//var mainSettings = require('main.settings');
var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');

//var fn = function () { return mainSettings.init(); };
var ticksToCheckCreepsNumber = 10;

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

   if(Game.time % ticksToCheckCreepsNumber == 0 || Game.time < 1) {
       Memory.totals = { Capacity: 0
                       , FreeCapacity: 0
                       , UsedCapacity: 0
                       };
   }

   for(var name in Memory.creeps) {
      var creep = Game.creeps[name];
      if(!creep) {
         delete Memory.creeps[name];
         console.log('Clearing non-existing creep memory:', name);
      }
      else {
         Memory.totals.Capacity += creep.store.getCapacity();
         Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
         Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
      }
   }

   if(Game.time % ticksToCheckCreepsNumber == 0) {
       console.log('totals Capacity/FreeCapacity/UsedCapacity :'
                   , Memory.totals.Capacity
                   , Memory.totals.FreeCapacity
                   , Memory.totals.UsedCapacity);
       var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
       Memory.totals.CreepsNumber = creeps.length;
       console.log('Creeps Number: ' + Memory.totals.CreepsNumber);
   }

   if(Memory.totals.CreepsNumber < 10) {
      var newName = 'Creep' + Game.time;
      console.log('Spawning new creep: ' + newName);
      Game.spawns['Spawn1'].spawnCreep([WORK,WORK,CARRY,MOVE], newName,
                                       {memory: {role: 'creep', transfering: { energy: { to: { all: false}}}}});
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
