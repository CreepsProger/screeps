const roleNext = require('role.noenergy.transferer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
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

		if(!creep.memory.transfering
			 &&
			 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0)
				||
				(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0
				 &&
				 ((creep.room.energyAvailable != creep.room.energyCapacityAvailable && !creep.getActiveBodyparts(WORK))
					||
					creep.memory.rerun
				 )
				)
			 )
			) {
			creep.memory.transfering = true;
		}

		if(creep.memory.transfering) {

			const this_room = creep.room.name;
			const this_room_config = Memory.config.rooms[this_room];
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_room_config = Memory.config.rooms[my_room];
			// const this_room_sources_is_empty = !creep.pos.findClosestByRange(FIND_SOURCES, { no use because: storage->containers->storage
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

			const this_room_sources_are_empty = tools.areEmptySources(creep);
			const this_room_sources_are_not_empty = !this_room_sources_are_empty;

			if(!target && (this_room_sources_are_not_empty || !creep.getActiveBodyparts(WORK))) {
			//if(!target) {
				var t = Game.cpu.getUsed();
				var containers = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_CONTAINER &&
							this_room_config.containers.weight < creep.memory.weight &&
							structure.store.getFreeCapacity() > 0;
					}
				});
				if(containers.length > 0) {
					console.log( this_room, 'containers.length:', containers.length, 'dt:', Game.cpu.getUsed()-t);
					target = containers.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				}
			}

			if(!target && this_room == my_room &&
				 (!creep.getActiveBodyparts(WORK) || (this_room_sources_are_empty && creep.memory.rerun))) {
				var extensions = creep.room.find(FIND_STRUCTURES, {
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
				if(extensions.length > 0) {
					var extension = extensions.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					if(!!extension) {
						target = tools.setTarget(creep,extension,extension.id,roleEnergyTransferer.run);
					}
				}
			}

			if(!target && creep.memory.rerun) {
				var labs = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return structure.structureType == STRUCTURE_LAB &&
							structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
					}
				});
				if(labs.length > 0) {
					target = labs[0];
				}
			}

			//if(!target) {
			//if(!target && (this_room != my_room || this_room_sources_are_not_empty)) {
			if(!target && this_room_sources_are_not_empty) {
				var closests = creep.pos.findInRange(FIND_MY_CREEPS, 2, {
					filter: (creep2) => {
						return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
							creep2.memory.weight < creep.memory.weight;
					}
				});
				if(closests.length > 0) {
					target = closests[0];
				}
			}

			if(!target &&
				 !creep.getActiveBodyparts(WORK) &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.memory.rerun) {
				var storages = _.filter(Game.structures, (structure) => !!structure.my &&
						structure.structureType == STRUCTURE_STORAGE &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) < constants.START_UPGRADING_ENERGY);
				if(storages.length > 0) {
					target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * creep.pos.getRangeTo(p)
																	 < c.store.getUsedCapacity(RESOURCE_ENERGY) * creep.pos.getRangeTo(c)? p:c);
				}
			}

			if(!target &&
				 creep.memory.rerun &&
				 !!creep.room.storage &&
				 !!creep.room.storage.my &&
				 creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
					 target = creep.room.storage;
			}

			if(!target &&
				 !creep.getActiveBodyparts(WORK) &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.memory.rerun) {
				var storages = _.filter(Game.structures, (structure) => !!structure.my &&
						structure.structureType == STRUCTURE_STORAGE &&
						structure.store.getUsedCapacity(RESOURCE_ENERGY) < 10*constants.START_UPGRADING_ENERGY);
				if(storages.length > 0) {
					target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * creep.pos.getRangeTo(p)
																	 < c.store.getUsedCapacity(RESOURCE_ENERGY) * creep.pos.getRangeTo(c)? p:c);
				}
			}

			if(target) {

				var err = ERR_NOT_IN_RANGE;

				if(target.id !== undefined) {
					err = creep.transfer(target, RESOURCE_ENERGY);
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💡');
					err = tools.moveTo(creep,target);
					if(!!Game.flags['LET'] || !!Game.flags['LE'] || !!Game.flags['L']) {
						console.log( '🔜💡', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, err
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

		metrix.cpu.role_time(creep, 'transfering');
		if(!creep.memory.transfering) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleEnergyTransferer;
