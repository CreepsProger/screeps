const roleNext = require('role.dismantler');
// const roleNext = require('role.renewer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const cash = require('cash');
const tools = require('tools');

var role = {

    name: 'attacker',
		test_n: 41270,

		init: function(creep) {
			if(creep.memory[role.name] === undefined ||
				 creep.memory[role.name].v === undefined ||
				 creep.memory[role.name].v != config.version) {
				creep.memory[role.name] = { v: config.version
																	, on: false
                                  , room: creep.room.name
  																, shard: Game.shard.name
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

				cash.renewCreep(creep);

				const this_room = creep.room.name;
				const my_room = creep.memory[role.name].room;
				const my_shard = creep.memory[role.name].shard;
				const my_shard_config = Memory.config.shards[my_shard];
				const this_room_config = my_shard_config.rooms[this_room];
				const my_room_config = my_shard_config.rooms[my_room];
				const my_heal_room = my_room_config.heal_room;//'W25S33';
				const my_path_room = my_room_config.path_rooms[this_room];
				// const my_next_escape_room = 'W26S33';//my_room_config.escape_path[this_room];
				const my_next_escape_room = my_room_config.escape_path[this_room];

    		var target;

				const hostile_creeps_near = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0;
				const good_healer_near = creep.pos.findInRange(FIND_MY_CREEPS, 3, {filter: (healler) => {
					const attack_count = creep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK),0);
					const attacker = attack_count > 0;
					const heal_count = healler.body.reduce((p,c) => p += (c.type == HEAL),0);
					const mayHeal = healler.getActiveBodyparts(HEAL) > heal_count/2;
					return mayHeal && !attacker;}});
				
				const tough_count = creep.body.reduce((p,c) => p += (c.type == TOUGH),0);
				const shouldBeHealled = creep.hitsMax - creep.hits > tough_count/2;
				const attack_count = creep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK),0);
				const Attacker = attack_count > 0;
				const canAttack = creep.getActiveBodyparts(RANGED_ATTACK) + creep.getActiveBodyparts(ATTACK) > attack_count/2;
				const canAttack2 = creep.getActiveBodyparts(RANGED_ATTACK) + creep.getActiveBodyparts(ATTACK);
				const heal_count = creep.body.reduce((p,c) => p += (c.type == HEAL),0);
				const Healler = !Attacker && heal_count > 0;
				const canHeal = creep.getActiveBodyparts(HEAL) > heal_count/2;
				const canHeal2 = creep.getActiveBodyparts(HEAL);

				if(creep.memory.n == role.test_n) {
					console.log(JSON.stringify({Attacker: Attacker, canAttack: canAttack, Healler: Healler, canHeal: canHeal, shouldBeHealled: shouldBeHealled}));
				}

				if(!target && this_room == my_heal_room && shouldBeHealled &&
					 ((Attacker && !canAttack) || (Healler && !canHeal) || (!Attacker && !Healler))
					) {
					var towers = cash.getTowers(creep.room);

					if(towers.length > 0) {
						target = towers.reduce((p,c) => !!p && !!p.store && !!c && !!c.store &&
												creep.pos.getRangeTo(p) * (p.store.getUsedCapacity(RESOURCE_ENERGY) + 500)
												<
												creep.pos.getRangeTo(c) * (c.store.getUsedCapacity(RESOURCE_ENERGY) + 500)
												? p:c);
					}
				}

				if(creep.memory.n == role.test_n) {
					console.log(JSON.stringify({Attacker: Attacker, canAttack: canAttack, Healler: Healler, canHeal: canHeal, shouldBeHealled: shouldBeHealled}));
				}

				if(!target && Attacker && !canAttack2 && !good_healer_near) {
					var creep2 = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (healler) => {
							const attack_count = creep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK),0);
							const attacker = attack_count > 0;
							const heal_count = healler.body.reduce((p,c) => p += (c.type == HEAL),0);
							const mayHeal = healler.getActiveBodyparts(HEAL) > heal_count/2;
							return mayHeal && !attacker;
						}
					});
					var path = creep.pos.findPathTo(target);
					if(path.length > 1) {
						target = creep2;
					}
				}
