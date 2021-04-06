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
		test_n: 93492,

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
				  (creep.getActiveBodyparts(CARRY) == 0 && creep.getActiveBodyparts(CLAIM) == 0))) {

				creep.memory.attacking = true;
				config.setRoom(creep, role.name);
			}

			if(creep.memory.attacking) {

				cash.renewCreep(creep);

				const this_room = creep.room.name;
				const my_room = creep.memory[role.name].room;
				const my_shard = creep.memory[role.name].shard;
				const my_shard_config = config.Memory.shards[my_shard];
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
					return mayHeal && !attacker;}}).shift();
				
				const tough_count = creep.body.reduce((p,c) => p += (c.type == TOUGH),0);
				const shouldBeHealled = creep.hitsMax - creep.hits > tough_count*200/3;
				const attack_count = creep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK ),0);
				const Attacker = attack_count > 0;
				const attacker = attack_count > 0;
				const canAttack = (creep.getActiveBodyparts(RANGED_ATTACK) + creep.getActiveBodyparts(ATTACK) > attack_count/2) &&
							(!flags.getFlag(creep.room.name + '.canAttack_if_tough>50%') || (creep.getActiveBodyparts(TOUGH) + creep.getActiveBodyparts(TOUGH) > tough_count/2));
				const canAttack2 = creep.getActiveBodyparts(RANGED_ATTACK) + creep.getActiveBodyparts(ATTACK);
				const heal_count = creep.body.reduce((p,c) => p += (c.type == HEAL),0);
				const Healler = !Attacker && heal_count > 0;
				const canHeal = creep.getActiveBodyparts(HEAL) > heal_count/2;
				const canHeal2 = creep.getActiveBodyparts(HEAL);
				const dism_count = creep.body.reduce((p,c) => p += (c.type == WORK ),0);
				const Dismantler = dism_count > 0;
				const canDismantle = creep.getActiveBodyparts(WORK) > dism_count/2;
				const canDismantle2 = creep.getActiveBodyparts(WORK);

				if(creep.memory.n == role.test_n) {
					console.log(JSON.stringify( { creep:creep.name
																			, Attacker:Attacker, canAttack:canAttack, canAttack2:canAttack2
																			, Healler:Healler, canHeal:canHeal, canHeal2:canHeal2
																			, Dismantler:Dismantler, canDismantle:canDismantle, canDismantle2:canDismantle2
																			, shouldBeHealled: shouldBeHealled, good_healer_near:good_healer_near}));
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

				if(!target && ((Attacker && !canAttack2) || (Dismantler && !canDismantle)) && good_healer_near) {
					var creep2 = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (healler) => {
							const attack_count = creep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK),0);
							const attacker = attack_count > 0;
							const heal_count = healler.body.reduce((p,c) => p += (c.type == HEAL),0);
							const mayHeal = healler.getActiveBodyparts(HEAL) > heal_count/2;
							return mayHeal && !attacker;
						}
					});
					var path = creep.pos.findPathTo(creep2);
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
					 ((Attacker && !canAttack) ||
						(Dismantler && !canDismantle) ||
						(Healler && !canHeal) ||
						(!Attacker && !Healler && shouldBeHealled) )
					) {
					const exit = creep.room.findExitTo(my_next_escape_room);
					target = creep.pos.findClosestByPath(exit);
					if(creep.memory.n == role.test_n) {
						console.log('Go to my heal room:', JSON.stringify({n:creep.memory.n, my_pos:creep.pos, my_heal_room: my_heal_room, shouldBeHealled: shouldBeHealled, canAttack: canAttack, canAttack2: canAttack2}));
					}
				}

				const StopHereFlag = flags.getFlag(creep.room.name+'.Stop_attackers_in_this_room');
				const StopHere = (!!StopHereFlag && (StopHereFlag.pos.roomName == this_room));
				if(!target &&
					 this_room != my_room &&
					 (canAttack || canHeal || canDismantle) &&
					 !StopHere) {
					target = config.findPathToMyRoom(creep,role.name);
				}

				const D = flags.flags.D;
				const D1 = flags.flags.D1;
				const D2 = flags.flags.D2;
				const D3 = flags.flags.D3;
				const D4 = flags.flags.D4;
				const DR1 = flags.flags.DR1;
				const DR2 = flags.flags.DR2;
				const DSOURCE = !!flags.flags.DSOURCE && flags.flags.DSOURCE.pos.roomName == this_room;
				const this_room_sources_are_empty = cash.areEmptySourcesByPath(creep);

				if(!target && (Dismantler && canDismantle) && 
					 (D
						||
						(!!D1 && D1.pos.roomName == this_room)
						||
						(!!D2 && D2.pos.roomName == this_room)
						||
						(!!D3 && D3.pos.roomName == this_room)
						||
						(!!D4 && D4.pos.roomName == this_room)
						||
						(!!DR1 && DR1.pos.roomName == this_room)
						||
						(!!DR2 && DR2.pos.roomName == this_room)
					 )) {
					const structures = creep.room.find(FIND_STRUCTURES, {
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
								if(!!DR1 && DR1.pos.roomName == this_room &&
									 DR1.pos.getRangeTo(structure) < 11-DR1.color &&
									 structure.structureType == STRUCTURE_RAMPART ) {
									return true;
								}
								if(!!DR2 && DR2.pos.roomName == this_room &&
									 DR2.pos.getRangeTo(structure) < 11-DR2.color &&
									 structure.structureType == STRUCTURE_RAMPART ) {
									return true;
								}
								if(!!D1 && D1.pos.roomName == this_room && D1.pos.getRangeTo(structure) < 11-D1.color) {
									return true;
								}
								if(!!D2 && D2.pos.roomName == this_room && D2.pos.getRangeTo(structure) < 11-D2.color) {
									return true;
								}
								if(!!D3 && D3.pos.roomName == this_room && D3.pos.getRangeTo(structure) < 11-D3.color) {
									return true;
								}
								if(!!D4 && D4.pos.roomName == this_room && D4.pos.getRangeTo(structure) < 11-D4.color) {
									return true;
								}
							}
							return !!D;
						}
					});
					if(structures.length > 0) {
						target = structures.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					}
				}

				const NA = (!!flags.getFlag(creep.room.name + '.NA'))? flags.getFlag(creep.room.name + '.NA'):flags.getFlag('NA');
				if(!target && canAttack && !NA) {
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
							const attack_count = mycreep.body.reduce((p,c) => p += (c.type == RANGED_ATTACK || c.type == ATTACK || (c.type == WORK && c.boost == 'XZH2O')),0);
							return  mycreep.hitsMax - mycreep.hits == 0 &&
											attack_count &&
                      creep.pos.getRangeTo(mycreep) > 0 &&
                      creep.pos.getRangeTo(mycreep) <= 2;
						}
					});
				}
				
				
				var range = 50;

				const A2 = (!!flags.getFlag(creep.room.name + '.A2'))? flags.getFlag(creep.room.name + '.A2'):flags.getFlag('A2');
				if(!target && !!A2) {
					//console.log('A2', creep, 'this_room:', this_room, 'range', range, 'A2:', JSON.stringify(A2))
					range = 5*(A2.color-1);
					if(Game.time % constants.TICKS_TO_CHECK_CREEPS_NUMBER == 0) {
						//console.log('A2', creep, 'this_room:', this_room, 'range', range, 'A2:', JSON.stringify(A2));
					}
				}

				if(!target && canAttack && !NA) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, range);
					if(targets.length > 0) {
						console.log(creep, 'Attacking in', 'this_room:', this_room, 'in range', range);
						target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
					}
				}

    		if(!target && this_room != my_room && creep.hitsMax == creep.hits && !StopHere) {
    			const exitDir = Game.map.findExit(this_room , my_path_room);
    			target = creep.pos.findClosestByPath(exitDir);
					if(!!target && target.x > 1 && target.x < 49)
						target.x += Game.time%3 - 1;
    			// console.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room, 'target', target);
    		}
				
				if(!target && canAttack && !NA) {
					const targets = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, range, {
						filter: (structure) => {
							return (structure.structureType == STRUCTURE_INVADER_CORE) && !structure.ticksToDeploy;
						}
					});
					if(targets.length > 0) {
						target = targets[0];
					}
				}

				if(!target && canAttack && !NA) {
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

				if(!target && canAttack && !NA) {
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

				const DP1 = flags.getFlag(creep.room.name + '.DP1');
				if(!target && !!DP1 &&
					 (DP1.pos.roomName == my_room || (!!StopHereFlag && StopHereFlag.pos.roomName == DP1.pos.roomName && DP1.pos.roomName == this_room )) &&
					creep.pos.getRangeTo(DP1.pos)>1 ) {
					console.log('DP1', 'this_room:', this_room, 'DP1:', JSON.stringify(DP1));
					target = DP1.pos;
				}

				const DP2 = flags.getFlag(creep.room.name + '.DP2');
				if(!target && !!DP2 && 
					 (DP2.pos.roomName == my_room || (!!StopHereFlag && StopHereFlag.pos.roomName == DP2.pos.roomName && DP2.pos.roomName == this_room)) && 
					 creep.pos.getRangeTo(DP2.pos)>1 ) {
					//console.log('DP2', 'this_room:', this_room, 'DP2:', JSON.stringify(DP2));
					target = DP2.pos;
				}
				if(!target && canAttack && !NA) {
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

				if(!target && this_room != my_room && canAttack /*!shouldHeal*/ && !StopHere) {
					target = config.findPathToMyRoom(creep,role.name);
				}
				
				if(creep.getActiveBodyparts(HEAL)) {
					if(creep.hits < creep.hitsMax)
						creep.heal(creep);
					else {
						const my_creep = creep.pos.findInRange(FIND_MY_CREEPS, 1, {filter: (mc) => mc.hits < mc.hitsMax}).shift();
						if(!!my_creep)
							creep.heal(my_creep);
					}
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
									const hc_count = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 2).length;
									const hs_count = creep.pos.findInRange(FIND_HOSTILE_STRUCTURES, 2,
																												 {filter : (s) => {return s.structureType != STRUCTURE_KEEPER_LAIR && !s.ticksToDeploy;}}).length;
									if(hc_count + hs_count > 1) {
										err = creep.rangedMassAttack();
									}
									else err = range<4?creep.rangedAttack(target):ERR_NOT_IN_RANGE;
									const pos = tools.getPosByDirection(creep.pos, creep.pos.getDirectionTo(target));
									if(pos.findInRange(FIND_HOSTILE_CREEPS, 2).length > hc_count) {
										creep.moveTo(pos);
									}
								}
								if(creep.getActiveBodyparts(ATTACK)) {
									err = range==1?creep.attack(target):ERR_NOT_IN_RANGE;
								}
							}
							if(Dismantler && canDismantle2) {
								err = range==1?creep.dismantle(target):ERR_NOT_IN_RANGE;
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
