var roleEnergyHarvester = require('role.energy.harvester');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
        }

        if(!creep.memory.upgrading &&
           (creep.store[RESOURCE_ENERGY] > creep.store.getFreeCapacity() ||
            (creep.memory.rerun && creep.store[RESOURCE_ENERGY] > 0))) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            var err = creep.upgradeController(creep.room.controller);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🛠');
            }
            else if(err == ERR_NO_BODYPART) {
                var new_target = target.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > creep2.store.getFreeCapacity(RESOURCE_ENERGY) &&
                            creep.memory.weight < creep2.memory.weight;
                        }
                });
                if(new_target) {
                    creep.moveTo(new_target, {visualizePaathStyle: {stroke: '#ffffff'}});
                    creep.memory.target = new_target.id;
                    creep.say('🤫🛠');
                }
            }
            else if(!err) {
                creep.say('🛠');
            }
            else {
                creep.memory.upgrading = false;
                roleEnergyHarvester.run(creep);
            }
        }
        else {
            roleEnergyHarvester.run(creep);
        }
    }
};

module.exports = roleUpgrader;
