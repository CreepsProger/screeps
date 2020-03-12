const roleNext = require('role.energy.transferer');
const constants = require('main.constants');
const config = require('main.config');
const tools = require('tools');

var roleRepairer = {

    /** @param {Creep} creep **/
    run: function(creep,executer) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				roleNext.run(creep);
				return;
			}

			if(creep.memory.repairing &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)) {
				creep.memory.repairing = false;
			}

			if(!creep.memory.repairing &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.store.getFreeCapacity() == 0) ||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.memory.rerun))) {
				creep.memory.repairing = true;
			}

			if(creep.memory.repairing) {

				const this_room = creep.room.name;
				const this_room_config = Memory.config.rooms[this_room];
				// const my_room = creep.memory[role.name].room;
				const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
				const my_room_config = Memory.config.rooms[my_room];


				var target;

				if(!target && this_room != my_room) {
    			const exitDir = Game.map.findExit(this_room, my_room);
    			target = creep.pos.findClosestByPath(exitDir);
    // 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
    		}

				if(!creep.memory.prev_target_id)
					creep.memory.prev_target_id = '0';

				const NR1 = Game.flags['NR1'];// don't repair
				const NR2 = Game.flags['NR2'];// don't repair
				const D1 = Game.flags['D1'];// dismanle
				const D2 = Game.flags['D1'];// dismanle
				if(!target) {
					var structures = creep.pos.findInRange(FIND_STRUCTURES, 50, {
						filter: (structure) => {
							if((structure.structureType == STRUCTURE_ROAD || structure.structureType == STRUCTURE_CONTAINER) &&
								 structure.pos.roomName == my_room &&
								 structure.hitsMax - structure.hits > structure.hitsMax/(2+98*(structure.id == creep.memory.prev_target_id))) {
								 if(!!D1 && D1.pos.roomName == my_room &&
 									D1.pos.getRangeTo(structure) < 1*D1.color) {
 									return false;
 								}
 								if(!!D2 && D2.pos.roomName == creep.room.name &&
 									D2.pos.getRangeTo(structure) < 1*D2.color) {
 									return false;
 								}
								if(!!NR1 && NR1.pos.roomName == my_room &&
									NR1.pos.getRangeTo(structure) < 1*NR1.color) {
									return false;
								}
								if(!!NR2 && NR2.pos.roomName == creep.room.name &&
									NR2.pos.getRangeTo(structure) < 1*NR2.color) {
									return false;
								}
								return true;
							}
							return false;
						}
					});
					if(structures.length > 0) {
						var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
							filter: (structure) => {
								return structures.find(s => s.id == structure.id) &&
									tools.checkTarget(executer,structure.id);;
							}
						});
					}
					if(!!structure) {
						target = tools.setTarget(creep,structure,structure.id,roleRepairer.run);
					}
				}

				if(target) {
					var action;
					var err = ERR_NOT_IN_RANGE
					if(!!target.hitsMax && target.hits < target.hitsMax) {
						action = 'repairing:';
						err = creep.repair(target);
						creep.memory.prev_target_id = target.id;
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🔧');
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
// 						console.log( '🔜🔧', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'moving for repairing:'
// 												, target.name?target.name:target.structureType);
					}
					else if(!err) {
						creep.say('🔧');
// 						console.log( '🔧', Math.trunc(Game.time/10000), Game.time%10000
//                                 , creep.name
//                                 , 'repairing:'
//                                 , target.name?target.name:target.structureType);
					}
					else {
						creep.memory.repairing = false;
						console.log( '🔧⚠️', Math.trunc(Game.time/10000), Game.time%10000
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
					creep.memory.repairing = false;
				}
			}

			Memory.cpu.role('repairing');
			if(!creep.memory.repairing) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleRepairer;
