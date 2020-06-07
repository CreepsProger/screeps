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
	getTarget: function(creep, executer = undefined) {
	},

	run: function(creep, executer = undefined) {
		if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				return roleNext.run(creep);
		}

		if(creep.memory.transfering && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
			creep.memory.transfering = false;
		}

		if(	!creep.memory.transfering
			 	&&
			 	(	(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.store.getFreeCapacity(RESOURCE_ENERGY) < creep.getActiveBodyparts(WORK)*2)
					||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && creep.memory.rerun)
					||
					(	creep.store.getUsedCapacity(RESOURCE_ENERGY) > creep.store.getFreeCapacity(RESOURCE_ENERGY) &&
						creep.room.energyAvailable != creep.room.energyCapacityAvailable && !creep.getActiveBodyparts(WORK))
			 	)
			) {
			creep.memory.transfering = true;
		}

		if(creep.memory.transfering) {
			var t = Game.cpu.getUsed();

			const this_room = creep.room.name;
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
			const my_shard = creep.memory[constants.ROLE_ENERGY_HARVESTING].shard;
			const my_shard_config = Memory.config.shards[my_shard];
			const this_room_config = !!my_shard_config.rooms[this_room]?my_shard_config.rooms[this_room]:my_shard_config.defaults;
			const my_room_config = my_shard_config.rooms[my_room];

			if(!this_room_config) {
				console.log( '🚸', Math.trunc(Game.time/10000), Game.time%10000, Game.shard.name
									, 'link:', JSON.stringify({my_shard:my_shard,this_room:this_room, this_room_config:this_room_config})
									);
			}

			// const this_room_sources_is_empty = !creep.pos.findClosestByRange(FIND_SOURCES, { no use because: storage->containers->storage
			// const a_source_is_not_near = !creep.pos.findInRange(FIND_SOURCES, 2, {
			// 	filter: (source) => source.energy > 0 && source.room.name == this_room
			// });
			const XU = !!flags.flags.XU;
			const TW = !!flags.flags.TW && flags.flags.TW.pos.roomName == my_room;
			const B  = XU || !!flags.flags.B && flags.flags.B.pos.roomName == my_room;
			const UU = XU || !!flags.flags.UU && flags.flags.UU.pos.roomName == my_room;
			const Infra = !!flags.flags.Infra && flags.flags.Infra.pos.roomName == my_room;

			var target;

			if(!target && (!creep.getActiveBodyparts(WORK) || !XU) ) {
				 target = links.getTargetLinkToTransferEnergy(creep, executer, roleEnergyTransferer.run, this_room_config.containers.weight);
				 if(!!target) {
					 if(!creep.memory.target ||
						 	!creep.memory.target.id ||
							 creep.memory.target.id != target.id || true) {
						 var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
						 if(dt > 0.2)
							 console.log( '🚸', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													 , 'link:', JSON.stringify(target)
													 );
					 }
				 }
			}

			const this_room_sources_are_empty = cash.areEmptySourcesByPath(creep);
			const this_room_sources_are_not_empty = !this_room_sources_are_empty;

			metrix.cpu.step_time(creep, 'transfering', '🚸');

			if(!target && this_room == my_room &&
				 (	!creep.getActiveBodyparts(WORK) ||
				  	(this_room_sources_are_empty && creep.memory.rerun) ||
					 	conditions.MAIN_ROOM_CRISIS() ||
					 	UU || B
					)
				) {
				var towers = cash.getTowers(creep.room).filter((t) => {
						return	!!t && !! t.my && !!t.store && t.store.getFreeCapacity(RESOURCE_ENERGY) > constants.TOWER_NO_ENERGY_TO_FILL &&
										tools.checkTarget(executer,t.id);
						});
				if(towers.length > 0) {
					var infra = towers.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					target = tools.setTarget(creep,infra,infra.id,roleEnergyTransferer.run);
				}

				var use_api = false; var sz = 0;
				var use_cash_pos = false;
				var use_cash = false;
				if(!target && creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
					if(Infra) {
						use_api = true;
						var exts = creep.pos.findInRange(FIND_STRUCTURES, 1, {
							filter: (structure) => {
								return ( structure.structureType == STRUCTURE_SPAWN ||
												structure.structureType == STRUCTURE_POWER_SPAWN ||
												structure.structureType == STRUCTURE_EXTENSION)  &&
									!!structure.store &&
									structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
									tools.checkTarget(executer,structure.id);
							}
						});
						if(exts.length > 0) {
							sz = exts.length;
							var infra = exts.reduce((p,c) => !!p && !!p.store && !!c && !!c.store &&
													creep.pos.getRangeTo(p) * (p.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													<
													creep.pos.getRangeTo(c) * (c.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													? p:c);
							target = tools.setTarget(creep,infra,infra.id,roleEnergyTransferer.run);
						}
					}
					if(!target) {
						use_cash_pos = true;
						var exts = cash.getPosExtensions(creep).filter((e) => {
							return 	!!e && !!e.store && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
											tools.checkTarget(executer,e.id);
										});
						if(exts.length > 0) {
							var infra = exts.reduce((p,c) => !!p && !!p.store && !!c && !!c.store &&
													creep.pos.getRangeTo(p) * (p.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													<
													creep.pos.getRangeTo(c) * (c.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													? p:c);
							target = tools.setTarget(creep,infra,infra.id,roleEnergyTransferer.run);
						}
					}
					if(!target) {
						use_cash = true;
						var exts = cash.getExtensions(creep.room).filter((e) => {
							return 	!!e && !!e.store && e.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
							 				tools.checkTarget(executer,e.id);
										});
						if(exts.length > 0) {
							var infra = exts.reduce((p,c) => !!p && !!p.store && !!c && !!c.store &&
													creep.pos.getRangeTo(p) * (p.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													<
													creep.pos.getRangeTo(c) * (c.store.getUsedCapacity(RESOURCE_ENERGY) + 1)
													? p:c);
							target = tools.setTarget(creep,infra,infra.id,roleEnergyTransferer.run);
						}
					}
				}

				if(!!target) {
					if(!creep.memory.target ||
						 !creep.memory.target.id ||
							creep.memory.target.id != target.id || true) {
						var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
						if(dt > 0.6)
							console.log( '🌕', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'infra id:', target.id
													, use_api, sz, use_cash_pos, use_cash
													, 'infra:', JSON.stringify(target)
													, 'pos:', JSON.stringify(creep.pos)
												 );
					}
				}
			}

			metrix.cpu.step_time(creep, 'transfering', '🌕');

			//if(!target) {
			//if(!target && (this_room != my_room || this_room_sources_are_not_empty)) {
			if(!target && (this_room_sources_are_not_empty || !creep.getActiveBodyparts(WORK))) {
				var targs = creep.pos.findInRange(FIND_MY_CREEPS, 1, {
					filter: (creep2) => {
						return creep2.store.getFreeCapacity(RESOURCE_ENERGY) > creep2.store.getUsedCapacity(RESOURCE_ENERGY) &&
							(!creep2.getActiveBodyparts(WORK) || TW) &&
							tools.getWeight(creep2.name) < tools.getWeight(creep.name);
					}
				});

				const U = !!flags.flags.U && flags.flags.U.pos.roomName == my_room;

				if((!targs || !targs.length || targs.length == 0) &&
				  (this_room_config.containers.weight < tools.getWeight(creep.name) && !U && !UU)) {
					targs = cash.getContainers(creep.room).filter((cont) =>
						!!cont && !!cont.store && cont.store.getFreeCapacity() > 0);
				}

				if((!targs || !targs.length) && !!creep.room.storage &&
						creep.getActiveBodyparts(WORK)  && !U && !UU &&
						this_room_config.containers.weight < tools.getWeight(creep.name) &&
						creep.room.storage.store.getFreeCapacity() > 0) {
					targs = [creep.room.storage];
				}
				// var containers = creep.room.find(FIND_STRUCTURES, {
				// 	filter: (structure) => {
				// 		return (structure.structureType == STRUCTURE_CONTAINER ||
				// 						(structure.structureType == STRUCTURE_STORAGE && creep.getActiveBodyparts(WORK))) &&
				// 			this_room_config.containers.weight < tools.getWeight(creep.name) &&
				// 			structure.store.getFreeCapacity() > 0;
				// 	}
				// });
				// const targs = containers.concat(closests);

				if(!!targs && targs.length > 0) {
					target = targs.reduce((p,c) => !!p && !!c &&
					 															   creep.pos.getRangeTo(p)
																				 * (p.store.getUsedCapacity(RESOURCE_ENERGY) + 500)
																				 < creep.pos.getRangeTo(c)
																				 * (c.store.getUsedCapacity(RESOURCE_ENERGY) + 500)
																				 ? p:c);
				}
				if(!!target) {
					if(!creep.memory.target ||
						 !creep.memory.target.id ||
							creep.memory.target.id != target.id || true) {
							var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
							if(dt > 0.2)
								console.log( '🔜💡🛢️', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'target:', (!!target.name)? target.name:target.id + '(' + target.store.getUsedCapacity(RESOURCE_ENERGY) + ')'
												 );
					}
				}
			}

			metrix.cpu.step_time(creep, 'transfering', '🔜💡🛢️');

			if(!target && creep.memory.rerun) {
				var labs = cash.getLabs(creep.room).filter((l) =>
						!!l && !!l.store && l.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
				if(labs.length > 0) {
					target = labs.reduce((p,c) => !!p && !!c && creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				}
			}
			
			if(!target && creep.memory.rerun) {
				var nukers = cash.getNukers(creep.room).filter((n) =>
						!!n && !!n.store && n.store.getFreeCapacity(RESOURCE_ENERGY) > 0);
				if(nukers.length > 0) {
					target = nukers.reduce((p,c) => !!p && !!c && creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				}
			}

			metrix.cpu.step_time(creep, 'transfering', new Error().stack.split('\n')[1]);

			if(!target &&
				 creep.memory.rerun &&
				 !!creep.room.storage &&
				 !!creep.room.storage.my &&
				 !!creep.room.terminal &&
				 !!creep.room.terminal.my &&
				 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.START_UPGRADING_ENERGY + constants.MIN_STORAGE_ENERGY &&
			 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) - creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > 5000 &&
				 creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) < 150000 ) {
					 target = creep.room.terminal;
			}

			metrix.cpu.step_time(creep, 'transfering', '🔜💡 0️⃣⃣');

			// const this_room_containers_are_empty = cash.areEmptyContainers(creep);
			// if(this_room_containers_are_empty)
			// 	console.log( '🔜💡1️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
			// 						, 'this_room_containers_are_empty:', this_room_containers_are_empty
			// 					 );
			//
			// if(!target &&
			// 	 !creep.getActiveBodyparts(WORK) &&
			// 	 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
			// 	 (this_room_containers_are_empty || !creep.room.storage) &&
			// 	 creep.memory.rerun) {
			// 	var storages = cash.getStorages().filter((s) => s.store.getUsedCapacity(RESOURCE_ENERGY)
			// 	 		+ (!s.room.terminal? 0:s.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY))
			// 	 		< constants.START_UPGRADING_ENERGY + constants.MIN_TERMINAL_ENERGY + constants.MIN_STORAGE_ENERGY);
			// 	if(storages.length > 0) {
			// 		// target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,p.pos)
			// 		// 																< c.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,c.pos)? p:c);
			// 		target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY)
			// 																		< c.store.getUsedCapacity(RESOURCE_ENERGY)? p:c);
			// 		const range_to_store = tools.getRangeTo(creep.pos,target.pos);
			// 		const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
			// 		if(range_to_store >= constants.RANGE_TO_STORE_1_TO_CONSOLE_LOG &&
			// 			 (!creep.memory.target ||
				 // !creep.memory.target.id ||
					// creep.memory.target.id != target.id || true)
			// 			) {
			// 				var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
			// 				if(dt > 0.1)
			// 					console.log( '🔜💡1️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
			// 										, 'range to store:', range_to_store
			// 										, creep.pos.roomName, '->', target.pos.roomName
			// 										, 'store energy value:', store_energy_value
			// 									 );
			// 		}
			// 	}
			// }
			//
			// metrix.cpu.step_time(creep, 'transfering', '🔜💡1️⃣');
			//
			// if(!target &&
			// 	 !creep.getActiveBodyparts(WORK) &&
			// 	 creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 &&
			// 	 (this_room_containers_are_empty || !creep.room.storage) &&
			// 	 creep.memory.rerun) {
			// 	var storages = cash.getStorages().filter((s) => s.store.getUsedCapacity(RESOURCE_ENERGY)
			// 	 		+ (!s.room.terminal? 0:s.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY))
			// 	 		< 2*constants.START_UPGRADING_ENERGY + constants.MIN_TERMINAL_ENERGY + constants.MIN_STORAGE_ENERGY);
			// 	if(storages.length > 0) {
			// 		// target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,p.pos)
			// 		// 												 				< c.store.getUsedCapacity(RESOURCE_ENERGY) * tools.getRangeTo(creep.pos,c.pos)? p:c);
			// 		target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY)
			// 														 				< c.store.getUsedCapacity(RESOURCE_ENERGY)? p:c);
			// 		const range_to_store = tools.getRangeTo(creep.pos,target.pos);
			// 		const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
			// 		if(range_to_store >= constants.RANGE_TO_STORE_2_TO_CONSOLE_LOG &&
			// 			 (!creep.memory.target ||
				 // !creep.memory.target.id ||
					// creep.memory.target.id != target.id || true)
			// 			) {
			// 			var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
			// 			if(dt > 0.1)
			// 				console.log( '🔜💡2️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
			// 										, 'range to store:', range_to_store
			// 										, creep.pos.roomName, '->', target.pos.roomName
			// 										, 'store energy value:', store_energy_value
			// 									 );
			// 		}
			// 	}
			// }
			//
			// metrix.cpu.step_time(creep, 'transfering', '🔜💡2️⃣');

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
				var storages = cash.getStorages();
				if(storages.length > 0) {
					var target = storages.reduce((p,c) => p.store.getUsedCapacity(RESOURCE_ENERGY)
					 																		* tools.getRangeTo(creep.pos,p.pos)
																						 	* tools.getRoomRange(p.pos.roomName,'W25S33')
																	 				< c.store.getUsedCapacity(RESOURCE_ENERGY)
																					 		* tools.getRangeTo(creep.pos,c.pos)
																							* tools.getRoomRange(c.pos.roomName,'W25S33')
																					? p:c);

					// target = storages.reduce((p,c) =>  tools.getRangeTo(creep.pos,p.pos)
					// 												 				 < tools.getRangeTo(creep.pos,c.pos)? p:c);
					const range_to_store = tools.getRangeTo(creep.pos,target.pos);
					const store_energy_value = target.store.getUsedCapacity(RESOURCE_ENERGY);
					if(range_to_store >= constants.RANGE_TO_STORE_3_TO_CONSOLE_LOG) {
						var dt = Math.round((Game.cpu.getUsed() - t)*100)/100; t = Game.cpu.getUsed();
						if(dt > 0.5)
							console.log( '🔜💡3️⃣', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
													, 'range to store:', range_to_store
													, creep.pos.roomName, '->', target.pos.roomName
													, JSON.stringify(target)
													, 'store energy value:', store_energy_value
												 );
					}
				}
				else if(tools.getWeight(creep.name) >= 400) {
					target = {pos:{x:29,y:39,roomName:'W57S52'}};
					if(Game.time % constants.TICKS_TO_CHECK_CPU == 0)
						console.log(creep, JSON.stringify({trnsfer_without_storage:true, target:target}));
				}
			}

			metrix.cpu.step_time(creep, 'transfering', '🔜💡3️⃣');

			if(!target &&
				   creep.getActiveBodyparts(WORK) &&
				   creep.memory.rerun &&
				 !!creep.room.storage &&
				  !creep.room.storage.my && // !!!!
				 creep.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
					 target = creep.room.storage;
			}

			if(target) {

				var err = ERR_NOT_IN_RANGE;

				if(!!target.id) {
					err = creep.transfer(target, RESOURCE_ENERGY);
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💡');
					err = config.moveTo(creep, target);
					if(tools.getWeight(creep.name) == 201 && err != OK) {
						console.log(creep, JSON.stringify({weight:tools.getWeight(creep.name), err:err, target:target}));
					}

					if(!!flags.flags.LET || !!flags.flags.LE || !!flags.flags.L) {
						console.log( '🔜💡', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, err
												, 'moving for transfering energy to:', JSON.stringify(target)
												, target.name?target.name:target.structureType);
					}
				}
				else if(!err) {
					creep.say('💡');
					if(!!flags.flags.LET || !!flags.flags.LE || !!flags.flags.L) {
						console.log( '💡', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering energy to:'
												, target.name?target.name:target.structureType);
					}
				}
				else {
					creep.memory.transfering = false;
					if(!!flags.flags.LET || !!flags.flags.LE || !!flags.flags.L) {
						console.log( '💡⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering energy to:'
												, target.name?target.name:target.structureType, target.id
												, 'with err:'
												, err);
					}
				}
			}
			else {
				creep.memory.transfering = false;
			}
		}

		metrix.cpu.step_time(creep, 'transfering', '💡🔚');

		metrix.cpu.role_time(creep, 'transfering');
		if(!creep.memory.transfering) {
			return roleNext.run(creep);
		}
	}
};

module.exports = roleEnergyTransferer;
