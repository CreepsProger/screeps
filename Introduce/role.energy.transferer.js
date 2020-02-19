var roleNext = require('role.noenergy.transferer');

var roleEnergyTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.transfering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.transfering = false;
        }

        if(!creep.memory.transfering &&
           (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity() == 0) ||
            (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun)) {
            creep.memory.transfering = true;
        }

        if(creep.memory.transfering) {
            var target = Game.getObjectById(creep.memory.target);
            if(!target) {
                var closests = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
                    filter: (creep2) => {
                        return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                            creep2.memory.weight < creep2.memory.weight;
                    }
                });
                
                if(closests.lenght > 0) {
                    target = closests[0];
                }
            }            
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_SPAWN) &&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
                    }
                });
            }
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getUsedCapacity(RESOURCE_ENERGY) < structure.store.getFreeCapacity(RESOURCE_ENERGY);
                    }
                });
            }
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                    }
                });
            }

            if(!target && !creep.getActiveBodyparts(WORK)) {
                target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_TOWER) &&
                            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 100;
                    }
                });
            }
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.store.getFreeCapacity(RESOURCE_ENERGY) >= 50 &&
                            creep2.memory.weight < creep.memory.weight;
                    }
                });
            }
            var err = creep.transfer(target, RESOURCE_ENERGY);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🔜💡');
            }
            else if(!err) {
                creep.say('💡');
            }
            else {
                creep.memory.transfering = false;
            }
        }

        if(!creep.memory.transfering) {
            roleNext.run(creep);
        }
    }
};

module.exports = roleEnergyTransferer;
