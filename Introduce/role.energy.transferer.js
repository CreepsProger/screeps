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
				(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun && creep.getActiveBodyparts(WORK)))) {
			creep.memory.transfering = true;
		}
		
		if(creep.memory.transfering) {
			
			const this_room = creep.room.name;
			const this_room_config = Memory.config.rooms[this_room];
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_room_config = Memory.config.rooms[my_room];

			var target;

			if(!target && this_room != my_room) {//5e56dc7a28e44c6f77878b87
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_LINK) &&
							structure.id == '5e56dc7a28e44c6f77878b87' &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
							Memory.targets[structure.id] === undefined;
					}
				});
			}			

			if(!target && creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
				target = creep.pos.findInRange(FIND_STRUCTURES, 5, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTAINER) &&
							this_room_config.containers.weight < creep.memory.weight && 
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
// 				console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
// 										, creep.name
// 										, 'this_room:'
// 										, this_room
// 										, 'my_room:'
// 										, my_room
// 										, 'this_room_config:'
// 										, JSON.stringify(this_room_config)
// 										, creep.getActiveBodyparts(WORK)
// 										, creep.store.getUsedCapacity(RESOURCE_ENERGY)
// 										, creep.store.getFreeCapacity(RESOURCE_ENERGY)
// 										, 'rerun:'
// 										, creep.memory.rerun
// 										, 'containers weight:'
// 										, this_room_config.containers.weight
// 										, 'transfering energy:'
// 										, creep.memory.building
// 										, 'target:'
// 									  , JSON.stringify(target));
			}
/*
			if(!target && creep.memory.rerun) {
				if(this_room != 'W25S33') {
					const exitDir = Game.map.findExit(creep.room, 'W25S33');
					target = creep.pos.findClosestByRange(exitDir);
				}
			}
*/
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
			
			if(!target) {
				var storages = _.filter(Game.structures, function(structure) {
					return structure.my &&
						structure.structureType == STRUCTURE_STORAGE &&
						(structure.store.getUsedCapacity(RESOURCE_ENERGY) < 30000 || creep.memory.rerun ) ;
				});
				if(storages.length > 0) {
					target = storages[0];
				}
			}
			
			if(target) {
				
				var err = ERR_NOT_IN_RANGE;
				
				if(target.id !== undefined) {
					err = creep.transfer(target, RESOURCE_ENERGY);
					Memory.targets[target.id] = creep.id;
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
