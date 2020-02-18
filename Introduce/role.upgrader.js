var roleNext = require('role.energy.harvester');

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.upgrading = false;
        }

        if(!creep.memory.upgrading &&
           (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity() == 0) ||
            (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun)) {
            creep.memory.upgrading = true;
        }

        if(creep.memory.upgrading) {
            var err = creep.upgradeController(creep.room.controller);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🔜🛠');
                creep.memory.upgrading = false;
            }
            else if(err == ERR_NO_BODYPART) {
                var new_target;
                if(!new_target && creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    new_target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.memory.upgrading &&
                            creep.memory.weight < creep2.memory.weight;
                        }
                    });
                    if(new_target)
                        creep.say('🤫⚡🛠');
                }
                if(!new_target) {
                    new_target = creep.room.controller.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (creep2) => {
                        return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 50 &&
                            creep.memory.weight > creep2.memory.weight;
                        }
                    });
                    if(new_target)
                        creep.say('🤫🛠');
                }
                if(new_target) {
                    creep.moveTo(new_target, {visualizePaathStyle: {stroke: '#ffffff'}});
                    creep.memory.target = new_target.id;
                }
                creep.memory.upgrading = false;

            }
            else if(!err) {
                creep.withdraw(creep.room.storage,RESOURCE_ENERGY);
                creep.say('🛠');
            }
            else {
                creep.memory.upgrading = false;
                roleNext.run(creep);
            }
        }
        else {
            roleNext.run(creep);
        }
    }
};

module.exports = roleUpgrader;
