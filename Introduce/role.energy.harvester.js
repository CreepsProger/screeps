//if(!roleEnergyTransfererToNearestLighter) 
//  roleEnergyTransfererToNearestLighter = require('role.energy.transferer.to.nearest.lighter');

var roleEnergyHarvesterCall = 0;

var roleEnergyHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(Game.time == 0 || !Memory.commitEnergyHarvester0003) {
            Memory.commitEnergyHarvester0003 = true;
            console.log( '✒️', Game.time
                       , 'Commit EnergyHarvester 0003');
        }

        if(!creep.memory.target_index) 
           creep.memory.target_index = 0;
        
        if(creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = false;
        }

        if(!creep.memory.harvesting && creep.store.getFreeCapacity() > 0) {
            var targets = creep.room.find(FIND_SOURCES);
            console.log( '✒️', Game.time
                        , '⚡ source targets:'
                        , targets
                        , 'for creep:'
                        , creep.name);
            if(targets.length > 0) {
                creep.memory.harvesting = true;
                creep.memory.target = targets[creep.memory.target_index % targets.length].id;
            }
        }

        var maxHarvesterMovementsToSource = Math.max(200,Math.floor(2 * Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta));

        if(creep.memory.harvesting) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.harvest(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                if(!creep.memory.starttimemoving)
                    creep.memory.starttimemoving = Game.time;
                if(Game.time - creep.memory.starttimemoving > maxHarvesterMovementsToSource) {
                   console.log( '✒️', Game.time
                              , '⚡ ❓ harvesting failed by timemovements > maxHarvesterMovementsToSource :'
                              , Game.time - creep.memory.starttimemoving
                              , '>'
                              , maxHarvesterMovementsToSource
                              , 'for creep:' 
                              , creep.name);
                    creep.memory.starttimemoving = 0;
                    creep.memory.harvesting = false;
                    creep.memory.target_index += 1;
                    creep.say('❓');
                }
                else {
                    require('role.energy.transferer.to.nearest.lighter').run(creep);
                    creep.say('➡️⚡');
                }
            }
            else if(!err) {
                creep.say('⚡');
                
                if(creep.memory.lasterr != 0)
                {
                    Memory.harvestersMovements.Value.v += Game.time - creep.memory.starttimemoving;
                    Memory.harvestersMovements.Count.v += 1;
                    Memory.harvestersMovements.Avg.v = Math.floor(Memory.harvestersMovements.Value.v / Memory.harvestersMovements.Count.v) ;
                }
                creep.memory.starttimemoving = 0;
            }
            else /*if(err != -4)*/ {
                console.log( '✒️', Game.time
                    , '⚡ harvesting failed with err:'
                    , err
                    , 'for creep:' 
                    , creep.name);
                creep.memory.starttimemoving = 0;
                creep.memory.target_index = 0;
                creep.memory.harvesting = false;
            }
            creep.memory.lasterr = err;
        }
    }
};

module.exports = roleEnergyHarvester;
