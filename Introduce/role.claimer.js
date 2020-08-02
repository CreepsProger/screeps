const roleNext = require('role.attacker');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

//var git = '$Format:%H$';

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

	init: function(creep, mrole) {
		if(mrole === undefined ||
			 mrole.v === undefined ||
			 mrole.v != config.version) {
			creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
			mrole = creep.memory[role.name];
		}
	},
	
	checkOff: function(creep, mrole) {
		if(creep.getActiveBodyparts(CLAIM) == 0 && mrole.on) {
			mrole.on = false;
		}
	},

	checkOn: function(creep, mrole) {
		if(!mrole.on && creep.getActiveBodyparts(CLAIM) > 0) {

			mrole.on = true;
// 			creep.memory[role.name].room = role.target_room;
			const old_shard = mrole.shard;
			const old_room = mrole.room;
			config.setRoom(creep, role.name);
			const new_shard = mrole.shard;
			const new_room = mrole.room;
			if(new_shard != old_shard || new_room != old_room) {
				console.log(creep, role.name, '['+old_shard+']'+old_room, '->', '['+new_shard+']'+new_room);
			}
		}
	},

	test_weight: 300,

	run: function(creep) {
		var mrole = creep.memory[role.name];

		role.init(creep, mrole);
		role.checkOff(creep, mrole);
		role.checkOn(creep, mrole);


		if(tools.getWeight(creep.name) % 10 == 0 && mrole.on) {

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
					const C = !!flags.flags.C && flags.flags.C.pos.roomName == creep.pos.roomName;
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
				mrole.on = false;
			}
		}

		metrix.cpu.step_time(creep, role.name, '🗝🔚');
		metrix.cpu.role_time(creep, role.name);
		if(!mrole.on) {
			return roleNext.run(creep);
		}
	}
};

module.exports = role;
