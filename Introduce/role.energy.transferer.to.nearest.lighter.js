var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');

function lookNearestLighterAtPosition(room,hitsMax,x,y) { 
    var nearestLighter;
    const look = room.lookAt(x,y);
    look.forEach(function(lookObject) {
        if(lookObject.type == LOOK_CREEPS) {
            nearestLighter = lookObject[LOOK_CREEPS];
            if(nearestLighter.store.getFreeCapacity() > 0 &&
               nearestLighter.hitsMax < hitsMax) {
            }
        }
    });
    return nearestLighter;
}

function lookNearestLighterForCreep(creep) {
    var nearestLighter;
    var nearestLighters
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter); nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y+1);

    console.log( '✒️', Game.time
                    , 'NearestLighterForCreep'
                    , creep.name
                    , nearestLighters);
    return nearestLighters;
}

var roleEnergyTransfererToNearestLighter = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(Game.time == 0 || !Memory.commitEnergyTransfererToNearestLighter0001) {
            Memory.commitEnergyTransfererToNearestLighter0001 = true;
            console.log( '✒️', Game.time
                       , 'Commit commitEnergyTransfererToNearestLighter 0001');
            
            for(var name in Game.creeps) {
                var creep = Game.creeps[name];
                creep.memory.transfering.energy.to.nearest = {lighter: false};
            }
        }


        if(creep.memory.transfering.energy.to.nearest.lighter && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.transfering.energy.to.nearest.lighter = false;
        }

        if(!creep.memory.transfering.energy.to.nearest.lighter && creep.store[RESOURCE_ENERGY] > 0) {
            var targets = lookNearestLighterForCreep(creep);
            targets = creep.room.find(FIND_MY_CREEPS, {
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
            roleEnergyTransfererToSpawns.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToNearestLighter;
