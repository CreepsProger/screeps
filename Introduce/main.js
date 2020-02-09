//var mainSettings = require('main.settings');
var roleEnergyTransfererToSpawns = require('role.energy.transferer.to.spawns');

//var fn = function () { return mainSettings.init(); };

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

    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
    console.log('Creeps: ' + creeps.length);

    if(creeps.length < 9) {
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
