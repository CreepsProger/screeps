var roleNext = require('role.energy.transferer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,executer) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				roleNext.run(creep);
				return;
			}

			if(creep.memory.building &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)) {
				creep.memory.building = false;
			}

			const this_room = creep.room.name;
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

			if(!creep.memory.building &&
				 this_room == my_room &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.store.getFreeCapacity() == 0) ||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.memory.rerun))) {
				creep.memory.building = true;
			}

			if(creep.memory.building) {

				const my_room_config = Memory.config.rooms[my_room];

				var target;

				if(!target && this_room != my_room) {
					const my_path_room = my_room_config.path_rooms[this_room];
					const exit = creep.room.findExitTo(my_path_room);
					target = creep.pos.findClosestByPath(exit);
				}

				if(!target) {
					target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
				}

				if(!target) {
					var targets = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => { return structure.structureType == STRUCTURE_WALL &&
							structure.hits < 1000; }
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(target) {
					var action;
					var err = ERR_NOT_IN_RANGE
					if(target.hitsMax !== undefined && target.hits < target.hitsMax) {
						action = 'repairing:';
						err = creep.repair(target);
					}
					else {
						action = 'building:';
						err = creep.build(target);
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🏗');
						tools.moveTo(creep,target);
// 						console.log( '🔜🏗', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'moving for building:'
// 												, target.name?target.name:target.structureType);
					}
					else if(!err) {
						creep.say('🏗');
// 						console.log( '🏗', Math.trunc(Game.time/10000), Game.time%10000
//                                 , creep.name
//                                 , 'building:'
//                                 , target.name?target.name:target.structureType);
					}
					else {
						creep.memory.building = false;
						console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, creep.getActiveBodyparts(WORK)
												, creep.store.getUsedCapacity(RESOURCE_ENERGY)
												, action
												, target.name?target.name:target.structureType
												, 'with err:'
												, err);
					}
				}
				else {
					creep.memory.building = false;
				}
			}

			metrix.cpu.role_time(creep, 'building');
			if(!creep.memory.building) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleBuilder;
