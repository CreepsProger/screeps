var roleEnergyHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(!creep.memory.movements)
            creep.memory.movements = 0;
        if(!creep.memory.target_index)
            creep.memory.target_index = 0;

        if(creep.memory.harvesting && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.harvesting = false;
        }

        if(!creep.memory.harvesting && creep.store.getFreeCapacity() > 0) {
            var targets = creep.room.find(FIND_SOURCES);
            if(targets.length > 0) {
                creep.memory.harvesting = true;
                creep.memory.target = targets[creep.memory.target_index % targets.length].id;
            }
        }

        var maxHarvesterMovementsToSource = Math.floor(2 * Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta);

        if(creep.memory.harvesting) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.harvest(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.movements += 1;
                if(creep.memory.movements > maxHarvesterMovementsToSource) {
                   console.log( '✒️', Game.time
                              , '⚡ ❓ harvesting failed by movements > maxHarvesterMovementsToSource :'
                              , creep.memory.movements
                              , '>'
                              , maxHarvesterMovementsToSource
                              , 'for creep:' 
                              , creep.name);
                    creep.memory.movements = 0;
                    creep.memory.lastmovements = 0;
                    creep.memory.harvesting = false;
                    creep.memory.target_index += 1;
                    creep.say('❓');
                }
                else {
                    creep.say('➡️⚡');
                }
            }
            else if(!err) {
                creep.say('⚡');
                
                if(creep.memory.lasterr != 0)
                {
                    Memory.harvestersMovements.Value.v += creep.memory.movements;
                    Memory.harvestersMovements.Count.v += 1;
                    Memory.harvestersMovements.Avg.v = Math.floor(Memory.harvestersMovements.Value.v / Memory.harvestersMovements.Count.v) ;
                }
                creep.memory.movements = 0;
            }
            else if(err != -4) {
                console.log( '✒️', Game.time
                    , '⚡ harvesting failed with err:'
                    , err
                    , 'for creep:' 
                    , creep.name);
                creep.memory.movements = 0;
                creep.memory.target_index = 0;
                creep.memory.harvesting = false;
            }
            creep.memory.lasterr = err;
        }
    }
};

module.exports = roleEnergyHarvester;
