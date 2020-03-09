var roleNext = require('role.upgrader');
const tools = require('tools');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,executer) {

			if(creep.memory.building &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)) {
				creep.memory.building = false;
// 				console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
// 										, creep.name
// 										, creep.getActiveBodyparts(WORK)
// 										, creep.store.getUsedCapacity(RESOURCE_ENERGY)
// 										, 'building:'
// 										, creep.memory.building);
			}

			if(!creep.memory.building &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.store.getFreeCapacity() == 0) ||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.memory.rerun))) {
				creep.memory.building = true;
// 				console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
// 										, creep.name
// 										, creep.getActiveBodyparts(WORK)
// 										, creep.store.getUsedCapacity(RESOURCE_ENERGY)
// 										, creep.store.getFreeCapacity(RESOURCE_ENERGY)
// 										, creep.memory.rerun
// 										, 'building:'
// 										, creep.memory.building);
			}

			if(creep.memory.building) {

				const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

				var target;

				const NR1 = Game.flags['NR1'];// don't repair
				const NR2 = Game.flags['NR2'];// don't repair
				if(!target) {
					var structures = creep.pos.findInRange(FIND_STRUCTURES, 15, {
						filter: (structure) => {
							if(structure.structureType == STRUCTURE_ROAD &&
								 structure.hitsMax - structure.hits > 2000) {
								if(!!NR1 && NR1.pos.roomName == creep.room.name &&
									NR1.pos.getRangeTo(structure) < 1*NR1.color) {
									return false;
								}
								if(!!NR2 && NR2.pos.roomName == creep.room.name &&
									NR2.pos.getRangeTo(structure) < 1*NR2.color) {
									return false;
								}
								// return true;
								return structure.pos.roomName == my_room;
							}
							if(structure.structureType == STRUCTURE_CONTAINER &&
								 structure.hitsMax - structure.hits > 25000) {
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
						target = tools.setTarget(creep,structure,structure.id,roleBuilder.run);
					}
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
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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

			if(!creep.memory.building) {
				roleNext.run(creep);
			}
		}
};

module.exports = roleBuilder;
