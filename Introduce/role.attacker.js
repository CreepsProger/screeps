const roleNext = require('role.dismantler');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');

var role = {

    name: 'attacker',

			init: function(creep) {
				if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].v === undefined ||
					 creep.memory[role.name].v != config.version) {
					creep.memory[role.name] = { v: config.version
																		, on: false
																		, room: creep.room.name
																		};
				}
			},

    /** @param {Creep} creep **/
    run: function(creep) {

			role.init(creep);

			if(creep.memory.attacking) {
				creep.memory.attacking = false;
			}

			if(!creep.memory.attacking &&
				 (creep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
          creep.getActiveBodyparts(ATTACK) > 0 ||
          creep.getActiveBodyparts(HEAL) > 0 ||
          creep.hits < creep.hitsMax ||
				  (creep.getActiveBodyparts(WORK) == 0 && creep.getActiveBodyparts(CARRY) == 0 && creep.getActiveBodyparts(CLAIM) == 0))) {

				creep.memory.attacking = true;
				config.setRoom(creep, role.name);
			}

			if(creep.memory.attacking) {

	      const this_room = creep.room.name;
	  		const this_room_config = Memory.config.rooms[this_room];
				const my_room = creep.memory[role.name].room;
	  		const my_room_config = Memory.config.rooms[my_room];
  			// console.log(creep, my_room, JSON.stringify(my_room_config));
				// const my_heal_room = 'W26S33';//my_room_config.heal_room;//'W25S33';
				// const my_path_room = 'W27S33';//(!!my_room_config.path_rooms[this_room];
				const my_heal_room = my_room_config.heal_room;//'W25S33';
				const my_path_room = my_room_config.path_rooms[this_room];
				// const my_next_escape_room = 'W26S33';//my_room_config.escape_path[this_room];
				const my_next_escape_room = my_room_config.escape_path[this_room];

    		var target;

				const hostile_creeps_near = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length > 0;
				const good_healer_near = creep.pos.findInRange(FIND_MY_CREEPS, 2, {filter: (healer) => {
						return healer.getActiveBodyparts(HEAL) > 0 /*&& healer.hits == healer.hitsMax*/;}}).length > 0;
				const shouldHeal = creep.hitsMax - creep.hits;
				const tough_count = creep.body.reduce((p,c) => p += (c.type == TOUGH),0);
				const tough_more_then_half = shouldHeal < tough_count*50;
				const tough_less_then_half = !tough_more_then_half && shouldHeal < tough_count*100;
				const canAttack = tough_more_then_half && (creep.getActiveBodyparts(RANGED_ATTACK) || creep.getActiveBodyparts(ATTACK));
				const canAttack2 = tough_less_then_half && (creep.getActiveBodyparts(RANGED_ATTACK) || creep.getActiveBodyparts(ATTACK));
				const canHeal = tough_more_then_half && creep.getActiveBodyparts(HEAL);
				const canHeal2 = tough_less_then_half && creep.getActiveBodyparts(HEAL);

				if(creep.memory.n == 1276) {
					console.log(JSON.stringify({tough_count: tough_count, shouldHeal: shouldHeal, canAttack: canAttack, canAttack2: canAttack2}));
				}

				if(!target && this_room == my_heal_room && creep.hits < creep.hitsMax) {
					var rampart = creep.pos.findClosestByPath(FIND_STRUCTURES, {
						filter: (structure) => {
							return structure.structureType == STRUCTURE_RAMPART &&
								structure.pos.roomName == my_heal_room &&
								!!structure.my;
						}
					});

					if(!!rampart && rampart.pos != creep.pos) {
						target = rampart;
					}
				}

				if(creep.memory.n == 1276) {
					console.log(JSON.stringify({n:creep.memory.n, my_heal_room: my_heal_room, shouldHeal: shouldHeal, canAttack: canAttack, canAttack2: canAttack2}));
				}

				// if(!target && creep.hits < creep.hitsMax) { //creep.hitsMax - creep.hits > creep.getActiveBodyparts(TOUGH)*100 && !creep.getActiveBodyparts(HEAL)) {
			  if(!target && //!creep.getActiveBodyparts(HEAL) &&
					!canAttack && canAttack2 && !good_healer_near) {
					var creep2 = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (healer) => {
							const healer_tough_count = healer.body.reduce((p,c) => p += (c.type == TOUGH),0);
							const healer_canAttack = ((healer.hitsMax - healer.hits) < tough_count*100);
							return healer_canAttack && healer.getActiveBodyparts(HEAL) > 0;
						}
					});
					var path = creep.pos.findPathTo(target);
					if(path.length > 1) {
						target = creep2;
					}
				}

				if(!target && creep.getActiveBodyparts(HEAL) &&
					 this_room != my_room &&
					 creep.pos.x%48 > 1 &&
					 creep.pos.y%48 > 1 &&
					 !hostile_creeps_near &&
					 creep.hitsMax - creep.hits > 0 ) {
					target = creep;
					if(creep.memory.n == 1276) {
						console.log('Heal myself:', JSON.stringify({n:creep.memory.n, my_heal_room: my_heal_room, shouldHeal: shouldHeal, canAttack: canAttack, canAttack2: canAttack2}));
					}
				}

				if(!target && this_room != my_heal_room && !canAttack && !canHeal) {
					const exit = creep.room.findExitTo(my_next_escape_room);
					target = creep.pos.findClosestByPath(exit);
					if(creep.memory.n == 1276) {
						console.log('Go to my heal room:', JSON.stringify({n:creep.memory.n, my_pos:creep.pos, my_heal_room: my_heal_room, shouldHeal: shouldHeal, canAttack: canAttack, canAttack2: canAttack2}));
					}
				}

				if(!target && creep.getActiveBodyparts(HEAL)) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							const mycreep_tough_count = mycreep.body.reduce((p,c) => p += (c.type == TOUGH),0);
							const mycreep_canAttack2 = mycreep.hitsMax - mycreep.hits < tough_count*100;
							return mycreep_canAttack2 && mycreep.hitsMax - mycreep.hits > 0 &&
								creep.pos.getRangeTo(mycreep) <= 10 &&
								(mycreep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
			           mycreep.getActiveBodyparts(ATTACK) > 0 ||
			           mycreep.getActiveBodyparts(HEAL) > 0);
						}
					});
				}

				if(!target && creep.getActiveBodyparts(HEAL)) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							return mycreep.hitsMax - mycreep.hits > 0 &&
								creep.pos.getRangeTo(mycreep) <= 10 &&
								!(mycreep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
			            mycreep.getActiveBodyparts(ATTACK) > 0 ||
			            mycreep.getActiveBodyparts(HEAL) > 0);
						}
					});
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
					if(targets.length > 0) {
						target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
						//target = targets[0];
					}
				}

				var range = 50;

				const A2 = Game.flags['A2'];
				if(!target && !!A2) {
					//console.log('A2', creep, 'this_room:', this_room, 'range', range, 'A2:', JSON.stringify(A2));
					if(A2.pos.roomName == this_room) {
						range = 5*A2.color;
						if(Game.time % constants.TICKS_TO_CHECK_CREEPS_NUMBER == 0) {
						//console.log('A2', creep, 'this_room:', this_room, 'range', range, 'A2:', JSON.stringify(A2));
						}
					}
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, range);
					if(targets.length > 0) {
						console.log(creep, 'Attacking in', 'this_room:', this_room, 'in range', range);
						target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
					}
				}

    		if(!target && this_room != my_room && creep.hitsMax == creep.hits) {
    			const exitDir = Game.map.findExit(this_room , my_path_room);
    			target = creep.pos.findClosestByPath(exitDir);
    // 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
    		}

				const DP1 = Game.flags['DP1'];
				if(!target && !!DP1 && DP1.pos.roomName == my_room) {
					// console.log('DP1', 'this_room:', this_room, 'DP1:', JSON.stringify(DP1));
					target = DP1.pos;
				}

				const DP2 = Game.flags['DP2'];
				if(!target && !!DP2 && DP2.pos.roomName == my_room) {
					//console.log('DP2', 'this_room:', this_room, 'DP2:', JSON.stringify(DP2));
					target = DP2.pos;
				}

				if(!target) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
						filter: (structure) => {
							return (structure.structureType != STRUCTURE_CONTROLLER &&
											structure.structureType != STRUCTURE_KEEPER_LAIR &&
                      structure.structureType == STRUCTURE_RAMPART);
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, range, {
						filter: (structure) => {
							return (structure.structureType != STRUCTURE_CONTROLLER &&
											structure.structureType != STRUCTURE_KEEPER_LAIR &&
                      structure.structureType == STRUCTURE_RAMPART);
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target && this_room != my_room && canAttack /*!shouldHeal*/) {
					const my_path_room = my_room_config.path_rooms[this_room];
					const exit = creep.room.findExitTo(my_path_room);
					target = creep.pos.findClosestByPath(exit);
				}

				if(target)
				{
					var err = ERR_NOT_IN_RANGE;
					if(target.id &&
						 // target.structureType != STRUCTURE_RAMPART &&
						 target.structureType != STRUCTURE_CONTROLLER) {
							 if (!target.my) {
								 const range = creep.pos.getRangeTo(target);							;
								 if(creep.getActiveBodyparts(RANGED_ATTACK) &&
										(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 4).length == 1 && true|| true))
									 err = range>1?creep.rangedAttack(target):creep.rangedMassAttack();
								 else
									 err = creep.attack(target);
							 }
							 else if (target.hits < target.hitsMax && creep.getActiveBodyparts(HEAL)) {
								 err = creep.heal(target);
							 }
					}

					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🎯');
						tools.moveTo(creep,target);
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

			metrix.cpu.role_time(creep, role.name);
			if(!creep.memory.attacking) {
				roleNext.run(creep);
			}
		}
};

module.exports = role;
