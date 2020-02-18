var roleNext = require('role.withdrawer');

var roleNoEnergyTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.noenergytransferer &&
            creep.store.getUsedCapacity() == creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            creep.memory.noenergytransferer = false;
        }

        if(!creep.memory.noenergytransferer &&
          creep.store.getFreeCapacity() > 0 &&
          creep.store.getUsedCapacity() > creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            var target;

            if(!target) {
                target = creep.room.storage;
            }
            if(target) {
                creep.memory.noenergytransferer = true;
                creep.memory.target = target.id;
            }
        }

        if(creep.memory.noenergytransferer) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('NE🚐');
            }
            else if(!err) {
                creep.say('🚐');
            }
            else {
                creep.memory.noenergytransferer = false;
                roleNext.run(creep);
            }
        }
        else {
            roleNext.run(creep);
        }
    }
};

module.exports = roleNoEnergyTransferer;
