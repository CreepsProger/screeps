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
            creep.memory.pickuping = true;
        }

        if(creep.memory.pickuping) {
            var target;
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
            }
            if(target) {
                var err = creep.pickup(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜👊');
                    console.log( '🔜👊', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'moving for pickuping:'
                                , target.name?target.name:target.structureType);
                }
                else if(!err) {
                    creep.say('👊');
                    console.log( '👊', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'pickuping:'
                                , target.name?target.name:target.structureType);
                }
                else {
                    creep.memory.pickuping = false;
                    console.log( '👊⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'pickuping :'
                                , target.name?target.name:target.structureType
                                , 'with err:'
                                , err);
                }
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
