var roleHarvester = require('role.harvester');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('stop upgrading');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }
        if(creep.memory.upgrading) {
            var err = creep.upgradeController(creep.room.controller);
            creep.say('⚡' + err);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            else {
                creep.say('stop U1');
                creep.memory.upgrading = false;
                roleHarvester.run(creep);
            }
        }
        else {
            creep.say('stop U2');
            creep.memory.upgrading = false;
            roleHarvester.run(creep);
        }
    }
};

module.exports = roleUpgrader;
