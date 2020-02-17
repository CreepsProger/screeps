var roleEnergyTransferer = require('role.energy.transferer');

var roleEnergyPickuper = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.pickuping && creep.store.getFreeCapacity() == 0) {
            creep.memory.withdrawing = false;
        }

        if(!creep.memory.pickuping &&
          creep.store.getFreeCapacity() > 0) {
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
                roleEnergyTransferer.run(creep);
            }
        }
        else {
            roleEnergyTransferer.run(creep);
        }
    }
};

module.exports = roleEnergyPickuper;
