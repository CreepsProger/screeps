var roleNext = require('role.builder');

var rolePickuper = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.pickuping && creep.store.getFreeCapacity() == 0) {
            creep.memory.pickuping = false;
        }

        if(!creep.memory.pickuping &&
          creep.store.getFreeCapacity() > 0 &&
          creep.getActiveBodyparts(WORK) == 0) {
            var target;

            if(!target) {
                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            }
            if(target) {
                creep.memory.pickuping = true;
                creep.memory.target = target.id;
            }
        }

        if(creep.memory.pickuping) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.pickup(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('P🚐');
            }
            else if(!err) {
                creep.say('🚐');
            }
            else {
                creep.memory.pickuping = false;
            }
        }

        if(!creep.memory.pickuping) {
            roleNext.run(creep);
        }
    }
};

module.exports = rolePickuper;
