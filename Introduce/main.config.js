const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 554,

	log_flags: ['MC','MCF ','M'],

	log: function(sign, ...args) {
			if(log.canLog(config.log_flags)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(config.version)
									  , args);
			}
	}, 
	
	Memory: {},
	
	getRole: function(creep, role_name) {
		if(!config.Memory[role_name])
			config.Memory[role_name] = {};
		const n = tools.getN(creep.name);
		var mrole = config.Memory[role_name][n];
		if(mrole === undefined ||
			 mrole.v === undefined ||
			 mrole.v != config.version) {
			creep.memory[role_name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																, n: n
																};
			config.Memory[role_name][n] = creep.memory[role_name];
			mrole = config.Memory[role_name][n];
		}
		return mrole;
	},
	
	getMaxAvgAmountToProduce: function(res) {
		const commodity = COMMODITIES[res];
		if(!!commodity) {
			if(!commodity.level)
				return 2000;
			if(commodity.level == 1 && res != 'composite')
				return 1;
			if(commodity.level == 2 && res != 'crystal')
				return 2;
			if(commodity.level == 3 && res != 'liquid')
				return 3;
			if(commodity.level == 4)
				return 4;
			if(commodity.level == 5)
				return 5;
			return 3000;
		}
		return 10000;
	},
	
	getMaxAvgAmountToSell: function(res) {
		const commodity = COMMODITIES[res];
		if(!!commodity) {
			if(!commodity.level)
				return 2000;
			if(commodity.level == 1 && res != 'composite')
				return 1;
			if(commodity.level == 2 && res != 'crystal')
				return 2;
			if(commodity.level == 3 && res != 'liquid')
				return 3;
			if(commodity.level == 4)
				return 4;
			if(commodity.level == 5)
				return 5;
			return 3000;
		}
		return 20000;
	},
	
	getMinAvgAmountToBuy: function(res) {
		const commodity = COMMODITIES[res];
		if(!!commodity) {
			if(!commodity.level)
				return 2000;
			if(commodity.level == 1 && res != 'composite')
				return 1;
			if(commodity.level == 2 && res != 'crystal')
				return 2;
			if(commodity.level == 3 && res != 'liquid')
				return 3;
			if(commodity.level == 4)
				return 4;
			if(commodity.level == 5)
				return 5;
			return 3000;
		}
		return 10000;
	},
	
	getPowerConfig: function(roomName, pcName) {
		const flagsPowerConfig = flags.getPowerConfig(roomName, pcName);
		if(!!flagsPowerConfig)
			return flagsPowerConfig;
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_power_config = my_room_config['power'];
		if(!my_power_config)
			return undefined;
		const my_pc_config = my_power_config[pcName];
		return my_pc_config;
	},
	
	getAmountToStore: function(roomName,resource) {
		const flagStoreConfigAmount = flags.getStoreConfigAmount(roomName,resource);
		if(!!flagStoreConfigAmount) {/*
			console.log( '📦🏨📜', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { config:'getAmountToDeal', roomName:roomName
																			, resource:resource, flagDealConfigAmount:flagDealConfigAmount }));*/
			return flagStoreConfigAmount;
		}
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_store_config = my_room_config['store'];
		if(!my_store_config)
			return undefined;
		const my_store_amount = my_store_config[resource];
		return tools.nvl(my_store_amount,0);
	},
	
	getAmountToDeal: function(roomName,resource) {
		const flagDealConfigAmount = flags.getDealConfigAmount(roomName,resource);
		if(!!flagDealConfigAmount) {/*
			console.log( '🤝💲💠📜', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { config:'getAmountToDeal', roomName:roomName
																			, resource:resource, flagDealConfigAmount:flagDealConfigAmount }));*/
			return flagDealConfigAmount;
		}
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_deals_config = my_room_config['deals'];
		if(!my_deals_config)
			return undefined;
		const my_deal_amount = my_deals_config[resource];
		return tools.nvl(my_deal_amount,0);
	},
	
	getFactoryConfig: function(roomName) {
		const flagsFactoryConfig = flags.getFactoryConfig(roomName);
		if(!!flagsFactoryConfig)
			return flagsFactoryConfig;
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_factory_config = my_room_config['factory'];
		return my_factory_config;
	},

	getLabsConfig: function(roomName) {
		const flagLabsConfig = flags.getLabsConfig(roomName);
		if(!!flagLabsConfig)
			return flagLabsConfig;
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_labs_config = my_room_config['labs'];
		return my_labs_config;
	},

	getMW: function(roomName) {
		const MW = flags.flags.MW;

		const my_main_defaults = config.Memory.defaults;
		const my_shard_config = config.Memory.shards[Game.shard.name];
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

		const my_main_defaults = config.Memory.defaults;
		const my_shard_config = config.Memory.shards[Game.shard.name];
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

		const my_shard_config = config.Memory.shards[my_shard];
		// if(Game.shard.name == 'shard0') {
		// 	creep.memory[role_name].shard = Game.shard.name;
		// 	console.log(creep, role_name, JSON.stringify({this_room:this_room, my_room:my_room, my_shard:my_shard, my_shard_config:my_shard_config}));
		// }
		const my_room_config = my_shard_config.rooms[my_room];
		const path_rooms = my_room_config.path_rooms;
		const path_rooms_by_shard = path_rooms[Game.shard.name];
		const path_rooms2 = !!path_rooms_by_shard?path_rooms_by_shard:path_rooms;
		const my_path_room = path_rooms2[this_room];
		if(!my_path_room || (tools.getWeight(creep.name) % 10 == 3 && Game.time%17 == 0) ) {
			console.log(creep, role_name, JSON.stringify({this_room:this_room, my_path_room:my_path_room, path_rooms2:path_rooms2}));
		}
		const shard = my_path_room.substring(0,5);
		if(!!shard && shard == 'shard') {
			const dest_shard = my_path_room;
			var dest_room = path_rooms[dest_shard][Game.shard.name + '_' + this_room];
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

	getPassConfig: function(roomName) {
		const flagPassConfig = flags.getPassConfig(roomName);
		if(!!flagPassConfig)
			return flagPassConfig;
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_pass_config = my_room_config['pass'];
		return my_pass_config;
	},

	moveTo: function(creep,target) {

		if(!!target.id || !!target.pos) {
			creep.memory.target = {id:target.id, pos:target.pos, time: Game.time};
		}

		if(!!target.pos && creep.room.name != target.pos.roomName) {
			const my_path_room = config.Memory.main_path[creep.room.name];
			const exit = creep.room.findExitTo(my_path_room);
			target = creep.pos.findClosestByPath(exit);
			const special_x = config.Memory.main_path[creep.room.name+'x'];
			const special_y = config.Memory.main_path[creep.room.name+'y'];
			// console.log(creep, role_name, JSON.stringify({pos:pos, exit:exit, my_path_room:my_path_room}));
			if(!!special_x && !!target)
				target.x = special_x+Game.time%3-1;
			if(!!special_y && !!target)
				target.y = special_y+Game.time%3-1;
		}
		else if(!!target.pos && creep.room.name == target.pos.roomName) {
			const passConfig = config.getPassConfig(creep.room.name);
			if(!!passConfig && passConfig.length > 0) {
				console.log(creep, target.pos.roomName, JSON.stringify({target:target.pos, pass:passConfig[0], pos:creep.pos}));
				if((passConfig[0].x-creep.pos.x)*(passConfig[0].x-target.x) < 0 ||
					 (passConfig[0].y-creep.pos.y)*(passConfig[0].y-target.y) < 0) {
					target = passConfig[0];
				}
			}
		}

		return tools.moveTo(creep,target);
	},

	init: function() {
		// if(Memory.config === undefined ||
		// 	 Memory.config.v === undefined ||
	  if(!config.Memory ||
			 !config.Memory.v ||
			  config.Memory.v != config.version) {
			Memory.config	=
			{ v: config.version
			,	main_path:{ W29S37: 'W28S37'
									, W29S36: 'W29S35', W29S35: 'W28S35'
			 						, W28S37: 'W28S36', W28S36: 'W28S35'
									, W27S34: 'W28S34', W28S34: 'W28S35' //!!!
				  				, W29S33: 'W28S33'
									, W29S34: 'W28S34'
									, W28S32: 'W28S33'
									, W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W27S33'
									, W27S33: 'W27S34', W27S33x:31
									, W26S34: 'W27S34', W26S34y:7
									, W26S32: 'W26S33'
									, W26S33: 'W26S33'
									, W25S35: 'W25S34', W25S34: 'W25S33', W25S33: 'W25S33'
									, W59S52: 'W58S52', W58S52: 'W57S52'
									, W56S54: 'W56S53', W56S53: 'W56S52', W56S52: 'W57S52'
									, W58S54: 'W58S53', W58S53: 'W57S53', W57S53: 'W57S52', W57S53x:30
									, W55S51: 'W54S51'
									, W52S51: 'W53S51', W53S51: 'W54S51'
									, W56S50: 'W56S51', W56S51: 'W57S51', W56S51y:37
									, W59S51: 'W58S51', W58S51: 'W57S51'
									, W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38
									, W54S52: 'W54S53', W55S52: 'W55S53', W55S52x:31, W55S53: 'W54S53'
									, W29S29: 'W29S29', W28S29: 'W29S29', W29S28: 'W29S29', W28S28: 'W29S28'
									, W25S29: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29'
									, W28S27: 'W29S27', W28S26: 'W27S26'
									, W28S23: 'W28S24', W28S24: 'W27S24', W27S23: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26'
									, W25S26: 'W25S27', W24S26: 'W24S27'
									, W25S27: 'W24S27', W25S28: 'W24S28', W25S28y:16
									, W23S29: 'W24S29', W24S29: 'W24S28', W24S29x:37
									, W26S26: 'W27S26', W26S26y:34
									//, W26S26: 'W26S27', W26S26x:17
									, W26S28: 'W26S27'
									, W27S27: 'W27S28', W27S28: 'W26S28'
									, W23S28: 'W22S28', W22S28: 'W21S28', W21S27: 'W21S28'
									, W22S29: 'W22S28', W24S26: 'W24S27'
									, W26S25: 'W27S25'
									}
			, defaults: {towers: {mw:20000,mr:20000}}
			, shards:
			{	shard0:
					{	defaults:
						{ containers: {weight: 1000}
						, towers: {mw:6000000, mr:6000000}
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
								[ 
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1000, max_weight: 1000}
								, {name: '2', time: 0, min_weight: 1000, max_weight: 1000}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W57S51y:36, W56S51: 'W56S52'
								, W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S53', W56S53: 'W56S54'
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
							W57S52:
							{ containers: {weight: 403}
							, towers: {mw:400000, mr:2000000}
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
									{ shard3_W30S30:'W30S30', W30S30: 'shard1'}
								, shard1:
									{ shard2_W30S30:'W30S30', W30S30: 'shard0'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									, W29S29: 'W29S30', W29S30: 'W30S30'
									}
								, shard0:
									{ shard1_W30S30: 'W60S50', W60S50: 'W60S51', W60S51: 'W60S52'
									, W60S52: 'W59S52', W59S52: 'W58S52', W58S52: 'W57S52'
									, W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
									, W56S53: 'W56S52'
									}
								}
								, escape_path:
									{ W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
									, W29S33: 'W28S33'
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
								, {name: '4', time: 0, min_weight: 410, max_weight: 419}
								, {name: '5', time: 0, min_weight: 410, max_weight: 419}
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
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W57S53: 'W57S52', W57S52: 'W57S52'
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
								, {name: '4', time: 0, min_weight: 420, max_weight: 429}
								, {name: '5', time: 0, min_weight: 420, max_weight: 429}
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
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W58S52: 'W57S52', W57S52: 'W57S52'
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
								, {name: '4', time: 0, min_weight: 430, max_weight: 439}
								, {name: '5', time: 0, min_weight: 430, max_weight: 439}
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
								, W60S52: 'W59S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W59S52: 'W58S52', W58S52: 'W57S52', W57S52: 'W57S52'
								}
							},
						  W56S52:
							{ containers: {weight: 443}
							, towers: {mw:6000000, mr:6000000}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 440, max_weight: 449}
								, {name: '2', time: 0, min_weight: 440, max_weight: 449}
								, {name: '3', time: 0, min_weight: 440, max_weight: 449}
								, {name: '4', time: 0, min_weight: 440, max_weight: 449}
								, {name: '5', time: 0, min_weight: 440, max_weight: 449}
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
								{ W57S51: 'W56S51', W56S51: 'W56S52'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
						  W57S51:
							{ containers: {weight: 453}
							, towers: {mw:6000000, mr:6000000}
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
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S52'
								}
							},
							W55S51:
							{ containers: {weight: 463}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 460, max_weight: 469}
								, {name: '2', time: 0, min_weight: 460, max_weight: 469}
								, {name: '3', time: 0, min_weight: 460, max_weight: 469}
								, {name: '4', time: 0, min_weight: 460, max_weight: 469}
								, {name: '5', time: 0, min_weight: 460, max_weight: 469}
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
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51'
								, W56S50: 'W56S51'
								, W57S51: 'W56S51', W56S51: 'W55S51'
								, W54S51: 'W55S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W55S51: 'W56S51', W56S51: 'W57S51', W56S52: 'W56S51'
								, W54S51: 'W55S51'
								}
							},
						  W59S51:
							{ containers: {weight: 473}
							, sites:
								[ {x:19, y:30, type:STRUCTURE_CONTAINER}
								, {x:20, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								, {name: '3', time: 0, min_weight: 470, max_weight: 479}
								, {name: '4', time: 0, min_weight: 470, max_weight: 479}
								, {name: '5', time: 0, min_weight: 470, max_weight: 479}
								, {name: '6', time: 0, min_weight: 470, max_weight: 479}
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
								, W59S52: 'W59S51'
								, W57S51: 'W58S51', W58S51: 'W59S51'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								, W56S52: 'W56S51'
								, W56S53: 'W56S52', W56S52: 'W57S52'
								}
								, escape_path:
								{ W59S51: 'W58S51', W58S51: 'W57S51'
								}
							},
							W58S51:
							{ containers: {weight: 483}
							, sites:
								[ {x:31, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 480, max_weight: 489}
								, {name: '2', time: 0, min_weight: 480, max_weight: 489}
								, {name: '3', time: 0, min_weight: 480, max_weight: 489}
								, {name: '4', time: 0, min_weight: 480, max_weight: 489}
								, {name: '5', time: 0, min_weight: 480, max_weight: 489}
								, {name: '6', time: 0, min_weight: 480, max_weight: 489}
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
								, W57S51: 'W58S51'
								, W59S51: 'W58S51'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								, W56S53: 'W56S52', W56S52: 'W57S52'
								}
								, escape_path:
								{ W59S51: 'W58S51', W58S51: 'W57S51'
								}
							},
							W56S51:
							{ containers: {weight: 493}
							, sites:
								[ {x:37, y:39, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 490, max_weight: 499}
								, {name: '2', time: 0, min_weight: 490, max_weight: 499}
								, {name: '3', time: 0, min_weight: 490, max_weight: 499}
								, {name: '4', time: 0, min_weight: 490, max_weight: 499}
								, {name: '5', time: 0, min_weight: 490, max_weight: 499}
								, {name: '6', time: 0, min_weight: 490, max_weight: 499}
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
								, W56S50: 'W56S51'
								, W57S51: 'W56S51'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W58S53:
							{ containers: {weight: 503}
							, sites:
								[ {x:35, y:37, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								, {name: '2', time: 0, min_weight: 500, max_weight: 509}
								, {name: '3', time: 0, min_weight: 500, max_weight: 509}
								, {name: '4', time: 0, min_weight: 500, max_weight: 509}
								, {name: '5', time: 0, min_weight: 500, max_weight: 509}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 500, max_weight: 509}
								, {name: '2', time: 0, min_weight: 500, max_weight: 509}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53', W58S53: 'W58S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W58S53: 'W57S53', W57S53: 'W57S52', W57S52: 'W57S52'
								}
							},
							W58S54:
							{ containers: {weight: 513}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 510, max_weight: 519}
								, {name: '2', time: 0, min_weight: 510, max_weight: 519}
								, {name: '3', time: 0, min_weight: 510, max_weight: 519}
								, {name: '4', time: 0, min_weight: 510, max_weight: 519}
								, {name: '5', time: 0, min_weight: 510, max_weight: 519}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 510, max_weight: 519}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 510, max_weight: 519}
								, {name: '2', time: 0, min_weight: 510, max_weight: 519}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53', W58S53: 'W58S54'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W58S54: 'W58S53', W58S53: 'W57S53', W57S53: 'W57S52', W57S52: 'W57S52'
								}
							},
							W54S51:
							{ containers: {weight: 523}
							, towers: {mw:6000000, mr:6000000}
							// , sites:
							// 	[ {x:37, y:39, type:STRUCTURE_CONTAINER}
							// 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 520, max_weight: 529}
								, {name: '2', time: 0, min_weight: 520, max_weight: 529}
								, {name: '3', time: 0, min_weight: 520, max_weight: 529}
								, {name: '4', time: 0, min_weight: 520, max_weight: 529}
								, {name: '5', time: 0, min_weight: 520, max_weight: 529}
								, {name: '6', time: 0, min_weight: 520, max_weight: 529}
								, {name: '7', time: 0, min_weight: 520, max_weight: 529}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 520, max_weight: 529}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 520, max_weight: 529}
								, {name: '2', time: 0, min_weight: 520, max_weight: 529}
								, {name: '3', time: 0, min_weight: 520, max_weight: 529}
								, {name: '4', time: 0, min_weight: 520, max_weight: 529}
								, {name: '5', time: 0, min_weight: 520, max_weight: 529}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W55S51'
								, W55S51: 'W54S51', W54S51: 'W54S51'
								, W57S51: 'W56S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W52S51:
							{ containers: {weight: 533}
							, towers: {mw:6000000, mr:6000000}
							, sites:
							  [ {x:11, y:35, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 530, max_weight: 539}
								, {name: '2', time: 0, min_weight: 530, max_weight: 539}
								, {name: '3', time: 0, min_weight: 530, max_weight: 539}
								, {name: '4', time: 0, min_weight: 530, max_weight: 539}
								, {name: '5', time: 0, min_weight: 530, max_weight: 539}
								, {name: '6', time: 0, min_weight: 530, max_weight: 539}
								, {name: '7', time: 0, min_weight: 530, max_weight: 539}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 530, max_weight: 539}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 530, max_weight: 539}
								, {name: '2', time: 0, min_weight: 530, max_weight: 539}
								, {name: '3', time: 0, min_weight: 530, max_weight: 539}
								, {name: '4', time: 0, min_weight: 530, max_weight: 539}
								, {name: '5', time: 0, min_weight: 530, max_weight: 539}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W55S51'
								, W55S51: 'W54S51', W54S51: 'W53S51', W53S51: 'W52S51'
								, W57S51: 'W56S51'
								, W52S50: 'W52S51'
								, W55S53: 'W56S53', W56S53: 'W56S52'
								}
								, escape_path:
								{ W52S51: 'W53S51', W53S51: 'W54S51', W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W53S51:
							{ containers: {weight: 543}
							, towers: {mw:6000000, mr:6000000}
							, sites:
							  [ {x:5, y:42, type:STRUCTURE_CONTAINER}
								, {x:23, y:11, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 540, max_weight: 549}
								, {name: '2', time: 0, min_weight: 540, max_weight: 549}
								, {name: '3', time: 0, min_weight: 540, max_weight: 549}
								, {name: '4', time: 0, min_weight: 540, max_weight: 549}
								, {name: '5', time: 0, min_weight: 540, max_weight: 549}
								, {name: '6', time: 0, min_weight: 540, max_weight: 549}
								, {name: '7', time: 0, min_weight: 540, max_weight: 549}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 540, max_weight: 549}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 540, max_weight: 549}
								, {name: '2', time: 0, min_weight: 540, max_weight: 549}
								, {name: '3', time: 0, min_weight: 540, max_weight: 549}
								, {name: '4', time: 0, min_weight: 540, max_weight: 549}
								, {name: '5', time: 0, min_weight: 540, max_weight: 549}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S51'}
							, path_rooms:
								{ W57S52: 'W56S52', W57S52y:24, W56S52: 'W56S51', W56S51: 'W55S51'
								, W55S51: 'W54S51', W54S51: 'W53S51'
								, W57S51: 'W56S51'
								, W56S53: 'W56S52'
								}
								, escape_path:
								{ W53S51: 'W54S51', W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
								}
							},
							W56S53:
							{ containers: {weight: 553}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ //{x:37, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 550, max_weight: 559}
								, {name: '2', time: 0, min_weight: 550, max_weight: 559}
								, {name: '3', time: 0, min_weight: 550, max_weight: 559}
								, {name: '4', time: 0, min_weight: 550, max_weight: 559}
								, {name: '5', time: 0, min_weight: 550, max_weight: 559}
								, {name: '6', time: 0, min_weight: 550, max_weight: 559}
								, {name: '7', time: 0, min_weight: 550, max_weight: 559}
								, {name: '8', time: 0, min_weight: 550, max_weight: 559}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 550, max_weight: 559}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 550, max_weight: 559}
								, {name: '2', time: 0, min_weight: 550, max_weight: 559}
								, {name: '3', time: 0, min_weight: 550, max_weight: 559}
								, {name: '4', time: 0, min_weight: 550, max_weight: 559}
								, {name: '5', time: 0, min_weight: 550, max_weight: 559}
								, {name: '6', time: 0, min_weight: 550, max_weight: 559}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W55S53: 'W56S53', W56S54: 'W56S53'
								}
								, escape_path:
								{ W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W56S54:
							{ containers: {weight: 563}
							, sites:
								[ {x:39, y:43, type:STRUCTURE_CONTAINER}
								, {x:40, y:43, type:STRUCTURE_CONTAINER}
								, {x:6, y:42, type:STRUCTURE_CONTAINER}
								, {x:7, y:42, type:STRUCTURE_CONTAINER}
								, {x:13, y:15, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 560, max_weight: 569}
								, {name: '2', time: 0, min_weight: 560, max_weight: 569}
								, {name: '3', time: 0, min_weight: 560, max_weight: 569}
								, {name: '4', time: 0, min_weight: 560, max_weight: 569}
								, {name: '5', time: 0, min_weight: 560, max_weight: 569}
								, {name: '6', time: 0, min_weight: 560, max_weight: 569}
								, {name: '7', time: 0, min_weight: 560, max_weight: 569}
								, {name: '8', time: 0, min_weight: 560, max_weight: 569}
								, {name: '9', time: 0, min_weight: 560, max_weight: 569}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 560, max_weight: 569}
								, {name: '2', time: 0, min_weight: 560, max_weight: 569}
								, {name: '3', time: 0, min_weight: 560, max_weight: 569}
								, {name: '4', time: 0, min_weight: 560, max_weight: 569}
								, {name: '5', time: 0, min_weight: 560, max_weight: 569}
								, {name: '6', time: 0, min_weight: 560, max_weight: 569}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52'
								, W57S52: 'W56S52', W57S52y:45
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
								, W56S52: 'W56S53', W56S52x:25, W55S53: 'W56S53'
								, W56S53: 'W56S54', W57S54: 'W56S54', W55S54: 'W56S54'
								}
								, escape_path:
								{ W56S54: 'W56S53', W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W55S53:
							{ containers: {weight: 573}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ //{x:37, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 570, max_weight: 579}
								, {name: '2', time: 0, min_weight: 570, max_weight: 579}
								, {name: '3', time: 0, min_weight: 570, max_weight: 579}
								, {name: '4', time: 0, min_weight: 570, max_weight: 579}
								, {name: '5', time: 0, min_weight: 570, max_weight: 579}
								, {name: '6', time: 0, min_weight: 570, max_weight: 579}
								, {name: '7', time: 0, min_weight: 570, max_weight: 579}
								, {name: '8', time: 0, min_weight: 570, max_weight: 579}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 570, max_weight: 579}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 570, max_weight: 579}
								, {name: '2', time: 0, min_weight: 570, max_weight: 579}
								, {name: '3', time: 0, min_weight: 570, max_weight: 579}
								, {name: '4', time: 0, min_weight: 570, max_weight: 579}
								, {name: '5', time: 0, min_weight: 570, max_weight: 579}
								, {name: '6', time: 0, min_weight: 570, max_weight: 579}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W54S53: 'W55S53'
								}
								, escape_path:
								{ W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W51S54:
							{ containers: {weight: 583}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ //{x:37, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 580, max_weight: 589}
								, {name: '2', time: 0, min_weight: 580, max_weight: 589}
								, {name: '3', time: 0, min_weight: 580, max_weight: 589}
								, {name: '4', time: 0, min_weight: 580, max_weight: 589}
								, {name: '5', time: 0, min_weight: 580, max_weight: 589}
								, {name: '6', time: 0, min_weight: 580, max_weight: 589}
								, {name: '7', time: 0, min_weight: 580, max_weight: 589}
								, {name: '8', time: 0, min_weight: 580, max_weight: 589}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 580, max_weight: 589}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 580, max_weight: 589}
								, {name: '2', time: 0, min_weight: 580, max_weight: 589}
								, {name: '3', time: 0, min_weight: 580, max_weight: 589}
								, {name: '4', time: 0, min_weight: 580, max_weight: 589}
								, {name: '5', time: 0, min_weight: 580, max_weight: 589}
								, {name: '6', time: 0, min_weight: 580, max_weight: 589}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53', W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W51S54'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W54S53:
							{ containers: {weight: 593}
							, towers: {mw:600000, mr:600000}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 590, max_weight: 599}
								, {name: '2', time: 0, min_weight: 590, max_weight: 599}
								, {name: '3', time: 0, min_weight: 590, max_weight: 599}
								, {name: '4', time: 0, min_weight: 590, max_weight: 599}
								, {name: '5', time: 0, min_weight: 590, max_weight: 599}
								, {name: '6', time: 0, min_weight: 590, max_weight: 599}
								, {name: '7', time: 0, min_weight: 590, max_weight: 599}
								, {name: '8', time: 0, min_weight: 590, max_weight: 599}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 590, max_weight: 599}
								, {name: '2', time: 0, min_weight: 590, max_weight: 599}
								, {name: '3', time: 0, min_weight: 590, max_weight: 599}
								, {name: '4', time: 0, min_weight: 590, max_weight: 599}
								, {name: '5', time: 0, min_weight: 590, max_weight: 599}
								, {name: '6', time: 0, min_weight: 590, max_weight: 599}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53', W56S52x:38, W56S53: 'W55S53', W55S53: 'W54S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
								, W56S54: 'W56S53', W56S54y:27
								, W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W51S54'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W55S52:
							{ containers: {weight: 603}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ {x:9, y:46, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 600, max_weight: 609}
								, {name: '2', time: 0, min_weight: 600, max_weight: 609}
								, {name: '3', time: 0, min_weight: 600, max_weight: 609}
								, {name: '4', time: 0, min_weight: 600, max_weight: 609}
								, {name: '5', time: 0, min_weight: 600, max_weight: 609}
								, {name: '6', time: 0, min_weight: 600, max_weight: 609}
								, {name: '7', time: 0, min_weight: 600, max_weight: 609}
								, {name: '8', time: 0, min_weight: 600, max_weight: 609}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 600, max_weight: 609}
								, {name: '2', time: 0, min_weight: 600, max_weight: 609}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 600, max_weight: 609}
								, {name: '2', time: 0, min_weight: 600, max_weight: 609}
								, {name: '3', time: 0, min_weight: 600, max_weight: 609}
								, {name: '4', time: 0, min_weight: 600, max_weight: 609}
								, {name: '5', time: 0, min_weight: 600, max_weight: 609}
								, {name: '6', time: 0, min_weight: 600, max_weight: 609}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:37
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53', W56S53y:6
								, W54S53: 'W55S53', W55S53: 'W55S52'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S52: 'W55S53', W55S53: 'W56S53', W55S53y:6, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W54S52:
							{ containers: {weight: 613}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ {x:34, y:23, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 610, max_weight: 619}
								, {name: '2', time: 0, min_weight: 610, max_weight: 619}
								, {name: '3', time: 0, min_weight: 610, max_weight: 619}
								, {name: '4', time: 0, min_weight: 610, max_weight: 619}
								, {name: '5', time: 0, min_weight: 610, max_weight: 619}
								, {name: '6', time: 0, min_weight: 610, max_weight: 619}
								, {name: '7', time: 0, min_weight: 610, max_weight: 619}
								, {name: '8', time: 0, min_weight: 610, max_weight: 619}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 610, max_weight: 619}
								, {name: '2', time: 0, min_weight: 610, max_weight: 619}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 610, max_weight: 619}
								, {name: '2', time: 0, min_weight: 610, max_weight: 619}
								, {name: '3', time: 0, min_weight: 610, max_weight: 619}
								, {name: '4', time: 0, min_weight: 610, max_weight: 619}
								, {name: '5', time: 0, min_weight: 610, max_weight: 619}
								, {name: '6', time: 0, min_weight: 610, max_weight: 619}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:37
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53', W56S53y:6
								, W54S53: 'W55S53', W55S53: 'W55S52', W55S52: 'W54S52'
								, W54S53: 'W54S52'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W54S52: 'W55S52', W55S52: 'W55S53', W55S53: 'W56S53', W55S53y:6, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W54S54:
							{ containers: {weight: 623}
							, sites:
								[ {x:1, y:16, type:STRUCTURE_CONTAINER}
								, {x:31, y:34, type:STRUCTURE_CONTAINER}
								, {x:11, y:38, type:STRUCTURE_CONTAINER}
								, {x:11, y:39, type:STRUCTURE_CONTAINER}
								, {x:37, y:3, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 620, max_weight: 629}
								, {name: '2', time: 0, min_weight: 620, max_weight: 629}
								, {name: '3', time: 0, min_weight: 620, max_weight: 629}
								, {name: '4', time: 0, min_weight: 620, max_weight: 629}
								, {name: '5', time: 0, min_weight: 620, max_weight: 629}
								, {name: '6', time: 0, min_weight: 620, max_weight: 629}
								, {name: '7', time: 0, min_weight: 620, max_weight: 629}
								, {name: '8', time: 0, min_weight: 620, max_weight: 629}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 620, max_weight: 629}
								, {name: '2', time: 0, min_weight: 620, max_weight: 629}
								, {name: '3', time: 0, min_weight: 620, max_weight: 629}
								, {name: '4', time: 0, min_weight: 620, max_weight: 629}
								, {name: '5', time: 0, min_weight: 620, max_weight: 629}
								, {name: '6', time: 0, min_weight: 620, max_weight: 629}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S53'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53', W56S52x:38, W56S53: 'W55S53', W55S53: 'W54S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
								, W56S54: 'W56S53', W56S54y:27
								, W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W51S54'
								, W55S54: 'W54S54'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W55S54:
							{ containers: {weight: 633}
							, sites:
								[ {x:34, y:41, type:STRUCTURE_CONTAINER}
								, {x:34, y:42, type:STRUCTURE_CONTAINER}
								, {x:11, y:39, type:STRUCTURE_CONTAINER}
								, {x:40, y:4, type:STRUCTURE_CONTAINER}
								, {x:3, y:2, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 630, max_weight: 639}
								, {name: '2', time: 0, min_weight: 630, max_weight: 639}
								, {name: '3', time: 0, min_weight: 630, max_weight: 639}
								, {name: '4', time: 0, min_weight: 630, max_weight: 639}
								, {name: '5', time: 0, min_weight: 630, max_weight: 639}
								, {name: '6', time: 0, min_weight: 630, max_weight: 639}
								, {name: '7', time: 0, min_weight: 630, max_weight: 639}
								, {name: '8', time: 0, min_weight: 630, max_weight: 639}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 630, max_weight: 639}
								, {name: '2', time: 0, min_weight: 630, max_weight: 639}
								, {name: '3', time: 0, min_weight: 630, max_weight: 639}
								, {name: '4', time: 0, min_weight: 630, max_weight: 639}
								, {name: '5', time: 0, min_weight: 630, max_weight: 639}
								, {name: '6', time: 0, min_weight: 630, max_weight: 639}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W54S53: 'W55S53'
								, W55S53: 'W55S54', W55S53x:26, W56S54: 'W55S54', W54S54: 'W55S54'
								}
								, escape_path:
								{ W55S54: 'W55S53', W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							}
							//, 
						}
					}
				,	shard1:
				 	{	defaults:
						{ containers: {weight: 5000}
						, towers: {mw:1000000,mr:1000000}
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
							, towers: {mw:11000000, mr:11000000}
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
							  { shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30'
									, shard2_W30S30: 'W30S30'
									, W28S28: 'W29S28', W29S28: 'W29S29', W27S29: 'W28S29'
									, W28S29: 'W29S29', W29S29: 'W29S29', W29S31: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
									, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29'
									, W26S29: 'W27S29'
									, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
									, W23S29: 'W24S29', W24S29: 'W24S28'
									, W24S27: 'W25S27', W25S27: 'W25S28'
									, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
									, W27S28: 'W26S28'
									, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
									},
								 shard3:
									{ W28S35: 'W28S34', W28S34: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'shard2'
									}
								, shard2:
									{ shard3_W30S30:'W30S30', W30S30: 'shard1'}
								}
							 , escape_path:
								{ W29S29: 'W29S29'
								}
							},
							W28S29:
							{ containers: {weight: 5023}
							, towers: {mw:21000000, mr:21000000}
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
							  { shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
								  { shard0_W60S50: 'W30S30'
									, shard2_W30S30: 'W30S30'
									, W29S29: 'W28S29'
									, W27S29: 'W28S29'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'W29S30', W29S30: 'W28S30', W28S30: 'W28S29', W28S30x:28
									, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29'
									, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
									, W23S29: 'W24S29', W24S29: 'W24S28'
									, W24S27: 'W25S27', W25S27: 'W25S28'
									, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
									, W27S28: 'W26S28'
									, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
									},
								 shard3:
									{ W28S35: 'W28S34', W28S34: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'shard2'
									}
								, shard2:
									{ shard3_W30S30:'W30S30', W30S30: 'shard1'}
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
							  { shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30'
									, W29S29: 'W29S28', W28S28: 'W29S28'
									, W27S29: 'W28S29', W28S29: 'W29S29'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
									, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29'
									, W26S29: 'W27S29'
									, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
									, W23S29: 'W24S29', W24S29: 'W24S28'
									, W24S27: 'W25S27', W25S27: 'W25S28'
									, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
									, W27S28: 'W26S28'
									, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
									}
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
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W28S28: 'W29S28', W29S28: 'W29S29', W29S29: 'W29S29'
								}
							},
							W27S29:
							{ containers: {weight: 5053}
							, towers: {mw:11000000, mr:11000000}
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
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W27S30: 'W27S29'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
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
								, {name: '5', time: 0, min_weight: 5060, max_weight: 5069}
								, {name: '6', time: 0, min_weight: 5060, max_weight: 5069}
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
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S28: 'W26S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W25S29:
							{ containers: {weight: 5073}
							, sites:
							 	[ {x:8, y:20, type:STRUCTURE_CONTAINER}
								, {x:9, y:20, type:STRUCTURE_CONTAINER}
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
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9, W26S29: 'W25S29'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W24S29', W24S29: 'W25S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W24S28'
								, W26S28: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W25S29: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W29S31:
							{ containers: {weight: 5083}
							, towers: {mw:11000000, mr:11000000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '2', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '3', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '4', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '5', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '6', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '7', time: 0, min_weight: 5080, max_weight: 5089}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '2', time: 0, min_weight: 5080, max_weight: 5089}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '2', time: 0, min_weight: 5080, max_weight: 5089}
								, {name: '3', time: 0, min_weight: 5080, max_weight: 5089}
								]
							, heal_room:
							 	{ shard: 'shard1', room: 'W29S31'}
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
									{ W30S30: 'W30S31', W60S50: 'W30S30', W30S31: 'W29S31', W29S31: 'W29S31'
									, W27S29: 'W28S29', W28S29: 'W29S29', W29S29: 'W29S30', W29S30: 'W30S30', W29S30y:42
									, W24S28: 'W25S28', W25S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29'
									, W24S27: 'W25S27', W25S27: 'W25S28'
									, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
									, W27S28: 'W26S28', W26S28: 'W26S29'
									, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								 	}
								, shard0:
									{ W57S52:'W58S52', W57S52y:31, W58S52:'W59S52', W58S52y:37
									, W59S52:'W59S51', W59S52x:11, W59S51:'W60S51'
									, W60S51:'W60S50', W60S50:'shard1'
								 	}
								}
								, escape_path:
									{ W29S31:'W29S31'} 
							},
							W26S27:
							{ containers: {weight: 5093}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '2', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '3', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '4', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '5', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '6', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '7', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '8', time: 0, min_weight: 5090, max_weight: 5099}
								, {name: '9', time: 0, min_weight: 5090, max_weight: 5099}
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
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27'
								, W26S26: 'W26S27'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27' 
								}
								, escape_path:
								{ W26S27: 'W26S28', W26S28: 'W26S29'
								, W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W27S27:
							{ containers: {weight: 5103}
							, sites:
							 	[ {x:28, y:45, type:STRUCTURE_CONTAINER}
								, {x:29, y:45, type:STRUCTURE_CONTAINER}
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
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S27x:7, W26S28: 'W27S28', W27S28: 'W27S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W27S27: 'W27S28', W27S28: 'W26S28', W26S28: 'W26S29'
								, W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W27S28:
							{ containers: {weight: 5113}
							, sites:
							 	[ {x:4, y:38, type:STRUCTURE_CONTAINER}
								, {x:5, y:38, type:STRUCTURE_CONTAINER}
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
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28', W26S27: 'W26S28', W26S27x:7, W26S28: 'W27S28'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								}
								, escape_path:
								{ W27S28: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W24S28:
							{ containers: {weight: 5123}
							, towers: {mw:11000000, mr:11000000}
							, sites:
							 	[ //{x:16, y:20, type:STRUCTURE_CONTAINER}
								//, {x:12, y:34, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '2', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '3', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '4', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '5', time: 0, min_weight: 5120, max_weight: 5129}
								, {name: '6', time: 0, min_weight: 5120, max_weight: 5129}
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
								{ shard: 'shard1', room: 'W24S28'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28', W25S28y:16
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W26S28: 'W25S28', W25S28: 'W24S28'
								, W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W26S28:
							{ containers: {weight: 5133}
							, sites:
							 	[ {x:6, y:11, type:STRUCTURE_CONTAINER}
								, {x:7, y:11, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '2', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '3', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '4', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '5', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '6', time: 0, min_weight: 5130, max_weight: 5139}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '2', time: 0, min_weight: 5130, max_weight: 5139}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '2', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '3', time: 0, min_weight: 5130, max_weight: 5139}
								, {name: '4', time: 0, min_weight: 5130, max_weight: 5139}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28', W26S27: 'W26S28', W26S27x:7
								, W27S28: 'W26S28'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W24S28: 'W25S28', W25S28: 'W26S28'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29'
								, W27S29: 'W28S29', W28S29: 'W29S29'
								, W24S28: 'W25S28', W25S28: 'W26S28'
								}
							},
							W27S26:
							{ containers: {weight: 5143}
							, sites:
							 	[ 
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '2', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '3', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '4', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '5', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '6', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '7', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '8', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '9', time: 0, min_weight: 5140, max_weight: 5149}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '2', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '3', time: 0, min_weight: 5140, max_weight: 5149}
								, {name: '4', time: 0, min_weight: 5140, max_weight: 5149}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21, W28S26: 'W27S26'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W27S26: 'W27S26'
								}
							},
							W25S28:
							{ containers: {weight: 5153}
							, towers: {mw:11000000, mr:11000000}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '2', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '3', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '4', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '5', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '6', time: 0, min_weight: 5150, max_weight: 5159}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '2', time: 0, min_weight: 5150, max_weight: 5159}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '2', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '3', time: 0, min_weight: 5150, max_weight: 5159}
								, {name: '4', time: 0, min_weight: 5150, max_weight: 5159}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W25S28', W26S28y:42
								, W24S28: 'W25S28', W24S28y:16
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:34
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W25S28: 'W26S28', W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W23S28:
							{ containers: {weight: 5163}
							, sites:
							 	[ {x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '2', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '3', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '4', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '5', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '6', time: 0, min_weight: 5160, max_weight: 5169}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '2', time: 0, min_weight: 5160, max_weight: 5169}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '2', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '3', time: 0, min_weight: 5160, max_weight: 5169}
								, {name: '4', time: 0, min_weight: 5160, max_weight: 5169}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W21S28: 'W22S28', W22S28: 'W23S28'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								, W26S28: 'W25S28', W25S28: 'W24S28', W24S28: 'W24S29'
								}
								, escape_path:
								{ W26S28: 'W25S28', W25S28: 'W24S28'
								, W23S28: 'W23S29', W23S29: 'W24S29', W24S29: 'W24S28'
								, W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W23S29:
							{ containers: {weight: 5173}
							, sites:
							 	[ {x:19, y:41, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '2', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '3', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '4', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '5', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '6', time: 0, min_weight: 5170, max_weight: 5179}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '2', time: 0, min_weight: 5170, max_weight: 5179}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '2', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '3', time: 0, min_weight: 5170, max_weight: 5179}
								, {name: '4', time: 0, min_weight: 5170, max_weight: 5179}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								, W26S28: 'W25S28', W25S28: 'W24S28', W24S28: 'W24S29'
								}
								, escape_path:
								{ W26S28: 'W25S28', W25S28: 'W24S28'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W24S29:
							{ containers: {weight: 5183}
							, sites:
							 	[ {x:34, y:12, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '2', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '3', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '4', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '5', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '6', time: 0, min_weight: 5180, max_weight: 5189}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '2', time: 0, min_weight: 5180, max_weight: 5189}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '2', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '3', time: 0, min_weight: 5180, max_weight: 5189}
								, {name: '4', time: 0, min_weight: 5180, max_weight: 5189}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29'
								, W23S29: 'W24S29'
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								, W26S28: 'W25S28', W25S28: 'W24S28', W24S28: 'W24S29'
								}
								, escape_path:
								{ W26S28: 'W25S28', W25S28: 'W24S28'
								, W24S29: 'W24S28'
								, W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W24S27:
							{ containers: {weight: 5193}
							, towers: {mw:11000000, mr:11000000}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '2', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '3', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '4', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '5', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '6', time: 0, min_weight: 5190, max_weight: 5199}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '2', time: 0, min_weight: 5190, max_weight: 5199}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '2', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '3', time: 0, min_weight: 5190, max_weight: 5199}
								, {name: '4', time: 0, min_weight: 5190, max_weight: 5199}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S27'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W25S28', W26S28y:42
								, W24S28: 'W25S28', W24S28y:16
								, W26S28: 'W25S28', W25S28: 'W25S27', W25S27: 'W24S27', W24S26: 'W24S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:35
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								, W26S28: 'W25S28', W25S28: 'W25S27', W25S27: 'W24S27'
								}
								, escape_path:
								{ W25S27: 'W24S27'
								, W24S26: 'W24S27'
								, W23S27: 'W24S27'
								}
							},
							W25S27:
							{ containers: {weight: 5203}
							, sites:
							 	[ //{x:42, y:43, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '2', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '3', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '4', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '5', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '6', time: 0, min_weight: 5200, max_weight: 5209}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '2', time: 0, min_weight: 5200, max_weight: 5209}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '2', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '3', time: 0, min_weight: 5200, max_weight: 5209}
								, {name: '4', time: 0, min_weight: 5200, max_weight: 5209}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S27'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W25S28', W26S28y:42
								, W24S28: 'W25S28', W24S28y:16
								, W26S28: 'W25S28', W25S28: 'W25S27'
								, W24S27: 'W25S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:33
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W25S27: 'W24S27'
								}
							},
							W21S28:
							{ containers: {weight: 5213}
							, towers: {mw:21000000, mr:21000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '2', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '3', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '4', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '5', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '6', time: 0, min_weight: 5210, max_weight: 5219}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '2', time: 0, min_weight: 5210, max_weight: 5219}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '2', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '3', time: 0, min_weight: 5210, max_weight: 5219}
								, {name: '4', time: 0, min_weight: 5210, max_weight: 5219}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W21S27: 'W21S28'
								, W24S27: 'W25S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								}
								, escape_path:
								{ W22S28: 'W21S28', W21S27: 'W21S28'
								}
							},
							W21S27:
							{ containers: {weight: 5223}
							, sites:
							 	[ {x:28, y:44, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '2', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '3', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '4', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '5', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '6', time: 0, min_weight: 5220, max_weight: 5229}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '2', time: 0, min_weight: 5220, max_weight: 5229}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '2', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '3', time: 0, min_weight: 5220, max_weight: 5229}
								, {name: '4', time: 0, min_weight: 5220, max_weight: 5229}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28', W21S28: 'W21S27', W21S28x:40
								, W22S27: 'W21S27'
								, W20S27: 'W21S27'
								, W24S27: 'W25S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W25S27: 'W26S27'
								}
								, escape_path:
								{ W22S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W22S29:
							{ containers: {weight: 5233}
							, sites:
							 	[ {x:44, y:5, type:STRUCTURE_CONTAINER}
								, {x:34, y:25, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '2', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '3', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '4', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '5', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '6', time: 0, min_weight: 5230, max_weight: 5239}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '2', time: 0, min_weight: 5230, max_weight: 5239}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '2', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '3', time: 0, min_weight: 5230, max_weight: 5239}
								, {name: '4', time: 0, min_weight: 5230, max_weight: 5239}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28'
								, W21S28: 'W22S28', W22S28: 'W22S29'
								, W23S29: 'W22S29'
								, W22S30: 'W22S29'
								, W24S27: 'W25S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W25S27: 'W25S28'
								}
								, escape_path:
								{ W22S29: 'W22S28', W22S28: 'W21S28'
								}
							},
							W22S28:
							{ containers: {weight: 5243}
							, sites:
							 	[ {x:21, y:32, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '2', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '3', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '4', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '5', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '6', time: 0, min_weight: 5240, max_weight: 5249}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '2', time: 0, min_weight: 5240, max_weight: 5249}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '2', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '3', time: 0, min_weight: 5240, max_weight: 5249}
								, {name: '4', time: 0, min_weight: 5240, max_weight: 5249}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W21S28: 'W22S28'
								, W22S29: 'W22S28'
								, W22S27: 'W22S28'
								, W24S27: 'W25S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								}
								, escape_path:
								{ W22S28: 'W21S28', W21S27: 'W21S28'
								}
							},
							W25S26:
							{ containers: {weight: 5253}
							, sites:
							 	[ {x:17, y:16, type:STRUCTURE_CONTAINER}
								, {x:18, y:16, type:STRUCTURE_CONTAINER}
								, {x:46, y:15, type:STRUCTURE_CONTAINER}
								, {x:46, y:16, type:STRUCTURE_CONTAINER}
								, {x:36, y:39, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '2', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '3', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '4', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '5', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '6', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '7', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '8', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '9', time: 0, min_weight: 5250, max_weight: 5259}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '2', time: 0, min_weight: 5250, max_weight: 5259}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '2', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '3', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '4', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '5', time: 0, min_weight: 5250, max_weight: 5259}
								, {name: '6', time: 0, min_weight: 5250, max_weight: 5259}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S28'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:35
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28', W24S28: 'W25S28', W24S28y:16, W25S28: 'W25S27', W26S27: 'W25S27'
								, W25S27: 'W25S26', W25S27x:39
								, W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28'
								, W26S28: 'W26S27', W26S27: 'W25S27'
								, W24S27: 'W25S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W25S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S24: 'W27S25', W27S25: 'W27S26'
								}
								, escape_path:
								{ W25S26: 'W25S27', W25S27: 'W24S27'
								}
							},
							W24S26:
							{ containers: {weight: 5263}
							, sites:
							 	[ {x:12, y:36, type:STRUCTURE_CONTAINER}
								, {x:12, y:12, type:STRUCTURE_CONTAINER}
								, {x:12, y:13, type:STRUCTURE_CONTAINER}
								, {x:39, y:10, type:STRUCTURE_CONTAINER}
								, {x:40, y:10, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '2', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '3', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '4', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '5', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '6', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '7', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '8', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '9', time: 0, min_weight: 5260, max_weight: 5269}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '2', time: 0, min_weight: 5260, max_weight: 5269}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '2', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '3', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '4', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '5', time: 0, min_weight: 5260, max_weight: 5269}
								, {name: '6', time: 0, min_weight: 5260, max_weight: 5269}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W24S27'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9, W26S29: 'W26S28'
								, W26S28: 'W25S28', W25S28: 'W25S27', W26S27: 'W25S27', W25S27: 'W24S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:35
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S28: 'W25S28', W24S28y:16
 								, W24S27: 'W24S26', W24S27x:20
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W25S27', W25S27: 'W24S27'
								}
								, escape_path:
								{ W25S26: 'W24S26', W24S26: 'W24S27', W24S26x:40
								}
							},
							W29S27:
							{ containers: {weight: 5273}
							, towers: {mw:11000000, mr:11000000}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '2', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '3', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '4', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '5', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '6', time: 0, min_weight: 5270, max_weight: 5279}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '2', time: 0, min_weight: 5270, max_weight: 5279}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '2', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '3', time: 0, min_weight: 5270, max_weight: 5279}
								, {name: '4', time: 0, min_weight: 5270, max_weight: 5279}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W27S28', W26S28y:17
								, W27S28: 'W27S27', W27S27: 'W28S27', W28S27: 'W29S27'
								, W24S28: 'W25S28', W24S28y:16
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:34
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W26S28'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W25S28: 'W26S28', W26S27: 'W26S28', W26S28: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W26S26:
							{ containers: {weight: 5283}
							, sites:
							 	[ {x:5, y:12, type:STRUCTURE_CONTAINER}
								, {x:45, y:12, type:STRUCTURE_CONTAINER}
								, {x:46, y:12, type:STRUCTURE_CONTAINER}
								, {x:9, y:39, type:STRUCTURE_CONTAINER}
								, {x:34, y:42, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '2', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '3', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '4', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '5', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '6', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '7', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '8', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '9', time: 0, min_weight: 5280, max_weight: 5289}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '2', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '3', time: 0, min_weight: 5280, max_weight: 5289}
								, {name: '4', time: 0, min_weight: 5280, max_weight: 5289}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26'
								, W25S26: 'W26S26'
								, W27S26: 'W26S26'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W26S29'
								, W26S29: 'W27S29', W27S29: 'W28S29', W28S29: 'W29S29'
								}
							},
							W28S27:
							{ containers: {weight: 5293}
							, towers: {}
							, sites:
							 	[ {x:12, y:37, type:STRUCTURE_CONTAINER}
								, {x:6, y:34, type:STRUCTURE_ROAD}
								, {x:7, y:35, type:STRUCTURE_ROAD}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '2', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '3', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '4', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '5', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '6', time: 0, min_weight: 5290, max_weight: 5299}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '2', time: 0, min_weight: 5290, max_weight: 5299}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '2', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '3', time: 0, min_weight: 5290, max_weight: 5299}
								, {name: '4', time: 0, min_weight: 5290, max_weight: 5299}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S27'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S27: 'W26S28', W26S28: 'W27S28', W26S28y:17
								, W27S28: 'W27S27', W27S27: 'W28S27'
								, W29S27: 'W28S27'
								, W24S28: 'W25S28', W24S28y:16
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:34
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W25S28', W25S28: 'W26S28'
								, W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
								}
								, escape_path:
								{ W28S27: 'W29S27'
								}
							},
							W27S25:
							{ containers: {weight: 5303}
							, sites:
							 	[// {x:32, y:14, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '2', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '3', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '4', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '5', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '6', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '7', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '8', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '9', time: 0, min_weight: 5300, max_weight: 5309}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '2', time: 0, min_weight: 5300, max_weight: 5309}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '2', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '3', time: 0, min_weight: 5300, max_weight: 5309}
								, {name: '4', time: 0, min_weight: 5300, max_weight: 5309}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21, W28S26: 'W27S26', W27S26: 'W27S25'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S24: 'W27S25'
								}
								, escape_path:
								{ W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							W28S26:
							{ containers: {weight: 5313}
							, sites:
							 	[ 
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '2', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '3', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '4', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '5', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '6', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '7', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '8', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '9', time: 0, min_weight: 5310, max_weight: 5319}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '2', time: 0, min_weight: 5310, max_weight: 5319}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '2', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '3', time: 0, min_weight: 5310, max_weight: 5319}
								, {name: '4', time: 0, min_weight: 5310, max_weight: 5319}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21, W27S26: 'W28S26'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W28S26: 'W27S26'
								}
							}, 
							W26S25:
							{ containers: {weight: 5323}
							, sites:
							 	[ 
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '2', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '3', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '4', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '5', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '6', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '7', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '8', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '9', time: 0, min_weight: 5320, max_weight: 5329}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '2', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '3', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '4', time: 0, min_weight: 5320, max_weight: 5329}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W26S25', W26S26x:37, W27S26: 'W26S26'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								, W27S26: 'W26S26'
								, W27S25: 'W26S25'
								}
								, escape_path:
								{ W26S25: 'W26S26', W26S26: 'W27S26'
								}
							},
							W27S24:
							{ containers: {weight: 5343}
							, sites:
							 	[ {x:21, y:15, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '2', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '3', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '4', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '5', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '6', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '7', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '8', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '9', time: 0, min_weight: 5340, max_weight: 5349}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '2', time: 0, min_weight: 5340, max_weight: 5349}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '2', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '3', time: 0, min_weight: 5340, max_weight: 5349}
								, {name: '4', time: 0, min_weight: 5340, max_weight: 5349}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21, W28S26: 'W27S26', W27S26: 'W27S25', W27S25: 'W27S24'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							W28S24:
							{ containers: {weight: 5353}
							, sites:
							 	[ {x:25, y:12, type:STRUCTURE_CONTAINER}
								, {x:42, y:2, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '2', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '3', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '4', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '5', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '6', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '7', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '8', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '9', time: 0, min_weight: 5350, max_weight: 5359}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '2', time: 0, min_weight: 5350, max_weight: 5359}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '2', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '3', time: 0, min_weight: 5350, max_weight: 5359}
								, {name: '4', time: 0, min_weight: 5350, max_weight: 5359}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21, W28S26: 'W27S26', W27S26: 'W27S25', W27S25: 'W27S24', W27S24: 'W28S24'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							W27S23:
							{ containers: {weight: 5363}
							, sites:
							 	[ {x:6, y:37, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '2', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '3', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '4', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '5', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '6', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '7', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '8', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '9', time: 0, min_weight: 5360, max_weight: 5369}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '2', time: 0, min_weight: 5360, max_weight: 5369}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '2', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '3', time: 0, min_weight: 5360, max_weight: 5369}
								, {name: '4', time: 0, min_weight: 5360, max_weight: 5369}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21
								, W28S26: 'W27S26', W27S26: 'W27S25', W27S25: 'W27S24', W27S24: 'W27S23'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W27S23: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							W28S23:
							{ containers: {weight: 5373}
							, sites:
							 	[ {x:28, y:12, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '2', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '3', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '4', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '5', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '6', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '7', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '8', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '9', time: 0, min_weight: 5370, max_weight: 5379}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '2', time: 0, min_weight: 5370, max_weight: 5379}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '2', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '3', time: 0, min_weight: 5370, max_weight: 5379}
								, {name: '4', time: 0, min_weight: 5370, max_weight: 5379}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S26'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21
								, W28S26: 'W27S26', W27S26: 'W27S25', W27S25: 'W27S24', W27S24: 'W28S24', W28S24: 'W28S23'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W28S23: 'W28S24', W28S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							//,
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W27S33'
								}
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
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W27S33'
								}
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
							, heal_room: 'W25S33'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W28S33: 'W27S33'
						 		, W28S35: 'W28S34', W28S34: 'W28S33'
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W27S33'
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
							 	{ shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30', W30S30: 'shard2'
									, W29S29: 'W29S30', W29S30: 'W30S30'} 
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'shard3'}
								, shard3:
									{ shard2_W30S30: 'W30S30'
									, W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S35: 'W28S34', W28S34: 'W28S33'
									, W29S32: 'W28S32', W28S32: 'W28S33'
									, W27S34: 'W27S33'
									}
								}
						 	, escape_path:
								{ W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38', W30S38: 'W30S37', W30S37: 'W30S36'
								, W30S36: 'W30S35', W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33', W29S33: 'W28S33'
								, W28S33: 'W27S33', W27S33: 'W26S33'
								}
							},
			 				W26S34:
							{ containers: {weight: 73}
							, sites:
								[ {x:2, y:3, type:STRUCTURE_CONTAINER}
								, {x:15, y:30, type:STRUCTURE_CONTAINER}
								//, {x:41, y:29, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 70, max_weight: 79}
							  , {name: '2', time: 0, min_weight: 70, max_weight: 79}
							  , {name: '3', time: 0, min_weight: 70, max_weight: 79}
								, {name: '4', time: 0, min_weight: 70, max_weight: 79}
							  , {name: '5', time: 0, min_weight: 70, max_weight: 79}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 70, max_weight:79}
								, {name: '2', time: 0, min_weight: 70, max_weight:79}
								, {name: '3', time: 0, min_weight: 70, max_weight:79}
								, {name: '4', time: 0, min_weight: 70, max_weight:79}
								, {name: '5', time: 0, min_weight: 70, max_weight:79}
								]
						  , heal_room: 'W26S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W26S34', W25S34: 'W26S34'
								, W27S33: 'W26S33', W28S33: 'W27S33', W28S34: 'W28S33'
								, W28S35: 'W28S34'
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W26S34', W27S34y:7
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
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W27S34'
								, W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W28S34', W28S34: 'W27S34'
								, W28S35: 'W28S34', W28S34: 'W27S34'
								, W26S34: 'W27S34'
								, W27S33: 'W27S34'
								}
							, escape_path:
								{ W27S34: 'W28S34', W28S34: 'W28S35'
								, W26S34: 'W27S34'
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
						  , heal_room: 'W25S33'
							, path_rooms:
							 	{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
						 		, W28S33: 'W28S32'
								, W29S33: 'W28S33'
								, W29S32: 'W28S32'
								, W27S34: 'W27S33'
								}
							, escape_path:
								{ W28S37: 'W28S38', W28S38: 'W29S38', W29S38: 'W30S38'
							  , W30S38: 'W30S37', W30S37: 'W30S36', W30S36: 'W30S35'
								, W30S35: 'W30S34', W30S34: 'W30S33', W30S33: 'W29S33'
								, W29S33: 'W28S33', W28S33: 'W27S33', W27S33: 'W26S33', W26S33: 'W25S33'
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
								, W27S34: 'W27S33'
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
								, W27S34: 'W28S34'
								}
							, escape_path:{ W28S34: 'W28S33'}
							},
							W29S34:
							{ containers: {weight:213}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:210, max_weight:219}
								, {name: '2', time: 0, min_weight:210, max_weight:219}
								, {name: '3', time: 0, min_weight:210, max_weight:219}
								, {name: '4', time: 0, min_weight:210, max_weight:219}
								, {name: '5', time: 0, min_weight:210, max_weight:219}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:210, max_weight:219}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:210, max_weight:219}
								, {name: '2', time: 0, min_weight:210, max_weight:219}
								, {name: '3', time: 0, min_weight:210, max_weight:219}
								, {name: '4', time: 0, min_weight:210, max_weight:219}
								, {name: '5', time: 0, min_weight:210, max_weight:219}
								, {name: '6', time: 0, min_weight:210, max_weight:219}
								, {name: '7', time: 0, min_weight:210, max_weight:219}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
							 	, W28S33: 'W28S34', W28S34: 'W29S34', W30S34: 'W29S34'
								, W28S35: 'W28S34'
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W28S34'
								}
							, escape_path:{ W29S34: 'W28S34', W28S34: 'W28S33'}
							},
							W29S36:
							{ containers: {weight:223}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight:220, max_weight:229}
								, {name: '2', time: 0, min_weight:220, max_weight:229}
								, {name: '3', time: 0, min_weight:220, max_weight:229}
								, {name: '4', time: 0, min_weight:220, max_weight:229}
								, {name: '5', time: 0, min_weight:220, max_weight:229}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight:220, max_weight:229}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight:220, max_weight:229}
								, {name: '2', time: 0, min_weight:220, max_weight:229}
								, {name: '3', time: 0, min_weight:220, max_weight:229}
								, {name: '4', time: 0, min_weight:220, max_weight:229}
								, {name: '5', time: 0, min_weight:220, max_weight:229}
								, {name: '6', time: 0, min_weight:220, max_weight:229}
								, {name: '7', time: 0, min_weight:220, max_weight:229}
								]
						  , heal_room: 'W28S33'
							, path_rooms:
								{ W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
								, W29S32: 'W28S32', W28S32: 'W28S33'
								, W27S34: 'W28S34'
							 	, W28S33: 'W28S34', W28S34: 'W28S35'
								, W28S35: 'W29S35', W29S35: 'W29S36', W29S35x:44
								}
							, escape_path:{ W29S36: 'W29S35', W29S35: 'W28S35'}
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
								, W27S34: 'W28S34'
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
								, W27S34: 'W28S34'
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
								, W27S34: 'W28S34'
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
								, W27S34: 'W28S34'
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
								, W27S34: 'W28S34'
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
								, {name: '1', time: 0, min_weight: 170, max_weight: 179}
								, {name: '2', time: 0, min_weight: 170, max_weight: 179}
								, {name: '3', time: 0, min_weight: 170, max_weight: 179}
								, {name: '1', time: 0, min_weight: 170, max_weight: 179}
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
							 	{ shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30', W30S30: 'shard2'
									, W29S29: 'W29S30', W29S30: 'W30S30'} 
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'shard3'}
								, shard3:
									{ shard2_W30S30: 'W30S30'
									, W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W28S35: 'W28S34'
									, W28S34: 'W28S33', W27S34: 'W28S34'
									, W29S31: 'W29S32'
									}
							 	}
							, escape_path:
								{ W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32', W29S32: 'W30S32', W30S32: 'W30S33', W30S33: 'W29S33'
						 		, W29S33: 'W28S33'
								}
							},
						  W29S31:
							{ containers: {weight: 233}
							, towers: {mw:110000, mr:6000000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								, {name: '3', time: 0, min_weight: 230, max_weight: 239}
								, {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								, {name: '3', time: 0, min_weight: 230, max_weight: 239}
								, {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								, {name: '3', time: 0, min_weight: 230, max_weight: 239}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								, {name: '3', time: 0, min_weight: 230, max_weight: 239}
								, {name: '4', time: 0, min_weight: 230, max_weight: 239}
								, {name: '5', time: 0, min_weight: 230, max_weight: 239}
								, {name: '6', time: 0, min_weight: 230, max_weight: 239}
								, {name: '7', time: 0, min_weight: 230, max_weight: 239}
								, {name: '8', time: 0, min_weight: 230, max_weight: 239}
								, {name: '9', time: 0, min_weight: 230, max_weight: 239}
								]
						  , heal_room: 'W29S32'
							, path_rooms:
							 	{ shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30', W30S30: 'shard2'
									, W29S29: 'W29S30', W29S30: 'W30S30'} 
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'shard3'}
								, shard3:
									{ shard2_W30S30: 'W30S30'
									, W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W28S35: 'W28S34'
									, W28S34: 'W28S33', W27S34: 'W28S34'
									, W29S32: 'W29S31'
									}
							 	}
							, escape_path:
								{ W30S30: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32', W29S32: 'W28S32', W28S32: 'W28S33', W28S33: 'W28S34'
						 		, W28S34: 'W28S35', W29S31: 'W29S32'
								}
							},
						  W29S30:
							{ containers: {weight: 243}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								, {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								, {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								, {name: '4', time: 0, min_weight: 240, max_weight: 249}
								, {name: '5', time: 0, min_weight: 240, max_weight: 249}
								, {name: '6', time: 0, min_weight: 240, max_weight: 249}
								, {name: '7', time: 0, min_weight: 240, max_weight: 249}
								, {name: '8', time: 0, min_weight: 240, max_weight: 249}
								, {name: '9', time: 0, min_weight: 240, max_weight: 249}
								]
						  , heal_room: 'W29S32'
							, path_rooms:
							 	{ shard0:
									{ W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									}
								, shard1:
									{ shard0_W60S50: 'W30S30', W30S30: 'shard2'
									, W29S29: 'W29S30', W29S30: 'W30S30'} 
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'shard3'}
								, shard3:
									{ shard2_W30S30: 'W30S30'
									, W30S30: 'W30S31'
									, W30S31: 'W30S32', W30S32: 'W29S32', W29S32: 'W29S31', W29S32x:39, W29S31: 'W30S31', W29S31y:34
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W28S35: 'W28S34'
									, W28S34: 'W28S33', W27S34: 'W28S34'
									}
							 	}
							, escape_path:
								{ W30S30: 'W30S31'
								, W29S31: 'W30S31', W30S31: 'W30S32', W30S32: 'W29S32'
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
								, W27S34: 'W27S33'
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
								, W27S34: 'W27S33'
								}
						 	, escape_path:
								{ W25S35: 'W25S34', W25S34: 'W25S33'
								}
						 	}
						}
					}
				}
			};
			config.Memory = Memory.config;
			config.log('init config', config.inited, 'Memory.config:', JSON.stringify(Memory.config));
		}
	},

	setRoom: function(creep, role) {
		var already = false;
		for(var shard_name in config.Memory.shards) {
			var shard_config = config.Memory.shards[shard_name];
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
