var roleNext = require('role.energy.transferer');

var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.attacking && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.attacking = false;
        }

        if(!creep.memory.attacking &&
           creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
           creep.getActiveBodyparts(RANGED_ATTACK)) {
           const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
           if(targets.length > 0) {
               creep.memory.target = targets[0].id;
               creep.memory.attacking = true;
           }
        }

        if(creep.memory.attacking) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.rangedAttack(target);
            if(!err) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                           , creep.name, 'attaking hostile creeps'
                           , target.name);
                creep.say('RA');
                creep.memory.attacking = false;
            }
            else {
                creep.memory.attacking = false;
                roleNext.run(creep);
            }
        }
        else {
            roleNext.run(creep);
        }
    }
};

module.exports = roleAttacker;
