var roleNext = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {
			
			var myRoom = 'W25S33';//Game.spawns['Spawn1'].room.name;
			var anotherRoom = 'W25S34';//Game.map.describeExits(myRoom)[BOTTOM].name; //'W25S34'

			if(creep.memory.building &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)) {
				creep.memory.building = false;
			}

			if(!creep.memory.building &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity() == 0) ||
				 (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun)) {
				creep.memory.building = true;
			}

			if(creep.memory.building) {
				var target;

				if(!target) {
					var targets = creep.pos.findInRange(FIND_STRUCTURES, 0, {
						filter: (structure) => { 
							if(structure.structureType == STRUCTURE_ROAD &&
								 structure.hitsMax - structure.hits > 1000) {
								return true;
							}
							if(structure.structureType == STRUCTURE_CONTAINER &&
								 structure.hitsMax - structure.hits > 1000) {
								return true;
							}
							return false;
						}
					});
					if(targets.length > 0) {
						target = targets[0];
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
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
						creep.say('🔜🏗');
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
