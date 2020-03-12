var roleNext = require('role.withdrawer');

var roleNoEnergyTransferer = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.memory.noenergytransfering &&
            creep.store.getUsedCapacity() == creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            creep.memory.noenergytransfering = false;
        }

        if(!creep.memory.noenergytransfering &&
          creep.store.getUsedCapacity() > creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
            creep.memory.noenergytransfering = false;
        }

        if(creep.memory.noenergytransfering) {
            var target;
            if(!target) {
                target = creep.room.storage;
            }
            if(target) {
                var energy_amount = creep.store.getUsedCapacity(RESOURCE_ENERGY);
                var noenergy_amount = creep.store.getUsedCapacity() - energy_amount;
                var err = creep.transfer(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🚐💦');
                    console.log( '🚐💦', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'moving for transfering no/energy(' + noenergy_amount + '/' + energy_amount + ') to:'
                                , target.name?target.name:target.structureType);
                }
                else if(!err) {
                    creep.say('💦');
                    console.log( '💦', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'transfering no/energy to:'
                                , target.name?target.name:target.structureType);
                }
                else {
                    creep.memory.noenergytransfering = false;
                    console.log( '💦⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                , creep.name
                                , 'transfering no/energy to:'
                                , target.name?target.name:target.structureType
                                , 'with err:'
                                , err);
                }
            }
            else {
                    creep.memory.noenergytransfering = false;
            }
        }

				Memory.cpu.role('noenergytransfering');
        if(!creep.memory.noenergytransfering) {
            roleNext.run(creep);
        }
    }
};

module.exports = roleNoEnergyTransferer;