/*
				if(!target && creep.getActiveBodyparts(HEAL) &&
					 this_room != my_room &&
					 creep.pos.x%48 > 1 &&
					 creep.pos.y%48 > 1 &&
					 !hostile_creeps_near &&
					 creep.hitsMax - creep.hits > 0 ) {
					target = creep;
					if(creep.memory.n == role.test_n) {
						console.log('Heal myself:', JSON.stringify({n:creep.memory.n, my_heal_room: my_heal_room, shouldHeal: shouldHeal, canAttack: canAttack, canAttack2: canAttack2}));
					}
				}
*/
				if(!target && this_room != my_heal_room &&
					 ((Attacker && !canAttack2) || (Healler && !canHeal) || (!Attacker && !Healler && shouldBeHealled) )
					) {
					const exit = creep.room.findExitTo(my_next_escape_room);
					target = creep.pos.findClosestByPath(exit);
					if(creep.memory.n == role.test_n) {
						console.log('Go to my heal room:', JSON.stringify({n:creep.memory.n, my_pos:creep.pos, my_heal_room: my_heal_room, shouldBeHealled: shouldBeHealled, canAttack: canAttack, canAttack2: canAttack2}));
					}
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
					if(targets.length > 0) {
						target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
					}
				}

				if(!target && Healler && canHeal) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							const attack_count = mycreep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK),0);
							const mayAttack = mycreep.getActiveBodyparts(RANGED_ATTACK) + creep.getActiveBodyparts(ATTACK) > attack_count/2;
							const heal_count = mycreep.body.reduce((p,c) => p += (c.type == HEAL),0);
							const mayHeal = mycreep.getActiveBodyparts(HEAL) > heal_count/2;
							return  mycreep.hitsMax - mycreep.hits > 0 &&
											(mayAttack || mayHeal) &&
                      creep.pos.getRangeTo(mycreep) > 0 &&
                      creep.pos.getRangeTo(mycreep) <= 15;
						}
					});
				}

				if(!target && Healler && canHeal) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							const mayAttack2 = mycreep.getActiveBodyparts(RANGED_ATTACK) + mycreep.getActiveBodyparts(ATTACK);
							const mayHeal2 = mycreep.getActiveBodyparts(HEAL);
							return 	mycreep.hitsMax - mycreep.hits > 0 &&
											(mayAttack2 || mayHeal2) &&
                    	creep.pos.getRangeTo(mycreep) > 0 &&
    									creep.pos.getRangeTo(mycreep) <= 10;
						}
					});
				}

				if(!target && Healler && canHeal) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							return 	mycreep.hitsMax - mycreep.hits > 0 &&
                    	creep.pos.getRangeTo(mycreep) > 0 &&
    									creep.pos.getRangeTo(mycreep) <= 5;
						}
					});
				}

				if(!target && Healler && canHeal) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							const attack_count = mycreep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK /* || c.type == TOUGH*/),0);
							return  mycreep.hitsMax - mycreep.hits == 0 &&
											attack_count &&
                      creep.pos.getRangeTo(mycreep) > 0 &&
                      creep.pos.getRangeTo(mycreep) <= 20;
						}
					});
				}

				var range = 50;

				const A2 = flags.flags.A2;
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
					if(!!target && target.x > 1 && target.x < 49)
						target.x += Game.time%3 - 1;
    			// console.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room, 'target', target);
    		}
				
				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, range, {
						filter: (structure) => {
							return (structure.structureType == STRUCTURE_INVADER_CORE) &&
								structure.level !== undefined && structure.level == 0;
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5, {
						filter: (structure) => {
							return (//structure.structureType != STRUCTURE_CONTROLLER &&
											structure.structureType != STRUCTURE_KEEPER_LAIR);/* &&
                      structure.structureType == STRUCTURE_RAMPART);*/
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target && canAttack) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, range, {
						filter: (structure) => {
							return structure.structureType != STRUCTURE_KEEPER_LAIR;
								//  &&
								// structure.structureType != STRUCTURE_CONTROLLER &&
								// 				structure.structureType == STRUCTURE_RAMPART);
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				const DP1 = flags.flags.DP1;
				if(!target && !!DP1 && DP1.pos.roomName == my_room) {
					// console.log('DP1', 'this_room:', this_room, 'DP1:', JSON.stringify(DP1));
					target = DP1.pos;
				}

				const DP2 = flags.flags.DP2;
				if(!target && !!DP2 && DP2.pos.roomName == my_room) {
					//console.log('DP2', 'this_room:', this_room, 'DP2:', JSON.stringify(DP2));
					target = DP2.pos;
				}
				if(!target && canAttack) {
					// const room = Game.rooms[this_room];
					const pos = (!A2 || A2.pos.roomName != my_room) ? creep.pos:A2.pos;
					const keeperlairs = pos.findInRange(FIND_HOSTILE_STRUCTURES, range, {
						filter: (structure) => {
							return (structure.structureType == STRUCTURE_KEEPER_LAIR);
						}
					});

					if(keeperlairs.length > 0) {
						var lair = keeperlairs.reduce((p,c) => {
							const left = ((creep.pos.getRangeTo(p) + 250) * ((!p.ticksToSpawn)?0:p.ticksToSpawn));
							const right = ((creep.pos.getRangeTo(c) + 250) * ((!c.ticksToSpawn)?0:c.ticksToSpawn));
							// console.log('keeperlairs', 'this_room:', this_room, 'left:', left, JSON.stringify(p));
							// console.log('keeperlairs', 'this_room:', this_room, 'right', right, JSON.stringify(c));
							return (creep.pos.getRangeTo(p)>2 && left < right)? p:c;
						});
						if(!!lair) {
							//console.log('lair', 'this_room:', this_room, 'range:', creep.pos.getRangeTo(lair), 'lair:', JSON.stringify(lair));
							target = lair;
						}
					}
				}

				if(!target && canAttack2) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 5);
					if(targets.length > 0) {
						var hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
						creep.attack(hostile);
						creep.rangedAttack(hostile);
					}
				}

				if(!target && this_room != my_room && canAttack /*!shouldHeal*/) {
					target = config.findPathToMyRoom(creep,role.name);
				}

				if(!target && shouldBeHealled && canHeal2) {
					target = creep;
				}

				if(target)
				{
					var err = ERR_NOT_IN_RANGE;
					if(target.id &&
						 // target.structureType != STRUCTURE_RAMPART &&
						 target.structureType != STRUCTURE_CONTROLLER) {
						if (!target.my) {
							const range = creep.pos.getRangeTo(target);
							if(Attacker && canAttack2) {
								if(creep.getActiveBodyparts(RANGED_ATTACK)) {
									if(creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2).length > 1)
										err = creep.rangedMassAttack();
									else err = range<4?creep.rangedAttack(target):ERR_NOT_IN_RANGE;
								}
								if(creep.getActiveBodyparts(ATTACK)) {
									err = range==1?creep.attack(target):ERR_NOT_IN_RANGE;
								}
							}
						}
						else {
							if (target.hits < target.hitsMax && creep.getActiveBodyparts(HEAL)) {
								err = creep.heal(target);
							}
							else {
								err == ERR_NOT_IN_RANGE;
							}
						}
					}
					if ((creep.hits < creep.hitsMax || !target) && creep.getActiveBodyparts(HEAL)) {
						creep.heal(creep);
					}

					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🎯');
						config.moveTo(creep,target);
						if(!!flags.flags.LA || !!flags.flags.L) {
							console.log( '🔜🎯', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'moving for attacking to:'
													, JSON.stringify({target:target}));
						}
					}
					else if(!err) {
						creep.say('🎯');
						if(!!flags.flags.LA || !!flags.flags.L) {
							console.log( '🎯', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'attacking on:'
													, JSON.stringify({target:target}));
						}
					}
					else {
						if(!!flags.flags.LA || !!flags.flags.L) {
							console.log( '🎯⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'attacking on:'
													, 'with err:'
													, err, JSON.stringify({target:target}));
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
