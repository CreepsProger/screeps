const roleNext = require('role.energy.transferer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
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
			
			const this_room = creep.room.name;				
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			
			if(!creep.memory.repairing &&
				 this_room == my_room &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.store.getFreeCapacity() == 0) ||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.memory.rerun))) {
				creep.memory.repairing = true;
			}

			if(creep.memory.repairing) {
				
				var target;
				
				if(!creep.memory.prev_target_id || !creep.memory.prev_target_time || creep.memory.prev_target_time < Game.time - 100) {
					creep.memory.prev_target_id = '0';
					creep.memory.prev_target_time = 0;
				}

				const NR1 = Game.flags['NR1'];// don't repair
				const NR2 = Game.flags['NR2'];// don't repair
				const D1 = Game.flags['D1'];// dismanle
				const D2 = Game.flags['D1'];// dismanle
				if(!target) {
					var structures = creep.room.find(FIND_STRUCTURES, {
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
						var structure = structures.reduce((p,c) => tools.checkTarget(executer,p.id) &&
																							creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
						if(!!structure && tools.checkTarget(executer,structure.id)) {
							target = tools.setTarget(creep,structure,structure.id,roleRepairer.run);
						}
					}
				}

				if(target) {
					var action;
					var err = ERR_NOT_IN_RANGE
					if(!!target.hitsMax && target.hits < target.hitsMax) {
						action = 'repairing:';
						err = creep.repair(target);
						creep.memory.prev_target_id = target.id;
						creep.memory.prev_target_time = Game.time;
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🔧');
						err = tools.moveTo(creep,target);
// 						console.log( '🔜🔧', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name, err
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

			metrix.cpu.role_time(creep, 'repairing');
			if(!creep.memory.repairing) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleRepairer;
