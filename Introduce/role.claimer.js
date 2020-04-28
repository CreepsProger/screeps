const roleNext = require('role.attacker');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

var git = '$Format:%H$';

var role = {

	name: 'claiming',

	logFlags: ['LC','LC ','L'],

	log: function(creep,...args) {
			if(log.canLog(role.logFlags, creep)) {
				console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

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

	checkOff: function(creep) {
		if(creep.memory[role.name].on && creep.getActiveBodyparts(CLAIM) == 0) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 creep.getActiveBodyparts(CLAIM) > 0 // && creep.memory.rerun
		 ) {

			creep.memory[role.name].on = true;
// 			creep.memory[role.name].room = role.target_room;
			const old_room = creep.memory[role.name].room;
			config.setRoom(creep, role.name);
			const new_room = creep.memory[role.name].room;
			if(new_room != old_room) {
				console.log(creep, role.name, old_room, '->', new_room);
			}
		}
	},

	test_weight: 300,

	run: function(creep) {
		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);

		if(creep.memory[role.name].on) {

			if(creep.memory.weight == role.test_weight) {
				// console.log(creep, role.name, JSON.stringify(creep.room));
			}

			const this_room = creep.room.name;
			const this_room_config = Memory.config.rooms[this_room];
			const my_room = creep.memory[role.name].room;
			const my_room_config = Memory.config.rooms[my_room];
			const my_shard = creep.memory[role.name].shard;
			const my_shard_config = Memory.config.shards[my_shard];

			var target;

			if(creep.memory.weight == role.test_weight) {
				const my_room = creep.memory[role.name].room;
				const my_room_config = my_shard_config.rooms[my_room];
				if(!target && (this_room != my_room || (Game.shard.name != my_shard || true)) {
					// console.log(creep, role.name, JSON.stringify({my_room:my_room, my_shard_config:my_shard_config}));
					// console.log(creep, role.name, JSON.stringify({my_room_config:my_room_config}));
					const path_rooms = my_room_config.path_rooms[Game.shard.name];
					// console.log(creep, role.name, JSON.stringify({shard:Game.shard.name, path_rooms:path_rooms}));
					const my_path_room = path_rooms[this_room];
					const shard = my_path_room.substring(0,5);
					console.log(creep, role.name, JSON.stringify({this_room:this_room, my_path_room:my_path_room, shard:shard, path_rooms:path_rooms}));
					if(shard == 'shard') {
						var portals = creep.room.find(FIND_STRUCTURES, {
							filter: (structure) => structure.structureType == STRUCTURE_PORTAL });
							console.log(creep, role.name, JSON.stringify({my_path_room:my_path_room, portals:portals}));
					}
					else {
						const exit = creep.room.findExitTo(my_path_room);
						target = creep.pos.findClosestByPath(exit);
						console.log(creep, role.name, JSON.stringify({my_path_room:my_path_room, exit:exit, target:target}));
					}
					// console.log(creep, role.name, JSON.stringify({my_path_room:my_path_room, exit:exit, target:target}));
				}
			}

			if(!target && this_room != my_room) {
				const my_path_room = my_room_config.path_rooms[this_room];
				const exit = creep.room.findExitTo(my_path_room);
				target = creep.pos.findClosestByPath(exit);
			}

			if(!target) {
				target = cash.getController(creep.room);
			}

			metrix.cpu.step_time(creep, role.name, '🗝');

			if(target)
			{
				var err = ERR_NOT_IN_RANGE;
				var action;
				if(target.id) {
					const myRoomsNumber = 5;
					const C = !!Game.flags['C'] && Game.flags['C'].pos.roomName == creep.pos.roomName;
					if(!target.my && (Game.gcl.level == myRoomsNumber || C)) {
						action = 'claiming controller';
						err = creep.claimController(target);
						if(OK != err) {
							action = 'reserving controller';
							err = creep.reserveController(target);
						}
						if(OK != err) {
							action = 'attacking controller';
							err = creep.attackController(target);
						}
					}
				}
				creep.say('🗝')
				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜🗝');
					err = tools.moveTo(creep,target);
					role.log(creep, 'err:', err, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				if(!err) {
					role.log(creep, action, JSON.stringify(target), JSON.stringify(Game.rooms));
				}
				else {
					role.log(creep, action, 'err:', err, JSON.stringify(creep.reserveController));
					creep.memory.claiming.on = false;
				}
			}
			else {
				creep.memory[role.name].on = false;
			}
		}

		metrix.cpu.step_time(creep, role.name, '🗝🔚');
		metrix.cpu.role_time(creep, role.name);
		if(!creep.memory[role.name].on) {
			roleNext.run(creep);
		}
	}
};

module.exports = role;
