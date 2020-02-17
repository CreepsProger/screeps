var roleEnergyPickuper = require('role.pickuper');

var roleWithdrawer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.withdrawing && creep.store.getFreeCapacity() == 0) {
            creep.memory.withdrawing = false;
        }

        if(!creep.memory.withdrawing &&
           creep.store.getFreeCapacity() > 0 &&
           creep.getActiveBodyparts(WORK) == 0) {
            var target;

            if(!target) {
                target = creep.pos.findClosestByPath(FIND_TOMBSTONES);
            }
            if(target) {
                creep.memory.withdrawing = true;
                creep.memory.target = target.id;
            }
        }

        if(creep.memory.withdrawing) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.withdraw(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('W🚐');
            }
            else if(!err) {
                creep.say('🚐');
            }
            else {
                creep.memory.withdrawing = false;
                rolePickuper.run(creep);
            }
        }
        else {
            rolePickuper.run(creep);
        }
    }
};

module.exports = roleWithdrawer;





         
//             if(!target) {
//                 target = room.find(FIND_TOMBSTONES).forEach(tombstone => {
//                     if(tombstone.creep.my) {
//                         console.log(`My creep died with ID=${tombstone.creep.id} ` +
//                         `and role=${Memory.creeps[tombstone.creep.name].role}`);
//                         var creep = tombstone.pos.findClosestByPath(FIND_MY_CREEPS, {
//                           filter: (creep) => {
//                           return (creep.structureType == STRUCTURE_TOWER) &&
//                             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
//                           }
//                         }
//                     }
//                 });
//             }
//             if(!target) {
//                 target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
//                     filter: (structure) => {
//                         return (structure.structureType == STRUCTURE_TOWER) &&
//                             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
//                     }
//                 });
//             }
