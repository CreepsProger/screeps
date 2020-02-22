var roleNext = require('role.attacker');
var flags = require('main.flags');
var log = require('main.log');

var git = '$Format:%H$';

var roleClaimer = {
	
	/** @param {Creep} creep **/
	run: function(creep) {
		if(creep.memory.claiming && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory.claiming = false;
		}
		
		if(!creep.memory.claiming &&
			 creep.getActiveBodyparts(CLAIM) > 0 &&
			 creep.getActiveBodyparts(CARRY) == 0 &&
			 !creep.memory.rerun) {
			creep.memory.claiming = true;
		}
		
		var targetRoom = 'W26S33';
		
		if(creep.memory.claiming) {
			var target;
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTROLLER) &&
							!structure.my;
					}
				});
			}
			if(!target) {
				if(creep.room != targetRoom) {
					const exitDir = Game.map.findExit(creep.room, targetRoom);
					target = creep.pos.findClosestByRange(exitDir);
				}
			}
			if(target)
			{
				var err = ERR_NOT_IN_RANGE;
				if(target.id) {
					err = creep.reserveController(target);
				}
				if(err == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					creep.say('🔜🗝');
					if(log.canLog(['LC','LC ','L'])) {
						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
						console.log( '🔜🗝', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'moving for claiming to:'
												, targetinfo
												, targetRoom);
					}
				}
				else if(!err) {
					creep.say('🗝');
					if(log.canLog(['LC','LC ','L'])) {
						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
						console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'claiming:'
												, targetinfo
												, targetRoom);
					}
				}
				else {
					if(log.canLog(['LC','LC ','L'])) {
						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
						console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'claiming:'
												, targetinfo
												, targetRoom
												, 'with err:'
												, err);
					}
					creep.memory.claiming = false;
				}
			}
			else {
				creep.memory.claiming = false;
			}
		}

		if(!creep.memory.claiming) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleClaimer;
