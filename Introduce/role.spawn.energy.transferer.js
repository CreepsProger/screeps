var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleEnergyTransferer = require('role.energy.transferer');

var roleSpawnEnergyTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.transfering.energy.to.spawn && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.spawn = false;
            creep.say('stop transfering');
        }

        if(!creep.memory.transfering.energy.to.spawn && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering.energy.to.spawn = true;
                creep.memory.target = targets[0].id;
                creep.say('E->Spawn');
            }
        }

        if(creep.memory.transfering.energy.to.spawn) {
            var target = Game.getObjectById(creep.memory.target);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.transfering.energy.to.spawn = false;
                roleEnergyTransferer.run(creep);
            }
        }
        else {
            creep.memory.transfering.energy.to.spawn = false;
            roleEnergyTransferer.run(creep);
        }
    }
};

module.exports = roleSpawnEnergyTransferer;
