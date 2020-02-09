var roleBuilder = require('role.builder');

var roleEnergyTransfererToAll = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.transfering.energy.to.all && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.all = false;
            creep.say('stop E->All');
        }

        if(!creep.memory.transfering.energy.to.all && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_TOWER ||
                        structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering.energy.to.all = true;
                creep.memory.target = targets[0].id;
                creep.say('E->All');
            }
        }

        if(creep.memory.transfering.energy.to.all) {
            var target = Game.getObjectById(creep.memory.target);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.transfering.energy.to.all = false;
                roleBuilder.run(creep);
            }
        }
        else {
            creep.memory.transfering.energy.to.all = false;
            roleBuilder.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToAll;
