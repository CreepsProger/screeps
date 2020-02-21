var roleNext = require('role.attacker');

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.claiming && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.claiming = false;
        }

        if(!creep.memory.claiming &&
           creep.getActiveBodyparts(CLAIM) > 0 &&
           creep.getActiveBodyparts(CARRY) == 0) {
            creep.memory.claiming = true;
        }

        if(creep.memory.claiming) {
            var target;
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTROLLER);
                    }
                });
            }
            if(!target) {
                var hostileRoom = 'W26S33';
                if(creep.room != hostileRoom) {
                    const exitDir = Game.map.findExit(creep.room, hostileRoom);
                    target = creep.pos.findClosestByRange(exitDir);
                }
            }
            if(target)
            {
                var err = ERR_NOT_IN_RANGE;
                if(target.id) creep.rangedAttack(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜🗝');
                    console.log( '🔜🗝', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'moving for claiming on:'
                                , target.name?target.name:target.structureType);
                }
                else if(!err) {
                    creep.say('🗝');
                    console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'claiming on:'
                                , target.name?target.name:target.structureType);
                }
                else {
                    console.log( '🗝⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'claiming on:'
                                , target.name?target.name:target.structureType
                                , 'with err:'
                                , err);
                    creep.memory.claiming = false;
                }
            }
            else {
                    creep.memory.claiming = false;
            }
        }

        if(!creep.memory.claiming) {
            roleNext.run(creep);
        }
    }
};

module.exports = roleClaimer;
