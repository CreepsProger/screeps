const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
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
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
				(creep.memory.rerun &&
				 creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0))) {
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

		const U = !!Game.flags['U'] && Game.flags['U'].pos.roomName == my_room;
		const UU = !!Game.flags['UU'] && Game.flags['UU'].pos.roomName == my_room;
		const BB = !!Game.flags['BB'] && Game.flags['BB'].pos.roomName == my_room;

		if(!target &&
			 (!creep.getActiveBodyparts(WORK) || U) &&
			 (creep.memory.weight < my_room_config.containers.weight || U) &&
			 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			var conts = cash.getContainers(creep.room).filter((cont) => !!cont && !!cont.store &&
			 																								cont.store.getUsedCapacity(RESOURCE_ENERGY) > 0);

			if(conts.length > 0) {
				var cont = conts.reduce((p,c) => tools.checkTarget(executer,p.id) && creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				if(!!cont) {
					target = tools.setTarget(creep,cont,cont.id,role.run);
				}
			}
			if(!!target) return target;
		}

		const DP2 = Game.flags['DP2'];
		const this_room_sources_are_not_empty = !tools.areEmptySources(creep);

		if(!target &&
			 //this_room_sources_are_not_empty &&
			 creep.getActiveBodyparts(WORK) && !UU && !BB
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy == source.energyCapacity &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.getRangeTo(source) <= 5)) &&
						 tools.checkTarget(executer,source.id);
				 }
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
			 creep.getActiveBodyparts(WORK) && !UU
			 // && (!conditions.MAIN_ROOM_CRISIS() || creep.memory.rerun)
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy > 0 && // TODO: LOOK_TERRAIN
						(!source.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.getRangeTo(source) <= 5))
						}
			});
			if(sources.length > 0) {
				var source = sources.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				if(!!source) {
					target = source;
				}
			}
			if(!!target) return target;
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
				   creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_TERMINAL_ENERGY) {
				st.push(creep.room.terminal);
			}
			if(!!creep.room.storage &&
				 !!creep.room.storage.my &&
				 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_STORAGE_ENERGY) {
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
						creep2.memory.weight > creep.memory.weight &&
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
			  creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) >0) {
					target = creep.room.storage;
			if(!!target) return target;
		}

		if(!target && creep.getActiveBodyparts(WORK) && creep.memory.rerun && !BB) {
			var emptysources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy == 0 && source.ticksToRegeneration < 100 &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5))
				}
			});
			if(emptysources.length > 0) {
				target = emptysources.reduce((p,c) => (p.ticksToRegeneration < c.ticksToRegeneration ||
				 																			creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c))? p:c);
				// target = tools.setTarget(creep,emptysources[0],emptysources[0].id,role.run);
			}
			if(!!target) return target;
		}
		return target;
	},

	run: function(creep,executer = undefined) {
		role.init(creep);																metrix.cpu.step_time(creep, role.name, 'init');
		role.checkOff(creep);														metrix.cpu.step_time(creep, role.name, 'checkOff');
		role.checkOn(creep);														metrix.cpu.step_time(creep, role.name, 'checkOn');

		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep,executer);  metrix.cpu.step_time(creep, role.name, 'getTarget');
			if(tools.getWeight(creep.name) >= 424) {
				console.log(creep, JSON.stringify({this_room:this_room, target:target}));
			}
			if(target) {
				var err = (target.name || !target.id)? // a creep || exit
						ERR_NOT_IN_RANGE:
				target.structureType?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
				(target.energy == 0 && creep.pos.getRangeTo(target) > 1 )? // a source
						ERR_NOT_IN_RANGE:
				creep.harvest(target);
				creep.say('⚡');

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜⚡');
					err = tools.moveTo(creep, target);
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

		for(var name in Game.spawns) {
			var spawn = Game.spawns[name];
			if(creep.room.name == spawn.room.name &&
				 creep.pos.x == spawn.pos.x &&
				 creep.pos.y == spawn.pos.y+1 &&
				 creep.memory.rerun) {
				creep.move(Game.time%8+1); // TOP:1 ,..., TOP_LEFT:8
			}
		}
		metrix.cpu.step_time(creep, role.name, '⚡🔚');
		metrix.cpu.role_time(creep, role.name);

		if(!creep.memory.rerun) {
			creep.memory.rerun = 1;
			if(!creep.memory[role.name].on) {
				creep.say('🔃');
				require('role.claimer').run(creep);
			}
		}
		if(creep.memory.rerun && !creep.memory[role.name].on) {
			metrix.idle(creep);
			//cash.renewCreep(creep);
		}
	}
};

module.exports = role;
