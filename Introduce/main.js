//import {checkFlags} from 'main.flags.js';
//import {checkMainCommit} from 'main.flags.js';
const constants = require('main.constants');
var mainFlags = require('main.flags');
var roleCreep = require('role.claimer');

var commit = 31;
var ticksToCheckCreepsNumber = 10;
var maxCreepsNumber = 12;
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
   mainFlags.checkFlags(ticksToCheckCreepsNumber);

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
         const targets = tower.pos.findInRange(FIND_MY_CREEPS, 5, {
            filter: (mycreep) => {
               return (mycreep.hitsMax - mycreep.hits > 0 &&
                       mycreep.memory.heal_time != Game.time);
            }
         });
         if(targets.length > 0) {
            target = targets[0];
         }
         if(target) {
            tower.heal(target);
            target.memory.healer = tower.id;
            target.memory.heal_time = Game.time;
         }
      }
   });

   if(Game.time % ticksToCheckCreepsNumber == 0) {
       Memory.totals = { CreepsNumber: 0
                       , Capacity: 0
                       , FreeCapacity: 0
                       , UsedCapacity: 0
                       , hits: 0
                       , hitsMax: 0
                       , WORK: 0
                       , CARRY: 0
                       , MOVE: 0};
      Memory.CreepsNumberByType = {};
      updateMovingAverage(Memory.harvestersMovements.Value);
      updateMovingAverage(Memory.harvestersMovements.Count);
      updateMovingAverage(Memory.harvestersMovements.Avg);
   }

   for(var name in Memory.creeps) {
      var creep = Game.creeps[name];
      if(!creep) {
         if(Memory.creeps[name].type) {
					  const full_type = '' + Memory.creeps[name].type + '/' + Memory.creeps[name].weight;
            Memory.CreepsNumberByType[full_type]--;
				 }
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
							const creep_target_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
                if(creep_target_room == Spawn.room.name && 
									 Memory.totals.CreepsNumber == maxCreepsNumber &&
									 creep.ticksToLive < constants.TICKS_TO_LIVE_TO_RENEW) {
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
					 const full_type = '' + creep.memory.type+'/'+creep.memory.weight;
            if(!Memory.CreepsNumberByType[full_type])
               Memory.CreepsNumberByType[full_type] = 0;
            Memory.CreepsNumberByType[full_type]++;
            Memory.totals.CreepsNumber += 1;
            Memory.totals.Capacity += creep.store.getCapacity();
            Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
            Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
            Memory.totals.hits += creep.hits;
            Memory.totals.hitsMax += creep.hitsMax;
            Memory.totals.WORK += creep.getActiveBodyparts(WORK);
            Memory.totals.CARRY += creep.getActiveBodyparts(CARRY);
            Memory.totals.MOVE += creep.getActiveBodyparts(MOVE);
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
                  , 'h/hM:'
                  , Memory.totals.hits
                  , Memory.totals.hitsMax
                  , 'C/FC/UC:'
                  , Memory.totals.Capacity
                  , Memory.totals.FreeCapacity
                  , Memory.totals.UsedCapacity
                  , 'W/C/M:'
                  , Memory.totals.WORK
                  , Memory.totals.CARRY
                  , Memory.totals.MOVE
                  , 'EA/ECA'
                  , Spawn.room.energyAvailable
                  , Spawn.room.energyCapacityAvailable
                     
//                   , 'hmV/hmC/hmA:'
//                   , Memory.harvestersMovements.Value.v
//                   , Memory.harvestersMovements.Count.v
//                   , Memory.harvestersMovements.Avg.v
//                   , 'hmVd/hmCd/hmdA/hmAd:'
//                   , Memory.harvestersMovements.Value.movingAverage.delta
//                   , Memory.harvestersMovements.Count.movingAverage.delta
//                   , Math.floor(Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta)
//                   , Memory.harvestersMovements.Avg.movingAverage.delta
                  , JSON.stringify(Memory.CreepsNumberByType));

//      if(((Memory.totals.CreepsNumber < 8) || (2 * Memory.totals.FreeCapacity <=  Memory.totals.UsedCapacity)) && !Spawn.spawning) {
      if(!Spawn.spawning) {
         var Controller = Spawn.room.controller;
         const CL = Controller.level;
         var N = Memory.totals.CreepsNumber;

         if(CL >= 5) mainFlags.tryCreateCreep(5000200000007,100, N<(maxCreepsNumber+1)? 2:0); // V 1-1 E   650 Attacker
         if(CL >= 5) mainFlags.tryCreateCreep(       100610, 50, N<(maxCreepsNumber+1)? 4:0); // V 1-2 E  1800   Worker
         if(CL >= 5) mainFlags.tryCreateCreep(        90909, 40, N<(maxCreepsNumber+1)? 5:0); // V 1-1 E  1800   Worker
         if(CL >= 5) mainFlags.tryCreateCreep(  20000000002,100, N<(maxCreepsNumber+1)? 1:0); // V 1-1 E  1300  Claimer

         if(CL >= 4) mainFlags.tryCreateCreep(        80808, 30, Memory.totals.WORK< 8? 1:0); // E 1600 Worker
         if(CL >= 4) mainFlags.tryCreateCreep(        70707, 30, Memory.totals.WORK< 7? 1:0); // E 1400 Worker
         if(CL >= 3) mainFlags.tryCreateCreep(        60606, 30, Memory.totals.WORK< 6? 1:0); // E 1200 Worker
         if(CL >= 3) mainFlags.tryCreateCreep(        50505, 30, Memory.totals.WORK< 5? 1:0); // E 1000 Worker
         if(CL >= 3) mainFlags.tryCreateCreep(        40404, 30, Memory.totals.WORK< 4? 1:0); // E  800 Worker

         if(CL >= 2) mainFlags.tryCreateCreep(          506, 45, Memory.totals.CARRY< 6? 1:0); // E 550 Carier

         if(CL >= 1) mainFlags.tryCreateCreep(          303, 45, Memory.totals.CARRY< 3? 1:0); // E 300 Carier
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
