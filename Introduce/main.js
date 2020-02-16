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

function tryCreateCreep(err, type, needed = 0, weight) {
   var body = [];
   var As = Math.trunc(type/1000000);
   var Ws = Math.trunc(type%1000000/10000);
   var Cs = Math.trunc(type%1000000%10000/100);
   var Ms = Math.trunc(type%1000000%10000%100);
   for (var i = 0; i < As; i++) {body.push(ATACK);}
   for (var i = 0; i < Ws; i++) {body.push(WORK);}
   for (var i = 0; i < Cs; i++) {body.push(CARRY);}
   for (var i = 0; i < Ms; i++) {body.push(MOVE);}
   var energy = 50 * (2*As + 2*Ws + Cs + Ms);
   var existsNumber = 0;
   if(Memory.CreepsNumberByType[type])
      existsNumber = Memory.CreepsNumberByType[type];
   var needsNumber = needed - existsNumber;
//   var newName = 'creep-' + weight + '-' + As.toString(16) + Ws.toString(16) + Cs.toString(16) + Ms.toString(16) + '-' + Game.time % 10000;
   var newName = 'creep-' + weight + '-' + As + Ws + Cs + Ms + '-' + Game.time % 10000;
//    console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                     , 'trying create a creep:'
//                     , newName
//                     , type
//                     , body
//                     , 'exists:'
//                     , existsNumber
//                     , 'needs:'
//                     , needsNumber
//                     , 'energy:'
//                     , energy
//                     , 'weight:'
//                     , weight
//                   );
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


   //Destroy Rampart;
   var DR = Game.flags['DR'];
   if(DR) {
      var rampart = DR.pos.findClosestByPath(FIND_STRUCTURES, {
         filter: (structure) => {
            return structure.structureType == STRUCTURE_RAMPART;
         }
      });
      if(rampart) {
         var err = rampart.destroy();
         console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                     , 'Destroy Rampart:'
                     , rampart
                     , 'err:'
                     , err
                     , JSON.stringify(rampart)
                     , JSON.stringify(DR));
         if(!err) {
            DR.remove();
         }
      }
      else {
         DR.remove();
      }
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
      var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(closestHostile) {
         tower.attack(closestHostile);
      }
      var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
         filter: (structure) => { 
            if(structure.structureType == STRUCTURE_RAMPART) {
               return structure.hits < 8000;// E = 10 * 8000 / 800 = 100
            }
            return structure.hitsMax - structure.hits > 800;
         }
      });
      if(closestDamagedStructure) {
         tower.repair(closestDamagedStructure);
      }
      var closestDamagedCreep;
      if(!closestDamagedCreep) {
         closestDamagedCreep = tower.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (mycreep) => {
               return mycreep.hitsMax - mycreep.hits > 400;
            }
         });
      }
      if(closestDamagedCreep) {
         tower.heal(closestDamagedCreep);
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

//      if(((Memory.totals.CreepsNumber < 8) || (2 * Memory.totals.FreeCapacity <=  Memory.totals.UsedCapacity)) && !Spawn.spawning) {
      if(!Spawn.spawning) {
         var Controller = Spawn.room.controller;
         const CL = Controller.level;
         var err = ERR_NOT_ENOUGH_ENERGY;
         var N = Memory.totals.CreepsNumber;

         if(CL >= 4) err = tryCreateCreep(err, 41701, 1, 59); // E 1300   Miner
         if(CL >= 4) err = tryCreateCreep(err,   917, 1, 55); // E 1300 Carrier
         if(CL >= 4) err = tryCreateCreep(err, 71002, 1, 50); // E 1300  Worker
         if(CL >= 4) err = tryCreateCreep(err, 41701, 2, 59); // E 1300   Miner
         if(CL >= 4) err = tryCreateCreep(err,   917, 2, 55); // E 1300 Carrier

         if(CL >= 3) err = tryCreateCreep(err, 40404, N?0:1, 60); // E 800 Worker
//          if(CL >= 3) err = tryCreateCreep(err, 40701, 2, 69); // E 800   Miner
//          if(CL >= 3) err = tryCreateCreep(err, 709, 1, 65); // E 800 Carrier

         if(CL >= 2) err = tryCreateCreep(err, 30302, N?0:0, 70); // E 550 Worker
//          if(CL >= 2) err = tryCreateCreep(err, 40201, 2, 79); // E 550   Miner
//          if(CL >= 2) err = tryCreateCreep(err, 605, 2, 75); // E 550 Carrier

         if(CL >= 1) err = tryCreateCreep(err, 10202, N?0:0, 80); // E 300 Worker
//          if(CL >= 1) err = tryCreateCreep(err, 20101, 4, 89); // E 300   Miner
//          if(CL >= 1) err = tryCreateCreep(err, 303, 2, 85); // E 300 Carrier
      }
   }

   if(Spawn.spawning) {
      Spawn.spawning.setDirections([BOTTOM]);

      var spawningCreep = Game.creeps[Spawn.spawning.name];
      Spawn.room.visual.text(
         '🛠️' + Spawn.spawning.name,
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
