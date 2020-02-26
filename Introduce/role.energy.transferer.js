var roleNext = require('role.noenergy.transferer');
var constants = require('main.constants');

var roleEnergyTransferer = {
	
    /** @param {Creep} creep **/
	run: function(creep) {
		if(creep.memory.transfering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory.transfering = false;
		}

		if(!creep.memory.transfering &&
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity() == 0) ||
				(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun))) {
			creep.memory.transfering = true;
		}
		
		if(creep.memory.transfering) {
			
			const this_room = creep.room.name;
			const this_room_config = Memory[constants.ROLE_ENERGY_HARVESTING].rooms[this_room];
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_room_config = Memory[constants.ROLE_ENERGY_HARVESTING].rooms[my_room];

			var target;

			if(!target && this_room != my_room) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_LINK) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}
			

			if(!target && creep.room.energyAvailable == creep.room.energyCapacityAvailable && creep.memory.rerun) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTAINER) &&
							this_room_config.containers.weight < creep.memory.weight && 
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}
			
			if(!target && creep.memory.rerun) {
				if(this_room != 'W25S33') {
					const exitDir = Game.map.findExit(creep.room, 'W25S33');
					target = creep.pos.findClosestByRange(exitDir);
				}
			}
			
			if(!target) {
				var closests = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
					filter: (creep2) => {
						return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
							creep2.memory.weight < creep.memory.weight;
					}
				});
				if(closests.length > 0) {
					target = closests[0];
				}
			}            
			
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_EXTENSION) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}
			
			if(!target && creep.ticksToLive < constants.TICKS_TO_LIVE_TO_TRANSFER_ENERGY_TO_SPAWN) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_SPAWN) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}
			
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_SPAWN) &&
							structure.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
					}
				});
			}

			if(!target) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_TOWER) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 300;
					}
				});
			}
			
			if(!target) {
				var closests = creep.pos.findInRange(FIND_MY_STRUCTURES, 1, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_SPAWN) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				
				if(closests.length > 0) {
					target = closests[0];
				}
			}            
			
			if(!target &&
				 creep.room.storage !== undefined &&
				 creep.room.energyAvailable == creep.room.energyCapacityAvailable &&
				 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) < 25000 &&
				 creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 25000) {
				target = creep.room.storage;
			}
			
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_STORAGE) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) < 30000;
					}
				});
			}            
			
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_STORAGE) &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}            
			
			if(target) {
				
				var err = ERR_NOT_IN_RANGE;
				
				if(target.id) {
					if(target.structureType == STRUCTURE_LINK) {
						const linkFrom = target;
						if(creep.room.controller !== undefined && creep.room.controller.my) {
							const linkTo = creep.room.controller.pos.findClosestByPath(FIND_MY_STRUCTURES, {
								filter: (structure) => {
									return (structure.structureType == STRUCTURE_LINK) &&
										structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
								}
							});
							if(!!linkTo) {
								err = creep.transfer(target, RESOURCE_ENERGY);
								err = linkFrom.transferEnergy(linkTo);
							}
						}
					}
					else {
						err = creep.transfer(target, RESOURCE_ENERGY);
					}
				}
				
				if(err == ERR_NOT_IN_RANGE) {
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					creep.say('🔜💡');
					if(!!Game.flags['LET'] || !!Game.flags['LE'] || !!Game.flags['L']) {
						console.log( '🔜💡', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'moving for transfering energy to:'
												, target.name?target.name:target.structureType);
					}
				}
				else if(!err) {
					creep.say('💡');
					if(!!Game.flags['LET'] || !!Game.flags['LE'] || !!Game.flags['L']) {
						console.log( '💡', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering energy to:'
												, target.name?target.name:target.structureType);
					}
				}
				else {
					creep.memory.transfering = false;
					if(!!Game.flags['LET'] || !!Game.flags['LE'] || !!Game.flags['L']) {
						console.log( '💡⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering energy to:'
												, target.name?target.name:target.structureType
												, 'with err:'
												, err);
					}
				}
			}
			else {
				creep.memory.transfering = false;
			}
		}

		if(!creep.memory.transfering) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleEnergyTransferer;
