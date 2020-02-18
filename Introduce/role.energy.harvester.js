var roleEnergyHarvester = {
	
    /** @param {Creep} creep **/
    run: function(creep) {
        var commit = 4;
        if(!Memory.commits.EnergyHarvester ||
           Memory.commits.EnergyHarvester != commit) {
            Memory.commits.EnergyHarvester = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                             , 'Commit EnergyHarvester'
                             , Memory.commits.EnergyHarvester);
        }
        
        if(!creep.memory.target_index && creep.memory.n) 
           creep.memory.target_index = creep.memory.n;

        if(!creep.memory.target_index) 
           creep.memory.target_index = 0;

        if(creep.memory.harvesting &&
           creep.store.getFreeCapacity() == 0) {
            creep.memory.harvesting = false;
        }

        if(!creep.memory.harvesting &&
           (creep.store.getUsedCapacity[RESOURCE_ENERGY] == 0 ||
            creep.memory.rerun)) {
            var targets = creep.room.find(FIND_SOURCES, {
                filter: (source) => source.energy >= (creep.memory.rerun? 0:1)
            });

            if(targets.length > 0) {
                creep.memory.harvesting = true;
                creep.memory.target = targets[creep.memory.target_index % targets.length].id;
//                 creep.memory.target = targets[0].id;
                creep.memory.starttimemoving = Game.time;
            }
        }

        var maxHarvesterMovementsToSource = Math.max(100,Math.floor(2 * Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta));

        if(creep.memory.harvesting) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.harvest(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePaathStyle: {stroke: '#ffffff'}});
                if(creep.memory.starttimemoving &&
                   Game.time - creep.memory.starttimemoving > maxHarvesterMovementsToSource) {
                   console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                              , '⚡' + creep.name + '❓ harvesting failed by timemovements > maxHarvesterMovementsToSource :'
                              , Game.time - creep.memory.starttimemoving
                              , '>'
                              , maxHarvesterMovementsToSource);
                    creep.memory.harvesting = false;
                    creep.memory.target_index += 1;
                    creep.say('⚡❓');
                }
                else {
                    creep.say('➡️⚡');
                }
            }
            else if(!err) {
                creep.say('⚡');

                if(creep.memory.starttimemoving) {
                    Memory.harvestersMovements.Value.v += Game.time - creep.memory.starttimemoving;
                    Memory.harvestersMovements.Count.v += 1;
                    Memory.harvestersMovements.Avg.v = Math.floor(Memory.harvestersMovements.Value.v / Memory.harvestersMovements.Count.v) ;
                    creep.memory.starttimemoving = 0;
                }
            }
            else {
                if(err != ERR_BUSY && err != ERR_NOT_ENOUGH_RESOURCES) {
                    console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                                , '⚡' + creep.name +' harvesting failed with err:'
                                , err);
                }
                creep.memory.harvesting = false;
            }
        }

        if(!creep.memory.harvesting) {
            if(!creep.memory.rerun) {
                creep.memory.rerun = 1;
                creep.say('🔃');
                require('role.attacker').run(creep);
            }
        }
    }
};

module.exports = roleEnergyHarvester;
