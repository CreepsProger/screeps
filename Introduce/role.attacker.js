var roleNext = require('role.energy.transferer');

var myRoom = 'W25S33';
var hostileRoom = 'W25S34';

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
            if(creep.room == myRoom && creep.hits < creep.hitsMax) {
                var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return structure.structureType == STRUCTURE_RAMPART;
                    }
                });
                if(rampart.pos != creep.pos) {
                    target = rampart;
                    target = creep.room.controller;
                }
            }
            if(creep.room != myRoom && creep.hits < creep.hitsMax) {
                if(!target) {
                    const exitDir = Game.map.findExit(creep.room, myRoom);
                    target = creep.pos.findClosestByRange(exitDir);
                }
            }
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
                const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {
                    filter: (structure) => {
                        return (structure.structureType != STRUCTURE_CONTROLLER);
                    }
                });
                if(targets.length > 0) {
                    target = targets[0];
                }
            }
            if(!target) {
                target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType != STRUCTURE_CONTROLLER);
                    }
                });
            }
            if(!target) {
                if(creep.room != hostileRoom) {
                    const exitDir = Game.map.findExit(creep.room, hostileRoom);
                    target = creep.pos.findClosestByRange(exitDir);
                }
            }
            if(!target) {
                if(creep.room != myRoom) {
                    const exitDir = Game.map.findExit(creep.room, myRoom);
                    target = creep.pos.findClosestByRange(exitDir);
                }
            }
            if(target)
            {
                var err = ERR_NOT_IN_RANGE;
                if(target.id && !(target.structureType == STRUCTURE_RAMPART)) creep.rangedAttack(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜🎯');
                    console.log( '🔜🎯', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'moving for attacking on:'
                                , target.name?target.name:target.structureType);
                }
                else if(!err) {
                    creep.say('🎯');
                    console.log( '🎯', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'attacking on:'
                                , target.name?target.name:target.structureType);
                }
                else {
                    console.log( '🎯⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'attacking on:'
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
