var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('stop building');
        }
            
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                creep.memory.building = true;
                creep.memory.target = targets[0].id;
                creep.say('🚧 build');
            }
        }

        if(creep.memory.building) {
            creep.say('🚧');
            var target = Game.getObjectById(creep.memory.target);
            if(creep.build(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.memory.building = false;
                roleUpgrader.run(creep);
            }
        }
        else {
            creep.memory.building = false;
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleBuilder;
