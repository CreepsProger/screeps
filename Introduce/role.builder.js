var roleUpgrader = require('role.upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('stop building');
        }
            
        if(!creep.memory.building &&
           (creep.store[RESOURCE_ENERGY] > creep.store.getCapacity()/2 ||
            (creep.memory.rerun && creep.store[RESOURCE_ENERGY] > 0))) {
            var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(targets.length > 0) {
                creep.memory.building = true;
                creep.memory.target = targets[0].id;
            }
//             else if(targets.length > 0) {
//                 creep.memory.building = true;
//                 creep.memory.target = targets[1].id;
//             }
        }

        if(creep.memory.building) {
            var target = Game.getObjectById(creep.memory.target);
            var err = creep.build(target);
            if(err == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                creep.say('🔜🏗');
            }
            else if(!err) {
                creep.say('🏗');
            }
            else {
                creep.memory.building = false;
                roleUpgrader.run(creep);
            }
        }
        else {
            roleUpgrader.run(creep);
        }
    }
};

module.exports = roleBuilder;
