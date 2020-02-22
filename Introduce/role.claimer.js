var roleNext = require('role.attacker');

var roleClaimer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.claiming && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.claiming = false;
        }

        if(!creep.memory.claiming &&
           creep.getActiveBodyparts(CLAIM) > 0 &&
           creep.getActiveBodyparts(CARRY) == 0 &&
           !creep.memory.rerun) {
            creep.memory.claiming = true;
        }

        if(creep.memory.claiming) {
            var target;
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTROLLER) &&
                            !structure.my;
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
                if(target.id) {
                    err = creep.reserveController(target);
                }
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜🗝');
                    if(!!Game.flags['LC '] || !!Game.flags['LC'] || !!Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '🔜🗝', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'moving for claiming to:'
                                    , targetinfo);
                    }
                }
                else if(!err) {
                    creep.say('🗝');
                    if(!!Game.flags['LC '] || !!Game.flags['LC'] || !!Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'claiming:'
                                    , targetinfo);
                    }
                }
                else {
                    if(!!Game.flags['LC '] || !!Game.flags['LC'] || !!Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'claiming:'
                                    , targetinfo
                                    , 'with err:'
                                    , err);
                    }
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
