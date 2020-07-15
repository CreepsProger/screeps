const roleNext = require('role.repairer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

var roleDismantler = {

	test_weight: 5256,

	run: function(creep,executer) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				return roleNext.run(creep);
			}

			if(creep.memory.dismantling &&
				 (creep.getActiveBodyparts(WORK) == 0 ||
					(creep.store.getFreeCapacity() == 0 && creep.getActiveBodyparts(TOUGH) == 0))) {
				creep.memory.dismantling = false;
			}

			if(!creep.memory.dismantling &&
				 creep.getActiveBodyparts(WORK) > 0 &&
				 ((creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) ||
					creep.getActiveBodyparts(TOUGH) > 0 ||
					(creep.store.getFreeCapacity() > 0 && creep.memory.rerun))) {
				creep.memory.dismantling = true;
				if(creep.getActiveBodyparts(TOUGH) > 0 && creep.store.getCapacity() == 0){
					config.setRoom(creep, constants.ROLE_ENERGY_HARVESTING);
				}
			}

			if(creep.memory.dismantling) {

				const this_room = creep.room.name;

				var target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);

				if(!creep.memory.target)
					creep.memory.target = {id:'0', pos:{}, time: 0};

				const D = flags.flags.D;
				const D1 = flags.flags.D1;
				const D2 = flags.flags.D2;
				const DSOURCE = !!flags.flags.DSOURCE && flags.flags.DSOURCE.pos.roomName == this_room;
				const this_room_sources_are_empty = cash.areEmptySourcesByPath(creep);

				if(!target && (!DSOURCE || this_room_sources_are_empty) && 
					 ( (!!D && D.pos.roomName == this_room)
						||
						(!!D1 && D1.pos.roomName == this_room)
						||
						(!!D2 && D2.pos.roomName == this_room)
					 )) {
					var structures = creep.room.find(FIND_STRUCTURES, {
						filter: (structure) => {
							if((structure.structureType == STRUCTURE_SPAWN ||
                  structure.structureType == STRUCTURE_EXTENSION ||
									structure.structureType == STRUCTURE_ROAD ||
									structure.structureType == STRUCTURE_WALL ||
									structure.structureType == STRUCTURE_RAMPART ||
									structure.structureType == STRUCTURE_LINK ||
									structure.structureType == STRUCTURE_STORAGE ||
									structure.structureType == STRUCTURE_TOWER ||
									structure.structureType == STRUCTURE_LAB ||
									structure.structureType == STRUCTURE_TERMINAL ||
									structure.structureType == STRUCTURE_CONTAINER ||
									structure.structureType == STRUCTURE_NUKER ||
								  structure.structureType == STRUCTURE_FACTORY ||
								  structure.structureType == STRUCTURE_OBSERVER ||
								  structure.structureType == STRUCTURE_POWER_SPAWN)) {
								if(!!D1 && D1.pos.roomName == this_room && D1.pos.getRangeTo(structure) < 11-D1.color) {
									return true;
								}
								if(!!D2 && D2.pos.roomName == this_room && D2.pos.getRangeTo(structure) < 11-D2.color) {
									return true;
								}
							}
							return !!D && D.pos.roomName == this_room &&
								!structure.my &&
								!(structure.structureType != STRUCTURE_CONTROLLER &&
									structure.structureType != STRUCTURE_CONTAINER &&
									structure.structureType != STRUCTURE_ROAD &&
									structure.structureType != STRUCTURE_WALL );
						}
					});
					if(structures.length > 0) {
						target = structures.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					}/*
					if(!!structure) {
						target = tools.setTarget(creep,structure,structure.id,roleDismantler.run);
					}*/
				}

				if(!!target) {
					var action;
					var err = ERR_NOT_IN_RANGE
					if(!!target.id) {
						action = 'dismantling:';
						err = creep.dismantle(target);
					}
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜⛏');
						err = tools.moveTo(creep,target);
// 						console.log( '🔜⛏', Math.trunc(Game.time/10000), Game.time%10000
// 												, creep.name
// 												, 'moving for dismantling:'
// 												, target.name?target.name:target.structureType);
					}
					else if(!err) {
						creep.say('⛏');
// 						console.log( '⛏', Math.trunc(Game.time/10000), Game.time%10000
//                                 , creep.name
//                                 , 'dismantling:'
//                                 , target.name?target.name:target.structureType);
					}
					else {
						creep.memory.dismantling = false;
						console.log( '⛏⚠️', Math.trunc(Game.time/10000), Game.time%10000
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
					creep.memory.dismantling = false;
				}
			}

			metrix.cpu.role_time(creep, 'dismantling');
			if(!creep.memory.dismantling) {
				return roleNext.run(creep);
			}
		}
};

module.exports = roleDismantler;
