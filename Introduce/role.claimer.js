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
		if(!creep.memory[role.name].on) &&
			 creep.getActiveBodyparts(CLAIM) > 0 // && creep.memory.rerun
		 ) {

			creep.memory[role.name].on = true;
// 			creep.memory[role.name].room = role.target_room;
			const old_shard = creep.memory[role.name].shard;
			const old_room = creep.memory[role.name].room;
			config.setRoom(creep, role.name);
			const new_shard = creep.memory[role.name].shard;
			const new_room = creep.memory[role.name].room;
			if(new_shard != old_shard || new_room != old_room || tools.getWeight(creep.name) == role.test_weight) {
				console.log(creep, role.name, '['+old_shard+']'+old_room, '->', '['+new_shard+']'+new_room);
			}
		}
	},

	test_weight: 300,

	run: function(creep) {

		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);


		if(creep.memory[role.name].on) {

			if(tools.getWeight(creep.name) == role.test_weight) {
				// console.log(creep, role.name, JSON.stringify({room:creep.room, config:Memory.config}));
				// config.setRoom(creep, role.name);
			}

			const this_room = creep.room.name;
			const my_room = creep.memory[role.name].room;
			const my_shard = creep.memory[role.name].shard;
			const my_shard_config = Memory.config.shards[my_shard];
			const this_room_config = my_shard_config.rooms[this_room];
			const my_room_config = my_shard_config.rooms[my_room];

			var target = config.findPathToMyRoom(creep,role.name);

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
					if(!target.my && C) {
						action = 'claiming controller';
						err = creep.claimController(target);
					}
					else if(!target.my){
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
