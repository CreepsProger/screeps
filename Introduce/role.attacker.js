const roleNext = require('role.energy.transferer');
const config = require('main.config');

var role = {

    name: 'attacker',

			init: function(creep) {
				if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].on === undefined) {
					creep.memory[role.name] = { on: false
																		, room: ''
																		};
				}
			},

    /** @param {Creep} creep **/
    run: function(creep) {

			role.init(creep);

			if(creep.memory.attacking && creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
				creep.memory.attacking = false;
			}

			if(!creep.memory.attacking &&
				 (creep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
				  creep.getActiveBodyparts(WORK) == 0 && creep.getActiveBodyparts(CARRY) == 0)) {
				creep.memory.attacking = true;
			}

			if(creep.memory.attacking) {

				config.setRoom(creep, role.name);

	      const this_room = creep.room.name;
	  		const this_room_config = Memory.config.rooms[this_room];
				const my_room = creep.memory[role.name].room;
	  		const my_room_config = Memory.config.rooms[my_room];
				const my_heal_room = my_room_config.heal_room;//'W25S33';
				console.log(JSON.stringify(my_room));
				const my_path_room = my_room_config.path_rooms[this_room];

    		var target;

    		if(!target && this_room != my_room && creep.hits == creep.hitsMax) {
    			const exitDir = Game.map.findExit(this_room , my_path_room);
    			target = creep.pos.findClosestByPath(exitDir);
    // 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
    		}

				if(this_room == my_heal_room && creep.hits < creep.hitsMax - 400) {
					if(!target) {
						var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {
							filter: (structure) => {
								return structure.structureType == STRUCTURE_RAMPART;
							}
						});

						if(rampart && rampart.my && rampart.pos != creep.pos) {
							target = rampart;
						}
						else if(creep.room.controller.my) {
							target = creep.room.controller;
						}
					}
				}

				if(creep.room.name != my_heal_room && creep.hits < creep.hitsMax - 400) {
					if(!target) {
						const exitDir = Game.map.findExit(creep.room, my_heal_room);
						target = creep.pos.findClosestByRange(exitDir);
					}
				}

				if(!target) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 3);
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target) {
					target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
				}

				if(!target) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 3, {
						filter: (structure) => {
							return (structure.structureType != STRUCTURE_CONTROLLER);
						}
					});

					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target) {
					target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
						filter: (structure) => {
							return (structure.structureType != STRUCTURE_CONTROLLER &&
											structure.structureType != STRUCTURE_KEEPER_LAIR);
						}
					});
				}

				if(!target) {
					if(this_room != my_room) {
						const exitDir = Game.map.findExit(creep.room, my_room);
						target = creep.pos.findClosestByRange(exitDir);
					}
				}

				if(!target && creep.hits < creep.hitsMax - 400) {
					if(creep.room.name != myRoom) {
						const exitDir = Game.map.findExit(creep.room, myRoom);
						target = creep.pos.findClosestByRange(exitDir);
					}
				}

				if(!target && Game.flags['DP'] !== undefined) {
					target = Game.flags['DP'].pos;
				}

				if(target)
				{
					var err = ERR_NOT_IN_RANGE;
					if(target.id &&
						 target.structureType != STRUCTURE_RAMPART &&
						 target.structureType != STRUCTURE_CONTROLLER) {
						err = creep.rangedAttack(target);
					}

					if(err == ERR_NOT_IN_RANGE) {
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
						creep.say('🔜🎯');
						if(!!Game.flags['LA '] || !!Game.flags['LA'] || !!Game.flags['L']) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '🔜🎯', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'moving for attacking to:'
													, targetinfo);
						}
					}
					else if(!err) {
						creep.say('🎯');
						if(!!Game.flags['LA '] || !!Game.flags['LA'] || !!Game.flags['L']) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '🎯', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'attacking on:'
													, targetinfo);
						}
					}
					else {
						if(!!Game.flags['LA '] || !!Game.flags['LA'] || !!Game.flags['L']) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '🎯⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'attacking on:'
													, targetinfo
													, 'with err:'
													, err);
						}
						creep.memory.attacking = false;
					}
				}
				else {
					creep.memory.attacking = false;
				}
			}

			if(!creep.memory.attacking) {
				roleNext.run(creep);
			}
		}
};

module.exports = role;
