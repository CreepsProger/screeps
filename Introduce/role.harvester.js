const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const terminals = require('main.terminals');
const labs = require('main.labs');
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
			 creep.store.getFreeCapacity() > 0 &&
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

	getTarget: function(creep,executer) {

		const this_room = creep.room.name;
		const my_room = creep.memory[role.name].room;
		const my_shard = creep.memory[role.name].shard;
		const my_shard_config = Memory.config.shards[my_shard];
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
		}

		const XU = !!flags.flags.XU;
		const B  = !!flags.flags.B && flags.flags.B.pos.roomName == my_room;
		const U  = XU || !!flags.flags.U && flags.flags.U.pos.roomName == my_room;
		const UU = XU || !!flags.flags.UU && flags.flags.UU.pos.roomName == my_room;
		const BB = XU || !!flags.flags.BB && flags.flags.BB.pos.roomName == my_room;

		if(!target &&
			 (!creep.getActiveBodyparts(WORK) || U) &&
			 (tools.getWeight(creep.name) < my_room_config.containers.weight || U) &&
			 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			var conts = cash.getContainers(creep.room).filter((cont) => !!cont && !!cont.store &&
                   (creep.memory.rerun && cont.store.getFreeCapacity() < cont.store.getCapacity() - cont.store.getUsedCapacity(RESOURCE_ENERGY) ||
			 																								cont.store.getUsedCapacity(RESOURCE_ENERGY) > 0));

			if(conts.length > 0) {
				// var cont = conts.reduce((p,c) => tools.checkTarget(executer,p.id) && creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				var cont = conts.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				if(!!cont) {
					// target = tools.setTarget(creep,cont,cont.id,role.run);
					target = cont;
				}
			}
			if(!!target) return target;
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
			if(!!target) return target;
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
		
		if(creep.getActiveBodyparts(WORK) && !UU && !B) {
			const extractor = creep.pos.findClosestByPath(FIND_STRUCTURES, {
							filter: function(s) { return s.structureType == STRUCTURE_EXTRACTOR && (s.my === undefined || s.my);}});
			if(!!extractor) {
				const minerals = extractor.pos.lookFor(LOOK_MINERALS);
				if(!!minerals && minerals.length > 0) {
					const mineral = minerals[0];
					if(!!mineral && mineral.mineralAmount > 0)
						return mineral;
				}
			}
		}

		var energy = (!!creep.room.terminal && !!creep.room.terminal.my)? creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY):0;
			  energy +=  (!!creep.room.storage && !!creep.room.storage.my)? creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0;
				energy -= constants.MIN_TERMINAL_ENERGY;
				energy -= constants.MIN_STORAGE_ENERGY;

		if(!target &&
			 Memory.stop_upgrading == false &&
			 creep.getActiveBodyparts(WORK) &&
			 energy > constants.STOP_UPGRADING_ENERGY) {
			var st = [];
			if(!!creep.room.terminal &&
				 !!creep.room.terminal.my &&
				   creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_TERMINAL_ENERGY + constants.MAX_TERMINAL_ENERGY) {
				st.push(creep.room.terminal);
			}
			if(!!creep.room.storage &&
				 !!creep.room.storage.my &&
				 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_STORAGE_ENERGY &&
				 (!creep.room.terminal || creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < constants.MIN_TERMINAL_ENERGY + constants.MAX_TERMINAL_ENERGY)) {
				st.push(creep.room.storage);
			}
			if(st.length > 0) {
				var target = st.reduce((p,c) => creep.pos.getRangeTo(p)
																			* (c.store.getUsedCapacity(RESOURCE_ENERGY) + 5000) // dp*ec < dc*ep !! it is right! don't change
																			< creep.pos.getRangeTo(c)
																			* (p.store.getUsedCapacity(RESOURCE_ENERGY) + 5000)
																			? p:c);
			}
			if(!!target) {
				// console.log('🔜⚡', creep, 'st for W:', target);
			 return target;
		  }
		}

		if(!target &&
			 (creep.room.energyAvailable != creep.room.energyCapacityAvailable || Memory.stop_upgrading) &&
			 (!creep.getActiveBodyparts(WORK) || creep.memory.rerun) &&
			 energy > constants.STOP_UPGRADING_ENERGY) {
			var st = [];
 			if(!!creep.room.terminal &&
 				 !!creep.room.terminal.my &&
 				   creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_TERMINAL_ENERGY) {
 				st.push(creep.room.terminal);
 			}
 			if(!!creep.room.storage &&
 				 !!creep.room.storage.my &&
 				 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.STOP_UPGRADING_ENERGY + constants.MIN_STORAGE_ENERGY) {
 				st.push(creep.room.storage);
 			}
			if(st.length > 0) {
				var target = st.reduce((p,c) => creep.pos.getRangeTo(p)
																			* (c.store.getUsedCapacity(RESOURCE_ENERGY) + 5000) // dp*ec < dc*ep !! it is right! don't change
																			< creep.pos.getRangeTo(c)
																			* (p.store.getUsedCapacity(RESOURCE_ENERGY) + 5000)
																			? p:c);
			}
 			if(!!target) {
 				// console.log('🔜⚡', creep, 'st for C:', target);
 			 return target;
 		  }
		}

		if(!target &&
			 creep.room.energyAvailable != creep.room.energyCapacityAvailable &&
			 (!creep.getActiveBodyparts(WORK) || false) &&
			 !!creep.room.terminal &&
			 !!creep.room.terminal.my &&
			 (creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_TERMINAL_ENERGY || !conditions.TO_SPAWN_CLAIMING_ROOMS())) {
			target = creep.room.storage;
			if(!!target) return target;
		}

		if(!target &&
			 creep.room.energyAvailable != creep.room.energyCapacityAvailable &&
			 (!creep.getActiveBodyparts(WORK) || false) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.my &&
			 (creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_STORAGE_ENERGY || !conditions.TO_SPAWN_CLAIMING_ROOMS())) {
			target = creep.room.storage;
			if(!!target) return target;
		}
		
		if(!creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			const labToOut = labs.getLabsToOut(creep.room.name)
													.filter((e) => tools.checkTarget(executer,e.lab.id))
													.shift();		
			if(!!labToOut) {
				console.log('⚗️↪️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, roomName:creep.room.name, labToOut:labToOut}));
				const lab = tools.setTarget(creep,labToOut.lab,labToOut.lab.id,role.run);
				if(!!lab) {
					const target = {resource:labToOut.resource, amount:labToOut.amount, target:lab};
					console.log('⚗️🎯↪️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, roomName:creep.room.name, target:target}));
					return target;
				}
			}
			const labToIn = labs.getLabsToIn(creep.room.name)
													.filter((e) => tools.nvl(creep.room.storage.store[e.resource],0) > 0 &&
																					tools.checkTarget(executer,e.lab.id))
													.shift();
			if(!!labToIn) {
			console.log('⚗️↩️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, roomName:creep.room.name, labToIn:labToIn}));
				const lab = tools.setTarget(creep,labToIn.lab,labToIn.lab.id,role.run);
				if(!!lab) {
					const target = {resource:labToIn.resource, amount:labToIn.amount, target:creep.room.storage};
					console.log('⚗️🎯↩️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, roomName:creep.room.name, target:target}));
					return target;
				}
			}
		}
		
		const res_to_send = terminals.getResourceToSend(creep);
		if(!target &&
			 !!res_to_send &&
			 creep.memory.rerun && 
			 (!creep.getActiveBodyparts(WORK)) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.my) {
			target = {target:creep.room.storage, resource:res_to_send.resource, amount:res_to_send.amount};/*
			console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, res_to_send:res_to_send, storage:target}));*/
			if(!!target)
				return target;
		}
		const res_to_recieve = terminals.getResourceToRecieve(creep);
		if(!target &&
			 !!res_to_recieve &&
			 creep.memory.rerun &&
			 (!creep.getActiveBodyparts(WORK)) &&
			 !!creep.room.terminal &&
			 !!creep.room.terminal.my) {
			target = {target:creep.room.terminal, resource:res_to_recieve.resource, amount:res_to_recieve.amount};/*
			console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, res_to_recieve:res_to_recieve, terminal:target}));*/
			if(!!target)
				return target;
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
			!!creep.room.storage &&
			 !creep.room.storage.my &&
			 Object.keys(creep.room.storage.store).length > 0 ) {
					target = creep.room.storage;
			if(!!target) return target;
		}
		if(!target && (!creep.getActiveBodyparts(WORK) || UU) && (creep.memory.rerun || UU) &&
			!!creep.room.terminal &&
			 !creep.room.terminal.my &&
			 Object.keys(creep.room.terminal.store).length > 0 ) {
					target = creep.room.terminal;
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
				if(!!target.structureType && (target.structureType == STRUCTURE_CONTAINER || target.structureType == STRUCTURE_STORAGE)) {
					const resources = Object.keys(target.store); 
					resources.forEach(function(resource,i) {
						if(err == OK)
							err = creep.withdraw(target, resource);
					});
				}
				err = (err != OK) ? err:!!target.isTask? target.harvestingBy(creep):
				(!!target.name || (!target.id && !target.target))? // a creep || exit
						ERR_NOT_IN_RANGE:
				(!!target.mineralAmount)?
				    creep.harvest(target):
				!!target.structureType?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
					!!target.target?
						creep.withdraw(target.target, target.resource, Math.min(target.target.store[target.resource],Math.min(target.amount,creep.store.getFreeCapacity(target.resource)))): 
				(target.energy == 0 && creep.pos.getRangeTo(target) > 1 )? // a source
						ERR_NOT_IN_RANGE:
				creep.harvest(target);
				creep.say('⚡');

				if(err == ERR_NOT_IN_RANGE) {
					creep.say((!target.target)?'🔜⚡':'🔜💦');
					err = (!!target.target)? tools.moveTo(creep, target.target):tools.moveTo(creep, target);
					role.log('🔜⚡', creep, err, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				if(err) {
					creep.say('⚡⚠️'+err)
					role.log( '⚡⚠️', creep, 'err:', err, JSON.stringify(creep.harvest));
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
			//cash.renewCreep(creep);

			if(	creep.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 ||
				  creep.pos.findInRange(FIND_MY_CREEPS, 1).length > 1 ||
					(!!creep.room.storage && creep.pos.inRangeTo(creep.room.storage, 1)) ||
					(!!creep.room.terminal && creep.pos.inRangeTo(creep.room.terminal, 1)) ) {
				const random = Math.floor(Math.random()*8+Game.time)%8+1;
				creep.move(random); // TOP:1 ,..., TOP_LEFT:8
			}
		}
	}
};

module.exports = role;
