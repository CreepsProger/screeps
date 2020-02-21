// var roleRerun= require('role.attacker');

var roleEnergyHarvester = {
    
    
    /** @param {Creep} creep **/
    run: function(creep) {
        var commit = 4;
        if(!Memory.commits.EnergyHarvester ||
           Memory.commits.EnergyHarvester != commit) {
            Memory.commits.EnergyHarvester = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit EnergyHarvester'
                        , Memory.commits.EnergyHarvester);
        }         

        if(creep.memory.harvesting &&
           creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }

        if(!creep.memory.harvesting &&
           ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
            (creep.memory.rerun && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0))) {
            creep.memory.harvesting = true;
        }
        
        if(creep.memory.harvesting) {
            var target;
            if(!target &&
               creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            if(!target && creep.getActiveBodyparts(WORK)) {
                var target = creep.pos.findClosestByPath(FIND_SOURCES, {
                    filter: (source) => source.energy >= (creep.memory.rerun? 0:1)
                });
            }
            if(!target && !creep.getActiveBodyparts(WORK)) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                            creep2.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
                            creep2.memory.weight > creep2.memory.weight;
                    }
                });
            }
            if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
                            creep2.memory.weight > creep.memory.weight;
                    }
                });
            }
            if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.memory.weight > creep2.memory.weight;
                    }
                });
            }
            if(target) {
                var err = target.name? // a creep
                    ERR_NOT_IN_RANGE:
                target.structureType?
                    creep.withdraw(target, RESOURCE_ENERGY): // a structure
                creep.harvest(target); // a source

                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜⚡');
                    if(Game.flags['LEH'] || Game.flags['LE'] || Game.flags['L']) {
                        console.log( '🔜⚡', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'moving for harvesting energy from:'
                                    , target.name?target.name:target.structureType?target.structureType:target.id);
                    }
                }
                else if(!err) {
                    creep.say('⚡');
                    if(Game.flags['LEH'] || Game.flags['LE'] || Game.flags['L']) {
                        console.log( '⚡', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'harvesting energy from:'
                                    , target.name?target.name:target.structureType?target.structureType:target.id);
                    }
                }
                else {
                    creep.memory.harvesting = false;
                    if(Game.flags['LEH'] || Game.flags['LE'] || Game.flags['L']) {
                        console.log( '⚡⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'harvesting energy from:'
                                    , target.name?target.name:target.structureType?target.structureType:target.id
                                    , 'with err:'
                                    , err);
                    }
                }
            }
            else {
                    creep.memory.harvesting = false;
            }
        }

        if(!creep.memory.harvesting) {
            if(creep.memory.rerun) {
                if(creep.pos.x == 26 && creep.pos.y == 34) {
                    creep.move(BOTTOM_RIGHT);
                }
            }
            else {
                creep.say('🔃');
                creep.memory.rerun = 1;
                //             roleRerun.run(creep);
                require('role.claimer').run(creep);
            }
        }
    }
};

module.exports = roleEnergyHarvester;

//                                 if(target) {
//                             var err = creep.withdraw(target, RESOURCE_ENERGY);
//                             if(err == ERR_NOT_IN_RANGE) {
//                                 creep.moveTo(target, {visualizePaathStyle: {stroke: '#ffffff'}});
// 								creep.say('➡️⚡⚡');
//                             }
//                             else if(!err) {
// 								creep.say('⚡⚡');
// 							}
// 						}
// 					}
// 				}
// 			}
//             else if(!err) {
// 				creep.say('⚡');
// 				if(creep.memory.starttimemoving) {
// 					Memory.harvestersMovements.Value.v += Game.time - creep.memory.starttimemoving;
//                     Memory.harvestersMovements.Count.v += 1;
//                     Memory.harvestersMovements.Avg.v = Math.floor(Memory.harvestersMovements.Value.v / Memory.harvestersMovements.Count.v) ;
//                     creep.memory.starttimemoving = 0;
//                 }
//             }
//             else {
//                 if(err != ERR_BUSY && err != ERR_NOT_ENOUGH_RESOURCES) {
//                     console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                                 , '⚡' + creep.name +' harvesting failed with err:'
//                                 , err);
//                 }
//                 creep.memory.harvesting = false;
//             }
//         }

//         if(!creep.memory.harvesting) {
//             if(creep.memory.rerun) {
//                 creep.say('🔃'); 
//             }
//             else {
//                 creep.memory.rerun = 1;
//                 require('role.attacker').run(creep);
//             }
//         }
//     }
// };

// module.exports = roleEnergyHarvester;
