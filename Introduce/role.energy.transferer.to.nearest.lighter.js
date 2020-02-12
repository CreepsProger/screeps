var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');

function lookNearestLighterAtPosition(room,hitsMax,x,y) { 
    var nearestLighter;
    var look = room.lookAt(x,y);
    look.forEach(function(lookObject) {
        if(lookObject.type == LOOK_CREEPS) {
            if(lookObject[LOOK_CREEPS].store.getFreeCapacity() > 0 &&
               lookObject[LOOK_CREEPS].hitsMax < hitsMax) {
                nearestLighter = lookObject[LOOK_CREEPS];
            }
        }
    });
    return nearestLighter;
}

function lookNearestLighterForCreep(creep) {
    var nearestLighter;
    var nearestLighters = [];
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x+1,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    //nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y);
    //if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.hitsMax,creep.pos.x-1,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter); 

//     console.log( '✒️', Game.time
//                     , 'NearestLighterForCreep'
//                     , creep.name
//                     , nearestLighters);
    return nearestLighters;
}

var thisFunctionCalls = 0;

var roleEnergyTransfererToNearestLighter = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(Game.time == 0 || !Memory.commitEnergyTransfererToNearestLighter0003) {
            Memory.commitEnergyTransfererToNearestLighter0003 = true;
            console.log( '✒️', Game.time
                       , 'Commit EnergyTransfererToNearestLighter 0003');
            
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
//              var targets = creep.room.find(FIND_MY_CREEPS, {
//                  filter: (nearestLighter) => {
//                       return (nearestLighter.store.getFreeCapacity() > 0 &&
//                          Math.abs(nearestLighter.pos.x - creep.pos.x) <= 1 &&
//                          Math.abs(nearestLighter.pos.y - creep.pos.y) <= 1 &&
//                          nearestLighter.hitsMax < creep.hitsMax &&
//                          nearestLighter.id != creep.id);
//                  }
//              });
        
            if(targets.length > thisFunctionCalls) {
                creep.memory.transfering.energy.to.nearest.lighter = true;
                creep.memory.target = targets[thisFunctionCalls].id;
            }
        }

        if(creep.memory.transfering.energy.to.nearest.lighter) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target, RESOURCE_ENERGY);
            console.log( '✒️', Game.time
                       , 'try transfer to'
                       , target.name
                       , 'err:' 
                       , err);

            if(!err) {
                creep.say('⚡🐇');
            }
            else {
                creep.memory.transfering.energy.to.nearest.lighter = false;
                if(thisFunctionCalls++ < 9) {
                    roleEnergyTransfererToNearestLighter.run(creep);
                }
                else {
                    roleEnergyTransfererToSpawns.run(creep);
                }
            }
        }
        else {
            roleEnergyTransfererToSpawns.run(creep);
        }
    }
};

module.exports = roleEnergyTransfererToNearestLighter;
