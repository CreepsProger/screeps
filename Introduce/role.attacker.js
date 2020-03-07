const roleNext = require('role.energy.transferer');
const config = require('main.config');

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
				 (creep.getActiveBodyparts(RANGED_ATTACK) > 0 || creep.getActiveBodyparts(ATTACK) > 0 || creep.getActiveBodyparts(HEAL) > 0 ||
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

    		if(!target && this_room != my_room && creep.hits == creep.hitsMax) {
    			const exitDir = Game.map.findExit(this_room , my_path_room);
    			target = creep.pos.findClosestByPath(exitDir);
    // 			role.log('🔜⚡', creep, 'exit:', this_room, 'to', my_room);
    		}

				if(!target && this_room == my_heal_room && creep.hits < creep.hitsMax) {
					var rampart = creep.pos.findClosestByRange(FIND_STRUCTURES, {
						filter: (structure) => {
							return structure.structureType == STRUCTURE_RAMPART &&
							 !!rampart.my;
						}
					});

					if(rampart && rampart.pos != creep.pos) {
						target = rampart;
					}
				}

				if(!target && !creep.getActiveBodyparts(TOUGH) && !creep.getActiveBodyparts(HEAL)) {
					target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							return mycreep.getActiveBodyparts(HEAL);
						}
					});
				}

				if(this_room != my_heal_room && creep.hitsMax - creep.hits > creep.getActiveBodyparts(TOUGH)*100 ) {
					if(!target) {
						const exitDir = Game.map.findExit(creep.room, my_next_escape_room);
						target = creep.pos.findClosestByRange(exitDir);
					}
				}

				if(!target && creep.getActiveBodyparts(HEAL)) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							return mycreep.hitsMax - mycreep.hits > 12 * creep.getActiveBodyparts(HEAL);
						}
					});
				}

				if(!target && creep.getActiveBodyparts(HEAL)) {
					target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
						filter: (mycreep) => {
							return mycreep.hitsMax - mycreep.hits > 0;
						}
					});
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

				if(!target && Game.flags['DP'] !== undefined) {
					target = Game.flags['DP'].pos;
				}

				if(!target) {
					if(this_room != my_room) {
						const exitDir = Game.map.findExit(creep.room, my_room);
						target = creep.pos.findClosestByRange(exitDir);
					}
				}

				if(target)
				{
					var err = ERR_NOT_IN_RANGE;
					if(target.id &&
						 target.structureType != STRUCTURE_RAMPART &&
						 target.structureType != STRUCTURE_CONTROLLER) {
						err = (!target.my)? creep.rangedAttack(target):
																creep.heal(target);
					}

					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜🎯');
						creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
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
