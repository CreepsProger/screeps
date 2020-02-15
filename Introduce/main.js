var roleEnergyTransfererToNearestLighter = require('role.energy.transferer.to.nearest.lighter');

var commit = 29;
var ticksToCheckCreepsNumber = 20;
//var mainSettings = require('main.settings');

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
   var As = Math.trunc(type/0x1000);
   var Ws = Math.trunc(type%0x1000/0x100);
   var Cs = Math.trunc(type%0x1000%0x100/0x10);
   var Ms = Math.trunc(type%0x1000%0x100%0x10);
   for (var i = 0; i < As; i++) {body.push(ATACK);}
   for (var i = 0; i < Ws; i++) {body.push(WORK);}
   for (var i = 0; i < Cs; i++) {body.push(CARRY);}
   for (var i = 0; i < Ms; i++) {body.push(MOVE);}
   var weight = Math.floor(100 * (As + Ws + 2*Cs + Ms) / (Ms + As));
   var energy = 50 * (2*As + 2*Ws + Cs + Ms);
   var existsNumber = 0;
   if(Memory.CreepsNumberByType[type])
      existsNumber = Memory.CreepsNumberByType[type];
   var creepsNumber = Memory.totals.CreepsNumber;
   if(creepsNumber < 8)
      creepsNumber = 8;
//   var needsNumber = Math.max(min,Math.floor(creepsNumber * 100 / weight)) - existsNumber;
   var needsNumber = min - existsNumber;
   var newName = 'creep-' + As.toString(16) + Ws.toString(16) + Cs.toString(16) + Ms.toString(16) + '-' + Game.time % 10000;
//   var newName = 'creep-' + As + Ws + Cs + Ms + '-' + Game.time % 10000;
   console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , 'trying create a creep:'
                    , newName
                    , type
                    , body
                    , 'exists:'
                    , existsNumber
                    , 'needs:'
                    , needsNumber
                    , 'energy:'
                    , energy
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

   if(!Memory.commits.main ||
      Memory.commits.main != commit ||
      Game.flags['commit']) {
      Memory.commits.main = commit;
      console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                  , 'Commit main'
                  , Memory.commits.main
                  , Game.flags['commit']);
      if(Game.flags['commit'])
         Game.flags['commit'].remove();

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
                     , creep.memory.type.toString(16)
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

   //Test;
   var T = Game.flags['T'];
   if(T) {
      var N = 1234;
      console.log( 'Ｔ', Math.trunc(Game.time/10000), Game.time%10000
                  , T
                  , 'String.fromCharCode(65):'
                  , String.fromCharCode(65)
                  , 'N:'
                  , N
                  , 'N.toString(16).toUpperCase():'
                  , N.toString(16).toUpperCase()
                 );
      T.remove();
   }

   //Destroy Extention;
   var DE = Game.flags['DE'];
   if(DE) {
      var extention = DE.pos.findClosestByPath(FIND_MY_STRUCTURES, {
         filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
         }
      });
      if(extention) {
         var err = extention.destroy();
         console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                     , JSON.stringify(DE)
                     , 'destroying extention:'
                     , extention
                     , 'err:'
                     , err);
         if(!err) {
            DE.remove();
         }
      }
      else {
         DE.remove();
      }
   }
   //Remeve all constructions sites';
   var RACS = Game.flags['RACS'];
   if(RACS) {
      console.log( '❌⚪️⚪️⚪️', Math.trunc(Game.time/10000), Game.time%10000
                       , JSON.stringify(RACS)
                       , JSON.stringify(Game.constructionSites));
      for(var name in Game.constructionSites) {
         var constructionSite = Game.constructionSites[name];
         if(constructionSite) {
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                             , 'removing constructionSite:'
                             , constructionSite);
            constructionSite.remove();
         }
      }
      RACS.remove();
   }
   for(var name in Game.flags) {
      var flag = Game.flags[name];
      if(flag) {
         console.log( '🏳️‍🌈', Math.trunc(Game.time/10000), Game.time%10000
                          , 'flag:'
                          , flag);
      }
   }

   var tower = Game.getObjectById('5e45eb20d4e9fbbbbb4bee7d');
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
   
   var Spawn = Game.spawns['Spawn1'];
   
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

      var Controller = Spawn.room.controller;
      const CL = Controller.level;

