var roleEnergyHarvester = {

    var maxHarvesterMovementsToSource = 100;

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

        if(creep.memory.harvesting) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.harvest(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.memory.movements += 1;
                if(creep.memory.movements >= maxHarvesterMovementsToSource) {
                   console.log( '✒️', Game.time
                              , '⚡ ❓ harvesting failed by movements >= maxHarvesterMovementsToSource :'
                              , creep.memory.movements
                              , '/'
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
                    creep.say('⚡');
                }
            }
            else if(!err) {
                creep.say('⚡');
                
                Memory.harvestersMovements.Value += creep.memory.movements;
                Memory.harvestersMovements.Count += 1;
                Memory.harvestersMovements.Avg = Math.floor(Memory.harvestersMovements.Value / Memory.harvestersMovements.Count) ;
                creep.memory.movements = 0;
            }
            else {
                console.log( '✒️', Game.time
                    , '⚡ harvesting failed with err:'
                    , err
                    , 'for creep:' 
                    , creep.name);
                creep.memory.movements = 0;
                creep.memory.target_index = 0;
                creep.memory.harvesting = false;
            }
        }
    }
};

module.exports = roleEnergyHarvester;
