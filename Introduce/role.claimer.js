const roleNext = require('role.attacker');
const config = require('main.config');
const flags = require('main.flags');
const log = require('main.log');

var git = '$Format:%H$';

var role = {

	name: 'claiming',

	logFlags: ['LC','LC ','L'],

	log: function(creep,...args) {
			if(log.canLog(role.logFlags)) {
				console.log( '🗝', Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

	init: function(creep) {
		if(creep.memory[role.name] === undefined ||
			 creep.memory[role.name].on === undefined) {
			creep.memory[role.name] = { on: false
																, room: ''
																};
		}
	},

	checkOff: function(creep) {
		if(creep.memory[role.name].on) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 creep.getActiveBodyparts(CLAIM) > 0 &&
			 creep.getActiveBodyparts(CARRY) == 0 &&
			 creep.memory.rerun) {

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

	run: function(creep) {
		role.init(creep);
		role.checkOff(creep);
		role.checkOn(creep);

		const this_room = creep.room.name;
		const this_room_config = Memory.config.rooms[this_room];
		const my_room = creep.memory[role.name].room;
		const my_room_config = Memory.config.rooms[my_room];
		const my_path_room = my_room_config.path_rooms[this_room];

		if(creep.memory[role.name].on) {
			var target;

  		if(!target && this_room != my_room) {
  			const exitDir = Game.map.findExit(this_room , my_path_room);
  			target = creep.pos.findClosestByPath(exitDir);
  		}
			if(!target) {
				target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
					filter: (structure) => {
						return (structure.structureType == STRUCTURE_CONTROLLER) &&
							!structure.my;
					}
				});
			}
			if(target)
			{
				var err = ERR_NOT_IN_RANGE;
				var action;
				if(target.id) {
					if(!target.my) {
						action = 'claiming controller';
						err = creep.claimController(target);
						if(OK != err) {
							action = 'reserving controller';
							err = creep.reserveController(target);
						}
					}
				}
				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜🗝');
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
					role.log(creep, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));
				}
				else if(!err) {
					creep.say('🗝');
					role.log(creep, action, JSON.stringify(target), JSON.stringify(Game.rooms));
// 					console.log('Game.rooms:', JSON.stringify(Game.rooms));
//  					console.log('Game.gcl:', JSON.stringify(Game.gcl));
//  					console.log('Game.rooms my:', JSON.stringify(_.filter(Game.rooms, function(room) { return room.energyCapacityAvailable > 0; })));
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

		if(!creep.memory[role.name].on) {
			roleNext.run(creep);
		}
	}
};

module.exports = role;
