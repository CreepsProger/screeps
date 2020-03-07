const links = require('main.links');
const roleNext = require('role.noenergy.transferer');
const constants = require('main.constants');
const tools = require('tools');

var roleEnergyTransferer = {

    /** @param {Creep} creep **/
	run: function(creep, executer = undefined) {
		if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				roleNext.run(creep);
				return;
		}

		if(creep.memory.transfering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory.transfering = false;
		}

		if(!creep.memory.transfering &&
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) ||
			  (creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun))) {
			creep.memory.transfering = true;
		}

		if(creep.memory.transfering) {

			const this_room = creep.room.name;
			const this_room_config = Memory.config.rooms[this_room];
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_room_config = Memory.config.rooms[my_room];
			const this_room_sources_is_empty = !creep.pos.findClosestByPath(FIND_SOURCES, {
				filter: (source) => source.energy > 0 && source.room.name == this_room
			});
			const a_source_is_not_near = !creep.pos.findInRange(FIND_SOURCES, 2, {
				filter: (source) => source.energy > 0 && source.room.name == this_room
			});

			var target;

			if(!target && this_room != my_room) {
				target = links.getTargetLinkToTransferEnergy(creep, executer, roleEnergyTransferer.run, this_room_config.containers.weight);
			}

// 		if(!target && !this_room_sources_is_empty) {
// 				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
// 					filter: (structure) => {
// 						return structure.structureType == STRUCTURE_CONTAINER &&
// 									 this_room_config.containers.weight < creep.memory.weight &&
// 									 structure.store.getFreeCapacity() > 0;
// 					}
// 				});
// 			}

			if(!target && !this_room_sources_is_empty) {
				var containers = creep.pos.findInRange(FIND_STRUCTURES, 15, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_CONTAINER &&
							this_room_config.containers.weight < creep.memory.weight &&
							structure.store.getFreeCapacity() > 0;
					}
				});
				if(containers.length > 0) {
					target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: (structure) => {
							return containers.find(c => c.id == structure.id);
						}
					});
				}
			}

			// console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
				// 						, creep.name
				// 						, 'this_room:'
				// 						, this_room
				// 						, 'my_room:'
				// 						, my_room
				// 						, 'this_room_config:'
				// 						, JSON.stringify(this_room_config)
				// 						, creep.getActiveBodyparts(WORK)
				// 						, creep.store.getUsedCapacity(RESOURCE_ENERGY)
				// 						, creep.store.getFreeCapacity(RESOURCE_ENERGY)
				// 						, 'rerun:'
				// 						, creep.memory.rerun
				// 						, 'containers weight:'
				// 						, this_room_config.containers.weight
				// 						, 'creep weight:'
				// 						, creep.memory.weight
				// 						, 'transfering energy:'
				// 						, creep.memory.transfering
				// 						, 'target:'
				// 					  , JSON.stringify(target));



			if(!target &&
				 (this_room != my_room ||
				  !this_room_sources_is_empty)) {
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

			if(!target && this_room == my_room && !creep.getActiveBodyparts(WORK)) {
				var extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (
							(structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
							||
							(structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
							||
							(structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400)
						)
						&&
							tools.checkTarget(executer,structure.id);
					}
				});
				if(!!extension) {
					target = tools.setTarget(creep,extension,extension.id,roleEnergyTransferer.run);
				}
			}

			if(!target && !creep.getActiveBodyparts(WORK)) {
				var storages = _.filter(Game.structures, function(structure) {
					return structure.my &&
						structure.structureType == STRUCTURE_STORAGE &&
						(structure.store.getUsedCapacity(RESOURCE_ENERGY) < 30000);
				});
				if(storages.length > 0) {
					target = storages.reduce(function (p, v) {
						const pu = Math.floor(p.store.getUsedCapacity(RESOURCE_ENERGY)/5000);
						const vu = Math.floor(v.store.getUsedCapacity(RESOURCE_ENERGY)/5000);
//  						console.log(p.room.name, pu, v.room.name, vu, pu<vu, pu<vu? p.room.name:v.room.name);
						return (pu <= vu ? p : v );
					});
// 					if(target.room.name != my_room)
// 						console.log(creep, 'target storage room name:', target.room.name);
				}
			}

			if(!target && creep.memory.rerun) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_LAB &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}

			if(!target && creep.memory.rerun) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_STORAGE &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
			}

			if(!target && !creep.getActiveBodyparts(WORK) && creep.memory.rerun) {
				var storages = _.filter(Game.structures, function(structure) {
					return structure.my &&
						structure.structureType == STRUCTURE_STORAGE;
				});
				if(storages.length > 0) {
					target = storages.reduce(function (p, v) {
						const pu = Math.floor(p.store.getUsedCapacity(RESOURCE_ENERGY)/5000);
						const vu = Math.floor(v.store.getUsedCapacity(RESOURCE_ENERGY)/5000);
//  						console.log(p.room.name, pu, v.room.name, vu, pu<vu, pu<vu? p.room.name:v.room.name);
						return (pu <= vu ? p : v );
					});
// 					if(target.room.name != my_room)
// 						console.log(creep, 'target storage room name:', target.room.name);
				}
			}

			if(target) {

				var err = ERR_NOT_IN_RANGE;

				if(target.id !== undefined) {
					err = creep.transfer(target, RESOURCE_ENERGY);
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💡');
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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
