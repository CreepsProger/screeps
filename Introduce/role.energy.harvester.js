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
			if(log.canLog(role.logFlags)) {
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
		const this_room_sources_is_empty = !creep.pos.findClosestByRange(FIND_SOURCES, {
				filter: (source) => source.energy > 0 && source.room.name == this_room
			});

		var target;

		if(!target && this_room != my_room) {
			const exitDir = Game.map.findExit(Game.rooms[this_room] , my_room);
			target = creep.pos.findClosestByPath(exitDir);
// 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
		}

		//if(!target && (!creep.getActiveBodyparts(WORK) || (this_room_sources_is_empty && creep.memory.rerun))) {
		if(!target) {
			target = links.getTargetLinkToHarvest(creep,executer,role.run);
		}

		if(!target && !creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep.memory.weight < my_room_config.containers.weight;
				}
			});
		}

		const DP2 = Game.flags['DP2'];
		if(!target && creep.getActiveBodyparts(WORK)) {
			var source = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => {
					return source.energy == source.energyCapacity &&
					 source.room.name == my_room &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5)) &&
						 tools.checkTarget(executer,source.id);
				 }
			 });
			 if(!!source) {
				 target = tools.setTarget(creep,source,source.id,role.run);
			 }
		}

		if(!target && creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => source.energy > 0 &&
						(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						  (!!DP2 && DP2.pos.roomName == this_room && DP2.pos.findPathTo(source).length <= 5)) &&
				source.room.name == this_room
			});
		}

		if(!target &&
			 Memory.stop_upgrading == false &&
			 creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.room.name == creep.room.name &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 25000;
				}
			});
			role.log('🔜⚡', creep, 'STRUCTURE_STORAGE');
		}

		if(!target && (creep.room.energyAvailable != creep.room.energyCapacityAvailable || Memory.stop_upgrading) &&
			 (!creep.getActiveBodyparts(WORK) || creep.memory.rerun)) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 35000;
				}
			});
		}

		if(!target && creep.room.energyAvailable != creep.room.energyCapacityAvailable &&
			 (!creep.getActiveBodyparts(WORK) || false)) {
			target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 5000;
				}
			});
		}

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
