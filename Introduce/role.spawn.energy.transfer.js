var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

var roleSpawnEnergyTransfer = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.transfering && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering = false;
            creep.say('stop transfering');
        }

        if(!creep.memory.transfering && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_SPAWN) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering = true;
                creep.memory.target = targets[0].id;
                creep.say('transfer energy to a spawn');
            }
        }

        if(creep.memory.transfering) {
            var target = Game.getObjectById(creep.memory.target);
            if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.transfering = false;
                roleBuilder.run(creep);
            }
        }
        else {
            creep.memory.transfering = false;
            roleBuilder.run(creep);
        }
    }
};

module.exports = roleSpawnEnergyTransfer;
