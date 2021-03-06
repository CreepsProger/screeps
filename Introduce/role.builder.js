var roleNext = require('role.energy.transferer');
const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep,executer) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				return roleNext.run(creep);
			}

			if(creep.memory.building &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0)) {
				creep.memory.building = false;
			}

			const this_room = creep.room.name;
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

			const XU = !!flags.flags.XU;
			const XB = !!flags.flags.XB;
      const B  = XU || XB || !!flags.flags.B && flags.flags.B.pos.roomName == my_room;
      const BB = XU || !!flags.flags.BB && flags.flags.BB.pos.roomName == my_room;

			if(!creep.memory.building &&
				 this_room == my_room &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 (!conditions.MAIN_ROOM_CRISIS() || BB || B || creep.memory.rerun) &&
				  (creep.room.energyAvailable == creep.room.energyCapacityAvailable || B) &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.store.getFreeCapacity() < creep.getActiveBodyparts(WORK)*2) ||
					(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					 creep.memory.rerun))) {
				creep.memory.building = true;
			}

			if(creep.memory.building) {

				var target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);

				const this_room_sources_are_empty = cash.areEmptySourcesByPath(creep);
				const this_room_is_being_claiming = !!creep.room.controller && !creep.room.controller.my;
				const a_room_without_controller = !creep.room.controller;
				//console.log(JSON.stringify(Game.rooms['W29S35'].controller));
				const UU = XU || !!flags.flags.UU && flags.flags.UU.pos.roomName == my_room;

				if(!target && this_room == my_room) {
					const my_shard = creep.memory[constants.ROLE_ENERGY_HARVESTING].shard;
					const my_shard_config = config.Memory.shards[my_shard];
					const my_room_config = my_shard_config.rooms[my_room];
					const sites = my_room_config.sites;
					if(!!sites) {
						sites.forEach(function(cs, i) {
							const pos = new RoomPosition(cs.x,cs.y,this_room);
							if(	pos.findInRange(FIND_STRUCTURES,0,{filter: (s) => s.structureType == cs.type}).length == 0 &&
									pos.findInRange(FIND_CONSTRUCTION_SITES,0,{filter: (s) => s.structureType == cs.type}).length == 0
								) {
								const err = pos.createConstructionSite(cs.type,cs.name);
								if(err != OK) {
									console.log('createConstructionSite:', JSON.stringify({err:err, pos:pos, cs:cs, sites:sites}));
								}
							}
						});
					}
				}
				const NB = flags.flags.NB;
				const NB1 = flags.flags.NB1;
				const NB2 = flags.flags.NB2;
				var fn_filter = function(cs) {
					if(!NB || NB.pos.roomName != my_room) {
						if(!!NB1 && NB1.pos.roomName == this_room &&
							 NB1.pos.getRangeTo(cs) < 11-NB1.color) {
							return false;
						}
						if(!!NB2 && NB2.pos.roomName == this_room &&
							 NB2.pos.getRangeTo(cs) < 11-NB2.color) {
							return false;
						}
						return true;
					}
					return false;
				};
				if(!target &&
					 ((this_room_sources_are_empty || creep.memory.rerun) ||
						(this_room_is_being_claiming && creep.memory.rerun) ||
						(a_room_without_controller && creep.memory.rerun) ||
						UU || B || BB)) {
					target = creep.pos.findInRange(FIND_CONSTRUCTION_SITES,3, {filter: fn_filter })
														.sort((l,r) => l.pos.getRangeTo(creep.pos) - r.pos.getRangeTo(creep.pos))
														.shift();
				}

				if(!target &&
					 ((this_room_sources_are_empty || creep.memory.rerun) ||
					 	(this_room_is_being_claiming && creep.memory.rerun) ||
						(a_room_without_controller && creep.memory.rerun) ||
						UU || B || BB)) {
					target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, { filter: fn_filter });
				}

				if(!target) {
					var targets = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => { return structure.structureType == STRUCTURE_WALL &&
							structure.hits < 1000; }
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(target) {
					var action;
					var err = ERR_NOT_IN_RANGE
					if(target.hitsMax !== undefined && target.hits < target.hitsMax) {
						action = 'repairing:';
						err = creep.repair(target);
					}
					else {
						action = 'building:';
						err = creep.build(target);
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🏗');
						config.moveTo(creep,target);
// 						console.log( '🔜🏗', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'moving for building:'
// 												, target.name?target.name:target.structureType);
					}
					else if(!err) {
						creep.say('🏗');
// 						console.log( '🏗', Math.trunc(Game.time/10000), Game.time%10000
//                                 , creep.name
//                                 , 'building:'
//                                 , target.name?target.name:target.structureType);
					}
					else {
						creep.memory.building = false;
						console.log( '🏗⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, creep.getActiveBodyparts(WORK)
												, creep.store.getUsedCapacity(RESOURCE_ENERGY)
												, action
												, target.name?target.name:target.structureType
												, 'with err:'
												, err);
					}
				}
				else {
					creep.memory.building = false;
				}
			}

			metrix.cpu.role_time(creep, 'building');
			if(!creep.memory.building) {
				return roleNext.run(creep);
			}
		}
};

module.exports = roleBuilder;
