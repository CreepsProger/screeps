const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 292,

	log_flags: ['MC','MCF ','M'],

	log: function(sign, ...args) {
			if(log.canLog(config.log_flags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(config.version)
									  , args);
			}
	},

	getMW: function(roomName) {
		const MW = flags.flags.MW;

		const my_main_defaults = Memory.config.defaults;
		const my_shard_config = Memory.config.shards[Game.shard.name];
		const my_shard_defaults = my_shard_config.defaults;
		const my_room_config = my_shard_config.rooms[roomName];

		if(MW && MW.pos.roomName == roomName) {
			// console.log(JSON.stringify({ getMW:roomName
			// 													 , MW:MW}));
			return Math.pow(10,11-MW.color)*(11-MW.secondaryColor);
		}
		else if(!!my_room_config && !!my_room_config.towers && !!my_room_config.towers.mw) {
			// console.log(JSON.stringify({ getMW:roomName
			// 													 , my_room_config:my_room_config}));
			return my_room_config.towers.mw;
		}
		else if(!!my_shard_defaults && !!my_shard_defaults.towers && !!my_shard_defaults.towers.mw) {
			// console.log(JSON.stringify({ getMW:roomName
			// 													 , my_shard_defaults:my_shard_defaults}));
			return my_shard_defaults.towers.mw;
		}
		else if(!!my_main_defaults && !!my_main_defaults.towers && !!my_main_defaults.towers.mw) {
			// console.log(JSON.stringify({ getMW:roomName
			// 													 , my_main_defaults:my_main_defaults}));
			return my_main_defaults.towers.mw;
		}
		return 98765;
	},

	getMR: function(roomName) {
		const MR = flags.flags.MR;

		const my_main_defaults = Memory.config.defaults;
		const my_shard_config = Memory.config.shards[Game.shard.name];
		const my_shard_defaults = my_shard_config.defaults;
		const my_room_config = my_shard_config.rooms[roomName];

		if(MR && MR.pos.roomName == roomName) {
			return Math.pow(10,11-MR.color)*(11-MR.secondaryColor);
		}
		else if(!!my_room_config && !!my_room_config.towers && !!my_room_config.towers.mr) {
			return my_room_config.towers.mr;
		}
		else if(!!my_shard_defaults && !!my_shard_defaults.towers && !!my_shard_defaults.towers.mr) {
			return my_shard_defaults.towers.mr;
		}
		else if(!!my_main_defaults && !!my_main_defaults.towers && !!my_main_defaults.towers.mr) {
			return my_main_defaults.towers.mr;
		}
		return 98765;
	},

	findPathToMyRoom: function(creep,role_name) {

		// console.log(creep, JSON.stringify({role_name:role_name, creep:creep}));
		const this_room = creep.room.name;
		const my_room = creep.memory[role_name].room;
		const my_shard = creep.memory[role_name].shard;
		if(this_room == my_room && Game.shard.name == my_shard)
			return null;

		const my_shard_config = Memory.config.shards[my_shard];
		// if(Game.shard.name == 'shard0') {
		// 	creep.memory[role_name].shard = Game.shard.name;
		// 	console.log(creep, role_name, JSON.stringify({this_room:this_room, my_room:my_room, my_shard:my_shard, my_shard_config:my_shard_config}));
		// }
		const my_room_config = my_shard_config.rooms[my_room];
		const path_rooms = my_room_config.path_rooms;
		const path_rooms_by_shard = path_rooms[Game.shard.name];
		const path_rooms2 = !!path_rooms_by_shard?path_rooms_by_shard:path_rooms;
		const my_path_room = path_rooms2[this_room];
		if(!my_path_room) {
			console.log(creep, role_name, JSON.stringify({this_room:this_room, my_path_room:my_path_room, path_rooms2:path_rooms2}));
		}
		const shard = my_path_room.substring(0,5);
		if(!!shard && shard == 'shard') {
			const dest_shard = my_path_room;
			var dest_room = path_rooms[dest_shard][this_room];
			const shard2 = dest_room.substring(0,5);
			dest_room = (!!shard2 && shard2 == 'shard')?this_room:dest_room;
			if(tools.getWeight(creep.name) >= 404) {
				console.log(creep, role_name, JSON.stringify({dest_shard:dest_shard, dest_room:dest_room}));
			}
			var portals = creep.room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_PORTAL &&
															 structure.destination.shard == dest_shard &&
														 	 structure.destination.room == dest_room});
			if(portals.length > 0) {
				return portals[0].pos;
			}
		}
		const exit = creep.room.findExitTo(my_path_room);
		var pos = creep.pos.findClosestByPath(exit);
		// if(tools.getWeight(creep.name) >= 424)
		if(!!pos) {
			const special_x = path_rooms2[this_room+'x'];
			const special_y = path_rooms2[this_room+'y'];
			// console.log(creep, role_name, JSON.stringify({pos:pos, exit:exit, my_path_room:my_path_room}));
			if(!!special_x)
				pos.x = special_x+Game.time%3-1;
			if(!!special_y)
				pos.y = special_y+Game.time%3-1;
		}
		return pos;
	},

	moveTo: function(creep,target) {

		if(!!target.id || !!target.pos) {
			creep.memory.target = {id:target.id, pos:target.pos, time: Game.time};
		}

		if(!!target.pos && creep.room.name != target.pos.roomName) {
			const my_path_room = Memory.config.main_path[creep.room.name];
			const exit = creep.room.findExitTo(my_path_room);
			target = creep.pos.findClosestByPath(exit);
			const special_x = Memory.config.main_path[creep.room.name+'x'];
			const special_y = Memory.config.main_path[creep.room.name+'y'];
			// console.log(creep, role_name, JSON.stringify({pos:pos, exit:exit, my_path_room:my_path_room}));
			if(!!special_x)
				target.x = special_x+Game.time%3-1;
			if(!!special_y)
				target.y = special_y+Game.time%3-1;
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
									, W25S35: 'W25S34', W25S34: 'W25S33', W25S33: 'W25S33'
									, W59S52: 'W58S52', W58S52: 'W57S52', W56S52: 'W57S52'
									, W57S53: 'W57S52', W57S53x:30
									, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51', W56S51y:7
									, W59S51: 'W58S51', W58S51: 'W57S51'
									, W29S29: 'W29S29', W28S29: 'W29S29', W29S28: 'W29S29', W28S28: 'W29S28'
									, W25S29: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29'
									, W26S27: 'W26S28', W26S28: 'W26S29'
									, W27S27: 'W27S28', W27S28: 'W26S28'
									}
			, defaults: {towers: {mw:10000,mr:10000}}
			, shards:
			{	shard0:
					{	defaults:
						{ containers: {weight: 1000}
						, heal_room:
							{ shard: 'shard0', room: 'W57S52'}
						, path_rooms:
							{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S53', W56S53: 'W56S54'
							, W56S54: 'W57S54', W57S54: 'W57S55', W57S55: 'W56S55'
							, W56S55: 'W55S55', W55S55: 'W55S56', W55S56: 'W55S57'
							, W55S57: 'W55S58', W55S58: 'W56S58', W56S58: 'W56S59'
							, W56S59: 'W56S60', W56S60: 'W55S60', W55S60: 'W54S60'
							, W54S60: 'W54S59', W54S59: 'W53S59', W53S59: 'W53S58'
							, W53S58: 'W52S58', W52S58: 'W52S57', W52S57: 'W52S57'
							}
							, escape_path:
							{ W56S54: 'W56S53', W56S53: 'W56S52', W56S52: 'W57S52'
							}
						},
						rooms:
						{
							W52S57:
							{ containers: {weight: 1000}
							, sites:
								[ {x:37, y:39, type:STRUCTURE_CONTAINER}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1000, max_weight: 1000}
								, {name: '2', time: 0, min_weight: 1000, max_weight: 1000}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S53', W56S53: 'W56S54'
								, W56S54: 'W57S54', W57S54: 'W57S55', W57S55: 'W56S55'
								, W56S55: 'W55S55', W55S55: 'W55S56', W55S56: 'W55S57'
								, W55S57: 'W55S58', W55S58: 'W56S58', W56S58: 'W56S59'
								, W56S59: 'W56S60', W56S60: 'W55S60', W55S60: 'W54S60'
								, W54S60: 'W54S59', W54S59: 'W53S59', W53S59: 'W53S58'
								, W53S58: 'W52S58', W52S58: 'W52S57', W52S57: 'W52S57'
								}
								, escape_path:
								{ W56S54: 'W56S53', W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W54S51:
							{ containers: {weight: 503}
							// , sites:
							// 	[ {x:37, y:39, type:STRUCTURE_CONTAINER}
							// 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								, {name: '2', time: 0, min_weight: 500, max_weight: 509}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								, {name: '2', time: 0, min_weight: 500, max_weight: 509}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W55S51'
								, W55S51: 'W54S51', W54S51: 'W54S51'
								, W57S51: 'W56S51'
								}
								, escape_path:
								{ W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W55S51:
							{ containers: {weight: 493}
							, sites:
								[ {x:20, y:39, type:STRUCTURE_CONTAINER}
								, {x:20, y:40, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 490, max_weight: 499}
								, {name: '2', time: 0, min_weight: 490, max_weight: 499}
								, {name: '3', time: 0, min_weight: 490, max_weight: 499}
								, {name: '4', time: 0, min_weight: 490, max_weight: 499}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 490, max_weight: 499}
								, {name: '1', time: 0, min_weight: 490, max_weight: 499}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 490, max_weight: 499}
								, {name: '2', time: 0, min_weight: 490, max_weight: 499}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51'
								, W57S51: 'W56S51', W56S51: 'W55S51'
								}
								, escape_path:
								{ W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W59S51:
							{ containers: {weight: 483}
							, sites:
								[ {x:19, y:30, type:STRUCTURE_CONTAINER}
								, {x:20, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 480, max_weight: 489}
								, {name: '2', time: 0, min_weight: 480, max_weight: 489}
								, {name: '3', time: 0, min_weight: 480, max_weight: 489}
								, {name: '4', time: 0, min_weight: 480, max_weight: 489}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 480, max_weight: 489}
								, {name: '2', time: 0, min_weight: 480, max_weight: 489}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 480, max_weight: 489}
								, {name: '2', time: 0, min_weight: 480, max_weight: 489}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W58S52', W57S52y:20, W58S52: 'W59S52', W58S52y:15
								, W59S52: 'W59S51'
								, W57S51: 'W58S51', W58S51: 'W59S51'
								}
								, escape_path:
								{ W59S51: 'W58S51', W58S51: 'W57S51'
								}
							},
						  W58S51:
							{ containers: {weight: 473}
							, sites:
								[ {x:31, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								, {name: '3', time: 0, min_weight: 470, max_weight: 479}
								, {name: '4', time: 0, min_weight: 470, max_weight: 479}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W58S52', W57S52y:20, W58S52: 'W59S52', W58S52y:15
								, W59S52: 'W59S51', W59S51: 'W58S51'
								, W57S51: 'W58S51'
								}
								, escape_path:
								{ W58S51: 'W57S51'
								}
							},
							W56S51:
							{ containers: {weight: 463}
							, sites:
								[ {x:37, y:39, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 460, max_weight: 469}
								, {name: '2', time: 0, min_weight: 460, max_weight: 469}
								, {name: '3', time: 0, min_weight: 460, max_weight: 469}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 460, max_weight: 469}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 460, max_weight: 469}
								, {name: '2', time: 0, min_weight: 460, max_weight: 469}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W56S51'
								, W57S51: 'W56S51'
								}
								, escape_path:
								{ W56S51: 'W57S51'
								}
							},
						  W57S51:
							{ containers: {weight: 453}
							, sites:
								[ {x:7, y:41, type:STRUCTURE_LINK}
								, {x:11, y:34, type:STRUCTURE_ROAD}
								, {x:12, y:33, type:STRUCTURE_ROAD}
								//, {x:10, y:35, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 450, max_weight: 459}
								, {name: '2', time: 0, min_weight: 450, max_weight: 459}
								, {name: '3', time: 0, min_weight: 450, max_weight: 459}
								, {name: '4', time: 0, min_weight: 450, max_weight: 459}
								, {name: '5', time: 0, min_weight: 450, max_weight: 459}
								, {name: '6', time: 0, min_weight: 450, max_weight: 459}
								, {name: '7', time: 0, min_weight: 450, max_weight: 459}
								, {name: '8', time: 0, min_weight: 450, max_weight: 459}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 450, max_weight: 459}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 450, max_weight: 459}
								, {name: '2', time: 0, min_weight: 450, max_weight: 459}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W57S51'
								}
								, escape_path:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S52'
								}
							},
						  W56S52:
							{ containers: {weight: 443}
							, sites:
								[ {x:24, y:40, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 440, max_weight: 449}
								, {name: '2', time: 0, min_weight: 440, max_weight: 449}
								, {name: '3', time: 0, min_weight: 440, max_weight: 449}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 440, max_weight: 449}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 440, max_weight: 449}
								, {name: '2', time: 0, min_weight: 440, max_weight: 449}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:22, W56S52: 'W56S52'
								}
								, escape_path:
								{ W56S52: 'W57S52', W57S52: 'W57S52'
								}
							},
						  W59S52:
							{ containers: {weight: 433}
							, sites:
								[ {x:28, y:7, type:STRUCTURE_CONTAINER}
								// , {x:28, y:6, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 430, max_weight: 439}
								, {name: '2', time: 0, min_weight: 430, max_weight: 439}
								, {name: '3', time: 0, min_weight: 430, max_weight: 439}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 430, max_weight: 439}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 430, max_weight: 439}
								, {name: '2', time: 0, min_weight: 430, max_weight: 439}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S52'
								, W57S52: 'W58S52', W57S52y:20, W58S52: 'W59S52', W58S52y:15
								, W59S52: 'W59S52'
								}
								, escape_path:
								{ W59S52: 'W58S52', W58S52: 'W57S52', W57S52: 'W57S52'
								}
							},
							W58S52:
							{ containers: {weight: 423}
							, sites:
								[ {x:39, y:5, type:STRUCTURE_CONTAINER}
								, {x:39, y:4, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 420, max_weight: 429}
								, {name: '2', time: 0, min_weight: 420, max_weight: 429}
								, {name: '3', time: 0, min_weight: 420, max_weight: 429}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 420, max_weight: 429}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 420, max_weight: 429}
								, {name: '2', time: 0, min_weight: 420, max_weight: 429}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S52', W59S52: 'W58S52'
								, W57S52: 'W58S52', W57S52y:19, W58S52: 'W58S52'
								}
								, escape_path:
								{ W58S52: 'W57S52', W57S52: 'W57S52'
								}
							},
							W57S53:
							{ containers: {weight: 413}
							, sites:
								[ {x:26, y:31, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 410, max_weight: 419}
								, {name: '2', time: 0, min_weight: 410, max_weight: 419}
								, {name: '3', time: 0, min_weight: 410, max_weight: 419}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 410, max_weight: 419}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 410, max_weight: 419}
								, {name: '2', time: 0, min_weight: 410, max_weight: 419}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W57S53'
								}
								, escape_path:
								{ W57S53: 'W57S52', W57S52: 'W57S52'
								}
							},
							W57S52:
							{ containers: {weight: 403}
							, towers: {mw:300000, mr:2000000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 400, max_weight: 409}
								, {name: '2', time: 0, min_weight: 400, max_weight: 409}
								, {name: '3', time: 0, min_weight: 400, max_weight: 409}
								, {name: '4', time: 0, min_weight: 400, max_weight: 409}
								, {name: '5', time: 0, min_weight: 400, max_weight: 409}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 400, max_weight: 409}
								, {name: '2', time: 0, min_weight: 400, max_weight: 409}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 400, max_weight: 409}
								, {name: '2', time: 0, min_weight: 400, max_weight: 409}
								, {name: '3', time: 0, min_weight: 400, max_weight: 409}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ shard3:
									{ W28S35: 'W28S34', W28S34: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'shard2'
									}
								, shard2:
									{ W30S30: 'shard1'}
								, shard1:
									{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'shard0'
									, W50S60: 'W30S30'}
								, shard0:
									{ W30S30: 'W60S50', W60S50: 'W60S51', W60S51: 'W60S52'
									, W60S52: 'W59S52', W59S52: 'W58S52', W58S52: 'W57S52'
									// , W57S52: 'W57S52'
									, W50S60: 'shard1'
								  , W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
									}
								}
								, escape_path:
									{ W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
									, W29S33: 'W28S33'
								}
							}
						}
					}
				,	shard1:
				 	{	defaults:
						{ containers: {weight: 5000}
						, towers: {mw:10000,mr:10000}
						, heal_room:
							{ shard: 'shard0', room: 'W29S29'}
						, path_rooms:
							{
							}
							, escape_path:
							{
							}
						},
						rooms:
						{
							W29S29:
							{ containers: {weight: 5013}
							, towers: {mw:1000000, mr:1000000}
							// , sites:
							// 	[ {x:37, y:39, type:STRUCTURE_CONTAINER}
							// 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '2', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '3', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '4', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '5', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '6', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '7', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '8', time: 0, min_weight: 5010, max_weight: 5019}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '1', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '1', time: 0, min_weight: 5010, max_weight: 5019}
								, {name: '1', time: 0, min_weight: 5010, max_weight: 5019}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W29S29'
								, W27S29: 'W28S29', W28S29: 'W29S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W29S29: 'W29S29'
								}
							},
							W28S29:
							{ containers: {weight: 5023}
							, towers: {mw:1000000, mr:1000000}
							, sites:
							 	[ /*{x:13, y:30, type:STRUCTURE_CONTAINER}
								, {x:22, y:19, type:STRUCTURE_CONTAINER}*/
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '2', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '3', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '4', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '5', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '6', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '7', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '8', time: 0, min_weight: 5020, max_weight: 5029}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight:20, max_weight:29}
								, {name: '2', time: 0, min_weight:5020, max_weight:5029}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '1', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '1', time: 0, min_weight: 5020, max_weight: 5029}
								, {name: '1', time: 0, min_weight: 5020, max_weight: 5029}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29'
								, W27S29: 'W28S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W28S29: 'W29S29', W29S29: 'W29S29'
								}
							},
							W29S28:
							{ containers: {weight: 5033}
							, sites:
							 	[ {x:27, y:17, type:STRUCTURE_CONTAINER}
								, {x:28, y:17, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5030, max_weight: 5039}
								, {name: '2', time: 0, min_weight: 5030, max_weight: 5039}
								, {name: '3', time: 0, min_weight: 5030, max_weight: 5039}
								, {name: '4', time: 0, min_weight: 5030, max_weight: 5039}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight:5030, max_weight:5039}
								, {name: '2', time: 0, min_weight:5030, max_weight:5039}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5030, max_weight: 5039}
								, {name: '1', time: 0, min_weight: 5030, max_weight: 5039}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W29S28'
								, W27S29: 'W28S29', W28S29: 'W29S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W29S28: 'W29S29', W29S29: 'W29S29'
								}
							},
							W28S28:
							{ containers: {weight: 5043}
							, sites:
							 	[ {x:19, y:19, type:STRUCTURE_CONTAINER}
								// , {x:20, y:19, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5040, max_weight: 5049}
								, {name: '2', time: 0, min_weight: 5040, max_weight: 5049}
								, {name: '3', time: 0, min_weight: 5040, max_weight: 5049}
								, {name: '4', time: 0, min_weight: 5040, max_weight: 5049}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight:5040, max_weight:5049}
								, {name: '2', time: 0, min_weight:5040, max_weight:5049}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5040, max_weight: 5049}
								, {name: '1', time: 0, min_weight: 5040, max_weight: 5049}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W29S28', W29S28: 'W28S28'
								, W27S29: 'W28S29', W28S29: 'W29S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W28S28: 'W29S28', W29S28: 'W29S29', W29S29: 'W29S29'
								}
							},
							W27S29:
							{ containers: {weight: 5053}
							, sites:
							 	[ /*{x:42, y:10, type:STRUCTURE_CONTAINER}
								, {x:43, y:17, type:STRUCTURE_CONTAINER}*/
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '2', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '3', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '4', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '5', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '6', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '7', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '8', time: 0, min_weight: 5050, max_weight: 5059}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '2', time: 0, min_weight: 5050, max_weight: 5059}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '2', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '3', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '4', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '5', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '6', time: 0, min_weight: 5050, max_weight: 5059}
								, {name: '7', time: 0, min_weight: 5050, max_weight: 5059}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W28S29'}
							, path_rooms:
								{ W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W26S29:
							{ containers: {weight: 5063}
							, sites:
							 	[ {x:15, y:5, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '2', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '3', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '4', time: 0, min_weight: 5060, max_weight: 5069}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '2', time: 0, min_weight: 5060, max_weight: 5069}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '2', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '3', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '4', time: 0, min_weight: 5060, max_weight: 5069}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W25S29:
							{ containers: {weight: 5073}
							, sites:
							 	[ {x:9, y:20, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '2', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '3', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '4', time: 0, min_weight: 5070, max_weight: 5079}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '2', time: 0, min_weight: 5070, max_weight: 5079}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '2', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '3', time: 0, min_weight: 5070, max_weight: 5079}
								, {name: '4', time: 0, min_weight: 5070, max_weight: 5079}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9, W26S29: 'W25S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W25S29: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W26S28:
							{ containers: {weight: 5123}
							, sites:
							 	[ {x:7, y:11, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '2', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '3', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '4', time: 0, min_weight: 5120, max_weight: 5129}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '2', time: 0, min_weight: 5120, max_weight: 5129}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '2', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '3', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '4', time: 0, min_weight: 5120, max_weight: 5129}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W27S28:
							{ containers: {weight: 5113}
							, sites:
							 	[ {x:5, y:38, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '2', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '3', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '4', time: 0, min_weight: 5110, max_weight: 5119}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '2', time: 0, min_weight: 5110, max_weight: 5119}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '2', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '3', time: 0, min_weight: 5110, max_weight: 5119}
								, {name: '4', time: 0, min_weight: 5110, max_weight: 5119}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28', W26S28: 'W27S28'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W27S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W27S27:
							{ containers: {weight: 5103}
							, sites:
							 	[ {x:29, y:45, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '2', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '3', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '4', time: 0, min_weight: 5100, max_weight: 5109}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '2', time: 0, min_weight: 5100, max_weight: 5109}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '2', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '3', time: 0, min_weight: 5100, max_weight: 5109}
								, {name: '4', time: 0, min_weight: 5100, max_weight: 5109}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W27S28', W27S28: 'W27S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W27S27: 'W27S28', W27S28: 'W26S28', W26S28: 'W26S29'
								, W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W26S27:
							{ containers: {weight: 5093}
							, sites:
							 	[ {x:9, y:45, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '2', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '3', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '4', time: 0, min_weight: 5090, max_weight: 5099}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '2', time: 0, min_weight: 5090, max_weight: 5099}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '2', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '3', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '4', time: 0, min_weight: 5090, max_weight: 5099}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:25
								}
								, escape_path:
								{ W26S27: 'W26S28', W26S28: 'W26S29'
								, W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W29S31:
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
									{ W28S35:'W28S34', W28S34:'W28S33'
									, W25S33:'W26S33', W26S33:'W27S33', W27S33:'W28S33'
									, W28S33:'W28S32', W28S32:'W29S32', W29S32:'W30S32'
									, W30S32:'W30S31', W30S31:'W30S30'
									, W30S30:'shard2'
									}
								, shard2:
									{ W30S30: 'shard1'}
								, shard1:
									{ W30S30:'W30S31', W60S50:'W30S30', W30S31:'W29S31', W29S31:'W29S31'
								 	}
								, shard0:
									{ W57S52:'W58S52', W57S52y:31, W58S52:'W59S52', W58S52y:37
									, W59S52:'W59S51', W59S52x:11, W59S51:'W60S51'
									, W60S51:'W60S50', W60S50:'shard1'
								 	}
								}
								, escape_path:
									{ W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
									, W29S33: 'W28S33'
								}
							}
						}
					}
				,	shard2:
					{	rooms:
						{
						}
					}
				, shard3:
					{ rooms:
						{	W30S30:
							{ containers: {weight: 333}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 330, max_weight: 339}
								, {name: '2', time: 0, min_weight: 330, max_weight: 339}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 330, max_weight: 339}
								, {name: '2', time: 0, min_weight: 330, max_weight: 339}
								, {name: '3', time: 0, min_weight: 330, max_weight: 339}
								]
							, heal_room:
							 	{ shard: 'shard3', room: 'W29S32'}
							, path_rooms:
							 	{ shard3:
									{ W28S35: 'W28S34', W28S34: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'W30S30'
									}
								}
								, escape_path:
									{ W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32'
									, W29S32: 'W29S32'
								}
							},
							W25S33:
							{ containers: {weight: 33}
							, towers: {mw:250000, mr:250000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 30, max_weight: 39}
								, {name: '2', time: 0, min_weight: 30, max_weight: 39}
								, {name: '3', time: 0, min_weight: 30, max_weight: 39}
								]
							, heal_room: 'W25S33'
							, path_rooms:
								{ W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'
							 	, W28S35: 'W28S34', W28S34: 'W28S33'
								, W29S32: 'W28S32', W28S32: 'W28S33'}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'}
							},
			 				W26S33:
							{ containers: {weight: 43}
							, towers: {mw:64000, mr:64000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 40, max_weight: 49}
								, {name: '2', time: 0, min_weight: 40, max_weight: 49}
								, {name: '3', time: 0, min_weight: 40, max_weight: 49}
								, {name: '4', time: 0, min_weight: 40, max_weight: 49}
								]
							, heal_room: 'W26S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W28S33: 'W27S33', W27S33: 'W26S33'
						 		, W28S35: 'W28S34', W28S34: 'W28S33'
								, W29S32: 'W28S32', W28S32: 'W28S33'}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'}
							},
			 				W27S33:
							{ containers: {weight: 53}
							, sites:
								[ {x:13, y:40, type:STRUCTURE_CONTAINER}
								, {x:14, y:41, type:STRUCTURE_CONTAINER}
								, {x:41, y:19, type:STRUCTURE_CONTAINER}
								, {x:42, y:19, type:STRUCTURE_CONTAINER}
								]
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'
								}
							},
							W28S33:
							{ containers: {weight: 63}
							, towers: {mw:1000000, mr:1000000}
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
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
							  , {name: '4', time: 0, min_weight: 80, max_weight: 89}
							  , {name: '5', time: 0, min_weight: 80, max_weight: 89}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 80, max_weight: 89}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 80, max_weight:89}
								, {name: '2', time: 0, min_weight: 80, max_weight:89}
								, {name: '3', time: 0, min_weight: 80, max_weight:89}
								, {name: '4', time: 0, min_weight: 80, max_weight:89}
								, {name: '5', time: 0, min_weight: 80, max_weight:89}
							]
						  , heal_room: 'W28S35'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W28S33: 'W28S34', W28S34: 'W27S34'
								, W28S35: 'W28S34', W28S34: 'W27S34'
								, W29S32: 'W28S32', W28S32: 'W28S33'
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
								, W29S32: 'W28S32'
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								}
							, escape_path:{ W29S33: 'W28S33'}
						 	},
							W28S34:
							{ containers: {weight:113}
							, sites:
								[ {x:13, y:6, type:STRUCTURE_CONTAINER}
								]
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								}
							, escape_path:{ W28S34: 'W28S33'}
							},
							W28S35:
							{ containers: {weight:123}
							, towers: {mw:280000, mr:290000}
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								}
							, escape_path:{ W28S35: 'W28S34', W28S34: 'W28S33'}
							},
							W29S35:
							{ containers: {weight:133}
							, sites:
								[ {x:5, y:32, type:STRUCTURE_CONTAINER}
								, {x:5, y:33, type:STRUCTURE_CONTAINER}
								, {x:42, y:7, type:STRUCTURE_CONTAINER}
								, {x:43, y:7, type:STRUCTURE_CONTAINER}
								]
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
								, W29S32: 'W28S32', W28S32: 'W28S32'
								, W28S33: 'W28S34', W28S34: 'W28S35', W28S35: 'W29S35'
								}
							, escape_path:
								{ W29S35: 'W28S35', W28S35: 'W28S34', W28S34: 'W28S33'
								}
							},
							W28S36:
							{ containers: {weight:143}
							, sites:
								[ {x:10, y:28, type:STRUCTURE_CONTAINER}
								, {x:10, y:27, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:140, max_weight:149}
								, {name: '2', time: 0, min_weight:140, max_weight:149}
								, {name: '3', time: 0, min_weight:140, max_weight:149}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:140, max_weight:149}
								, {name: '2', time: 0, min_weight:140, max_weight:149}
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
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
							, towers: {mw:110000, mr:6000000}
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
							W23S34:
							{ containers: {weight: 223}
							// , sites:
							// 	[ {x:38, y:5, type:STRUCTURE_CONTAINER}
							// 	, {x:12, y:37, type:STRUCTURE_CONTAINER}
							// 	, {x:13, y:36, type:STRUCTURE_CONTAINER}
							// 	, {x:35, y:39, type:STRUCTURE_CONTAINER}
							// 	, {x:35, y:40, type:STRUCTURE_CONTAINER}
							// 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 220, max_weight: 229}
								, {name: '2', time: 0, min_weight: 220, max_weight: 229}
								, {name: '3', time: 0, min_weight: 220, max_weight: 229}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 220, max_weight: 229}
								, {name: '2', time: 0, min_weight: 220, max_weight: 229}
								, {name: '3', time: 0, min_weight: 220, max_weight: 229}
								]
						  , heal_room: 'W25S33'
							, path_rooms:
							 	{ W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W27S33'
								, W28S35: 'W28S34', W28S34: 'W28S33'
							 	, W27S33: 'W26S33', W26S33: 'W25S33', W25S33: 'W25S34'
								, W25S34: 'W24S34', W24S34: 'W23S34'
								}
							, escape_path:
								{ W23S34: 'W24S34', W24S34: 'W25S34', W25S34: 'W25S33'
								}
						 	},
							W25S34:
							{ containers: {weight: 203}
							, sites:
								[ {x:38, y:5, type:STRUCTURE_CONTAINER}
								, {x:12, y:37, type:STRUCTURE_CONTAINER}
								, {x:13, y:36, type:STRUCTURE_CONTAINER}
								, {x:35, y:39, type:STRUCTURE_CONTAINER}
								, {x:35, y:40, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								, {name: '4', time: 0, min_weight: 200, max_weight: 209}
								, {name: '5', time: 0, min_weight: 200, max_weight: 209}
								, {name: '6', time: 0, min_weight: 200, max_weight: 209}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								, {name: '4', time: 0, min_weight: 200, max_weight: 209}
								, {name: '5', time: 0, min_weight: 200, max_weight: 209}
								, {name: '6', time: 0, min_weight: 200, max_weight: 209}
								, {name: '7', time: 0, min_weight: 200, max_weight: 209}
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
			// console.log('setRoom:', JSON.stringify({shard_name:shard_name,shard_config:shard_config}));
		  // var shard_name = 'shard3' // Game.shard.name
			// var shard_config = Memory.config;
			for(var room_name in shard_config.rooms) {
				var room_config = shard_config.rooms[room_name]; // console.log(room_name, 'room_config:', JSON.stringify(room_config));
				var role_config = room_config[role]; // console.log(role, 'role_config:', JSON.stringify(role_config));
				if(role_config === undefined) { // console.log(room_name, role, 'role_config:', JSON.stringify(role_config));
					continue;
				}
				// if(tools.getWeight(creep.name) == 304) {
				// 	console.log('setRoom:', JSON.stringify({shard_name:shard_name,room_name:room_name,role:role,role_config:role_config}));
				// }
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
										tools.getWeight(creep.name) >= slot.min_weight &&
										tools.getWeight(creep.name) <= slot.max_weight) {
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
