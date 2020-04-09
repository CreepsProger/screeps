const roleNext = require('role.energy.harvester');
const constants = require('main.constants');
const terminals = require('main.terminals');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
const cash = require('cash');
const tools = require('tools');


var roleUpgrader = {

		checkStopUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
					structure.store.getUsedCapacity(RESOURCE_ENERGY) +
					(!structure.room.terminal? 0:structure.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY))
					 < constants.STOP_UPGRADING_ENERGY + constants.MIN_TERMINAL_ENERGY + constants.MIN_STORAGE_ENERGY;
			});
			if(storages.length > 0) {
				return true;
			}
			return false;
		},

		checkStartUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
				structure.store.getUsedCapacity(RESOURCE_ENERGY) +
				(!structure.room.terminal? 0:structure.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY))
				 < constants.START_UPGRADING_ENERGY + constants.MIN_TERMINAL_ENERGY + constants.MIN_STORAGE_ENERGY;
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

			const this_room = creep.room.name;
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

			if(this_room == my_room && creep.getActiveBodyparts(WORK)) {

				if(Game.time%constants.TICKS_TO_CHECK_STOP_UPGRADING == 0)
					roleUpgrader.updateStopUpgradingCondition(creep);

			const this_room_config = Memory.config.rooms[this_room];
			const my_room_config = Memory.config.rooms[my_room];
			const this_room_sources_are_empty = tools.areEmptySources(creep);
			const this_room_containers_are_full = cash.areFullContainers(creep);
			const U = !!Game.flags['U'] && (Game.flags['U'].pos.roomName == my_room);
				const total_energy = cash.getTotalEnergy();
				const X = condition.TO_EXTRA_UPGRADE(total_energy);

			const canDo =
						(creep.getActiveBodyparts(WORK) &&
						 (!Memory.stop_upgrading || this_room_containers_are_full || U) &&
						 this_room == my_room &&
						 (creep.room.energyAvailable == creep.room.energyCapacityAvailable || conditions.TO_SPAWN_CLAIMING_ROOMS() || U || X) &&
						 !!creep.room.controller &&
						 !!creep.room.controller.my &&
						 creep.room.controller.level > 0 &&
						 (this_room_sources_are_empty || this_room_containers_are_full || U) &&
						 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) < creep.getActiveBodyparts(WORK)*2) ||
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
					var err = ERR_NOT_IN_RANGE;
					const range = creep.pos.getRangeTo(target);
					if(tools.moveTo(creep,target) != OK || (range == 3 || 2)) {
						err = creep.upgradeController(target);
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🛠');
						err = tools.moveTo(creep,target);
						if(Game.flags['LU '] || Game.flags['LU'] || Game.flags['L']) {
							console.log( '🔜🛠', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, err
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
			}

			metrix.cpu.role_time(creep, 'upgrading');
			if(!creep.memory.upgrading) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleUpgrader;
