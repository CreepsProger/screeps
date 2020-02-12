var roleEnergyTransfererToSpawn = require('role.energy.transferer.to.spawn');

var roleEnergyTransfererToNearestLighter = {

    /** @param {Creep} creep **/
    run: function(creep) {


        if(creep.memory.transfering.energy.to.nearest.lighter && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.nearest.lighter = false;
        }

        if(!creep.memory.transfering.energy.to.nearest.lighter && creep.store.getFreeCapacity() == 0) {
            var targets = creep.room.find(FIND_MY_CREEPS, {
                filter: (nearestLighter) => {
                     return (nearestLighter.store.getFreeCapacity() > 0 &&
                        Math.abs(nearestLighter.pos.x - creep.pos.x) <= 1 &&
                        Math.abs(nearestLighter.pos.y - creep.pos.y) <= 1 &&
                        nearestLighter.hitsMax < creep.hitsMax &&
                        nearestLighter.id != creep.id);
                }
            });
        
            if(targets.length > 0) {
                creep.memory.transfering.energy.to.nearest.lighter = true;
                creep.memory.target = targets[0].id;
            }
        }

        if(creep.memory.transfering.energy.to.nearest.lighter) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target, RESOURCE_ENERGY);
            if(!err) {
                creep.say('⚡🐇');
            }
            else {
                creep.memory.transfering.energy.to.nearest.lighter = false;
                roleEnergyTransfererToNearestLighter.run(creep);
            }
        }
        else {
            roleEnergyTransfererToSpawn.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToNearestLighter;
