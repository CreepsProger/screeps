const constants = require('main.constants');
const flags = require('main.flags');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 109,
	ticksToCheckCreepsNumber: 10,
	// maxCreepsNumber:40,

	log_flags: ['MC','MCF ','M'],

	log: function(sign, ...args) {
			if(log.canLog(config.log_flags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(config.version)
									  , args);
			}
	},

	init: function() {
		if(Memory.config === undefined ||
			 Memory.config.v === undefined ||
			 Memory.config.v != config.version) {
			Memory.config = { v: config.version , rooms : {
						 W25S33: { containers: {weight: 35}
										 , links:
												 [ {from: '1', to: '0'}
												 , {from: '1', to: '0'}
												 ]
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 30, max_weight: 39}
												 , {name: '2', time: 0, min_weight: 30, max_weight: 39}
												 , {name: '3', time: 0, min_weight: 30, max_weight: 39}
												 , {name: '4', time: 0, min_weight: 30, max_weight: 39}
												 , {name: '5', time: 0, min_weight: 30, max_weight: 39}
												 ]
										 , heal_room: 'W26S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W26S33: { containers: {weight: 45}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 40, max_weight: 49}
												 , {name: '2', time: 0, min_weight: 40, max_weight: 49}
												 , {name: '3', time: 0, min_weight: 40, max_weight: 49}
												 , {name: '4', time: 0, min_weight: 40, max_weight: 49}
												 , {name: '5', time: 0, min_weight: 40, max_weight: 49}
												 ]
										 , heal_room: 'W26S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W27S33: { containers: {weight: 55}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '2', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '3', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '4', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '5', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '6', time: 0, min_weight: 50, max_weight: 59}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 50, max_weight: 59}
												 , {name: '2', time: 0, min_weight: 50, max_weight: 59}
												 ]
										 , attacker:
												 [ {name: '1', time: 0, min_weight: 70, max_weight: 79}
												 // , {name: '2', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '3', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '4', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '5', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '6', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '7', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '8', time: 0, min_weight: 50, max_weight: 59}
												 // , {name: '9', time: 0, min_weight: 50, max_weight: 59}
												 ]
										 , heal_room: 'W26S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W28S33: { containers: {weight: 65}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 69, max_weight: 69}
												 , {name: '2', time: 0, min_weight: 60, max_weight: 69}
												 , {name: '3', time: 0, min_weight: 60, max_weight: 69}
												 , {name: '4', time: 0, min_weight: 60, max_weight: 69}
												 , {name: '5', time: 0, min_weight: 60, max_weight: 69}
												 , {name: '6', time: 0, min_weight: 60, max_weight: 69}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 60, max_weight: 69}
												  , {name: '2', time: 0, min_weight: 60, max_weight: 69}
												 ]
										 , attacker:
												 [ {name: '1', time: 0, min_weight: 60, max_weight:100}
												 , {name: '2', time: 0, min_weight: 60, max_weight:100}
												 , {name: '3', time: 0, min_weight: 60, max_weight:100}
												 , {name: '4', time: 0, min_weight: 60, max_weight:100}
												 // , {name: '5', time: 0, min_weight: 60, max_weight:100}
												 // , {name: '6', time: 0, min_weight: 60, max_weight:100}
												 // , {name: '7', time: 0, min_weight: 60, max_weight:100}
												 ]
									   , heal_room: 'W26S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W27S34: { containers: {weight: 65}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 60, max_weight: 69}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 60, max_weight: 69}
												 ]
										 , attacker:
												 [ {name: '1', time: 0, min_weight: 60, max_weight:100}
												 , {name: '2', time: 0, min_weight: 60, max_weight:100}
												 , {name: '3', time: 0, min_weight: 60, max_weight:100}
												 , {name: '4', time: 0, min_weight: 60, max_weight:100}
												 , {name: '5', time: 0, min_weight: 60, max_weight:100}
												 , {name: '6', time: 0, min_weight: 60, max_weight:100}
												 , {name: '7', time: 0, min_weight: 60, max_weight:100}
												 ]
									   , heal_room: 'W27S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W27S34', W28S33: 'W27S33'}
										 , escape_path:{ W27S34: 'W27S33', W27S33: 'W27S33'}
										 },
						 W29S33: { containers: {weight: 75}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 70, max_weight: 79}
												 , {name: '2', time: 0, min_weight: 70, max_weight: 79}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 70, max_weight: 79}
												 , {name: '2', time: 0, min_weight: 70, max_weight: 79}
												 ]
									   , heal_room: 'W26S33'
										 , path_rooms: {W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33', W28S33: 'W29S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W31S33: { containers: {weight: 85}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 80, max_weight: 89}
												 , {name: '2', time: 0, min_weight: 80, max_weight: 89}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 80, max_weight: 89}
												 , {name: '2', time: 0, min_weight: 80, max_weight: 89}
												 ]
									   , heal_room: 'W26S33'
										 , path_rooms: { W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33', W28S33: 'W29S33', W29S33: 'W30S33'
												           , W30S33: 'W31S33'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
										 },
						 W25S34: { containers: {weight: 95}
										 , energy_harvesting:
												 [ {name: '1', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '2', time: 0, min_weight: 90, max_weight: 99}
												 ]
										 , claiming:
												 [ {name: '1', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '2', time: 0, min_weight: 90, max_weight: 99}
												 ]
										 , attacker:
												 [ {name: '1', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '2', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '3', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '4', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '5', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '6', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '7', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '8', time: 0, min_weight: 90, max_weight: 99}
												 , {name: '9', time: 0, min_weight: 90, max_weight: 99}
												 ]
									   , heal_room: 'W25S33'
										 , path_rooms: {W26S33: 'W25S33', W25S33: 'W25S34'}
										 , escape_path:{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
																	 , W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
																	 , W28S33: 'W27S33', W27S33: 'W26S33'}
									   }
									 }
						};
			config.log('init config', config.inited, 'Memory.config:', JSON.stringify(Memory.config));
		}
	},

	setRoom: function(creep, role) {
		var already = false;
		for(var room_name in Memory.config.rooms) {
			var room_config = Memory.config.rooms[room_name];
// 			console.log(room_name, 'room_config:', JSON.stringify(room_config));
			var role_config = room_config[role];
// 			console.log(role, 'role_config:', JSON.stringify(role_config));
			if(role_config === undefined) {
// 				console.log(room_name, role, 'role_config:', JSON.stringify(role_config));
				continue;
			}
			role_config.forEach(function(slot) {
				if(already) {
					if(slot.name === creep.name) {
						slot.name = '-' + creep.name;
						slot.time = Game.time;
						config.log('🏢', creep.memory[role].room, role, creep, 'setRoom remove slot:', JSON.stringify(slot));
					}
				}
				else {
					if(slot.name === creep.name) {
						creep.memory[role].room = room_name;
						slot.time = Game.time;
						already = true;
						config.log('🏢', creep.memory[role].room, role, creep, 'setRoom update slot:', JSON.stringify(slot));
					}
					else if(slot.time < Game.time - 10 &&
									creep.memory.weight >= slot.min_weight &&
									creep.memory.weight <= slot.max_weight) {
            const old_name = slot.name;
            const old_time = slot.time;
						var reset = (creep.memory[role].room != room_name);
						creep.memory[role].room = room_name;
						slot.name = creep.name;
						slot.time = Game.time;
						already = true;
						config.log('🏢', creep.memory[role].room, role, creep, 'setRoom reset('+reset+') slot:', JSON.stringify(slot), 'prev slot:', old_name, old_time);
						if (reset) {
								console.log('🏢', creep.memory[role].room, role, creep, 'setRoom reset('+reset+') slot:', JSON.stringify(slot), 'prev slot:', old_name, old_time);
						}
					}
				}
			});
		}
	},

	run: function() {
		config.init();
	}

}

module.exports = config;