//      if(((Memory.totals.CreepsNumber < 8) || (2 * Memory.totals.FreeCapacity <=  Memory.totals.UsedCapacity)) && !Spawn.spawning) {
      if(!Spawn.spawning) {
         var err = ERR_NOT_ENOUGH_ENERGY;


         if(CL >= 4) err = tryCreateCreep(err, 0x1BB, 0); // E 1300 w=366
         if(CL >= 4) err = tryCreateCreep(err, 0x748, 0); // E 1300 w=287
         if(CL >= 4) err = tryCreateCreep(err, 0x499, 0); // E 1300 w=344 Carrier 1
         if(CL >= 4) err = tryCreateCreep(err, 0x686, 0); // E 1300 w=466
         if(CL >= 4) err = tryCreateCreep(err, 0x2B9, 0); // E 1300 w=366
         if(CL >= 4) err = tryCreateCreep(err, 0x677, 0); // E 1300 w=385
         if(CL >= 4) err = tryCreateCreep(err, 0x668, 0); // E 1300 w=325 
         if(CL >= 4) err = tryCreateCreep(err, 0x748, 1); // E 1300 w=287 Worker 1
         if(CL >= 4) err = tryCreateCreep(err, 0x971, 0); // E 1300 w=2400
         if(CL >= 4) err = tryCreateCreep(err, 0x891, 0); // E 1300 w=2700
         if(CL >= 4) err = tryCreateCreep(err, 0x7B1, 0); // E 1300 w=3000
         if(CL >= 4) err = tryCreateCreep(err, 0x6D1, 1); // E 1300 w=3000 Miner 1

         if(CL >= 3) err = tryCreateCreep(err, 0x257, 0); // E 800 w=271 Carrier 1
         if(CL >= 3) err = tryCreateCreep(err, 0x426, 0); // E 800 w=233 Worker 1
         if(CL >= 3) err = tryCreateCreep(err, 0x471, 0); // E 800 w=1900 Miner 2
//       if(CL >= 3) err = tryCreateCreep(err, 0x239, 0); // E 800 w=188
//       if(CL >= 3) err = tryCreateCreep(err, 0x328, 0); // E 800 w=187
//       if(CL >= 3) err = tryCreateCreep(err, 0x417, 0); // E 800 w=185
//       if(CL >= 3) err = tryCreateCreep(err, 0x435, 0); // E 800 w=300
//       if(CL >= 3) err = tryCreateCreep(err, 0x159, 0); // E 800 w=222
//       if(CL >= 3) err = tryCreateCreep(err, 0x248, 0); // E 800 w=225
//       if(CL >= 3) err = tryCreateCreep(err, 0x551, 0); // E 800 w=1600

         if(CL >= 2) err = tryCreateCreep(err, 0x145, 0); // E 550 Carrier
         if(CL >= 2) err = tryCreateCreep(err, 0x323, 0); // E 550 Worker
         if(CL >= 2) err = tryCreateCreep(err, 0x421, 0); // E 550 Miner

         if(CL >= 1) err = tryCreateCreep(err, 0x113, 0); // E 300 Worker
         if(CL >= 1) err = tryCreateCreep(err, 0x033, 0); // E 300 Carrier
         if(CL >= 1) err = tryCreateCreep(err, 0x211, 0); // E 300 Miner
      }
   }

   if(Spawn.spawning) {
      var spawningCreep = Game.creeps[Spawn.spawning.name];
      Spawn.room.visual.text(
         '🛠️' + spawningCreep.memory.role,
         Spawn.pos.x + 1,
         Spawn.pos.y,
         {align: 'left', opacity: 0.8});
   }
   
   for(var name in Game.creeps) {
      var creep = Game.creeps[name];
//       console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                   , 'go'
//                   , creep);

      if(creep.memory.role == 'creep') {
         creep.memory.rerun = 0;
         //require('role.energy.harvester').run(creep);
         roleEnergyTransfererToNearestLighter.run(creep);
      }
   }
}
