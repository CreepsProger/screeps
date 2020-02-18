var roleNext = require('role.energy.transferer');

function lookNearestLighterAtPosition(room,weight,x,y) { 
    var nearestLighter;
    var look = room.lookAt(x,y);
    look.forEach(function(lookObject) {
        if(lookObject.type == LOOK_CREEPS) {
            if(lookObject[LOOK_CREEPS].store.getFreeCapacity() > 0 &&
               (lookObject[LOOK_CREEPS].memory.weight < weight) ) {
                nearestLighter = lookObject[LOOK_CREEPS];
            }
        }
    });
    return nearestLighter;
}

function lookNearestLighterForCreep(creep) {
    var nearestLighter;
    var nearestLighters = [];
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x+1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x+1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x+1,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    //nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x,creep.pos.y);
    //if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x-1,creep.pos.y-1);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x-1,creep.pos.y);
    if(nearestLighter) nearestLighters.push(nearestLighter);
    nearestLighter = lookNearestLighterAtPosition(creep.room,creep.memory.weight,creep.pos.x-1,creep.pos.y+1);
    if(nearestLighter) nearestLighters.push(nearestLighter); 

    return nearestLighters;
}

var roleTransfererToNearest = {

    /** @param {Creep} creep **/
    run: function(creep) {
        var commit = 01;
        if(!Memory.commits.EnergyTransfererToNearestLighter ||
           Memory.commits.EnergyTransfererToNearestLighter != commit) {
            Memory.commits.EnergyTransfererToNearestLighter = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit EnergyTransfererToNearestLighter'
                        , Memory.commits.EnergyTransfererToNearestLighter);

            for(var name in Game.creeps) {
                var creep = Game.creeps[name];
                creep.memory.transfering_to_nearest = {lighter: false};
            }
        }

        if(creep.memory.transfering_to_nearest && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
            creep.memory.transfering_to_nearest = false;
        }

        if(!creep.memory.transfering_to_nearest &&
           (creep.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity()) ||
            (creep.memory.rerun && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)) {
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
        
            if(targets.length > 0) {
                creep.memory.transfering_to_nearest = true;
                creep.memory.target = targets[0].id;
            }
        }

        if(creep.memory.transfering_to_nearest) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.transfer(target, RESOURCE_ENERGY);
            if(!err) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                           , creep.name, 'transfer energy to'
                           , target.name);
                creep.say('🎁');
                creep.memory.transfering_to_nearest = false;
            }
            else {
                creep.memory.transfering_to_nearest = false;
                roleNext.run(creep);
            }
        }
        else {
            roleNext.run(creep);
        }
    }
};

module.exports = roleTransfererToNearest;
