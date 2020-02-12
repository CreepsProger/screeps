var roleEnergyTransfererToAll = require('role.energy.transferer.to.all');
var roleEnergyTransfererToNearestLighter = require('role.energy.transferer.to.nearest.lighter');

var roleEnergyTransfererToSpawns = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.transfering.energy.to.spawns && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.spawns = false;
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
            }
        }

        if(creep.memory.transfering.energy.to.spawns) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target, RESOURCE_ENERGY);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('⚡☀️');
                roleEnergyTransfererToNearestLighter.run(creep);
            }
            else if(!err) {
                creep.say('⚡☀️');
            }
            else {
                creep.memory.transfering.energy.to.spawns = false;
            roleEnergyTransfererToAll.run(creep);
            }
        }
        else {
            roleEnergyTransfererToAll.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToSpawns;
