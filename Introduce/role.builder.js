var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store.getUsedCapacity[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
        }

        if(!creep.memory.building &&
           (creep.store.getUsedCapacity[RESOURCE_ENERGY] > 0 && creep.store.getFreeCapacity() == 0 ||
            (creep.store.getUsedCapacity[RESOURCE_ENERGY] > 0 && creep.memory.rerun))) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                creep.memory.building = true;
                creep.memory.target = targets[0].id;
            }
//             else if(targets.length > 0) {
//                 creep.memory.building = true;
//                 creep.memory.target = targets[1].id;
//             }
        }

        if(creep.memory.building) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.build(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🔜🏗');
            }
            else if(err == ERR_NO_BODYPART) {
                var new_target;
                if(!new_target && creep.store.getUsedCapacity(RESOURCE_ENERGY) < creep.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    new_target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (target_creep) => {
                        return target_creep.memory.harvesting &&
                            target_creep.memory.weight > creep.memory.weight;
                        }
                    });
                    if(new_target)
                        creep.say('🤫⚡🏗');
                }
                if(!new_target) {
                    new_target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                    filter: (target_creep) => {
                        return target_creep.memory.building &&
                            target_creep.store.getFreeCapacity(RESOURCE_ENERGY) > 50 &&
                            target_creep.memory.weight < creep.memory.weight;
                        }
                    });
                    if(new_target)
                        creep.say('🤫🏗');
                }
                if(new_target) {
                    creep.moveTo(new_target, {visualizePaathStyle: {stroke: '#ffffff'}});
                    creep.memory.target = new_target.id;
                }
                else
                    creep.memory.building = false;
            }
            else if(!err) {
                creep.say('🏗');
            }
            else {
                creep.memory.building = false;
                roleUpgrader.run(creep);
            }
        }
        else {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleBuilder;
