const constants = require('main.constants');
const config = require('main.config');
var flags = require('main.flags');
var log = require('main.log');
const tools = require('tools');

var git = '$Format:%H$';

var role = {

	name: constants.ROLE_ENERGY_HARVESTING,

	logFlags: ['LEH','LE ','L'],

	log: function(sign, creep, ...args) {
			if(log.canLog(role.logFlags) || creep.name == 'creep-<59>-0.0.0.0.9.9.9-8600-') {
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

	checkFreeSlot: function(creep) {
		return true;
	},

	checkOff: function(creep) {
		if(creep.memory[role.name].on &&
			creep.store.getFreeCapacity() == 0) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 role.checkFreeSlot(creep) &&
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
				(creep.memory.rerun &&
				 creep.store.getUsedCapacity(RESOURCE_ENERGY) >= 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0))) {
			creep.memory[role.name].on = true;
// 			role.log(creep,"On");
			config.setRoom(creep, role.name);
		}
	},

	getTarget: function(creep,executer) {

		const this_room = creep.room.name;
		const this_room_config = Memory.config.rooms[this_room];
		const my_room = creep.memory[role.name].room;
		const my_room_config = Memory.config.rooms[my_room];
		const this_room_sources_is_empty = !creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => source.energy > 0 && source.room.name == this_room
			});

		var target;

		if(!target && this_room == my_room) {
			var link = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_LINK) &&
						(structure.id == '5e583a7b7a54e3585a982b96' ||
						 structure.id == '5e5ab4f1142d6b46f3c86280') &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
							tools.checkTarget(executer,structure.id);
				}
			});
			if(!!link) {
				target = tools.setTarget(creep,link,link.id,role.run);
			}
		}

		if(!target &&
// 			 creep.room.energyAvailable > creep.room.energyCapacityAvailable - 400 &&
			 this_room != my_room &&
// 			 creep.ticksToLive > constants.TICKS_TO_LIVE_TO_TRANSFER_ENERGY_TO_SPAWN &&
			 true) {
			const exitDir = Game.map.findExit(Game.rooms[this_room] , my_room);
			target = creep.pos.findClosestByPath(exitDir);
// 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
		}

// 		if(!target)
// 		{
// 			console.log(creep.name, 'check target', STRUCTURE_CONTAINER, ':', creep.memory.rerun, this_room, my_room, creep.room.energyAvailable,
// 								creep.room.energyCapacityAvailable);
// 		}

		if(!target &&
			 creep.memory.rerun &&
			 this_room == my_room &&
			 (!this_room_sources_is_empty || creep.room.energyCapacityAvailable == 0 || this_room != 'W25S33') &&
			 creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
// 					if(structure.structureType == STRUCTURE_CONTAINER) {
// 						console.log(creep.name, 'check 2 target', STRUCTURE_CONTAINER, ':'
// 											, structure.structureType
// 											, structure.store.getUsedCapacity(RESOURCE_ENERGY)
// 											, creep.memory.weight
// 											, my_room_config.containers.weight);
// 					}
					return (structure.structureType == STRUCTURE_CONTAINER) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep.memory.weight < my_room_config.containers.weight;
				}
			});
		}

		if(!target &&
			 creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
				}
			});

// 		role.log('🔜⚡', creep, 'STRUCTURE_CONTAINER');
		}
/*
		if(!target && creep.getActiveBodyparts(WORK)) {
			var sources = Game.rooms[my_room].find(FIND_SOURCES, {
				filter: (source) => source.energy > 0
			});
			if(sources.length > 0) {
				target = sources[0];
			}
// 		role.log('🔜⚡', creep, 'Game.rooms[my_room].find(FIND_SOURCES', my_room);
		}
*/

		if(!target && creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => source.energy > 0 && source.room.name == this_room
			});
		}

		if(!target && creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 5000;
				}
			});
		}

		if(!target &&
			 creep.room.energyAvailable == creep.room.energyCapacityAvailable &&
			 Memory.stop_upgrading == false &&
			 creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.room.name == creep.room.name &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 30000;
				}
			});
		role.log('🔜⚡', creep, 'STRUCTURE_STORAGE');
		}

		if(!target && !creep.getActiveBodyparts(WORK)) {
/*
			if(!target && creep.memory.my_worker_id !== undefined) {
				target = Game.getObjectById(creep.memory.my_worker_id);
			}
*/
			if(!target) {
				var weightcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
					filter: (creep2) => {
						return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
							creep2.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
							creep2.memory.weight > creep.memory.weight &&
							creep2.getActiveBodyparts(WORK) &&
							!creep2.memory.upgrading &&
							tools.checkTarget(executer,creep2.id);
					}
				});
				if(!!weightcreep) {
					target = tools.setTarget(creep,weightcreep,weightcreep.id,role.run);
				}
			}

			if(!target && creep.memory.rerun) {
				var weightcreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
					filter: (creep2) => {
						return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
							creep2.memory.weight > creep.memory.weight &&
							creep2.getActiveBodyparts(WORK) &&
							!creep2.memory.upgrading &&
							tools.checkTarget(executer,creep2.id);
					}
				});
				if(!!weightcreep) {
					target = tools.setTarget(creep,weightcreep,weightcreep.id,role.run);
				}
			}
		}
		return target;
	},

	run: function(creep,executer = undefined) {
		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);

		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep,executer);
			if(target) {
				var err = (target.name || !target.id)? // a creep || exit
						ERR_NOT_IN_RANGE:
				target.structureType?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
				creep.harvest(target); // a source

				if(err == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					creep.say('🔜⚡');
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

		if(!creep.memory.rerun) {
			creep.memory.rerun = 1;
			if(!creep.memory[role.name].on) {
				creep.say('🔃');
				require('role.claimer').run(creep);
			}
		}

		for(var name in Game.spawns) {
			var spawn = Game.spawns[name];
			if(creep.room.name == spawn.room.name &&
				 creep.pos.x == spawn.pos.x+1 &&
				 creep.pos.y == spawn.pos.y) {
				creep.move(Game.time%8+1); // TOP:1 ,..., TOP_LEFT:8
			}
		}
	}
};

module.exports = role;
