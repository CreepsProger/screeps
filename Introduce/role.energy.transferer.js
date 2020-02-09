var roleSpawnEnergyTransfer = require('role.spawn.energy.transfer');

var roleEnergyTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.transfering.energy && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy = false;
            creep.say('stop transfering');
        }

        if(!creep.memory.transfering.energy && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering.energy = true;
                creep.memory.target = targets[0].id;
                creep.say('transfer E');
            }
        }

        if(creep.memory.transfering.energy) {
            var target = Game.getObjectById(creep.memory.target);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.transfering.energy = false;
                roleBuilder.run(creep);
            }
        }
        else {
            creep.memory.transfering.energy = false;
            roleBuilder.run(creep);
        }
    }
};

module.exports = roleEnergyTransferer;
