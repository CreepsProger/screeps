var roleNext = require('role.attacker');
var flags = require('main.flags');
var log = require('main.log');

var git = '$Format:%H$';

var roleClaimer = {
	
	/** @param {Creep} creep **/
	run: function(creep) {
		if(!creep.memory.claiming.on)
		{
			creep.memory.claiming = {on: false, room: ''};
		}

		if(creep.memory.claiming.on) {
			creep.memory.claiming.on = false;
		}
		
		if(!creep.memory.claiming.on &&
			 creep.getActiveBodyparts(CLAIM) > 0 &&
			 creep.getActiveBodyparts(CARRY) == 0 &&
			 !creep.memory.rerun) {
			creep.memory.claiming.on = true;
		}

		if(!creep.memory.claiming.room) {
			creep.memory.claiming.room = 'W26S33';
		}
		
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
				if(creep.room != creep.memory.claiming.room) {
					const exitDir = Game.map.findExit(creep.room, creep.memory.claiming.room);
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
												, JSON.stringify(creep.memory.claiming));
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
												, JSON.stringify(creep.memory.claiming));
					}
				}
				else {
					if(log.canLog(['LC','LC ','L'])) {
						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
						console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'claiming:'
												, targetinfo
												, 'with err:'
												, err
												, JSON.stringify(creep.memory.claiming));
					}
					creep.memory.claiming.on = false;
				}
			}
			else {
				creep.memory.claiming.on = false;
			}
		}

		if(!creep.memory.claiming.on) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleClaimer;
