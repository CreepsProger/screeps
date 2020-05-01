const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 195,

	log_flags: ['MC','MCF ','M'],

	log: function(sign, ...args) {
			if(log.canLog(config.log_flags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(config.version)
									  , args);
			}
	},

	moveTo: function(creep,target) {

		if(!!target.id || !!target.pos) {
			creep.memory.target = {id:target.id, pos:target.pos, time: Game.time};
		}

		if(creep.room.name != target.pos.roomName) {
			const my_path_room = Memory.config.main_path[creep.room.name];
			const exit = creep.room.findExitTo(my_path_room);
			target = creep.pos.findClosestByPath(exit);
		}

		return tools.moveTo(creep,target);
	},

	init: function() {
		// if(Memory.config === undefined ||
		// 	 Memory.config.v === undefined ||
	  if(!Memory.config ||
			 !Memory.config.v ||
			  Memory.config.v != config.version) {
			Memory.config	=
			{ v: config.version
			,	main_path:{ W29S37: 'W28S37'
									, W29S35: 'W28S35'
			 						, W28S37: 'W28S36', W28S36: 'W28S35'
									, W28S35: 'W28S34', W28S34: 'W28S33'
									, W27S34: 'W28S34'
									, W29S33: 'W28S33'
									, W28S32: 'W28S33'
									, W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W27S33'
									, W27S33: 'W26S33'
									, W26S34: 'W26S33'
									, W26S32: 'W26S33'
									, W26S33: 'W26S33'
									, W25S35: 'W25S34', W25S34: 'W25S33'}
			, shards:
				{	shard1:
				 	{	rooms:
						{	W29S31:
							{ containers: {weight: 303}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 300, max_weight: 309}
								, {name: '2', time: 0, min_weight: 300, max_weight: 309}
								, {name: '3', time: 0, min_weight: 300, max_weight: 309}
								, {name: '4', time: 0, min_weight: 300, max_weight: 309}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 300, max_weight: 309}
								, {name: '2', time: 0, min_weight: 300, max_weight: 309}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 300, max_weight: 309}
								, {name: '2', time: 0, min_weight: 300, max_weight: 309}
								, {name: '3', time: 0, min_weight: 300, max_weight: 309}
								]
							, heal_room:
							 	{ shard: 'shard3', room: 'W29S32'}
							, path_rooms:
							 	{ shard3:
									{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'shard2'
									}
								, shard2:
									{ W30S30: 'shard1'}
								, shard1:
									{ W30S30: 'W30S31', W30S31: 'W29S31', W29S31: 'W29S31'
								 	}
								}
								, escape_path:
									{ W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
									, W29S33: 'W28S33'
								}
							}
						}
					}
				, shard3:
					{ rooms:
						{	W25S33:
							{ containers: {weight: 33}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 30, max_weight: 39}
								, {name: '2', time: 0, min_weight: 30, max_weight: 39}
								, {name: '3', time: 0, min_weight: 30, max_weight: 39}
								]
							, heal_room: 'W25S33'
							, path_rooms:
								{ W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'
							 	, W28S35: 'W28S34', W28S34: 'W28S33'}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'}
							},
			 				W26S33:
							{ containers: {weight: 43}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 40, max_weight: 49}
								, {name: '2', time: 0, min_weight: 40, max_weight: 49}
								, {name: '3', time: 0, min_weight: 40, max_weight: 49}
								]
							, heal_room: 'W26S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W28S33: 'W27S33', W27S33: 'W26S33'
						 		, W28S35: 'W28S34', W28S34: 'W28S33'}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'}
							},
			 				W27S33:
							{ containers: {weight: 53}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 50, max_weight: 59}
								, {name: '2', time: 0, min_weight: 50, max_weight: 59}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 50, max_weight: 59}
								]
							, attacker:
							 	[ {name: '1', time: 0, min_weight: 50, max_weight: 59}
							 	, {name: '2', time: 0, min_weight: 50, max_weight: 59}
							 	]
							, heal_room: 'W26S33'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W28S33: 'W27S33'
						 		, W28S35: 'W28S34', W28S34: 'W28S33'
								}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'
								}
							},
							W28S33:
							{ containers: {weight: 63}
							, energy_harvesting:
							 	[ {name: '1', time: 0, min_weight: 60, max_weight: 69}
							 	, {name: '2', time: 0, min_weight: 60, max_weight: 69}
							 	, {name: '3', time: 0, min_weight: 60, max_weight: 69}
							 	, {name: '4', time: 0, min_weight: 60, max_weight: 69}
							 	]
							, attacker:
							 	[ {name: '1', time: 0, min_weight: 60, max_weight:69}
								, {name: '2', time: 0, min_weight: 60, max_weight:69}
								, {name: '3', time: 0, min_weight: 60, max_weight:69}
								, {name: '4', time: 0, min_weight: 60, max_weight:69}
								, {name: '5', time: 0, min_weight: 60, max_weight:69}
								]
					   	, heal_room: 'W28S33'
						 	, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S35: 'W28S34', W28S34: 'W28S33'
								}
						 	, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'
								}
							},
			 				W26S34:
							{ containers: {weight: 73}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 70, max_weight: 79}
							  , {name: '2', time: 0, min_weight: 70, max_weight: 79}
							  , {name: '3', time: 0, min_weight: 70, max_weight: 79}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 70, max_weight:79}
								, {name: '2', time: 0, min_weight: 70, max_weight:79}
								, {name: '3', time: 0, min_weight: 70, max_weight:79}
								]
						  , heal_room: 'W26S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W26S34', W25S34: 'W26S34'
								, W27S33: 'W26S33', W28S33: 'W27S33', W28S34: 'W28S33'
								}
							, escape_path:
								{ W26S34: 'W26S33'
								}
							},
							W27S34:
							{ containers: {weight: 83}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 80, max_weight: 89}
								, {name: '2', time: 0, min_weight: 80, max_weight: 89}
							  , {name: '3', time: 0, min_weight: 80, max_weight: 89}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 80, max_weight: 89}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 80, max_weight:89}
								, {name: '2', time: 0, min_weight: 80, max_weight:89}
							]
						  , heal_room: 'W28S35'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W27S34'
								, W28S35: 'W28S34', W28S34: 'W27S34'
								}
							, escape_path:
								{ W27S34: 'W28S34', W28S34: 'W28S35'
								}
							},
							W28S32:
							{ containers: {weight: 93}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 90, max_weight:99}
								, {name: '2', time: 0, min_weight: 90, max_weight:99}
								, {name: '3', time: 0, min_weight: 90, max_weight:99}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 90, max_weight:99}
								, {name: '2', time: 0, min_weight: 90, max_weight:99}
							 	]
							, attacker:
							 	[ {name: '1', time: 0, min_weight: 90, max_weight:99}
								, {name: '2', time: 0, min_weight: 90, max_weight:99}
								, {name: '3', time: 0, min_weight: 90, max_weight:99}
								, {name: '4', time: 0, min_weight: 90, max_weight:99}
								, {name: '5', time: 0, min_weight: 90, max_weight:99}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
						 		, W28S33: 'W28S32'
								, W29S33: 'W28S33'
								}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38'
							  , W30S38: 'W30S37', W30S37: 'W30S36', W30S36: 'W30S35'
								, W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33'
								, W29S33: 'W28S33', W28S33: 'W27S33', W27S33: 'W26S33'
								, W28S32: 'W28S33'
								}
							},
							W29S33:
							{ containers: {weight: 103}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:100, max_weight:109}
								, {name: '2', time: 0, min_weight:100, max_weight:109}
								, {name: '3', time: 0, min_weight:100, max_weight:109}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight:100, max_weight:109}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:100, max_weight:109}
								, {name: '2', time: 0, min_weight:100, max_weight:109}
								, {name: '3', time: 0, min_weight:100, max_weight:109}
								, {name: '4', time: 0, min_weight:100, max_weight:109}
								, {name: '5', time: 0, min_weight:100, max_weight:109}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S35: 'W28S34', W28S34: 'W28S33', W28S33: 'W29S33'
								, W28S32: 'W28S33'
								}
							, escape_path:{ W29S33: 'W28S33'}
						 	},
							W28S34:
							{ containers: {weight:113}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:110, max_weight:119}
								, {name: '2', time: 0, min_weight:110, max_weight:119}
								, {name: '3', time: 0, min_weight:110, max_weight:119}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:110, max_weight:119}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:110, max_weight:119}
								, {name: '2', time: 0, min_weight:110, max_weight:119}
								, {name: '3', time: 0, min_weight:110, max_weight:119}
								, {name: '4', time: 0, min_weight:110, max_weight:119}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
							 	, W28S33: 'W28S34'
								, W28S35: 'W28S34'
								}
							, escape_path:{ W28S34: 'W28S33'}
							},
							W28S35: { containers: {weight:123}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:120, max_weight:129}
								, {name: '2', time: 0, min_weight:120, max_weight:129}
								, {name: '3', time: 0, min_weight:120, max_weight:129}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:120, max_weight:129}
								, {name: '2', time: 0, min_weight:120, max_weight:129}
								, {name: '3', time: 0, min_weight:120, max_weight:129}
								, {name: '4', time: 0, min_weight:120, max_weight:129}
								, {name: '5', time: 0, min_weight:120, max_weight:129}
								]
						  , heal_room: 'W28S35'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W28S35'
								}
							, escape_path:{ W28S35: 'W28S34', W28S34: 'W28S33'}
							},
							W29S35:
							{ containers: {weight:133}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:130, max_weight:139}
								, {name: '2', time: 0, min_weight:130, max_weight:139}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:130, max_weight:139}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:130, max_weight:139}
								, {name: '2', time: 0, min_weight:130, max_weight:139}
								, {name: '3', time: 0, min_weight:130, max_weight:139}
								]
						  , heal_room: 'W28S35'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W28S35', W28S35: 'W29S35'
								}
							, escape_path:
								{ W29S35: 'W28S35', W28S35: 'W28S34', W28S34: 'W28S33'
								}
							},
							W28S36:
							{ containers: {weight:143}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:140, max_weight:149}
								, {name: '2', time: 0, min_weight:140, max_weight:149}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:140, max_weight:149}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:140, max_weight:149}
								, {name: '2', time: 0, min_weight:140, max_weight:149}
								, {name: '3', time: 0, min_weight:140, max_weight:149}
								]
						  , heal_room: 'W28S35'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W28S35', W28S35: 'W28S36'
								}
							, escape_path:
								{ W28S36: 'W28S35', W28S35: 'W28S34', W28S34: 'W28S33'
								}
							},
							W28S37:
							{ containers: {weight:153}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:150, max_weight:159}
								, {name: '2', time: 0, min_weight:150, max_weight:159}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:150, max_weight:159}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:150, max_weight:159}
								, {name: '2', time: 0, min_weight:150, max_weight:159}
								, {name: '3', time: 0, min_weight:150, max_weight:159}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W28S35', W28S35: 'W28S36'
								, W28S36: 'W28S37'
								}
							, escape_path:
								{ W28S37: 'W28S36', W28S36: 'W28S35', W28S35: 'W28S34'
							  , W28S34: 'W28S33'
								}
							},
							W29S37:
							{ containers: {weight:163}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:160, max_weight:169}
								, {name: '2', time: 0, min_weight:160, max_weight:169}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:160, max_weight:169}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:160, max_weight:169}
								, {name: '2', time: 0, min_weight:160, max_weight:169}
								, {name: '3', time: 0, min_weight:160, max_weight:169}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W28S35', W28S35: 'W28S36'
								, W28S36: 'W28S37', W28S37: 'W29S37'
								}
							, escape_path:
								{ W29S37: 'W28S37', W28S37: 'W28S36', W28S36: 'W28S35'
							 	, W28S35: 'W28S34', W28S34: 'W28S33'
								}
							},
							W29S32:
							{ containers: {weight: 173}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 170, max_weight: 179}
								, {name: '2', time: 0, min_weight: 170, max_weight: 179}
								, {name: '3', time: 0, min_weight: 170, max_weight: 179}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 170, max_weight: 179}
								, {name: '2', time: 0, min_weight: 170, max_weight: 179}
								, {name: '3', time: 0, min_weight: 170, max_weight: 179}
								, {name: '4', time: 0, min_weight: 170, max_weight: 179}
								, {name: '5', time: 0, min_weight: 170, max_weight: 179}
								]
						  , heal_room: 'W29S32'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S32', W28S32: 'W29S32'
								, W29S33: 'W30S33', W30S33: 'W30S32', W30S32: 'W29S32'
								, W28S35: 'W28S34', W28S34: 'W28S33'
							 	}
							, escape_path:
								{ W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
						 		, W29S33: 'W28S33'
								}
							},
							W25S34:
							{ containers: {weight: 203}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								, {name: '4', time: 0, min_weight: 200, max_weight: 209}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								]
						  , heal_room: 'W25S33'
							, path_rooms:
							 	{ W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W27S33'
							 	, W27S33: 'W26S33', W26S33: 'W25S33', W25S33: 'W25S34'
							 	, W28S35: 'W28S34', W28S34: 'W28S33'
								}
							, escape_path:
								{ W25S34: 'W25S33'
								}
						 	},
							W25S35:
							{ containers: {weight: 193}
						 	, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 190, max_weight: 199}
								, {name: '2', time: 0, min_weight: 190, max_weight: 199}
								, {name: '3', time: 0, min_weight: 190, max_weight: 199}
								, {name: '4', time: 0, min_weight: 190, max_weight: 199}
								]
						 	, attacker:
								[ {name: '1', time: 0, min_weight: 190, max_weight: 199}
								, {name: '2', time: 0, min_weight: 190, max_weight: 199}
								, {name: '3', time: 0, min_weight: 190, max_weight: 199}
								, {name: '4', time: 0, min_weight: 190, max_weight: 199}
								, {name: '5', time: 0, min_weight: 190, max_weight: 199}
								]
						 	, heal_room: 'W25S33'
						 	, path_rooms:
							 	{ W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'
						    , W25S33: 'W25S34', W25S34: 'W25S35'
								, W28S35: 'W28S34', W28S34: 'W28S33'
								}
						 	, escape_path:
								{ W25S35: 'W25S34', W25S34: 'W25S33'
								}
						 	}
						}
					}
				}
			};
			config.log('init config', config.inited, 'Memory.config:', JSON.stringify(Memory.config));
		}
	},

	setRoom: function(creep, role) {
		var already = false;
		for(var shard_name in Memory.config.shards) {
			var shard_config = Memory.config.shards[shard_name];
		  // var shard_name = 'shard3' // Game.shard.name
			// var shard_config = Memory.config;
			for(var room_name in shard_config.rooms) {
				var room_config = shard_config.rooms[room_name]; // console.log(room_name, 'room_config:', JSON.stringify(room_config));
				var role_config = room_config[role]; // console.log(role, 'role_config:', JSON.stringify(role_config));
				if(role_config === undefined) { // console.log(room_name, role, 'role_config:', JSON.stringify(role_config));
					continue;
				}
				role_config.forEach(function(slot) {
					if(already) {
						if(slot.name === creep.name) {
							slot.name = '-' + creep.name;
							slot.time = Game.time;
							config.log('🏢', '['+creep.memory[role].shard+']', creep.memory[role].room
														, role, creep, 'setRoom remove slot:', JSON.stringify(slot));
						}
					}
					else {
						if(slot.name === creep.name) {
							creep.memory[role].shard = shard_name;
							creep.memory[role].room = room_name;
							slot.time = Game.time;
							already = true;
							config.log('🏢', '['+creep.memory[role].shard+']', creep.memory[role].room
														, role, creep, 'setRoom update slot:', JSON.stringify(slot));
						}
						else if(slot.time < Game.time - 10 &&
										creep.memory.weight >= slot.min_weight &&
										creep.memory.weight <= slot.max_weight) {
	            const old_name = slot.name;
	            const old_time = slot.time;
							var reset = (creep.memory[role].room != room_name);
							creep.memory[role].shard = shard_name;
							creep.memory[role].room = room_name;
							slot.name = creep.name;
							slot.time = Game.time;
							already = true;
							config.log('🏢', '['+creep.memory[role].shard+']', creep.memory[role].room
														, role, creep, 'setRoom reset('+reset+') slot:', JSON.stringify(slot)
														, 'prev slot:', old_name, old_time);
							if (reset) {
									console.log('🏢', '['+creep.memory[role].shard+']', creep.memory[role].room
																 , role, creep, 'setRoom reset('+reset+') slot:', JSON.stringify(slot)
																 , 'prev slot:', old_name, old_time);
							}
						}
					}
				});
			}
		}
	},

	run: function() {
		config.init();
	}

}

module.exports = config;
