//import {checkFlags} from 'main.flags.js';
//import {checkMainCommit} from 'main.flags.js';
var mainFlags = require('main.flags');
var roleCreep = require('role.claimer');

var commit = 31;
var ticksToCheckCreepsNumber = 20;
var maxCreepsNumber = 15;
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

module.exports.loop = function () {

   mainFlags.checkMainCommit(commit);
   mainFlags.checkFlags();

   var towers = [];
   towers.push(Game.getObjectById('5e45eb20d4e9fbbbbb4bee7d')) ;
   towers.push(Game.getObjectById('5e4dfed162e84714acb66b58')) ;
   towers.forEach(function(tower) {
      var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      if(target) {
         tower.attack(target);
      }
      
      if(!target) {
         target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => { 
               if(structure.structureType == STRUCTURE_WALL) {
                  return structure.hits < 32000;// 8000 E = 10 * 8000 / 800 = 100
               }
               if(structure.structureType == STRUCTURE_RAMPART) {
                  return structure.hits < 160000;// 8000 E = 10 * 8000 / 800 = 100
               }
               return structure.hitsMax - structure.hits > towers.length*800;
            }
         });
         if(target) {
            tower.repair(target);
         }
      }
      
      if(!target) {
         target = tower.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: (mycreep) => {
               return mycreep.hitsMax - mycreep.hits > 400;
            }
         });
         if(target) {
            tower.heal(target);
         }
      }
      if(!target) {
         const targets = tower.pos.findInRange(FIND_MY_CREEPS, 20, {
            filter: (mycreep) => {
               return (mycreep.hitsMax - mycreep.hits > 0 &&
                       mycreep.memory.healer != tower.id);
            }
         });
         if(targets.length > 0) {
            target = targets[0];
         }
         if(target) {
            tower.heal(target);
            target.memory.healer = tower.id;
         }
      }
   });

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
   
   if(!Spawn.spawning) {
        if(Spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
            Spawn.pos.findInRange(FIND_MY_CREEPS, 1).forEach(function(creep) {
                if(Memory.totals.CreepsNumber == maxCreepsNumber && creep.ticksToLive < 1000) {
                   if(OK == Spawn.renewCreep(creep)) {
                      console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                                  , Spawn.name, 'renew', creep.name);
                      creep.say('👨');
                   }
                }
            });
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
            if(Game.flags['LWE'] || Game.flags['LW'] || Game.flags['L']) {
               console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                           , creep.name
                           , 'work_efficiency(12):'
                           , mainFlags.work_efficiency(creep.memory.type,12)
                           , 'work_efficiency(24):'
                           , mainFlags.work_efficiency(creep.memory.type,24)
                          );
            }
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

         if(CL >= 4) mainFlags.tryCreateCreep(err, 5000100000006, N<(maxCreepsNumber+1)?10:0, 20); // V 1-1 E  500  Attaker
         if(CL >= 4) mainFlags.tryCreateCreep(err,          1212, N<(maxCreepsNumber+1)? 1:0, 55); // V 1-1 E 1800  Claimer
         if(CL >= 4) mainFlags.tryCreateCreep(err,         40404, N<(maxCreepsNumber+1)? 4:0, 50); // V 1-1 E  800   Worker
//          if(CL >= 4) mainFlags.tryCreateCreep(err,   200000002, N<(maxCreepsNumber+1)?2:0, 50); // V 1-1 E 800    Attaker
//          if(CL >= 4) mainFlags.tryCreateCreep(err,     80804, N<(maxCreepsNumber+1)?1:0, 50); // V 1-2 E 1300    Worker
//          if(CL >= 4) mainFlags.tryCreateCreep(err,     60603, N<(maxCreepsNumber+1)?1:0, 59); // V 1-2 E 1300 Harvester
//          if(CL >= 4) mainFlags.tryCreateCreep(err, 400001204, N<(maxCreepsNumber+1)?1:0, 55); // V 1-2 E 1400   Carrier
//          if(CL >= 4) mainFlags.tryCreateCreep(err,    100501, N<(maxCreepsNumber+1)?1:0, 50); // V 1-2 E 1300    Worker

//          if(CL >= 4) mainFlags.tryCreateCreep(err,     60905, N<4?0:0, 50); // V 1-3 E 1300    Worker
//          if(CL >= 4) mainFlags.tryCreateCreep(err, 200001208, N<4?0:0, 56); // V 1-2 E 1300   Carrier

         if(CL >= 3) mainFlags.tryCreateCreep(err, 40404, N?0:1, 60); // E 800 Worker
//          if(CL >= 3) err = tryCreateCreep(err, 40701, 2, 69); // E 800   Miner
//          if(CL >= 3) err = tryCreateCreep(err, 709, 1, 65); // E 800 Carrier

         if(CL >= 2) mainFlags.tryCreateCreep(err, 30302, N?0:0, 70); // E 550 Worker
//          if(CL >= 2) err = tryCreateCreep(err, 40201, 2, 79); // E 550   Miner
//          if(CL >= 2) err = tryCreateCreep(err, 605, 2, 75); // E 550 Carrier

         if(CL >= 1) mainFlags.tryCreateCreep(err, 10202, N?0:0, 80); // E 300 Worker
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
         roleCreep.run(creep);
      }
   }
}
