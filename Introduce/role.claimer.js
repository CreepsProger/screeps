var roleNext = require('role.attacker');
var flags = require('main.flags');
var log = require('main.log');

var git = '$Format:%H$';

var role = {
	name: 'claiming',

	logFlags: ['LC','LC ','L'], 
	
	log: function(creep,...args) {
			if(log.canLog(role.logFlags)) {
				console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

	init: function(creep) {
		if(creep.memory[role.name] === undefined ||
			 creep.memory[role.name].on === undefined) {
			creep.memory[role.name] = { on: false
																, room: ''
																};
		}
	},

	checkOff: function(creep) {
		if(creep.memory[role.name].on) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 creep.getActiveBodyparts(CLAIM) > 0 &&
			 creep.getActiveBodyparts(CARRY) == 0 &&
			 creep.memory.rerun) {
			creep.memory[role.name].on = true;

			if(!creep.memory[role.name].room) {
				creep.memory[role.name].room = 'W26S33';
			}
			
// 			role.log(creep,"On");
		}
	},
	
	run: function(creep) {
		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);
		
		if(creep.memory[role.name].on) {
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
				if(creep.room != creep.memory[role.name].room) {
					const exitDir = Game.map.findExit(creep.room, creep.memory[role.name].room);
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
					role.log(creep, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				else if(!err) {
					creep.say('🗝');
					role.log(creep, 'reserveController', JSON.stringify(target));
				}
				else {
					role.log(creep, 'err:', err, JSON.stringify(creep.reserveController));
					creep.memory.claiming.on = false;
				}
			}
			else {
				creep.memory[role.name].on = false;
			}
		}

		if(!creep.memory[role.name].on) {
			roleNext.run(creep);
		}
	}
};

module.exports = role;

//       Memory.config = { claimingRooms: { W26S33     }
//                        , Capacity: 0
//                        , FreeCapacity: 0
//                        , UsedCapacity: 0
//                        , hits: 0
//                        , hitsMax: 0
//                        , WORK: 0
//                        , CARRY: 0
//                        , MOVE: 0};

// var roleClaimer = {
	
// 	/** @param {Creep} creep **/
// 	run: function(creep) {
// 		role.init(creep);
// 		role.checkOn(creep);
// 		role.checkOff(creep);
// 		role.do(creep,next);
		
		
// 		if(creep.memory.claiming.on) {
// 			creep.memory.claiming.on = false;
// 		}
		
		
// 		if(creep.memory.claiming.on) {
// 			var target;
// 			if(!target) {
// 				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
// 					filter: (structure) => {
// 						return (structure.structureType == STRUCTURE_CONTROLLER) &&
// 							!structure.my;
// 					}
// 				});
// 			}
// 			if(!target) {
// 				if(creep.room != creep.memory.claiming.room) {
// 					const exitDir = Game.map.findExit(creep.room, creep.memory.claiming.room);
// 					target = creep.pos.findClosestByRange(exitDir);
// 				}
// 			}
// 			if(target)
// 			{
// 				var err = ERR_NOT_IN_RANGE;
// 				if(target.id) {
// 					err = creep.reserveController(target);
// 				}
// 				if(err == ERR_NOT_IN_RANGE) {
// 					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
// 					creep.say('🔜🗝');
// 					if(log.canLog(['LC','LC ','L'])) {
// 						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
// 						console.log( '🔜🗝', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'moving for claiming'
// 												, JSON.stringify(creep.memory.claiming)
// 												, 'from'
// 												, creep.room, creep.room.pos
// 												, 'to'
// 												, targetinfo);
// 					}
// 				}
// 				else if(!err) {
// 					creep.say('🗝');
// 					if(log.canLog(['LC','LC ','L'])) {
// 						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
// 						console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'claiming:'
// 												, targetinfo
// 												, JSON.stringify(creep.memory.claiming));
// 					}
// 				}
// 				else {
// 					if(log.canLog(['LC','LC ','L'])) {
// 						var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
// 						console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'claiming:'
// 												, targetinfo
// 												, 'with err:'
// 												, err
// 												, JSON.stringify(creep.memory.claiming));
// 					}
// 					creep.memory.claiming.on = false;
// 				}
// 			}
// 			else {
// 				creep.memory.claiming.on = false;
// 			}
// 		}

// 		if(!creep.memory.claiming.on) {
// 			roleNext.run(creep);
// 		}
// 	}
// };

// module.exports = roleClaimer;
