var roleNext = require('role.energy.transferer');

var roleAttacker = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.attacking && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.attacking = false;
        }

        if(!creep.memory.attacking &&
           creep.getActiveBodyparts(RANGED_ATTACK) > 0 &&
           creep.getActiveBodyparts(CARRY) == 0) {
            creep.memory.attacking = true;
        }

        if(creep.memory.attacking) {
            var target;
            if(!target) {
                const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            }
            if(!target) {
                target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            }
            if(target)
            {
                var err = creep.rangedAttack(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜💡');
                    console.log( '🔜💡', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'moving for transfering energy to:'
                                , target.name?target.name:target.structureType);
                }
                else if(!err) {
                    creep.say('💡');
                    console.log( '💡', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'transfering energy to:'
                                , target.name?target.name:target.structureType);
                }
                else {
                    console.log( '💡⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'transfering energy to:'
                                , target.name?target.name:target.structureType
                                , 'with err:'
                                , err);
                    creep.memory.attacking = false;
                }
            }
            else {
                    creep.memory.attacking = false;
            }
        }

        if(!creep.memory.attacking) {
            roleNext.run(creep);
        }
    }
};

module.exports = roleAttacker;
