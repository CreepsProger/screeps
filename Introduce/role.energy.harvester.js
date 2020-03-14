const links = require('main.links');
const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');

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
		const this_room_config = Memory.config.rooms[this_room];
		const my_room = creep.memory[role.name].room;
		const my_room_config = Memory.config.rooms[my_room];
 		const this_room_sources_are_not_empty = !tools.areEmptySources(creep);

		var target;

		if(!target && this_room != my_room) {
			const exit = creep.room.findExitTo(my_room);
			target = creep.pos.findClosestByPath(exit);
// 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
		}

		//if(!target && (!creep.getActiveBodyparts(WORK) || (this_room_sources_is_empty && creep.memory.rerun))) {
		if(!target) {
			target = links.getTargetLinkToHarvest(creep,executer,role.run);
		}

		if(!target &&
			 !creep.getActiveBodyparts(WORK) &&
			 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
			var conts = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep.memory.weight < my_room_config.containers.weight;
				}
			});
			if(conts.length > 0) {
				var cont = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return conts.find(e => e.id == structure.id);
					}
				});
				if(!!cont) {
					target = tools.setTarget(creep,cont,cont.id,role.run);
				}
			}		
		}

		Memory.cpu.step.run(creep, role.name, 'getTarget 1');

		const DP2 = Game.flags['DP2'];

		if(!target &&
			 //this_room_sources_are_not_empty &&
			 creep.getActiveBodyparts(WORK) //&&
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy == source.energyCapacity &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5)) &&
						 tools.checkTarget(executer,source.id);
				 }
			 });
			 if(sources.length > 0) {
				 var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					 filter: (structure) => {return sources.find(source => source.id == structure.id);} 
				 });
				 if(!!source) {
					 target = tools.setTarget(creep,source,source.id,role.run);
				 }
			 }
		}

		if(!target &&
			 //this_room_sources_are_not_empty &&
			 creep.getActiveBodyparts(WORK) //&&
			 //creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0
			) {
			var sources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy > 0 &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5))
						}
			});
			if(sources.length > 0) {
				 var source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					 filter: (structure) => sources.find(source => source.id == structure.id)});
				 if(!!source) {
					 target = source;
				 }
			 }
		}

		if(!target &&
			 Memory.stop_upgrading == false &&
			 creep.getActiveBodyparts(WORK) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.my &&
			 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 25000) {
			target = creep.room.storage;
			role.log('🔜⚡', creep, 'STRUCTURE_STORAGE');
		}

		if(!target &&
			 (creep.room.energyAvailable != creep.room.energyCapacityAvailable || Memory.stop_upgrading) &&
			 (!creep.getActiveBodyparts(WORK) || creep.memory.rerun) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.my &&
			 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 35000) {
			target = creep.room.storage;
		}

		if(!target &&
			 creep.room.energyAvailable != creep.room.energyCapacityAvailable &&
			 (!creep.getActiveBodyparts(WORK) || false) &&
			 !!creep.room.storage &&
			 !!creep.room.storage.my &&
			 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > 5000) {
			target = creep.room.storage;
		}
/*
		if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			var weightcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
				filter: (creep2) => {
					return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep2.memory.weight > creep.memory.weight &&
						creep2.getActiveBodyparts(WORK) &&
						creep.memory.transfering &&
						tools.checkTarget(executer,creep2.id);
				}
			});
			if(!!weightcreep) {
				target = tools.setTarget(creep,weightcreep,weightcreep.id,role.run);
			}
		}
*/
		if(!target && creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			var emptysources = creep.room.find(FIND_SOURCES, {
				filter: (source) => {
					return source.energy == 0 &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5))
				}
			});
			if(emptysources.length > 0) {
				target = tools.setTarget(creep,emptysources[0],emptysources[0].id,role.run);
			}
		}
		
		Memory.cpu.step.run(creep, role.name, 'getTarget 2');

		return target;
	},

	run: function(creep,executer = undefined) {
		role.init(creep);																Memory.cpu.step.run(creep, role.name, 'init');
		role.checkOff(creep);														Memory.cpu.step.run(creep, role.name, 'checkOff');
		role.checkOn(creep);														Memory.cpu.step.run(creep, role.name, 'checkOn');

		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep,executer);
			if(target) {
				var err = (target.name || !target.id)? // a creep || exit
						ERR_NOT_IN_RANGE:
				target.structureType?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
				creep.harvest(target); // a source

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜⚡');
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					role.log('🔜⚡', creep, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				else if(!err) {
					creep.say('⚡');
					role.log('⚡', creep, 'harvest', JSON.stringify(target));
				}
				else {
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
				 creep.pos.x == spawn.pos.x+1 &&
				 creep.pos.y == spawn.pos.y &&
				 creep.memory.rerun) {
				creep.move(Game.time%8+1); // TOP:1 ,..., TOP_LEFT:8
			}
		}

		Memory.cpu.role(creep, role.name);
		if(!creep.memory.rerun) {
			creep.memory.rerun = 1;
			if(!creep.memory[role.name].on) {
				creep.say('🔃');
				require('role.claimer').run(creep);
			}
		}
	}
};

module.exports = role;
