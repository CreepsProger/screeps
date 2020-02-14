var roleBuilder = require('role.builder');

var roleEnergyTransfererToAll = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.transfering.energy.to.all && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.all = false;
        }

        if(!creep.memory.transfering.energy.to.all && creep.store[RESOURCE_ENERGY] > creep.store.getCapacity()/2) {
            var target;
            if(!target) {
                creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_EXTENSION) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(!target) {
                creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_TOWER) &&
                         structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                });
            }
            if(!target) {
                creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                     return (structure.structureType == STRUCTURE_CONTAINER) &&
                         structure.store.getFreeCapacity(RESOURCE_ENERGY) > structure.store.getCapacity(RESOURCE_ENERGY)/2;
                });
            }
            if(target) {
                creep.memory.transfering.energy.to.all = true;
                creep.memory.target = target.id;
            }
        }

        if(creep.memory.transfering.energy.to.all) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target, RESOURCE_ENERGY);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('⚡⛅️');
         //       require('role.energy.transferer.to.nearest.lighter').run(creep);
            }
            else if(!err) {
                creep.say('⚡⛅️');
            }
            else {
                creep.memory.transfering.energy.to.all = false;
                roleBuilder.run(creep);
            }
        }
        else {
            roleBuilder.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToAll;
