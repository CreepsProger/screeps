const roleNext = require('role.energy.harvester');
const constants = require('main.constants');
const tools = require('tools');


var roleUpgrader = {

		checkStopUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
					structure.store.getUsedCapacity(RESOURCE_ENERGY) < constants.STOP_UPGRADING_ENERGY;
			});
			if(storages.length > 0) {
				return true;
			}
			return false;
		},

		checkStartUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
					structure.store.getUsedCapacity(RESOURCE_ENERGY) < constants.START_UPGRADING_ENERGY;
			});
			if(storages.length == 0) {
				return true;
			}
			return false;
		},

	updateStopUpgradingCondition: function(creep) {
		if (Memory.stop_upgrading === undefined) {
			Memory.stop_upgrading = true;
		}
		if(roleUpgrader.checkStopUpgrading(creep)) {
			 Memory.stop_upgrading = true;
		}
		if(roleUpgrader.checkStartUpgrading(creep)) {
			Memory.stop_upgrading = false;
		}
	},


		/** @param {Creep} creep **/
    run: function(creep) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				roleNext.run(creep);
				return;
			}

			if(Game.time%20)
				roleUpgrader.updateStopUpgradingCondition(creep);

			const this_room = creep.room.name;
			const this_room_config = Memory.config.rooms[this_room];
// 			console.log('upgrading?', JSON.stringify(constants.ROLE_ENERGY_HARVESTING), JSON.stringify(creep));
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_room_config = Memory.config.rooms[my_room];
			const this_room_sources_are_empty = tools.areEmptySources(creep);
			const this_room_containers_are_full = tools.areFullContainers(creep);

			const canDo =
						(creep.getActiveBodyparts(WORK) &&
						 (!Memory.stop_upgrading || this_room_containers_are_full) &&
						 this_room == my_room &&
						 !!creep.room.controller &&
						 !!creep.room.controller.my &&
						 creep.room.controller.level > 0 &&
						 (this_room_sources_are_empty || this_room_containers_are_full) &&
						 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) ||
						  (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun))) ;

			if(creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
				creep.memory.upgrading = false;
			}

			if(!creep.memory.upgrading && canDo) {
				creep.memory.upgrading = true;
			}

			if(creep.memory.upgrading) {
				var target;
				if(!target) {
					target = creep.room.controller;
				}
				if(target) {
					var err = creep.upgradeController(target);
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🛠');
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
						if(Game.flags['LU '] || Game.flags['LU'] || Game.flags['L']) {
							console.log( '🔜🛠', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'moving for upgrading:'
													, target.name?target.name:target.structureType);
						}
					}
					else if(!err) {
						creep.say('🛠');
						if(Game.flags['LU '] || Game.flags['LU'] || Game.flags['L']) {
							console.log( '🛠', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'upgrading:'
													, target.name?target.name:target.structureType);
						}
					}
					else {
						creep.memory.upgrading = false;
						if(Game.flags['LU '] || Game.flags['LU'] || Game.flags['L']) {
							console.log( '🛠⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'upgrading:'
													, target.name?target.name:target.structureType
													, 'with err:'
													, err);
						}
					}
				}
				else {
					creep.memory.upgrading = false;
				}
			}

			Memory.cpu.role.time(creep, 'upgrading');
			if(!creep.memory.upgrading) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleUpgrader;
