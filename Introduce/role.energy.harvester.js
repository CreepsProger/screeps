// var roleRerun= require('role.attacker');

var flags = require('main.flags');
var log = require('main.log');

var git = '$Format:%H$';

var role = {
	name: 'energy_harvesting',

	logFlags: ['LEH','LE ','L'], 
	
	log: function(sign, creep, ...args) {
			if(log.canLog(role.logFlags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

	W25S33: { needs: 2, workers: ['1','2'] },
	W26S33: { needs: 2, workers: ['3','4'] },

	init: function(creep) {
		if(true || creep.memory[role.name] === undefined ||
			 creep.memory[role.name].on === undefined) {
			creep.memory[role.name] = { on: false
																, room: ''
																};
// 			if(!role.W25S33.workers.filter(name => name === creep.name) &&
// 				 !role.W26S33.workers.filter(name => name === creep.name))
			if(!role.W25S33.workers.find(name => name === creep.name) &&
				 !role.W26S33.workers.find(name => name === creep.name))
			{
				if(role.W25S33.needs > 0) {
					creep.memory[role.name].room = 'W25S33';
					role.W25S33.needs -= 1;
					role.W25S33.workers[role.W25S33.needs] = creep.name;
				}
				else if(role.W26S33 > 0) {
					creep.memory[role.name].room = 'W26S33';
					role.W26S33.needs -= 1;
					role.W25S33.workers[role.W25S33.needs] = creep.name;
				}
			}
			role.log('I->', creep, 'init', 'role.W25S33:', JSON.stringify(role.W25S33), 'role.W26S33:', JSON.stringify(role.W26S33));
		}
	},

	intConfig: function(creep) {
		if(!creep.memory[role.name].room) {
			creep.memory[role.name].room = 'W25S33';
		}
		return true;
	},

	checkFreeSlot: function(creep) {
		if(!creep.memory[role.name].room) {
			creep.memory[role.name].room = 'W25S33';
		}
		return true;
	},

	reserveFreeSlot: function(creep) {
		return true;
	},

	getTarget: function(creep) {
		var target;
		if(!target) {
			if(creep.room != creep.memory[role.name].room) {
				const exitDir = Game.map.findExit(creep.room, creep.memory[role.name].room);
				target = creep.pos.findClosestByRange(exitDir);
			}
		}
		if(!target && creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
			var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_CONTAINER) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0;
				}
			});
		}
		if(!target && creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
			var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
				filter: (structure) => {
					return (structure.structureType == STRUCTURE_STORAGE) &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) > 5000;
				}
			});
		}
		if(!target && creep.getActiveBodyparts(WORK)) {
			var target = creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => source.energy >= (creep.memory.rerun? 0:1)
			});
		}
		if(!target && !creep.getActiveBodyparts(WORK)) {
			target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
				filter: (creep2) => {
					return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep2.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
						creep2.memory.weight > creep2.memory.weight;
				}
			});
		}
		if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
				filter: (creep2) => {
					return creep2.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						creep2.memory.weight > creep.memory.weight;
				}
			});
		}
		if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
			target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
				filter: (creep2) => {
					return creep2.memory.weight > creep2.memory.weight;
				}
			});
		}
		return target;
	},

	checkOff: function(creep) {
		if(creep.memory[role.name].on &&
			creep.store.getFreeCapacity() == 0) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 role.checkFreeSlot(creep) &&
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
				(creep.memory.rerun &&
				 creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0))) {
			creep.memory[role.name].on = true;
// 			role.log(creep,"On");
		}
	},
	
	run: function(creep) {
		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);
		
		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep);
			if(target) {
				var err = (target.name || !target.id)? // a creep || exit
						ERR_NOT_IN_RANGE:
				target.structureType?
						creep.withdraw(target, RESOURCE_ENERGY): // a structure
				creep.harvest(target); // a source
				
				if(err == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					creep.say('🔜⚡');
					role.log('🔜⚡', creep, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				else if(!err) {
					creep.say('⚡');
					role.log('⚡', creep, 'harvest', JSON.stringify(target));
				}
				else {
					role.log( '⚡⚠️', creep, 'err:', err, JSON.stringify(creep.harvest));
					creep.memory[role.name].on = false;
				}
			}
			else {
				creep.memory[role.name].on = false;
			}
		}
	
		if(!creep.memory[role.name].on) {
			if(creep.memory.rerun) {
				creep.say('🔃'); 
			}
			else {
				creep.memory.rerun = 1;
				require('role.claimer').run(creep);
			}
		}
	}
};

module.exports = role;


// var roleEnergyHarvester = {
    
    
//     /** @param {Creep} creep **/
//     run: function(creep) {
//         var commit = 4;
//         if(!Memory.commits.EnergyHarvester ||
//            Memory.commits.EnergyHarvester != commit) {
//             Memory.commits.EnergyHarvester = commit;
//             console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                         , 'Commit EnergyHarvester'
//                         , Memory.commits.EnergyHarvester);
//         }         

//         if(creep.memory.harvesting &&
//            creep.store.getFreeCapacity() == 0) {
//             creep.memory.harvesting = false;
//         }

//         if(!creep.memory.harvesting &&
//            ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) ||
//             (creep.memory.rerun && creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0))) {
//             creep.memory.harvesting = true;
//         }
        
//         if(creep.memory.harvesting) {
//         if(!creep.memory.harvesting) {
//             if(creep.memory.rerun) {
//                 if(creep.pos.x == 26 && creep.pos.y == 34) {
//                     creep.move(BOTTOM_RIGHT);
//                     creep.move(Game.time%8+1); // TOP:1 ,..., TOP_LEFT:8
//                 }
//             }
//             else {
//                 creep.say('🔃');
//                 creep.memory.rerun = 1;
//                 //             roleRerun.run(creep);
//                 require('role.claimer').run(creep);
//             }
//         }
//     }
// };

// module.exports = roleEnergyHarvester;

//                                 if(target) {
//                             var err = creep.withdraw(target, RESOURCE_ENERGY);
//                             if(err == ERR_NOT_IN_RANGE) {
//                                 creep.moveTo(target, {visualizePaathStyle: {stroke: '#ffffff'}});
// 								creep.say('➡️⚡⚡');
//                             }
//                             else if(!err) {
// 								creep.say('⚡⚡');
// 							}
// 						}
// 					}
// 				}
// 			}
//             else if(!err) {
// 				creep.say('⚡');
// 				if(creep.memory.starttimemoving) {
// 					Memory.harvestersMovements.Value.v += Game.time - creep.memory.starttimemoving;
//                     Memory.harvestersMovements.Count.v += 1;
//                     Memory.harvestersMovements.Avg.v = Math.floor(Memory.harvestersMovements.Value.v / Memory.harvestersMovements.Count.v) ;
//                     creep.memory.starttimemoving = 0;
//                 }
//             }
//             else {
//                 if(err != ERR_BUSY && err != ERR_NOT_ENOUGH_RESOURCES) {
//                     console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                                 , '⚡' + creep.name +' harvesting failed with err:'
//                                 , err);
//                 }
//                 creep.memory.harvesting = false;
//             }
//         }

//         if(!creep.memory.harvesting) {
//             if(creep.memory.rerun) {
//                 creep.say('🔃'); 
//             }
//             else {
//                 creep.memory.rerun = 1;
//                 require('role.attacker').run(creep);
//             }
//         }
//     }
// };

// module.exports = roleEnergyHarvester;
