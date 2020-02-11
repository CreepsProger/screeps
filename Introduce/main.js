var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');
//var mainSettings = require('main.settings');

var ticksToCheckCreepsNumber = 20;

module.exports.loop = function () {

   console.log( '✒️', Game.time
                   , 'Commit0001'
               );

/*
   if(Game.time == 0 || !Memory.commit0001) { Memory.commit0001 = true;
       Memory.totals
           = { Capacity: 0
             , FreeCapacity: 0
             , UsedCapacity: 0
             };
       Memory.harvestersMovements
           = { Value: 0
             , Count: 0
             ,   Avg: 0
             , movingAverage : Value : { v : [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0 }
             ,                 Count : { v : [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0 }
             ,                   Avg : { v : [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0 }
             };
   }

   var tower = Game.getObjectById('TOWER_ID');
   if(tower) {
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
         filter: (structure) => structure.hits < structure.hitsMax
      });
      if(closestDamagedStructure) {
         tower.repair(closestDamagedStructure);
      }
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(closestHostile) {
         tower.attack(closestHostile);
      }
   }

   if(Game.time % ticksToCheckCreepsNumber == 0) {
       Memory.totals = { Capacity: 0
                       , FreeCapacity: 0
                       , UsedCapacity: 0
                       };
       var index = Memory.harvestersMovements.movingAverage.Value.i;
       var oldNthValue = Memory.harvestersMovements.movingAverage.Value.v[index];
       Memory.harvestersMovements.movingAverage.Value.summ -= oldNthValue;
       var new1stValue = Memory.harvestersMovements.Value;
       Memory.harvestersMovements.movingAverage.Value.v[index] = new1stValue;
       Memory.harvestersMovements.movingAverage.Value.summ += new1stValue;
       Memory.harvestersMovements.movingAverage.Value.i = (index + 1) % Memory.harvestersMovements.movingAverage.Values.v.length;
   }
*/
   for(var name in Memory.creeps) {
      var creep = Game.creeps[name];
      if(!creep) {
         delete Memory.creeps[name];
         console.log( '✒️', Game.time
                    , 'Clearing non-existing creep memory:'
                    , name);
      }
      else {
         Memory.totals.Capacity += creep.store.getCapacity();
         Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
         Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
      }
   }

   if(Game.time % ticksToCheckCreepsNumber == 0) {
       var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
       Memory.totals.CreepsNumber = creeps.length;

       console.log( '✒️', Game.time
                  , 'Creeps Number:'
                  , Memory.totals.CreepsNumber
                  , 'C/FC/UC:'
                  , Memory.totals.Capacity
                  , Memory.totals.FreeCapacity
                  , Memory.totals.UsedCapacity
                  , 'hmV/hmC/hmA:'
                  , Memory.harvestersMovements.Value
                  , Memory.harvestersMovements.Count
                  , Memory.harvestersMovements.Avg
                  , 'mahmV/:'
                  , Memory.harvestersMovements.movingAverage.Value.summ);
       
       if(Memory.totals.FreeCapacity <= Memory.totals.UsedCapacity && !Game.spawns['Spawn1'].spawning) {
           var err = ERR_NOT_ENOUGH_ENERGY;
           var newName = 'Creep' + Game.time;

           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(!err) {
               console.log( '✒️', Game.time
                          , 'Spawning new creep:'
                          , newName);
           }
       }
   }

   if(Game.spawns['Spawn1'].spawning) {
      var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
      Game.spawns['Spawn1'].room.visual.text(
         '🛠️' + spawningCreep.memory.role,
         Game.spawns['Spawn1'].pos.x + 1,
         Game.spawns['Spawn1'].pos.y,
         {align: 'left', opacity: 0.8});
   }
   
   for(var name in Game.creeps) {
      var creep = Game.creeps[name];
      if(creep.memory.role == 'creep') {
         roleEnergyTransfererToSpawns.run(creep);
      }
   }
}
