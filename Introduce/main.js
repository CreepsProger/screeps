var roleEnergyTransfererToNearestLighter = require('role.energy.transferer.to.nearest.lighter');

//var mainSettings = require('main.settings');

var ticksToCheckCreepsNumber = 20;

function updateMovingAverage(x) { 
//    console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                    , 'updateMovingAverage');
   x.movingAverage.delta = x.v - x.movingAverage.vs[x.movingAverage.i];
   x.movingAverage.summ += x.movingAverage.delta;
   x.movingAverage.ma = x.movingAverage.summ / x.movingAverage.vs.length;
   x.movingAverage.vs[x.movingAverage.i] = x.v;
   x.movingAverage.i = (x.movingAverage.i + 1) % x.movingAverage.vs.length;
} 

function tryCreateCreep(err, type, min = 0) {
   var body = [];
   var weight = 0;
   var Ws = 0;
   var Cs = 0;
   var Ms = 0;
   for (var i = 0; i < type.length; i++) {
      switch (type.charAt(i)) {
         case 'W':  body.push(WORK); Ws += 1; break;
         case 'C':  body.push(CARRY); Cs += 1; break;
         case 'M':  body.push(MOVE); Ms += 1; break;
      }
   }
   var weight = Math.floor(100 * (Ws + 2*Cs + Ms) / Ms);
   var existsNumber = 0;
   if(Memory.CreepsNumberByType[type])
      existsNumber = Memory.CreepsNumberByType[type];
   var creepsNumber = Memory.totals.CreepsNumber;
   if(creepsNumber < 8)
      creepsNumber = 8;
   var needsNumber = Math.max(min,Math.floor(creepsNumber * 100 / weight)) - existsNumber;
   var newName = 'Creep-' + type + '-' + Game.time % 10000;
   console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , 'trying create a creep:'
                    , newName
                    , type
                    , body
                    , 'exists:'
                    , existsNumber
                    , 'needs:'
                    , needsNumber
                    , 'weight:'
                    , weight
                  );
   if(err && needsNumber > 0) {
      err = Game.spawns['Spawn1'].spawnCreep(body
                                           , newName
                                           , {memory: {n: Memory.CreepsCounter, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
      if(!err) {
         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                          , 'Spawning new creep:'
                          , newName);
         if(!Memory.CreepsNumberByType[type])
            Memory.CreepsNumberByType[type] = 0;
         Memory.CreepsNumberByType[type]++;
         Memory.CreepsCounter++;
      }
   }
   return err;
}

module.exports.loop = function () {
   var commit = 22;
   if(!Memory.commits.main ||
      Memory.commits.main != commit) {
      Memory.commits.main = commit;
      console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                  , 'Commit main'
                  , Memory.commits.main);

      Memory.CreepsCounter = 0;
      Memory.CreepsNumberByType = {};

      for(var name in Game.creeps) {
         var creep = Game.creeps[name];

         Memory.CreepsCounter++;
         if(!Memory.CreepsNumberByType[creep.memory.type])
            Memory.CreepsNumberByType[creep.memory.type] = 0;
         Memory.CreepsNumberByType[creep.memory.type]++;

         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                     , 'Commit main'
                     , commit
                     , creep
                     , 'creep.memory.type'
                     , creep.memory.type
                     , Memory.CreepsNumberByType[creep.memory.type]
                     , Memory.CreepsCounter);
      }
         
      console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                     , 'Commit main'
                     , commit
                     , 'Memory.CreepsCounter:'
                     , Memory.CreepsCounter
                     , 'Memory.CreepsNumberByType:'
                     , Memory.CreepsNumberByType
                     , JSON.stringify(Memory.CreepsNumberByType));

      Memory.totals = { CreepsNumber: 0
                      , Capacity: 0
                      , FreeCapacity: 0
                      , UsedCapacity: 0
                      , HitsMax: 0};

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
       Memory.totals = { CreepsNumber: 0
                       , Capacity: 0
                       , FreeCapacity: 0
                       , UsedCapacity: 0
                       , HitsMax: 0};
      updateMovingAverage(Memory.harvestersMovements.Value);
      updateMovingAverage(Memory.harvestersMovements.Count);
      updateMovingAverage(Memory.harvestersMovements.Avg);
   }

   for(var name in Memory.creeps) {
      var creep = Game.creeps[name];
      if(!creep) {
         if(Memory.creeps[name].type)
            Memory.CreepsNumberByType[Memory.creeps[name].type]--;
         delete Memory.creeps[name];
         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , 'Clearing non-existing creep memory:'
                    , name);
      }
   }

   if(Game.time % ticksToCheckCreepsNumber == 0) {
//          var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
         Memory.totals.CreepsNumber = 0;
         for(var name in Game.creeps) {
            var creep = Game.creeps[name];
            Memory.totals.CreepsNumber += 1;
            Memory.totals.Capacity += creep.store.getCapacity();
            Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
            Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
            Memory.totals.HitsMax += creep.hitsMax;
         }

         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                  , 'Creeps Number:'
                  , Memory.totals.CreepsNumber
                  , 'H/aH:'
                  , Memory.totals.HitsMax
                  , Math.floor(Memory.totals.HitsMax / Memory.totals.CreepsNumber)
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
                  , Memory.harvestersMovements.Avg.movingAverage.delta
                  , JSON.stringify(Memory.CreepsNumberByType));

      if(((Memory.totals.CreepsNumber < 12) || (2 * Memory.totals.FreeCapacity <=  Memory.totals.UsedCapacity)) && !Game.spawns['Spawn1'].spawning) {
         var err = ERR_NOT_ENOUGH_ENERGY;
         err = tryCreateCreep(err, 'WWWWCCM',4); // E 550
         err = tryCreateCreep(err, 'WWWCCMMM',8); // E 550
         err = tryCreateCreep(err, 'WWCMMM',4); // E 400
         err = tryCreateCreep(err, 'WWWCM',4); // E 400
         err = tryCreateCreep(err, 'WCCCMMM',4); // E 400
         err = tryCreateCreep(err, 'WWCM',4); // E 300
         err = tryCreateCreep(err, 'WCCMM',4); // E 300
         err = tryCreateCreep(err, 'WCMMM',4); // E 300
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
//       console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                   , 'go'
//                   , creep);

      if(creep.memory.role == 'creep') {
         //require('role.energy.harvester').run(creep);
         roleEnergyTransfererToNearestLighter.run(creep);
      }
   }
}
