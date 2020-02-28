const constants = require('main.constants');
const flags = require('main.flags');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 46,
	ticksToCheckCreepsNumber: 10,
	maxCreepsNumber:16,

	log_flags: ['MC','MCF ','M'], 
	
	log: function(sign, ...args) {
			if(log.canLog(role.logFlags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(config.version)
									  , args);
			}
	},

	init: function() {
		if(Memory.config === undefined ||
			 Memory.config.v === undefined ||
			 Memory.config.v != config.version) {
			Memory.config = { v: config.version
													 , rooms : { W25S33: { containers: {weight: 45}
																							 ,      links: [ {from: '1', to: '0'}
																														 , {from: '1', to: '0'}
																														 ]
																							 ,    workers: [ {name: '1', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '2', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '3', time: 0, min_weight: 31, max_weight: 40}
																														 ]
																							 },
																			 W26S33: { containers: {weight: 45}
																							 ,    workers: [ {name: '1', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '2', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '3', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '4', time: 0, min_weight: 41, max_weight: 50}
 																														 , {name: '5', time: 0, min_weight: 41, max_weight: 50}
 																														 , {name: '6', time: 0, min_weight: 31, max_weight: 40}
 																														 , {name: '7', time: 0, min_weight: 31, max_weight: 40}
																														 ]
																							 },
																			 W27S33: { containers: {weight: 45}
																							 ,    workers: [ {name: '1', time: 0, min_weight: 41, max_weight: 50}
 																														 , {name: '2', time: 0, min_weight: 41, max_weight: 50}
																														 , {name: '3', time: 0, min_weight: 31, max_weight: 40}
 																														 , {name: '4', time: 0, min_weight: 31, max_weight: 40}
// 																														 , {name: '5', time: 0, min_weight: 31, max_weight: 40}
																														 ]
																							 }
																		 }
													};
			config.log('init config', config.inited, 'Memory.config:', JSON.stringify(Memory.config));
		}
	},

	setRoom: function(creep) {
		var already = false;
		for(var room_name in Memory.config.rooms) {
			var room_config = Memory.config.rooms[room_name];
			room_config.workers.forEach(function(w) {
				if(already) {
					if(w.name === creep.name) {
            var v = w;
						w.name = '-' + creep.name;
						w.time = Game.time;
						config.log('🏢', creep, 'setRoom: slot\'s removed', JSON.stringify(v), JSON.stringify(w));
					}
				}
				else {
					if(w.name === creep.name) {
						creep.memory[role.name].room = room_name;
						w.time = Game.time;
						already = true;
						config.log('🏢', creep, 'setRoom: time\'s  updated', JSON.stringify(w));
					}
					else if(w.time < Game.time - 100 &&
									creep.memory.weight >= w.min_weight &&
									creep.memory.weight <= w.max_weight) {
            var v = w;
						var reset = (creep.memory[role.name].room != room_name); 
						creep.memory[role.name].room = room_name;
						w.name = creep.name;
						w.time = Game.time;
						already = true;
						config.log('🏢', creep, 'setRoom: reset('+reset+')', JSON.stringify(v), JSON.stringify(w));
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
