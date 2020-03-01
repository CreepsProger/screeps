const constants = require('main.constants');
const roleNext = require('role.energy.harvester');

var roleUpgrader = {
	
		checkStopUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
					structure.store.getUsedCapacity(RESOURCE_ENERGY) < 25000;
			});
			if(storages.length > 0) {
				return true;
			}
			return false;
		},
	
		checkStartUpgrading: function(creep) {
			var storages = _.filter(Game.structures, function(structure) {
				return (structure.structureType == STRUCTURE_STORAGE) &&
					structure.store.getUsedCapacity(RESOURCE_ENERGY) < 30000;
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
			const sources_is_empty = !creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => (source.energy > 0 && source.room.name == this_room) 
			});
			const canDo =
						(!Memory.stop_upgrading &&
						 this_room == my_room &&
						 sources_is_empty &&
						 (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity() == 0) ||
						 (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun));

			if(creep.memory.upgrading && !canDo) {
				creep.memory.upgrading = false;
			}

			if(!creep.memory.upgrading && canDo) {
				creep.memory.upgrading = true;
			}

			if(creep.memory.upgrading) {
				var target;
				if(!target && creep.room.controller !== undefined && creep.room.controller.my !== undefined) {
					target = creep.room.controller;
				}
				if(target) {
					var err = creep.upgradeController(target);
					if(err == ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
						creep.say('🔜🛠');
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

			if(!creep.memory.upgrading) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleUpgrader;






//             var err = creep.upgradeController(creep.room.controller);
//             if(err == ERR_NOT_IN_RANGE) {
//                 creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
//                 creep.say('🔜🛠');
//             }
//             else if(err == ERR_NO_BODYPART) {
//                 var new_target;
//                 if(!new_target && creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
//                     new_target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
//                     filter: (creep2) => {
//                         return creep2.memory.upgrading &&
//                             creep.memory.weight < creep2.memory.weight;
//                         }
//                     });
//                     if(new_target)
//                         creep.say('🤫⚡🛠');
//                 }
//                 if(!new_target) {
//                     new_target = creep.room.controller.pos.findClosestByPath(FIND_MY_CREEPS, {
//                     filter: (creep2) => {
//                         return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 50 &&
//                             creep.memory.weight > creep2.memory.weight;
//                         }
//                     });
//                     if(new_target)
//                         creep.say('🤫🛠');
//                 }
//                 if(new_target) {
//                     creep.moveTo(new_target, {visualizePaathStyle: {stroke: '#ffffff'}});
//                     creep.memory.target = new_target.id;
//                 }
//                 creep.memory.upgrading = false;

//             }
//             else if(!err) {
//                 creep.withdraw(creep.room.storage,RESOURCE_ENERGY);
//                 creep.say('🛠');
//             }
//             else {
//                 creep.memory.upgrading = false;
//                 roleNext.run(creep);
//             }
//         }
//         else {
//             roleNext.run(creep);
//         }
//     }
// };

