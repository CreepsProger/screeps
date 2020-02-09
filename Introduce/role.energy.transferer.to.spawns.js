var roleEnergyTransfererToAll = require('role.energy.transferer.to.all');

var roleEnergyTransfererToSpawns = {

    /** @param {Creep} creep **/
    run: function(creep) {

        creep.memory = {transfering: { energy: { to: { _: '_'}}}};

        if(creep.memory.transfering.energy.to.spawns && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.spawns = false;
            creep.say('stop E->Spawns');
        }

        if(!creep.memory.transfering.energy.to.spawns && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering.energy.to.spawns = true;
                creep.memory.target = targets[0].id;
                creep.say('E->Spawns');
            }
        }

        if(creep.memory.transfering.energy.to.spawns) {
            var target = Game.getObjectById(creep.memory.target);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.transfering.energy.to.spawns = false;
                roleEnergyTransfererToAll.run(creep);
            }
        }
        else {
            creep.memory.transfering.energy.to.spawns = false;
            roleEnergyTransfererToAll.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToSpawns;
