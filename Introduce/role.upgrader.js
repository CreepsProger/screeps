var roleHarvester = require('role.harvester');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
        }

        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            var err = creep.upgradeController(creep.room.controller);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🛠');
            }
            else if(!err) {
                creep.say('🛠');
            }
            else {
                creep.memory.upgrading = false;
                roleHarvester.run(creep);
            }
        }
        else {
            roleHarvester.run(creep);
        }
    }
};

module.exports = roleUpgrader;
