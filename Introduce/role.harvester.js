const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const terminals = require('main.terminals');
const labs = require('main.labs');
const factory = require('main.factory');
const log = require('main.log');
const tasks = require('tasks');
const tools = require('tools');
const cash = require('cash');

var git = '$Format:%H$';

var role = {

	name: constants.ROLE_ENERGY_HARVESTING,

	logFlags: ['LEH','LE ','L'],

	log: function(sign, creep, ...args) {
			if(log.canLog(role.logFlags, creep)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

	init: function(creep) {
		if(creep.memory[role.name] === undefined ||
			 creep.memory[role.name].v === undefined ||
			 creep.memory[role.name].v != config.version) {
			creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
		}
	},

	checkOff: function(creep) {
		if(creep.memory[role.name].on &&
			creep.store.getFreeCapacity() == 0) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 creep.store.getFreeCapacity() > 0  &&
// 			 creep.store.getFreeCapacity() > creep.memory.rerun * creep.store.getCapacity() * 0.50  &&
			 (creep.store.getFreeCapacity() == creep.store.getCapacity() || creep.memory.rerun || tasks.needToHarvest(creep))) {
			/*
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
				(creep.memory.rerun &&
				 creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
			  tasks.needToHarvest(creep))) {*/
			creep.memory[role.name].on = true;
			config.setRoom(creep, role.name);
		}
	},
	
	st: {
	},
	getST: function(creepName) {
		if(!role.st[tools.getWeight(creepName)])
			role.st[tools.getWeight(creepName)] = {time:Game.time,multi:1};
		return role.st[tools.getWeight(creepName)];
	},
	resetST: function(creepName) {
		const st = role.getST(creepName);
		st.time = Game.time;
		st.multi = 1;
	},
	postponeST: function(creepName) {
		const st = role.getST(creepName);
		st.time = Game.time;
		if(st.multi < 8)
			st.multi *= 2;
	},

	getTarget: function(creep,executer) {

		const this_room = creep.room.name;
		const my_room = creep.memory[role.name].room;
		const my_shard = creep.memory[role.name].shard;
		const my_shard_config = config.Memory.shards[my_shard];
		const this_room_config = my_shard_config.rooms[this_room];
		const my_room_config = my_shard_config.rooms[my_room];


		var target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
		if(!!target) return target;

		//if(!target && (!creep.getActiveBodyparts(WORK) || (this_room_sources_is_empty && creep.memory.rerun))) {
		if(!target) {
			var link = links.getTargetLinkToHarvest(creep,executer);
			if(!!link && (!creep.getActiveBodyparts(WORK) || creep.pos.inRangeTo(link,5))) {
				target = tools.setTarget(creep,link,link.id,role.run);
			}
			if(!!target)
				return target;
		}

		const XU = !!flags.flags.XU;
		const B  = !!flags.flags.B && flags.flags.B.pos.roomName == my_room;
		const U  = XU || !!flags.flags.U && flags.flags.U.pos.roomName == my_room;
		const UU = XU || !!flags.flags.UU && flags.flags.UU.pos.roomName == my_room;
		const BB = XU || !!flags.flags.BB && flags.flags.BB.pos.roomName == my_room;
		const CONT = !!flags.getFlag(this_room + '.cont.' + tools.getWeight(creep.name)); 

		if(!target &&
			 (!creep.getActiveBodyparts(WORK) || U) &&
			 (tools.getWeight(creep.name) < my_room_config.containers.weight || U) &&
			 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			var conts = cash.getContainers(creep.room).filter((cont) => !!cont && !!cont.store &&
                   (creep.memory.rerun && cont.store.getFreeCapacity() < cont.store.getCapacity() - cont.store.getUsedCapacity(RESOURCE_ENERGY) ||
			 																								cont.store.getUsedCapacity(RESOURCE_ENERGY) > 0));

			if(conts.length > 0) {
				var cont = conts.reduce((p,c) => ((!CONT || tools.checkTarget(executer,p.id)) && (creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)))? p:c);
				// var cont = conts.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				if(!!cont) {
					target = (CONT)? tools.setTarget(creep,cont,cont.id,role.run):cont;
				}
			}
			if(!!target)
				return target;
		}

		const DP2 = flags.flags.DP2;
		// const this_room_sources_are_not_empty = !cash.areEmptySources(creep);

		if(!target &&
			 //this_room_sources_are_not_empty &&
			 creep.getActiveBodyparts(WORK) && (!UU && !BB || !creep.room.terminal) 
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = cash.getSources(creep.room).filter((source) => {
					return source.energy == source.energyCapacity &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.getRangeTo(source) <= 5)) &&
						 tools.checkTarget(executer,source.id);
				 });
			 if(sources.length > 0) {
				 var source = sources.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				 if(!!source) {
					 target = tools.setTarget(creep,source,source.id,role.run);
				 }
			 }
			if(!!target)
				return target;
		}

		metrix.cpu.step_time(creep, role.name, 'getTarget 1/2');

		if(!target &&
			 //this_room_sources_are_not_empty &&
			 creep.getActiveBodyparts(WORK) && (!UU || !creep.room.terminal)
			 // && (!conditions.MAIN_ROOM_CRISIS() || creep.memory.rerun)
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = cash.getSources(creep.room).filter((source) => {
				return source.energy > 0 &&
					(!source.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0 ||
					  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.getRangeTo(source) <= 5))
			});
			if(sources.length > 0) {
				var source = sources.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				if(!!source && creep.pos.getRangeTo(source) == 1) {
					target = source;
				}
				else {
					target = creep.pos.findClosestByPath(FIND_SOURCES, {
							filter: function(source) { return source.energy > 0;}});
				}
			}
			if(!!target)
				return target;
		}

		const LL  = !!flags.flags.LL && flags.flags.LL.pos.roomName == my_room;
		if(LL) {
				console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({LL:LL, creep:creep.name, target:target}));
		}

		if(creep.getActiveBodyparts(WORK) && !UU && !B && !cash.needToRenew(creep)) {
			const extractor = creep.pos.findClosestByPath(FIND_STRUCTURES, {
							filter: function(s) { return s.structureType == STRUCTURE_EXTRACTOR && (s.my === undefined || s.my);}});
			if(!!extractor) {
				const minerals = extractor.pos.lookFor(LOOK_MINERALS);
				if(!!minerals && minerals.length > 0) {
					const mineral = minerals[0];
					if(!!mineral && mineral.mineralAmount > 0) {
						const roomName = mineral.pos.roomName;
						const ShardAvgAmount = terminals.getShardAvgAmount(mineral.mineralType);
						const MinAvgAmountToBuy = config.getMinAvgAmountToBuy(mineral.mineralType);
						if(ShardAvgAmount < MinAvgAmountToBuy*2) {
							return mineral;
						}
					}
				}
			}
		}

		var energy = (!!creep.room.terminal && !!creep.room.terminal.my)? creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY):0;
			  energy +=  (!!creep.room.storage && !!creep.room.storage.my)? creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0;
				energy -= constants.MIN_TERMINAL_ENERGY;
				energy -= constants.MIN_STORAGE_ENERGY;
		
		const sot = tools.getStorageOrTerminal(creep);

		if(!target && !!sot &&
			 Memory.stop_upgrading == false &&
			 creep.getActiveBodyparts(WORK) &&
			 energy > constants.STOP_UPGRADING_ENERGY + creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
				return sot;
		}

		if(!target && !!sot &&
			 (creep.room.energyAvailable != creep.room.energyCapacityAvailable /*|| Memory.stop_upgrading*/) &&
			 (!creep.getActiveBodyparts(WORK) || creep.memory.rerun) &&
			 energy > constants.STOP_UPGRADING_ENERGY + creep.store.getFreeCapacity(RESOURCE_ENERGY) ) {
				return sot; 
		}

		const SO  = !!flags.flags.SO && flags.flags.SO.pos.roomName == my_room;
		if(!creep.getActiveBodyparts(WORK) && SO) {
			var res_to_send = terminals.getResourceToSend(creep);
			if(!!res_to_send) {
				res_to_send.target = creep.room.storage;
				role.resetST(creep.name);
				return res_to_send;
			}
		}
		
		const ST  = !!flags.flags.ST && flags.flags.ST.pos.roomName == my_room;
		const st = role.getST(creep.name);

		if(!creep.getActiveBodyparts(WORK) &&
			 (st.time + st.multi <= Game.time) &&
			 creep.memory.rerun &&
			 ((Game.time % 500/10 < 20/2 && Game.cpu.bucket > 2000) || Game.cpu.bucket > 8000 || ST)) {

			const labToOutExtra = labs.getLabsToOut(creep.room.name)
													.filter((e) => e.amount == 3000)
													.filter((e) => tools.checkTarget(executer,e.lab.id))
													.shift();
			if(!!labToOutExtra) {
				var lab = tools.setTarget(creep,labToOutExtra.lab,labToOutExtra.lab.id,role.run);
				if(!!lab) {
					labToOutExtra.target = lab;
					role.resetST(creep.name);
					return labToOutExtra;
				}
			}
			
			const labToEmpty = labs.getLabsToEmpty(creep.room.name)
													.filter((e) => tools.checkTarget(executer,e.lab.id))
													.shift();
			if(!!labToEmpty) {
				if(Game.shard.name == 'shard3') {
						console.log('⚗️❓↩️', Math.trunc(Game.time/10000), Game.time%10000
																, JSON.stringify( { creep:creep.name, roomName:creep.room.name
																									, labToEmpty:labToEmpty}));
				}
				var lab = tools.setTarget(creep,labToEmpty.lab,labToEmpty.lab.id,role.run);
				if(!!lab) {
					labToEmpty.target = lab;
					role.resetST(creep.name);
					return labToEmpty;
				}
			}

			const labToOut = labs.getLabsToOut(creep.room.name)
													.filter((e) => tools.checkTarget(executer,e.lab.id))
													.shift();		
			if(!!labToOut) {
				var lab = tools.setTarget(creep,labToOut.lab,labToOut.lab.id,role.run);
				if(!!lab) {
					labToOut.target = lab;
					role.resetST(creep.name);
					return labToOut;
				}
			}

			const factoryToOut = factory.getFactoryToOut(creep.room.name);
			if(!!factoryToOut && !!factoryToOut.out && tools.checkTarget(executer,factoryToOut.id)) {
				var target = tools.setTarget(creep,factoryToOut,factoryToOut.id,role.run);
				if(!!target) {
					factoryToOut.out.target = target;
					return factoryToOut.out;/*
					console.log('🏭🎯↪️', Math.trunc(Game.time/10000), Game.time%10000
															, JSON.stringify( { creep:creep.name, roomName:creep.room.name
																								, target:target}));*/
				}
			}

			var res_to_recieve = terminals.getResourceToRecieve(creep);
			if(!!res_to_recieve) {
				res_to_recieve.target = creep.room.terminal;
				role.resetST(creep.name);
				return res_to_recieve;
			}

			const labToIn = labs.getLabsToIn(creep.room.name)
													.filter((e) => tools.nvl(creep.room.storage.store[e.resource],0) > 0 &&
																					tools.checkTarget(executer,e.lab.id))
													.shift();
			if(!!labToIn) {
				var lab = tools.setTarget(creep,labToIn.lab,labToIn.lab.id,role.run);
				if(!!lab) {
					labToIn.target = (labToIn.resource == RESOURCE_ENERGY)? sot:creep.room.storage;
					role.resetST(creep.name);
					return labToIn;
				}
			}

			const factoryToIn = factory.getFactoryToIn(creep.room.name);
			if(!!factoryToIn && !!factoryToIn.in &&
				 tools.checkTarget(executer,factoryToIn.id)) {
				var target = tools.setTarget(creep,factoryToIn,factoryToIn.id,role.run);
				if(!!target) {
					factoryToIn.in.target = (factoryToIn.in.resource == RESOURCE_ENERGY)? sot:creep.room.storage;
					if(Game.shard.name == '-shard0') {
						console.log('🏭🎯↩️', Math.trunc(Game.time/10000), Game.time%10000
																, JSON.stringify( { creep:creep.name, roomName:creep.room.name
																									, target:target}));
					}
					role.resetST(creep.name);
					return factoryToIn.in;
				}
			}

			var res_to_send = terminals.getResourceToSend(creep);
			if(!!res_to_send) {
				res_to_send.target = creep.room.storage;
				role.resetST(creep.name);
				return res_to_send;
			}
			
			role.postponeST(creep.name);
		}
		

		// const this_room_containers_are_empty = cash.areEmptyContainers(creep);
		//
		// if(!target &&
		// 	 !creep.getActiveBodyparts(WORK) && creep.memory.rerun && this_room_containers_are_empty &&
		// 	 !!creep.room.storage &&
		// 	 !!creep.room.storage.my &&
		// 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.START_UPGRADING_ENERGY + constants.MIN_STORAGE_ENERGY) {
		//  	var t = Game.cpu.getUsed();
		// 	var storages = cash.getStorages().filter((s) => s.store.getUsedCapacity(RESOURCE_ENERGY) < constants.START_UPGRADING_ENERGY);
		// 	if(storages.length > 0) {
		// 		var storage = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,p.pos)
		// 														 < c.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,c.pos)? p:c);
		// 		const range_to_store = tools.getRangeTo(creep.pos, storage.pos);
		// 		const my_store_energy_value = creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
		// 		const store_energy_value = storage.store.getUsedCapacity(RESOURCE_ENERGY);
		// 		if(range_to_store >= constants.HARVEST_RANGE_TO_STORE_2_TO_CONSOLE_LOG &&
		// 			(!creep.memory.target ||
			 // !creep.memory.target.id ||
				// creep.memory.target.id != target.id || true)
		// 			) {
		// 			var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
		// 			console.log( '🔜⚡2️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
		// 									, 'my store energy value:', my_store_energy_value
		// 									, 'range to possible target store:', range_to_store
		// 									, creep.pos.roomName, '->', storage.pos.roomName
		// 									, 'store energy value:', store_energy_value
		// 								 );
		// 			}
		// 		target = creep.room.storage;
		// 		if(!!target) return target;
		// 	}
		// }
		
		if(!creep.getActiveBodyparts(WORK) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.store &&
			 !!creep.room.terminal &&
			 !!creep.room.terminal.my &&
			 creep.room.storage.store.getUsedCapacity('power') > 0) {
			const spawnToIn = cash.getPowerSpawns(creep.room.name)
															.filter((s) => !!s && !!s.store && s.store.getFreeCapacity('power') > 75)
															.shift();
			if(!!spawnToIn && tools.checkTarget(executer,spawnToIn.id)) {
				const spawn = tools.setTarget(creep,spawnToIn,spawnToIn.id,role.run);
				if(!!spawn) {
					const target = {resource:'power', amount:spawn.store.getFreeCapacity('power'), target:creep.room.storage};/*
					console.log('🔴🎯↩️', Math.trunc(Game.time/10000), Game.time%10000
															, JSON.stringify( { creep:creep.name, roomName:creep.room.name
																								, target:target}));*/
					return target;
				}
			}
		}

		const NPE  = !!flags.flags.NPE;
		const psAmount = cash.getAllMyPowerSpawns().length;
		if(!creep.getActiveBodyparts(WORK) &&
			 !NPE &&
			 !!sot &&
			 energy > constants.START_UPGRADING_ENERGY * 5 &&
			 terminals.getShardAvgAmount(RESOURCE_ENERGY) > 300000) {
			const spawnToIn = cash.getPowerSpawns(creep.room.name)
															.filter((s) => !!s && !!s.store &&
																			s.store.getUsedCapacity('power') > 0 &&
																			s.store.getFreeCapacity(RESOURCE_ENERGY) > 2500)
															.shift();
			if(!!spawnToIn && tools.checkTarget(executer,spawnToIn.id)) {
				const spawn = tools.setTarget(creep,spawnToIn,spawnToIn.id,role.run);
				if(!!spawn) {
					const target = {resource:'energy', amount:spawn.store.getFreeCapacity(RESOURCE_ENERGY), target:sot};
					return target;
				}
			}
		}
		
		if(!target && !creep.getActiveBodyparts(WORK) && sot) {
			const tower = cash.getTowers(creep.room)
													.filter((t) =>
																	!!t && !! t.my && !!t.store &&
																	t.store.getFreeCapacity(RESOURCE_ENERGY) > constants.TOWER_NO_ENERGY_TO_FILL &&
																	tools.checkTarget(executer,t.id))
													.shift();
			if(!!tower) {
				tools.setTarget(creep,tower,tower.id,role.run);
				if(tools.getWeight(creep.name) == 999999) {
						console.log('🗼⚡', Math.trunc(Game.time/10000), Game.time%10000
																, JSON.stringify( { creep:creep.name, roomName:creep.room.name
																									, tower_id:tower.id}));
				}
				return sot;
			}
		}

		if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			var weightcreeps = creep.room.find(FIND_MY_CREEPS, {
				filter: (creep2) => {
					return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep2.memory.weight > tools.getWeight(creep.name) &&
						creep2.getActiveBodyparts(WORK) &&
						//creep2.memory.transfering &&
						tools.checkTarget(executer,creep2.id);
				}
			});
			if(weightcreeps.length > 0) {
				 var weightcreep = weightcreeps.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				 if(!!source) {
					 target = tools.setTarget(creep,weightcreep,weightcreep.id,role.run);
				 }
			 }
			if(!!target) return target;
		}

		if(!target && (!creep.getActiveBodyparts(WORK) || UU) && (creep.memory.rerun || UU) &&
			!!creep.room.terminal &&
			 !creep.room.terminal.my &&
			 Object.keys(creep.room.terminal.store).length > 0 ) {
					target = creep.room.terminal;
			if(!!target) return target;
		}
		if(!target && (!creep.getActiveBodyparts(WORK) || UU) && (creep.memory.rerun || UU) &&
			!!creep.room.storage &&
			 !creep.room.storage.my &&
			 Object.keys(creep.room.storage.store).length > 0 ) {
					target = creep.room.storage;
			if(!!target) return target;
		}

		if(!target && creep.getActiveBodyparts(WORK) && creep.memory.rerun && !BB) {
			var emptysources = cash.getSources(creep.room).filter((source) => {
					return source.energy == 0 && source.ticksToRegeneration < 100 &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5))
				});
			if(emptysources.length > 0) {
				target = emptysources.reduce((p,c) => (p.ticksToRegeneration < c.ticksToRegeneration ||
				 																			creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c))? p:c);
				// target = tools.setTarget(creep,emptysources[0],emptysources[0].id,role.run);
			}
			if(!!target) return target;
		}
		const task = tasks.needToHarvest(creep,creep.memory.rerun);
		if(!!task){
			return task;
		}
		return target;
	},
	
	sortRes: function(l,r) {
		const codeX = 'X'.charCodeAt(0);
		if(l == 'wire')
			return 1;
		if(r == 'wire')
			return -1;
		if(l.charCodeAt(0) == codeX)
			return 1;
		if(r.charCodeAt(0) == codeX)
			return -1;
		if(l == 'power')
			return 1;
		if(r == 'power')
			return -1;
		return r.length - l.length;
	}, 

	run: function(creep,executer = undefined) {
		role.init(creep);																metrix.cpu.step_time(creep, role.name, 'init');
		role.checkOff(creep);														metrix.cpu.step_time(creep, role.name, 'checkOff');
		role.checkOn(creep);														metrix.cpu.step_time(creep, role.name, 'checkOn');

		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep,executer);  metrix.cpu.step_time(creep, role.name, 'getTarget');
			// if(tools.getWeight(creep.name) >= 424) {
			// 	console.log(creep, JSON.stringify({this_room:creep.room.name, target:target}));
			// }
			if(target) {
				const LL  = !!flags.flags.LL && flags.flags.LL.pos.roomName == creep.room.name;
				if(LL) {
					console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({LL:LL, creep:creep.name, target:target}));
				}
				var err = OK;
				if(!!target.structureType && !target.my && (target.structureType == STRUCTURE_CONTAINER || target.structureType == STRUCTURE_STORAGE || target.structureType == STRUCTURE_TERMINAL)) {
					const resources = Object.keys(target.store).sort((l,r) => role.sortRes(l,r) ); 
					resources.forEach(function(resource,i) {
						if(err == OK)
							err = creep.withdraw(target, resource);
					});
				}
				err = (err != OK) ? err:!!target.isTask? target.harvestingBy(creep):
				(!!target.name || (!target.id && !target.target))? // a creep || exit
						ERR_NOT_IN_RANGE:
					!!target.target?
						creep.withdraw(target.target, target.resource, Math.min(target.target.store[target.resource],Math.min(target.amount,creep.store.getFreeCapacity(target.resource)))):
				(!!target.mineralAmount)?
				    creep.harvest(target):
					(!!target.structureType && !!target.my)?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
				(target.energy == 0 && creep.pos.getRangeTo(target) > 1 )? // a source
						ERR_NOT_IN_RANGE:
				creep.harvest(target);
				creep.say((!target.target)?'⚡':('💦'+tools.nvl(target.resource,'')));
				if(err == ERR_TIRED)
					creep.memory.noidle = {time:Game.time, role:role.name, err:err, before:Game.time+5};

				if(err == ERR_NOT_IN_RANGE) {
					creep.say((!target.target)?'🔜⚡':'🔜💦');
					err = (!!target.target)? tools.moveTo(creep, target.target):tools.moveTo(creep, target);
				}
				if(err) {
					creep.say('⚡⚠️'+err)
					role.log( '⚡⚠️', creep, 'err:', err, JSON.stringify(target.id));
					creep.memory[role.name].on = false;
				}
			}
			else {
				creep.memory[role.name].on = false;
			}
		}
		metrix.cpu.step_time(creep, role.name, '⚡🔚');
		metrix.cpu.role_time(creep, role.name);

		if(!creep.memory.rerun) {
			creep.memory.rerun = 1;
			if(!creep.memory[role.name].on) {
				creep.say('🔃');
				return require('role.claimer').run(creep);
			}
		}
		if(!!creep.memory.rerun && !creep.memory[role.name].on) {
			metrix.idle(creep);

			if((!creep.memory.noidle || !!creep.memory.noidle && creep.memory.noidle.before > Game.time) && 
				(creep.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 ||
				  creep.pos.findInRange(FIND_MY_CREEPS, 1).length > 1 ||
					(!!creep.room.storage && creep.pos.inRangeTo(creep.room.storage, 1)) ||
					(!!creep.room.terminal && creep.pos.inRangeTo(creep.room.terminal, 1))) ) {
				const random = Math.floor(Math.random()*8+Game.time)%8+1;
				creep.move(random); // TOP:1 ,..., TOP_LEFT:8
			}

			if(creep.getActiveBodyparts(ATTACK) > 0) {
				cash.recycleCreep(creep);
			}

		}
	}
};

module.exports = role;
