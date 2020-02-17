var roleEnergyTransferer = require('role.energy.transferer');

var roleEnergyWithdrawer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.withdrawing && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.withdrawing = false;
        }

        if(!creep.memory.withdrawing) {
            var target;

            if(!target) {
                target = creep.pos.findClosestByPath(FIND_RESURSES);
//                 target = creep.pos.findClosestByPath(FIND_TOMBSTONES);
            }
            if(target) {
                creep.memory.withdrawing = true;
                creep.memory.target = target.id;
            }
        }

        if(creep.memory.withdrawing) {
            var target = Game.getObjectById(creep.memory.target);
//             var err = creep.withdraw(target);
            var err = creep.pickup(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('⚡🚐');
            }
            else if(!err) {
                creep.say('🚐');
            }
            else {
                creep.memory.withdrawing = false;
                roleEnergyTransferer.run(creep);
            }
        }
        else {
            roleEnergyTransferer.run(creep);
        }
    }
};

module.exports = roleEnergyWithdrawer;





         
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
