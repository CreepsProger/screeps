//var mainSettings = require('main.settings');
var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');

//var fn = function () { return mainSettings.init(); };
var ticksToCheckCreepsNumber = 50;

module.exports.loop = function () {

    // fn();

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
                  , 'Creeps Number:', Memory.totals.CreepsNumber
                  , 'totals Capacity/FreeCapacity/UsedCapacity:'
                  , Memory.totals.Capacity
                  , Memory.totals.FreeCapacity
                  , Memory.totals.UsedCapacity);
       
       if(Memory.totals.FreeCapacity <= Memory.totals.UsedCapacity && !Game.spawns['Spawn1'].spawning) {
           var err = ERR_NOT_ENOUGH_ENERGY;
           var newName = 'Creep' + Game.time;

           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWWCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWCCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE]
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
               newName = 'Creep-WWWWCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWCMMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWWCCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE]
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
               newName = 'Creep-WWWCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,WORK,CARRY,MOVE,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWCCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE]
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
               newName = 'Creep-WWCCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWCMM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WWCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE]
                                                     , newName
                                                     , {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
           }
           if(err == ERR_NOT_ENOUGH_ENERGY) {
               newName = 'Creep-WCM-' + Game.time;
               err = Game.spawns['Spawn1'].spawnCreep([WORK,CARRY,MOVE]
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
