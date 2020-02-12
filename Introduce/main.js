var roleEnergyTransfererToNearestLighter = require('role.energy.transferer.to.nearest.lighter');

//var mainSettings = require('main.settings');

var ticksToCheckCreepsNumber = 20;

function updateMovingAverage(x) { 
//    console.log( '✒️', Game.time
//                    , 'updateMovingAverage');
   x.movingAverage.delta = x.v - x.movingAverage.vs[x.movingAverage.i];
   x.movingAverage.summ += x.movingAverage.delta;
   x.movingAverage.ma = x.movingAverage.summ / x.movingAverage.vs.length;
   x.movingAverage.vs[x.movingAverage.i] = x.v;
   x.movingAverage.i = (x.movingAverage.i + 1) % x.movingAverage.vs.length;
} 

module.exports.loop = function () {

   if(Game.time == 0 || !Memory.commit0014) {
      Memory.commit0014 = true;
      console.log( '✒️', Game.time
                      , 'Commit 0014');

      Memory.totals
           = { Capacity: 0
             , FreeCapacity: 0
             , UsedCapacity: 0 };

       Memory.harvestersMovements
           = { Value: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
             , Count: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
             ,   Avg: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}};
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
      updateMovingAverage(Memory.harvestersMovements.Value);
      updateMovingAverage(Memory.harvestersMovements.Count);
      updateMovingAverage(Memory.harvestersMovements.Avg);
   }

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
                  , Memory.harvestersMovements.Value.v
                  , Memory.harvestersMovements.Count.v
                  , Memory.harvestersMovements.Avg.v
                  , 'hmVd/hmCd/hmdA/hmAd:'
                  , Memory.harvestersMovements.Value.movingAverage.delta
                  , Memory.harvestersMovements.Count.movingAverage.delta
                  , Math.floor(Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta)
                  , Memory.harvestersMovements.Avg.movingAverage.delta);
       
       if(Memory.totals.FreeCapacity <= Memory.totals.UsedCapacity && !Game.spawns['Spawn1'].spawning) {
           var err = ERR_NOT_ENOUGH_ENERGY;
           var newName = 'Creep' + Game.time;

           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
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
         roleEnergyTransfererToNearestLighter.run(creep);
      }
   }
}
