const roleNext = require('role.noenergy.transferer');
const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

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
			// const a_source_is_not_near = !creep.pos.findInRange(FIND_SOURCES, 2, {
			// 	filter: (source) => source.energy > 0 && source.room.name == this_room
			// });

			var target;

			if(!target && this_room != my_room) {
				target = links.getTargetLinkToTransferEnergy(creep, executer, roleEnergyTransferer.run, this_room_config.containers.weight);
			}

			const this_room_sources_are_empty = tools.areEmptySources(creep);
			const this_room_sources_are_not_empty = !this_room_sources_are_empty;

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target && this_room == my_room &&
				 (!creep.getActiveBodyparts(WORK) || (this_room_sources_are_empty && creep.memory.rerun) || conditions.MAIN_ROOM_CRISIS())) {
				var t = Game.cpu.getUsed();
				var infras = [];
				if(creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
					var extensions = cash.getExtensions(creep.room).filter((e) => {
						return 	!!e.store && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
						 				tools.checkTarget(executer,e.id);
						});
						extensions.reduce((l,c) => (l.push(c),l), infras);
								// infras = infras.concat(extensions);
				}
				var towers = cash.getTowers(creep.room).filter((t) => {
					return	!!t.store && t.store.getFreeCapacity(RESOURCE_ENERGY) > 400 &&
					 				tools.checkTarget(executer,t.id);
					});
				towers.reduce((l,c) => (l.push(c),l), infras);
				// infras = infras.concat(towers);
				// var extensions = creep.room.find(FIND_STRUCTURES, {
				// 	filter: (structure) => {
				// 		return (
				// 			(structure.structureType == STRUCTURE_SPAWN && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
				// 			||
				// 			(structure.structureType == STRUCTURE_EXTENSION && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
				// 			||
				// 			(structure.structureType == STRUCTURE_TOWER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 400)
				// 		)
				// 		&&
				// 			tools.checkTarget(executer,structure.id);
				// 	}
				// });
				if(infras.length > 0) {
					var infra = infras.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					if(!!infra) {
						target = tools.setTarget(creep,infra,infra.id,roleEnergyTransferer.run);
						if(!!target) {
							if(creep.memory.prev_target_id || creep.memory.prev_target_id != target.id || true) {
								var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
								// if(dt > 0.01)
									// console.log( '⭕️', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
									// 						, 'infra id:', target.id
									// 				 		);
							}
						}
					}
				}
			}

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			//if(!target) {
			//if(!target && (this_room != my_room || this_room_sources_are_not_empty)) {
			if(!target && (this_room_sources_are_not_empty || !creep.getActiveBodyparts(WORK))) {
				var closests = creep.pos.findInRange(FIND_MY_CREEPS, 2, {
					filter: (creep2) => {
						return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
							creep2.memory.weight < creep.memory.weight;
					}
				});
				var containers = creep.room.find(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTAINER ||
										(structure.structureType == STRUCTURE_STORAGE && creep.getActiveBodyparts(WORK))) &&
							this_room_config.containers.weight < creep.memory.weight &&
							structure.store.getFreeCapacity() > 0;
					}
				});
				const targs = containers.concat(closests);
				if(targs.length > 0) {
					target = targs.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				}
			}

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

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

			metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target &&
				 !creep.getActiveBodyparts(WORK) &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.memory.rerun) {
				var t = Game.cpu.getUsed();
				var storages = cash.getStorages().filter((s) => s.store.getUsedCapacity(RESOURCE_ENERGY) < constants.START_UPGRADING_ENERGY);;
				if(storages.length > 0) {
					target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,p.pos)
																					< c.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,c.pos)? p:c);
					const range_to_store = tools.getRangeTo(creep.pos,target.pos);
					const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
					if(range_to_store >= constants.RANGE_TO_STORE_1_TO_CONSOLE_LOG &&
						 (!creep.memory.prev_target_id || creep.memory.prev_target_id != target.id)
						) {
							var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
							if(dt > 0.03)
								console.log( '🔜💡1️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'range to store:', range_to_store
													, creep.pos.roomName, '->', target.pos.roomName
													, 'store energy value:', store_energy_value
												 );
					}
				}
			}

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target &&
				 !creep.getActiveBodyparts(WORK) &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.memory.rerun) {
				var t = Game.cpu.getUsed();
				var storages = cash.getStorages().filter((s) => s.store.getUsedCapacity(RESOURCE_ENERGY) < 2*constants.START_UPGRADING_ENERGY);;
				if(storages.length > 0) {
					target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,p.pos)
																	 				< c.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,c.pos)? p:c);
					const range_to_store = tools.getRangeTo(creep.pos,target.pos);
					const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
					if(range_to_store >= constants.RANGE_TO_STORE_2_TO_CONSOLE_LOG &&
						 (!creep.memory.prev_target_id || creep.memory.prev_target_id != target.id || false)
						) {
						var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
						if(dt > 0.03)
							console.log( '🔜💡2️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'range to store:', range_to_store
													, creep.pos.roomName, '->', target.pos.roomName
													, 'store energy value:', store_energy_value
												 );
					}
				}
			}

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target &&
				 creep.memory.rerun &&
				 !!creep.room.storage &&
				 !!creep.room.storage.my &&
				 creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
					 target = creep.room.storage;
			}

			// metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target &&
				 !creep.getActiveBodyparts(WORK) &&
				 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
				 creep.memory.rerun) {
				var t = Game.cpu.getUsed();
				var storages = cash.getStorages();
				if(storages.length > 0) {
					target = storages.reduce((p,c) =>  tools.getRangeTo(creep.pos,p.pos)
																	 				 < tools.getRangeTo(creep.pos,c.pos)? p:c);
					const range_to_store = tools.getRangeTo(creep.pos,target.pos);
					const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
					if(range_to_store >= constants.RANGE_TO_STORE_3_TO_CONSOLE_LOG &&
						 (!creep.memory.prev_target_id || creep.memory.prev_target_id != target.id)
						) {
						var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
						if(dt > 0.03)
							console.log( '🔜💡3️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'range to store:', range_to_store
													, creep.pos.roomName, '->', target.pos.roomName
													, 'store energy value:', store_energy_value
												 );
					}
				}
			}

			metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(target) {

				var err = ERR_NOT_IN_RANGE;

				if(target.id !== undefined) {
					err = creep.transfer(target, RESOURCE_ENERGY);
				}

				if(!!target.id) {
					creep.memory.prev_target_id = target.id;
					creep.memory.prev_target_time = Game.time;
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
		// console.log(('Error\n    at Object.run (role.energy.transferer:210:46)\n    at Object.run (role.builder:108:14)\n').split('\n')[1]);

		metrix.cpu.role_time(creep, 'transfering');
		if(!creep.memory.transfering) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleEnergyTransferer;
