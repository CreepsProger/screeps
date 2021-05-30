const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const log = require('main.log');

var git = '$Format:%H$';

var config = {

	version: 746,

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
			if(!commodity.level) {
				if(res == RESOURCE_ENERGY)
					return 300000;
				if(res == RESOURCE_BATTERY)
					return 700000;
				return 2000;
			}
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

	getObserverConfig: function(roomName) {
		const flagsObserverConfig = flags.getObserverConfig(roomName);
		if(!!flagsObserverConfig)
			return flagsObserverConfig;
		const my_shard_config = config.Memory.shards[Game.shard.name];
		const my_room_config = my_shard_config.rooms[roomName];
		if(!my_room_config)
			return undefined;
		const my_observer_config = my_room_config['observer'];
		if(!my_observer_config)
			return undefined;
		const my_o_rooms = my_observer_config[roomName];
		return my_o_rooms;
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
		const my_shard_defaults = my_shard_config.defaults;
		const my_path_room_defaults = my_shard_defaults.path_rooms;
		// if(Game.shard.name == 'shard0') {
		// 	creep.memory[role_name].shard = Game.shard.name;
		// 	console.log(creep, role_name, JSON.stringify({this_room:this_room, my_room:my_room, my_shard:my_shard, my_shard_config:my_shard_config}));
		// }
		const my_room_config = my_shard_config.rooms[my_room];
		const path_rooms = my_room_config.path_rooms;
		const path_rooms_by_shard = path_rooms[Game.shard.name];
		const path_rooms2 = !!path_rooms_by_shard?path_rooms_by_shard:path_rooms;
		const my_path_room = !!path_rooms2[this_room]?path_rooms2[this_room]:my_path_room_defaults[this_room];
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
				const tx = target.pos.x; const ty = target.pos.y;
				const pass = passConfig.sort((l,r) => ((l.x-tx)*(l.x-tx)+(l.y-ty)*(l.y-ty))
																		        - ((r.x-tx)*(r.x-tx)+(r.y-ty)*(r.y-ty)) )
																	.shift();
				const dx = pass.x - creep.pos.x;
				const DX = pass.x - target.pos.x;
				const dxDX = dx*DX;
				const dy = pass.y - creep.pos.y;
				const DY = pass.y - target.pos.y;
				const dyDY = dy*DY;
				//console.log(creep, target.pos.roomName, JSON.stringify({target:target.pos, pass:pass, pos:creep.pos, dx:dx, dy:dy, DX:DX, DY:DY, dxDX:dxDX, dyDY:dyDY}));
				if(dxDX < 0 ||
					 dyDY < 0) {
					target.pos.x = pass.x;
					target.pos.y = pass.y;
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
									, W59S52: 'W59S51', W58S52: 'W57S52'
									, W56S54: 'W56S53', W56S53: 'W56S52', W56S52: 'W57S52'
									, W59S54: 'W58S54', W59S53: 'W58S53', W58S53: 'W58S54'
									, W59S55: 'W58S55', W58S55: 'W57S55'
									, W57S53: 'W57S52', W57S53x:30
									, W55S51: 'W54S51'
									, W52S51: 'W53S51', W53S51: 'W54S51'
									, W56S50: 'W56S51', W56S51: 'W57S51', W56S51y:37
									, W59S51: 'W58S51', W58S51: 'W57S51'
									, W51S54: 'W52S54', W53S54: 'W52S54', W52S55: 'W52S54', W54S54: 'W54S53', W54S54x:38
									, W54S52: 'W54S53', W55S52: 'W55S53', W55S52x:31, W55S53: 'W54S53'
									, W29S29: 'W29S29', W28S29: 'W29S29', W29S28: 'W29S29', W28S28: 'W29S28'
									, W25S29: 'W26S29', W26S29: 'W27S29', W27S29: 'W28S29'
									, W28S27: 'W29S27', W28S26: 'W27S26'
									, W28S23: 'W28S24', W28S24: 'W27S24', W27S23: 'W27S24', W26S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26'
									, W25S26: 'W25S27', W24S26: 'W24S27'
									, W25S27: 'W24S27', W25S28: 'W24S28', W25S28y:16
									, W23S29: 'W24S29', W24S29: 'W24S28', W24S29x:37
									, W26S26: 'W27S26', W26S26y:34
									//, W26S26: 'W26S27', W26S26x:17
									, W26S28: 'W26S27'
									, W27S27: 'W27S28', W27S28: 'W26S28'
									, W23S28: 'W23S29', W22S28: 'W21S28', W21S27: 'W21S28'
									, W22S29: 'W22S28', W24S26: 'W24S27'
									, W26S25: 'W27S25'
									, W21S29: 'W20S29', W20S29: 'W20S28', W20S28: 'W20S27', W20S27: 'W21S27', W21S27: 'W21S28'
									, W55S55: 'W55S54', W55S54: 'W55S53', W55S54x:25, W56S55: 'W57S55', W56S55y:14, W57S54: 'W57S55'
									, W54S55: 'W54S56', W54S56: 'W54S57'
									, W22S24: 'W22S23', W22S23: 'W21S23'
									, W23S22: 'W22S22', W22S22: 'W22S21'
									, W21S22: 'W22S22'
									, W30S29: 'W29S29'
									, W31S28: 'W31S29'
									, W53S57: 'W54S57', W55S57: 'W54S57', W54S58: 'W54S57'
									, W58S56: 'W57S56'
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
							, W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W58S54', W58S54: 'W58S53', W58S53: 'W57S53', W57S53: 'W57S52'
							, W51S54: 'W52S54', W52S54: 'W52S53', W52S53: 'W52S52', W52S52: 'W52S51', W52S51: 'W53S51', W53S51: 'W54S51'
							, W54S57: 'W53S57', W53S57: 'W53S56', W53S56: 'W52S56', W52S56: 'W52S55', W52S55: 'W52S54'
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
									, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
									, W58S54: 'W57S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
								, W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W56S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
								, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S52'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
								}
							},
						  W59S51:
							{ containers: {weight: 473}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								, {name: '3', time: 0, min_weight: 470, max_weight: 479}
								, {name: '4', time: 0, min_weight: 470, max_weight: 479}
								, {name: '5', time: 0, min_weight: 470, max_weight: 479}
								, {name: '6', time: 0, min_weight: 470, max_weight: 479}
								, {name: '7', time: 0, min_weight: 470, max_weight: 479}
								, {name: '8', time: 0, min_weight: 470, max_weight: 479}
								, {name: '9', time: 0, min_weight: 470, max_weight: 479}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 470, max_weight: 479}
								, {name: '2', time: 0, min_weight: 470, max_weight: 479}
								, {name: '3', time: 0, min_weight: 470, max_weight: 479}
								, {name: '4', time: 0, min_weight: 470, max_weight: 479}
								, {name: '5', time: 0, min_weight: 470, max_weight: 479}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S51'}
							, path_rooms:
								{ shard1:
									{ shard2_W30S30:'W30S30', W30S30: 'shard0'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									, W29S29: 'W29S30', W29S30: 'W30S30'
									, W28S29: 'W28S30', W28S30: 'W29S30'
									}
								, shard0:
									{ shard1_W30S30: 'W60S50', W60S50: 'W60S51', W60S51: 'W59S51'
									, W57S52: 'W58S52', W57S52y:20, W58S52: 'W59S52', W58S52y:15
									, W59S52: 'W59S51'
									, W57S51: 'W58S51', W58S51: 'W59S51'
									, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W57S51'
									, W56S52: 'W56S51'
									, W56S53: 'W56S52', W56S52: 'W57S52'
									, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53'
									, W58S54: 'W57S54'
									, W54S53: 'W55S53', W55S53: 'W56S53'
									}
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53'
								, W58S54: 'W57S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:4, W56S54: 'W56S53', W56S53: 'W56S52'
								, W58S54: 'W57S54'
								, W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W56S54', W56S54: 'W56S53'
								}
								, escape_path:
								{ W55S51: 'W56S51', W56S51: 'W57S51'
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
								, {name: '6', time: 0, min_weight: 510, max_weight: 519}
								, {name: '7', time: 0, min_weight: 510, max_weight: 519}
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
								{ shard1:
									{ shard2_W30S30:'W30S30', W30S30: 'shard0'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									, W29S29: 'W29S30', W29S30: 'W30S30'
									, W28S29: 'W28S30', W28S30: 'W29S30'
									}
								, shard0:
									{ shard1_W30S30: 'W60S50', W60S50: 'W60S51', W60S51: 'W60S52'
									, W60S52: 'W60S53', W60S53: 'W60S54', W60S54: 'W59S54', W59S54: 'W58S54'
									, W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53', W58S53: 'W58S54'
									, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
									, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S52'
									, W56S54: 'W57S54', W57S54: 'W58S54'
									, W57S55: 'W57S54'
									}
								}
								, escape_path:
								{ W58S54: 'W58S53', W58S53: 'W57S53', W57S53: 'W57S52', W57S52: 'W57S52'
								, W60S50: 'W60S51', W60S51: 'W60S52', W60S52: 'W60S53', W60S53: 'W60S54', W60S54: 'W59S54', W59S54: 'W58S54' 
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
								, W57S55: 'W57S54', W57S54: 'W56S54'
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
								, {name: '9', time: 0, min_weight: 570, max_weight: 579}
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
								, W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W56S54'
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
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53', W56S52x:38, W56S53: 'W55S53', W55S53: 'W54S53', W54S54: 'W54S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
								, W56S54: 'W56S53', W56S54y:27
								//, W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W51S54'
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
								, W57S55: 'W57S54', W57S54: 'W56S54', W57S54y:14, W56S54: 'W56S53', W56S53: 'W55S53', W55S53: 'W55S52'
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
								, {name: '9', time: 0, min_weight: 620, max_weight: 629}
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
								, W58S54: 'W57S54', W57S54: 'W56S54', W56S54: 'W56S53'
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
							},
							W57S55:
							{ containers: {weight: 653}
							, towers: {mw:500000, mr:500000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 650, max_weight: 659}
								, {name: '2', time: 0, min_weight: 650, max_weight: 659}
								, {name: '3', time: 0, min_weight: 650, max_weight: 659}
								, {name: '4', time: 0, min_weight: 650, max_weight: 659}
								, {name: '5', time: 0, min_weight: 650, max_weight: 659}
								, {name: '6', time: 0, min_weight: 650, max_weight: 659}
								, {name: '7', time: 0, min_weight: 650, max_weight: 659}
								, {name: '8', time: 0, min_weight: 650, max_weight: 659}
								, {name: '9', time: 0, min_weight: 650, max_weight: 659}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 650, max_weight: 659}
								, {name: '2', time: 0, min_weight: 650, max_weight: 659}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 650, max_weight: 659}
								, {name: '2', time: 0, min_weight: 650, max_weight: 659}
								, {name: '3', time: 0, min_weight: 650, max_weight: 659}
								, {name: '4', time: 0, min_weight: 650, max_weight: 659}
								, {name: '5', time: 0, min_weight: 650, max_weight: 659}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W56S53'}
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
									, W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53'
									, W56S53: 'W56S54', W56S54: 'W57S54', W57S54: 'W57S55'
									, W54S51: 'W55S51', W55S51: 'W56S51'
									, W54S53: 'W55S53', W55S53: 'W56S53'
									, W58S54: 'W57S54'
									, W57S52: 'W56S52', W56S52: 'W56S53'
									, W56S55: 'W57S55'
									}
								}
								, escape_path:
								{ W57S55: 'W57S54', W57S54: 'W56S54', W56S54: 'W56S53', W56S53: 'W56S52'
								}
							},
							W52S54:
							{ containers: {weight: 673}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ //{x:37, y:30, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 670, max_weight: 679}
								, {name: '2', time: 0, min_weight: 670, max_weight: 679}
								, {name: '3', time: 0, min_weight: 670, max_weight: 679}
								, {name: '4', time: 0, min_weight: 670, max_weight: 679}
								, {name: '5', time: 0, min_weight: 670, max_weight: 679}
								, {name: '6', time: 0, min_weight: 670, max_weight: 679}
								, {name: '7', time: 0, min_weight: 670, max_weight: 679}
								, {name: '8', time: 0, min_weight: 670, max_weight: 679}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 670, max_weight: 679}
								, {name: '2', time: 0, min_weight: 670, max_weight: 679}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 670, max_weight: 679}
								, {name: '2', time: 0, min_weight: 670, max_weight: 679}
								, {name: '3', time: 0, min_weight: 670, max_weight: 679}
								, {name: '4', time: 0, min_weight: 670, max_weight: 679}
								, {name: '5', time: 0, min_weight: 670, max_weight: 679}
								, {name: '6', time: 0, min_weight: 670, max_weight: 679}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53', W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54'//, W52S54: 'W51S54'
								, W57S56: 'W57S55', W57S54: 'W56S54'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W56S55:
							{ containers: {weight: 683}
							, sites:
								[ {x:35, y:41, type:STRUCTURE_CONTAINER}
								, {x:34, y:40, type:STRUCTURE_CONTAINER}
								, {x:34, y:16, type:STRUCTURE_CONTAINER}
								, {x:13, y:15, type:STRUCTURE_CONTAINER}
								, {x:4, y:38, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 680, max_weight: 689}
								, {name: '2', time: 0, min_weight: 680, max_weight: 689}
								, {name: '3', time: 0, min_weight: 680, max_weight: 689}
								, {name: '4', time: 0, min_weight: 680, max_weight: 689}
								, {name: '5', time: 0, min_weight: 680, max_weight: 689}
								, {name: '6', time: 0, min_weight: 680, max_weight: 689}
								, {name: '7', time: 0, min_weight: 680, max_weight: 689}
								, {name: '8', time: 0, min_weight: 680, max_weight: 689}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 680, max_weight: 689}
								, {name: '2', time: 0, min_weight: 680, max_weight: 689}
								, {name: '3', time: 0, min_weight: 680, max_weight: 689}
								, {name: '4', time: 0, min_weight: 680, max_weight: 689}
								, {name: '5', time: 0, min_weight: 680, max_weight: 689}
								, {name: '6', time: 0, min_weight: 680, max_weight: 689}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W58S54'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W54S53: 'W55S53', W55S53: 'W55S53', W55S53: 'W56S53'
								, W56S53: 'W56S54', W56S54: 'W56S55', W56S54x:28
								, W55S55: 'W56S55'
								, W56S56: 'W56S55'
								, W57S54: 'W57S55', W57S55: 'W56S55'
								}
								, escape_path:
								{ W56S54: 'W56S55', W56S56: 'W56S55', W55S55: 'W56S55', W56S55: 'W57S55', W56S55y:29, W57S55: 'W57S54', W57S54: 'W58S54'
								}
							}, 
							W55S55:
							{ containers: {weight: 693}
							, sites:
								[ {x:14, y:8, type:STRUCTURE_CONTAINER}
								, {x:34, y:15, type:STRUCTURE_CONTAINER}
								, {x:33, y:15, type:STRUCTURE_CONTAINER}
								, {x:40, y:38, type:STRUCTURE_CONTAINER}
								, {x:13, y:35, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 690, max_weight: 699}
								, {name: '2', time: 0, min_weight: 690, max_weight: 699}
								, {name: '3', time: 0, min_weight: 690, max_weight: 699}
								, {name: '4', time: 0, min_weight: 690, max_weight: 699}
								, {name: '5', time: 0, min_weight: 690, max_weight: 699}
								, {name: '6', time: 0, min_weight: 690, max_weight: 699}
								, {name: '7', time: 0, min_weight: 690, max_weight: 699}
								, {name: '8', time: 0, min_weight: 690, max_weight: 699}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 690, max_weight: 699}
								, {name: '2', time: 0, min_weight: 690, max_weight: 699}
								, {name: '3', time: 0, min_weight: 690, max_weight: 699}
								, {name: '4', time: 0, min_weight: 690, max_weight: 699}
								, {name: '5', time: 0, min_weight: 690, max_weight: 699}
								, {name: '6', time: 0, min_weight: 690, max_weight: 699}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S55'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W54S53: 'W55S53'
								, W55S53: 'W55S54', W55S53x:26, W56S54: 'W55S54', W55S54: 'W55S55'
								, W54S54: 'W55S54'
								, W58S54: 'W57S54', W57S54: 'W57S55', W57S55: 'W56S55', W56S55: 'W55S55'
								}
								, escape_path:
								{ W55S55: 'W56S55', W56S55: 'W57S55', W56S55y:29, W57S55: 'W57S54', W57S54: 'W58S54'
								}
							},
							W57S54:
							{ containers: {weight: 703}
							, sites:
								[ {x:24, y:37, type:STRUCTURE_CONTAINER}
								, {x:26, y:45, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 700, max_weight: 709}
								, {name: '2', time: 0, min_weight: 700, max_weight: 709}
								, {name: '3', time: 0, min_weight: 700, max_weight: 709}
								, {name: '4', time: 0, min_weight: 700, max_weight: 709}
								, {name: '5', time: 0, min_weight: 700, max_weight: 709}
								, {name: '6', time: 0, min_weight: 700, max_weight: 709}
								, {name: '7', time: 0, min_weight: 700, max_weight: 709}
								, {name: '8', time: 0, min_weight: 700, max_weight: 709}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 700, max_weight: 709}
								, {name: '2', time: 0, min_weight: 700, max_weight: 709}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 700, max_weight: 709}
								, {name: '2', time: 0, min_weight: 700, max_weight: 709}
								, {name: '3', time: 0, min_weight: 700, max_weight: 709}
								, {name: '4', time: 0, min_weight: 700, max_weight: 709}
								, {name: '5', time: 0, min_weight: 700, max_weight: 709}
								, {name: '6', time: 0, min_weight: 700, max_weight: 709}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S55'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53', W56S52x:25
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W54S53: 'W55S53', W55S53: 'W56S53', W55S53: 'W56S53'
								, W56S53: 'W56S54', W56S54: 'W57S54'
								, W58S54: 'W57S54'
								, W57S55: 'W57S54'
								}
								, escape_path:
								{ W57S54: 'W57S55'
								}
							},
							W59S53:
							{ containers: {weight: 713}
							, sites:
								[ {x:46, y:40, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 710, max_weight: 719}
								, {name: '2', time: 0, min_weight: 710, max_weight: 719}
								, {name: '3', time: 0, min_weight: 710, max_weight: 719}
								, {name: '4', time: 0, min_weight: 710, max_weight: 719}
								, {name: '5', time: 0, min_weight: 710, max_weight: 719}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 710, max_weight: 719}
								, {name: '1', time: 0, min_weight: 710, max_weight: 719}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 710, max_weight: 719}
								, {name: '2', time: 0, min_weight: 710, max_weight: 719}
								, {name: '3', time: 0, min_weight: 710, max_weight: 719}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W58S54'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53', W58S53: 'W59S53'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S54', W56S54: 'W57S54', W57S54: 'W58S54', W58S54: 'W58S53'
								, W57S56: 'W57S55', W57S55: 'W57S54'
								}
								, escape_path:
								{ W59S53: 'W58S53', W58S53: 'W58S54'
								, W56S54: 'W57S54', W57S54: 'W58S54'
								}
							},
							W58S53:
							{ containers: {weight: 723}
							, sites:
								[ {x:35, y:37, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 720, max_weight: 729}
								, {name: '2', time: 0, min_weight: 720, max_weight: 729}
								, {name: '3', time: 0, min_weight: 720, max_weight: 729}
								, {name: '4', time: 0, min_weight: 720, max_weight: 729}
								, {name: '5', time: 0, min_weight: 720, max_weight: 729}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 720, max_weight: 729}
								, {name: '1', time: 0, min_weight: 720, max_weight: 729}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 720, max_weight: 729}
								, {name: '2', time: 0, min_weight: 720, max_weight: 729}
								, {name: '3', time: 0, min_weight: 720, max_weight: 729}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S52'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53'
								, W59S53: 'W58S53'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S54', W56S54: 'W57S54', W57S54: 'W58S54', W58S54: 'W58S53'
								, W57S55: 'W57S54'
								}
								, escape_path:
								{ W59S53: 'W58S53', W58S53: 'W58S54'
								, W56S54: 'W57S54', W57S54: 'W58S54'
								}
							},
							W59S54:
							{ containers: {weight: 733}
							, sites:
								[ {x:24, y:15, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 730, max_weight: 739}
								, {name: '2', time: 0, min_weight: 730, max_weight: 739}
								, {name: '3', time: 0, min_weight: 730, max_weight: 739}
								, {name: '4', time: 0, min_weight: 730, max_weight: 739}
								, {name: '5', time: 0, min_weight: 730, max_weight: 739}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 730, max_weight: 739}
								, {name: '1', time: 0, min_weight: 730, max_weight: 739}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 730, max_weight: 739}
								, {name: '2', time: 0, min_weight: 730, max_weight: 739}
								, {name: '3', time: 0, min_weight: 730, max_weight: 739}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W58S54'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53', W57S53: 'W58S53'
								, W59S53: 'W58S53', W58S53: 'W58S54', W58S54: 'W59S54'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S54', W56S54: 'W57S54', W57S54: 'W58S54'
								, W57S56: 'W57S55', W57S55: 'W57S54'
								}
								, escape_path:
								{ W59S54: 'W58S54'
								, W58S53: 'W58S54'
								, W56S54: 'W57S54', W57S54: 'W58S54'
								}
							},
							W58S55:
							{ containers: {weight: 743}
							, sites:
								[ {x:47, y:29, type:STRUCTURE_CONTAINER}
								, {x:41, y:42, type:STRUCTURE_CONTAINER}
								, {x:42, y:41, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 740, max_weight: 749}
								, {name: '2', time: 0, min_weight: 740, max_weight: 749}
								, {name: '3', time: 0, min_weight: 740, max_weight: 749}
								, {name: '4', time: 0, min_weight: 740, max_weight: 749}
								, {name: '5', time: 0, min_weight: 740, max_weight: 749}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 740, max_weight: 749}
								, {name: '1', time: 0, min_weight: 740, max_weight: 749}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 740, max_weight: 749}
								, {name: '2', time: 0, min_weight: 740, max_weight: 749}
								, {name: '3', time: 0, min_weight: 740, max_weight: 749}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S55'}
							, path_rooms:
								{ W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W57S52', W57S52: 'W57S53'
								, W57S53: 'W58S53', W58S53: 'W58S54', W58S54: 'W58S55', W58S54x:35
								, W59S53: 'W58S53'
								, W54S51: 'W55S51', W55S51: 'W56S51'
								, W54S53: 'W55S53', W55S53: 'W56S53', W56S53: 'W56S54'
								, W56S54: 'W57S54', W57S54: 'W57S55', W57S55: 'W58S55'
								}
								, escape_path:
								{ W58S55: 'W57S55'
								, W56S54: 'W57S54', W57S54: 'W57S55'
								}
							},
							W57S56:
							{ containers: {weight: 753}
							, towers: {mw:500000, mr:500000}
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 750, max_weight: 759}
								, {name: '2', time: 0, min_weight: 750, max_weight: 759}
								, {name: '3', time: 0, min_weight: 750, max_weight: 759}
								, {name: '4', time: 0, min_weight: 750, max_weight: 759}
								, {name: '5', time: 0, min_weight: 750, max_weight: 759}
								, {name: '6', time: 0, min_weight: 750, max_weight: 759}
								, {name: '7', time: 0, min_weight: 750, max_weight: 759}
								, {name: '8', time: 0, min_weight: 750, max_weight: 759}
								, {name: '9', time: 0, min_weight: 750, max_weight: 759}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 750, max_weight: 759}
								, {name: '2', time: 0, min_weight: 750, max_weight: 759}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 750, max_weight: 759}
								, {name: '2', time: 0, min_weight: 750, max_weight: 759}
								, {name: '3', time: 0, min_weight: 750, max_weight: 759}
								, {name: '4', time: 0, min_weight: 750, max_weight: 759}
								, {name: '5', time: 0, min_weight: 750, max_weight: 759}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S56'}
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
									, W57S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53'
									, W56S53: 'W56S54', W56S54: 'W57S54', W57S54: 'W57S55'
									, W54S51: 'W55S51', W55S51: 'W56S51'
									, W54S53: 'W55S53', W55S53: 'W56S53'
									, W58S54: 'W57S54'
									, W57S52: 'W56S52', W56S52: 'W56S53'
									, W56S55: 'W57S55', W57S55: 'W57S56'
									}
								}
								, escape_path:
								{ W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W56S54', W56S54: 'W56S53', W56S53: 'W56S52'
								}
							},
							W54S57:
							{ containers: {weight: 763}
							, towers: {mw:600000, mr:600000}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 760, max_weight: 769}
								, {name: '2', time: 0, min_weight: 760, max_weight: 769}
								, {name: '3', time: 0, min_weight: 760, max_weight: 769}
								, {name: '4', time: 0, min_weight: 760, max_weight: 769}
								, {name: '5', time: 0, min_weight: 760, max_weight: 769}
								, {name: '6', time: 0, min_weight: 760, max_weight: 769}
								, {name: '7', time: 0, min_weight: 760, max_weight: 769}
								, {name: '8', time: 0, min_weight: 760, max_weight: 769}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 760, max_weight: 769}
								, {name: '2', time: 0, min_weight: 760, max_weight: 769}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 760, max_weight: 769}
								, {name: '2', time: 0, min_weight: 760, max_weight: 769}
								, {name: '3', time: 0, min_weight: 760, max_weight: 769}
								, {name: '4', time: 0, min_weight: 760, max_weight: 769}
								, {name: '5', time: 0, min_weight: 760, max_weight: 769}
								, {name: '6', time: 0, min_weight: 760, max_weight: 769}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S53', W56S52x:38, W56S53: 'W55S53', W55S53: 'W54S53'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52'
								, W56S54: 'W56S53', W56S54y:27
								, W55S55: 'W54S55', W54S55: 'W54S56', W54S56: 'W54S57', W54S56x:26
								, W57S55: 'W57S54', W57S54: 'W56S54'
								, W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54'
								, W52S54: 'W52S55', W52S55: 'W52S56', W52S56: 'W53S56', W53S56: 'W53S57', W53S57: 'W54S57'
								}
								, escape_path:
								{ W55S55: 'W54S55', W54S55: 'W54S56', W54S56: 'W54S57'
								}
							},
							W51S54:
							{ containers: {weight: 773}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ {x:18, y:11, type:STRUCTURE_CONTAINER}
								, {x:8, y:15, type:STRUCTURE_CONTAINER} 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 770, max_weight: 779}
								, {name: '2', time: 0, min_weight: 770, max_weight: 779}
								, {name: '3', time: 0, min_weight: 770, max_weight: 779}
								, {name: '4', time: 0, min_weight: 770, max_weight: 779}
								, {name: '5', time: 0, min_weight: 770, max_weight: 779}
								, {name: '6', time: 0, min_weight: 770, max_weight: 779}
								, {name: '7', time: 0, min_weight: 770, max_weight: 779}
								, {name: '8', time: 0, min_weight: 770, max_weight: 779}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 770, max_weight: 779}
								, {name: '2', time: 0, min_weight: 770, max_weight: 779}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 770, max_weight: 779}
								, {name: '2', time: 0, min_weight: 770, max_weight: 779}
								, {name: '3', time: 0, min_weight: 770, max_weight: 779}
								, {name: '4', time: 0, min_weight: 770, max_weight: 779}
								, {name: '5', time: 0, min_weight: 770, max_weight: 779}
								, {name: '6', time: 0, min_weight: 770, max_weight: 779}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53', W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W51S54'
								, W57S56: 'W57S55', W57S54: 'W56S54'
								}
								, escape_path:
								{ W51S54: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W53S54:
							{ containers: {weight: 783}
							, sites:
								[ {x:20, y:27, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 780, max_weight: 789}
								, {name: '2', time: 0, min_weight: 780, max_weight: 789}
								, {name: '3', time: 0, min_weight: 780, max_weight: 789}
								, {name: '4', time: 0, min_weight: 780, max_weight: 789}
								, {name: '5', time: 0, min_weight: 780, max_weight: 789}
								, {name: '6', time: 0, min_weight: 780, max_weight: 789}
								, {name: '7', time: 0, min_weight: 780, max_weight: 789}
								, {name: '8', time: 0, min_weight: 780, max_weight: 789}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 780, max_weight: 789}
								, {name: '2', time: 0, min_weight: 780, max_weight: 789}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 780, max_weight: 789}
								, {name: '2', time: 0, min_weight: 780, max_weight: 789}
								, {name: '3', time: 0, min_weight: 780, max_weight: 789}
								, {name: '4', time: 0, min_weight: 780, max_weight: 789}
								, {name: '5', time: 0, min_weight: 780, max_weight: 789}
								, {name: '6', time: 0, min_weight: 780, max_weight: 789}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W56S53'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53'
								, W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54'
								, W52S54: 'W53S54'
								, W57S56: 'W57S55', W57S55: 'W57S54', W57S54: 'W56S54'
								, W56S54: 'W56S53', W56S53: 'W55S53', W55S53: 'W54S53'
								, W54S53: 'W54S54', W54S53: 'W53S54'
								}
								, escape_path:
								{ W53S54: 'W54S54', W54S54: 'W54S53', W54S53: 'W55S53', W55S53: 'W56S53'
								}
							},
							W52S55:
							{ containers: {weight: 793}
							, towers: {mw:600000, mr:600000}
							, sites:
								[ {x:24, y:6, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 790, max_weight: 799}
								, {name: '2', time: 0, min_weight: 790, max_weight: 799}
								, {name: '3', time: 0, min_weight: 790, max_weight: 799}
								, {name: '4', time: 0, min_weight: 790, max_weight: 799}
								, {name: '5', time: 0, min_weight: 790, max_weight: 799}
								, {name: '6', time: 0, min_weight: 790, max_weight: 799}
								, {name: '7', time: 0, min_weight: 790, max_weight: 799}
								, {name: '8', time: 0, min_weight: 790, max_weight: 799}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 790, max_weight: 799}
								, {name: '2', time: 0, min_weight: 790, max_weight: 799}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 790, max_weight: 799}
								, {name: '2', time: 0, min_weight: 790, max_weight: 799}
								, {name: '3', time: 0, min_weight: 790, max_weight: 799}
								, {name: '4', time: 0, min_weight: 790, max_weight: 799}
								, {name: '5', time: 0, min_weight: 790, max_weight: 799}
								, {name: '6', time: 0, min_weight: 790, max_weight: 799}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53', W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W52S55'
								, W57S56: 'W57S55', W57S54: 'W56S54'
								}
								, escape_path:
								{ W52S55: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W58S56:
							{ containers: {weight: 803}
							, sites:
								[ {x:37, y:36, type:STRUCTURE_CONTAINER}
								, {x:37, y:37, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 800, max_weight: 809}
								, {name: '2', time: 0, min_weight: 800, max_weight: 809}
								, {name: '3', time: 0, min_weight: 800, max_weight: 809}
								, {name: '4', time: 0, min_weight: 800, max_weight: 809}
								, {name: '5', time: 0, min_weight: 800, max_weight: 809}
								, {name: '6', time: 0, min_weight: 800, max_weight: 809}
								, {name: '7', time: 0, min_weight: 800, max_weight: 809}
								, {name: '8', time: 0, min_weight: 800, max_weight: 809}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 800, max_weight: 809}
								, {name: '2', time: 0, min_weight: 800, max_weight: 809}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 800, max_weight: 809}
								, {name: '2', time: 0, min_weight: 800, max_weight: 809}
								, {name: '3', time: 0, min_weight: 800, max_weight: 809}
								, {name: '4', time: 0, min_weight: 800, max_weight: 809}
								, {name: '5', time: 0, min_weight: 800, max_weight: 809}
								, {name: '6', time: 0, min_weight: 800, max_weight: 809}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W57S56'}
							, path_rooms:
								{ W57S56: 'W58S56'
								}
								, escape_path:
								{ W58S56: 'W57S56'
								}
							},
							W55S57:
							{ containers: {weight: 813}
							, sites:
								[ {x:23, y:42, type:STRUCTURE_CONTAINER}
								, {x:24, y:42, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 810, max_weight: 819}
								, {name: '2', time: 0, min_weight: 810, max_weight: 819}
								, {name: '3', time: 0, min_weight: 810, max_weight: 819}
								, {name: '4', time: 0, min_weight: 810, max_weight: 819}
								, {name: '5', time: 0, min_weight: 810, max_weight: 819}
								, {name: '6', time: 0, min_weight: 810, max_weight: 819}
								, {name: '7', time: 0, min_weight: 810, max_weight: 819}
								, {name: '8', time: 0, min_weight: 810, max_weight: 819}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 810, max_weight: 819}
								, {name: '2', time: 0, min_weight: 810, max_weight: 819}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 810, max_weight: 819}
								, {name: '2', time: 0, min_weight: 810, max_weight: 819}
								, {name: '3', time: 0, min_weight: 810, max_weight: 819}
								, {name: '4', time: 0, min_weight: 810, max_weight: 819}
								, {name: '5', time: 0, min_weight: 810, max_weight: 819}
								, {name: '6', time: 0, min_weight: 810, max_weight: 819}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W54S57: 'W55S57'
								}
								, escape_path:
								{ W55S57: 'W54S57'
								}
							},
							W54S58:
							{ containers: {weight: 823}
							, sites:
								[ {x:34, y:25, type:STRUCTURE_CONTAINER}
								, {x:34, y:26, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 820, max_weight: 829}
								, {name: '2', time: 0, min_weight: 820, max_weight: 829}
								, {name: '3', time: 0, min_weight: 820, max_weight: 829}
								, {name: '4', time: 0, min_weight: 820, max_weight: 829}
								, {name: '5', time: 0, min_weight: 820, max_weight: 829}
								, {name: '6', time: 0, min_weight: 820, max_weight: 829}
								, {name: '7', time: 0, min_weight: 820, max_weight: 829}
								, {name: '8', time: 0, min_weight: 820, max_weight: 829}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 820, max_weight: 829}
								, {name: '2', time: 0, min_weight: 820, max_weight: 829}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 820, max_weight: 829}
								, {name: '2', time: 0, min_weight: 820, max_weight: 829}
								, {name: '3', time: 0, min_weight: 820, max_weight: 829}
								, {name: '4', time: 0, min_weight: 820, max_weight: 829}
								, {name: '5', time: 0, min_weight: 820, max_weight: 829}
								, {name: '6', time: 0, min_weight: 820, max_weight: 829}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W54S57: 'W54S58'
								}
								, escape_path:
								{ W54S58: 'W54S57'
								}
							},
							W53S57:
							{ containers: {weight: 833}
							, sites:
								[ {x:22, y:7, type:STRUCTURE_CONTAINER}
								, {x:23, y:7, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 830, max_weight: 839}
								, {name: '2', time: 0, min_weight: 830, max_weight: 839}
								, {name: '3', time: 0, min_weight: 830, max_weight: 839}
								, {name: '4', time: 0, min_weight: 830, max_weight: 839}
								, {name: '5', time: 0, min_weight: 830, max_weight: 839}
								, {name: '6', time: 0, min_weight: 830, max_weight: 839}
								, {name: '7', time: 0, min_weight: 830, max_weight: 839}
								, {name: '8', time: 0, min_weight: 830, max_weight: 839}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 830, max_weight: 839}
								, {name: '2', time: 0, min_weight: 830, max_weight: 839}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 830, max_weight: 839}
								, {name: '2', time: 0, min_weight: 830, max_weight: 839}
								, {name: '3', time: 0, min_weight: 830, max_weight: 839}
								, {name: '4', time: 0, min_weight: 830, max_weight: 839}
								, {name: '5', time: 0, min_weight: 830, max_weight: 839}
								, {name: '6', time: 0, min_weight: 830, max_weight: 839}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W54S57: 'W53S57'
								}
								, escape_path:
								{ W53S57: 'W54S57'
								}
							},
							W52S56:
							{ containers: {weight: 843}
							, towers: {mw:600000, mr:600000}
							, sites:
								[
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 840, max_weight: 849}
								, {name: '2', time: 0, min_weight: 840, max_weight: 849}
								, {name: '3', time: 0, min_weight: 840, max_weight: 849}
								, {name: '4', time: 0, min_weight: 840, max_weight: 849}
								, {name: '5', time: 0, min_weight: 840, max_weight: 849}
								, {name: '6', time: 0, min_weight: 840, max_weight: 849}
								, {name: '7', time: 0, min_weight: 840, max_weight: 849}
								, {name: '8', time: 0, min_weight: 840, max_weight: 849}
								]
							, claiming:
								[ {name: '1', time: 0, min_weight: 840, max_weight: 849}
								, {name: '2', time: 0, min_weight: 840, max_weight: 849}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 840, max_weight: 849}
								, {name: '2', time: 0, min_weight: 840, max_weight: 849}
								, {name: '3', time: 0, min_weight: 840, max_weight: 849}
								, {name: '4', time: 0, min_weight: 840, max_weight: 849}
								, {name: '5', time: 0, min_weight: 840, max_weight: 849}
								, {name: '6', time: 0, min_weight: 840, max_weight: 849}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W57S51: 'W56S51'
								, W57S52: 'W56S52', W57S52y:45, W56S52: 'W56S52'
								, W54S51: 'W55S51', W55S51: 'W56S51', W56S51: 'W56S52', W56S52: 'W56S53', W56S52x:25
								, W56S54: 'W56S53', W56S54y:27, W56S53: 'W55S53'
								, W55S53: 'W54S53', W54S53: 'W54S54', W54S53x:38, W54S54: 'W53S54', W53S54: 'W52S54', W52S54: 'W52S55', W52S55: 'W52S56'
								, W57S56: 'W57S55', W57S54: 'W56S54'
								}
								, escape_path:
								{ W52S56: 'W52S55', W52S55: 'W52S54', W52S54: 'W53S54', W53S54: 'W54S54', W54S54: 'W54S53', W54S54x:38, W54S53: 'W55S53'
								, W55S53: 'W56S53', W55S53y:27, W56S53: 'W56S52', W56S52: 'W57S52'
								}
							},
							W50S52:
							{ containers: {weight: 1003}
// 							, deposit: {spawnRooms: ['W55S51', 'W54S51', 'W57S51'] }
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '2', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '3', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '4', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '5', time: 0, min_weight: 1000, max_weight: 1009}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '2', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '3', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '4', time: 0, min_weight: 1000, max_weight: 1009}
								, {name: '5', time: 0, min_weight: 1000, max_weight: 1009}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W52S54: 'W51S54', W51S54: 'W50S54', W50S54: 'W50S53', W50S53: 'W50S52'
								}
								, escape_path:
								{ W50S52: 'W50S53', W50S53: 'W50S54', W50S54: 'W51S54', W51S54: 'W52S54'
								}
							},
							W52S60:
							{ containers: {weight: 1013}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '2', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '3', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '4', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '5', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '6', time: 0, min_weight: 1010, max_weight: 1019}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '2', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '3', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '4', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '5', time: 0, min_weight: 1010, max_weight: 1019}
								, {name: '6', time: 0, min_weight: 1010, max_weight: 1019}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W54S57: 'W54S58', W54S58: 'W53S58', W53S58: 'W53S59', W53S59: 'W53S60', W53S60: 'W52S60'
								}
								, escape_path:
								{ W52S60: 'W53S60', W53S60: 'W53S59', W53S59: 'W53S58', W53S58: 'W54S58', W54S58: 'W54S57'
								}
							},
							W50S55:
							{ containers: {weight: 1023}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '2', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '3', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '4', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '5', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '6', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '7', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '8', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '9', time: 0, min_weight: 1020, max_weight: 1029}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '2', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '3', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '4', time: 0, min_weight: 1020, max_weight: 1029}
								, {name: '5', time: 0, min_weight: 1020, max_weight: 1029}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W52S54: 'W51S54', W51S54: 'W50S54', W50S54: 'W50S55'
								}
								, escape_path:
								{ W50S55: 'W50S54', W50S54: 'W51S54', W51S54: 'W52S54'
								}
							},
							W49S60:
							{ containers: {weight: 1033}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '2', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '3', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '4', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '5', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '6', time: 0, min_weight: 1030, max_weight: 1039}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '2', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '3', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '4', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '5', time: 0, min_weight: 1030, max_weight: 1039}
								, {name: '6', time: 0, min_weight: 1030, max_weight: 1039}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W54S57'}
							, path_rooms:
								{ W54S57: 'W54S58', W54S58: 'W53S58', W53S58: 'W53S59', W53S59: 'W53S60', W53S60: 'W52S60'
								, W52S60: 'W51S60', W51S60: 'W50S60', W50S60: 'W49S60'
								}
								, escape_path:
								{ W49S60: 'W50S60', W50S60: 'W51S60', W51S60: 'W52S60'
								, W52S60: 'W53S60', W53S60: 'W53S59', W53S59: 'W53S58', W53S58: 'W54S58', W54S58: 'W54S57'
								}
							},
							W55S50:
							{ containers: {weight: 1043}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '2', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '3', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '4', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '5', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '6', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '7', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '8', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '9', time: 0, min_weight: 1040, max_weight: 1049}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '2', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '3', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '4', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '5', time: 0, min_weight: 1040, max_weight: 1049}
								, {name: '6', time: 0, min_weight: 1040, max_weight: 1049}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W55S51'}
							, path_rooms:
								{ W55S51: 'W55S50'
								}
								, escape_path:
								{ W55S50: 'W55S51'
								}
							},
							W50S56:
							{ containers: {weight: 1063}
							, sites:
								[ 
								]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '2', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '3', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '4', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '5', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '6', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '7', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '8', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '9', time: 0, min_weight: 1060, max_weight: 1069}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '2', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '3', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '4', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '5', time: 0, min_weight: 1060, max_weight: 1069}
								, {name: '6', time: 0, min_weight: 1060, max_weight: 1069}
								]
							, heal_room:
								{ shard: 'shard0', room: 'W52S54'}
							, path_rooms:
								{ W52S54: 'W51S54', W51S54: 'W50S54', W50S54: 'W50S55', W50S55: 'W50S56'
								}
								, escape_path:
								{ W50S56: 'W50S55', W50S55: 'W50S54', W50S54: 'W51S54', W51S54: 'W52S54'
								}
							},
							//, 
						}
					}
				,	shard1:
				 	{	defaults:
						{ containers: {weight: 5000}
						, towers: {mw:2000000,mr:2000000}
						, heal_room:
							{ shard: 'shard0', room: 'W29S29'}
						, path_rooms:
							{ W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
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
								, {name: '9', time: 0, min_weight: 5010, max_weight: 5019}
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
									, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26'
									},
								 shard3:
									{ W28S35: 'W28S34', W28S34: 'W28S33'
									, W25S33: 'W26S33', W26S33: 'W27S33', W27S33: 'W28S33'
									, W28S33: 'W28S32', W28S32: 'W29S32', W29S32: 'W30S32'
									, W30S32: 'W30S31', W30S31: 'W30S30'
									, W30S30: 'shard2'
									}
								, shard2:
									{ shard3_W30S30:'W30S30', W30S30: 'shard1'
									, W31S29: 'W30S29', W30S29: 'W30S30'}
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
									{ W58S54: 'W59S54', W59S54: 'W60S54', W60S54: 'W60S53', W60S53: 'W60S52', W60S52: 'W60S51', W60S51: 'W60S50'
									, W57S52: 'W58S52', W58S52: 'W59S52', W59S52: 'W59S51'
								  , W57S51: 'W58S51', W58S51: 'W59S51', W59S51: 'W59S50', W59S50: 'W60S50', W60S50: 'shard1'
									, W59S51: 'W60S51'
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
								, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
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
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28', W25S27: 'W25S28'
								, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
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
								, W24S27: 'W25S27'
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
								, W27S24: 'W27S25', W27S25: 'W27S26'
								, W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W25S27'
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
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
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
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
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
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
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
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
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
								, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28'
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
								, W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26'
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
							 	[ {x:10, y:29, type:STRUCTURE_CONTAINER}
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
								{ W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W28S26'
								, W26S26: 'W27S26'
								}
								, escape_path:
								{ W28S26: 'W27S26'
								}
							}, 
							W26S25:
							{ containers: {weight: 5323}
							, sites:
								[ {x:47, y:46, type:STRUCTURE_CONTAINER}
								, {x:48, y:45, type:STRUCTURE_CONTAINER}
								, {x:35, y:19, type:STRUCTURE_CONTAINER}
								, {x:36, y:18, type:STRUCTURE_CONTAINER}
								, {x:7, y:9, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
								[ {name: '0', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '1', time: 0, min_weight: 5320, max_weight: 5329}
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
								, {name: '5', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '6', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '7', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '8', time: 0, min_weight: 5320, max_weight: 5329}
								, {name: '9', time: 0, min_weight: 5320, max_weight: 5329}
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
								, W27S24: 'W27S25', W27S25: 'W26S25'
								, W25S25: 'W26S25'
								}
								, escape_path:
								{ W26S25: 'W27S25'
								, W26S24: 'W27S24', W27S24: 'W27S25'
								}
							},
							W27S24:
							{ containers: {weight: 5343}
							, sites:
							 	[
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
							W21S29:
							{ containers: {weight: 5403}
							, towers: {mw:6000000, mr:6000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '2', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '3', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '4', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '5', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '6', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '7', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '8', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '9', time: 0, min_weight: 5400, max_weight: 5409}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '2', time: 0, min_weight: 5400, max_weight: 5409}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '2', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '3', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '4', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '5', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '6', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '7', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '8', time: 0, min_weight: 5400, max_weight: 5409}
								, {name: '9', time: 0, min_weight: 5400, max_weight: 5409}
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
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S28', W20S28: 'W20S29', W20S29: 'W21S29', W21S29y:17
								}
								, escape_path:
								{ W21S29: 'W20S29', W20S29: 'W20S28', W20S28: 'W20S27', W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W21S23:
							{ containers: {weight: 5413}
							, towers: {mw:6000000, mr:6000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '2', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '3', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '4', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '5', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '6', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '7', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '8', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '9', time: 0, min_weight: 5410, max_weight: 5419}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '2', time: 0, min_weight: 5410, max_weight: 5419}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '2', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '3', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '4', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '5', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '6', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '7', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '8', time: 0, min_weight: 5410, max_weight: 5419}
								, {name: '9', time: 0, min_weight: 5410, max_weight: 5419}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25'
								, W20S25: 'W20S24', W20S24: 'W20S23', W20S23: 'W21S23'
								, W20S25: 'W21S25'
								, W21S25: 'W22S25', W22S25: 'W22S24', W22S24: 'W22S23', W22S23: 'W21S23'
								, W21S29: 'W20S29', W20S29: 'W20S28', W20S28: 'W20S27'
								}
								, escape_path:
								{ W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25'
								, W20S25: 'W20S24', W20S24: 'W20S23'
								, W20S23: 'W21S23'
								, W22S23: 'W21S23'
								, W21S22: 'W21S23'
								, W21S24: 'W21S23'
								}
							},
							W22S24:
							{ containers: {weight: 5423}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '2', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '3', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '4', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '5', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '6', time: 0, min_weight: 5420, max_weight: 5429}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '2', time: 0, min_weight: 5420, max_weight: 5429}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '2', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '3', time: 0, min_weight: 5420, max_weight: 5429}
								, {name: '4', time: 0, min_weight: 5420, max_weight: 5429}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S24'
								}
								, escape_path:
								{ W22S24: 'W22S23', W22S23: 'W21S23', W21S23: 'W20S23'
								, W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27'
								, W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W21S22:
							{ containers: {weight: 5433}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ {x:8, y:15, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '2', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '3', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '4', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '5', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '6', time: 0, min_weight: 5430, max_weight: 5439}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '2', time: 0, min_weight: 5430, max_weight: 5439}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '2', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '3', time: 0, min_weight: 5430, max_weight: 5439}
								, {name: '4', time: 0, min_weight: 5430, max_weight: 5439}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W22S21'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22'
								, W22S21: 'W22S22'
								, W22S22: 'W21S22'
								}
								, escape_path:
								{ W21S22: 'W22S22', W22S22: 'W22S21'
								}
							},
							W22S23:
							{ containers: {weight: 5443}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '2', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '3', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '4', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '5', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '6', time: 0, min_weight: 5440, max_weight: 5449}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '2', time: 0, min_weight: 5440, max_weight: 5449}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '2', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '3', time: 0, min_weight: 5440, max_weight: 5449}
								, {name: '4', time: 0, min_weight: 5440, max_weight: 5449}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S26: 'W26S26', W26S26: 'W26S27', W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24', W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23'
								}
								, escape_path:
								{ W22S23: 'W21S23', W21S23: 'W20S23'
								, W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27'
								, W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W26S24:
							{ containers: {weight: 5453}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '2', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '3', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '4', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '5', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '6', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '7', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '8', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '9', time: 0, min_weight: 5450, max_weight: 5459}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '2', time: 0, min_weight: 5450, max_weight: 5459}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '2', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '3', time: 0, min_weight: 5450, max_weight: 5459}
								, {name: '4', time: 0, min_weight: 5450, max_weight: 5459}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S24'}
							, path_rooms:
								{ W29S29: 'W28S29', W28S29: 'W27S29', W28S29y:30
								, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W26S28', W26S28: 'W26S27'
								, W29S31: 'W30S31', W30S31: 'W30S30'
								, W30S30: 'W29S30', W29S30: 'W29S29', W29S30x:32
								, W25S27: 'W26S27', W26S27: 'W26S26', W26S27x:21
								, W25S26: 'W26S26', W26S26: 'W27S26', W26S26y:21
								, W28S26: 'W27S26', W27S26: 'W27S25', W27S25: 'W27S24', W27S24: 'W26S24'
								, W24S28: 'W25S28', W25S28: 'W26S28', W25S28y:16
								, W21S28: 'W22S28', W22S28: 'W23S28', W23S28: 'W23S29'
								, W23S29: 'W24S29', W24S29: 'W24S28'
								, W24S27: 'W25S27', W25S27: 'W26S27'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28'
								}
								, escape_path:
								{ W26S24: 'W27S24', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W27S26'
								}
							},
							W30S29:
							{ containers: {weight: 5463}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '2', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '3', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '4', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '5', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '6', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '7', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '8', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '9', time: 0, min_weight: 5460, max_weight: 5469}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '2', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '3', time: 0, min_weight: 5460, max_weight: 5469}
								, {name: '4', time: 0, min_weight: 5460, max_weight: 5469}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S29'}
							, path_rooms:
								{ W29S29: 'W30S29'
								}
							, escape_path:
								{ W30S29: 'W29S29'
								}
							},
							W27S30:
							{ containers: {weight: 5473}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '2', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '3', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '4', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '5', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '6', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '7', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '8', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '9', time: 0, min_weight: 5470, max_weight: 5479}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '2', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '3', time: 0, min_weight: 5470, max_weight: 5479}
								, {name: '4', time: 0, min_weight: 5470, max_weight: 5479}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S29'}
							, path_rooms:
								{ W27S29: 'W27S30'
								}
							, escape_path:
								{ W27S30: 'W27S29'
								}
							},
							W30S31:
							{ containers: {weight: 5483}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '2', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '3', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '4', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '5', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '6', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '7', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '8', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '9', time: 0, min_weight: 5480, max_weight: 5489}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '2', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '3', time: 0, min_weight: 5480, max_weight: 5489}
								, {name: '4', time: 0, min_weight: 5480, max_weight: 5489}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S31'}
							, path_rooms:
								{ W29S31: 'W30S31'
								, W27S29: 'W28S29', W28S29: 'W29S29', W29S29: 'W29S30', W29S30: 'W30S30', W30S30: 'W30S31'
								}
							, escape_path:
								{ W30S31: 'W29S31'
								}
							},
							W20S23:
							{ containers: {weight: 5493}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '2', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '3', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '4', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '5', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '6', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '7', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '8', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '9', time: 0, min_weight: 5490, max_weight: 5499}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '2', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '3', time: 0, min_weight: 5490, max_weight: 5499}
								, {name: '4', time: 0, min_weight: 5490, max_weight: 5499}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S28'}
							, path_rooms:
								{ W21S23: 'W20S23'
								, W21S28: 'W21S27', W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24', W20S24: 'W20S23'
								}
							, escape_path:
								{ W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27', W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W25S30:
							{ containers: {weight: 5503}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '2', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '3', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '4', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '5', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '6', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '7', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '8', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '9', time: 0, min_weight: 5500, max_weight: 5509}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '2', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '3', time: 0, min_weight: 5500, max_weight: 5509}
								, {name: '4', time: 0, min_weight: 5500, max_weight: 5509}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W27S29'}
							, path_rooms:
								{ W27S29: 'W27S30', W27S30: 'W26S30', W26S30: 'W25S30'
								}
							, escape_path:
								{ W25S30: 'W26S30', W26S30: 'W27S30', W27S30: 'W27S29'
								}
							},
							W20S30:
							{ containers: {weight: 5513}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '2', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '3', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '4', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '5', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '6', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '7', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '8', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '9', time: 0, min_weight: 5510, max_weight: 5519}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '2', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '3', time: 0, min_weight: 5510, max_weight: 5519}
								, {name: '4', time: 0, min_weight: 5510, max_weight: 5519}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S29'}
							, path_rooms:
								{ W21S29: 'W20S29', W20S29: 'W20S30'
								}
							, escape_path:
								{ W20S30: 'W20S29', W20S29: 'W21S29'
								}
							},
							W30S26:
							{ containers: {weight: 5523}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '2', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '3', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '4', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '5', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '6', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '7', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '8', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '9', time: 0, min_weight: 5520, max_weight: 5529}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '2', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '3', time: 0, min_weight: 5520, max_weight: 5529}
								, {name: '4', time: 0, min_weight: 5520, max_weight: 5529}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W29S27'}
							, path_rooms:
								{ W29S27: 'W30S27', W30S27: 'W30S26'
								}
							, escape_path:
								{ W30S26: 'W30S27', W30S27: 'W29S27'
								}
							}, 
							W19S30:
							{ containers: {weight: 5533}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '2', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '3', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '4', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '5', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '6', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '7', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '8', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '9', time: 0, min_weight: 5530, max_weight: 5539}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '2', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '3', time: 0, min_weight: 5530, max_weight: 5539}
								, {name: '4', time: 0, min_weight: 5530, max_weight: 5539}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S29'}
							, path_rooms:
								{ W21S29: 'W20S29', W20S29: 'W20S30', W20S30: 'W19S30'
								}
							, escape_path:
								{ W19S30: 'W20S30', W20S30: 'W20S29', W20S29: 'W21S29'
								}
							},
							W22S30:
							{ containers: {weight: 5543}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '2', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '3', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '4', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '5', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '6', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '7', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '8', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '9', time: 0, min_weight: 5540, max_weight: 5549}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '2', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '3', time: 0, min_weight: 5540, max_weight: 5549}
								, {name: '4', time: 0, min_weight: 5540, max_weight: 5549}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S29'}
							, path_rooms:
								{ W21S29: 'W20S29', W20S29: 'W20S30', W20S30: 'W21S30', W21S30: 'W22S30'
								}
							, escape_path:
								{ W22S30: 'W21S30', W21S30: 'W20S30', W20S30: 'W20S29', W20S29: 'W21S29'
								}
							},
							W20S28:
							{ containers: {weight: 5553}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '2', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '3', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '4', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '5', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '6', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '7', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '8', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '9', time: 0, min_weight: 5550, max_weight: 5559}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '2', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '3', time: 0, min_weight: 5550, max_weight: 5559}
								, {name: '4', time: 0, min_weight: 5550, max_weight: 5559}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S29'}
							, path_rooms:
								{ W21S29: 'W20S29', W20S29: 'W20S28'
								}
							, escape_path:
								{ W20S28: 'W20S29', W20S29: 'W21S29'
								}
							},
							W23S30:
							{ containers: {weight: 5563}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '2', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '3', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '4', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '5', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '6', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '7', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '8', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '9', time: 0, min_weight: 5560, max_weight: 5569}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '2', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '3', time: 0, min_weight: 5560, max_weight: 5569}
								, {name: '4', time: 0, min_weight: 5560, max_weight: 5569}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S29'}
							, path_rooms:
								{ W21S29: 'W20S29', W20S29: 'W20S30', W20S30: 'W21S30', W21S30: 'W22S30', W22S30: 'W23S30'
								}
							, escape_path:
								{ W23S30: 'W22S30', W22S30: 'W21S30', W21S30: 'W20S30', W20S30: 'W20S29', W20S29: 'W21S29'
								}
							},
							W28S30:
							{ containers: {weight: 5573}
							, sites:
							 	[
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '2', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '3', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '4', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '5', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '6', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '7', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '8', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '9', time: 0, min_weight: 5570, max_weight: 5579}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '2', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '3', time: 0, min_weight: 5570, max_weight: 5579}
								, {name: '4', time: 0, min_weight: 5570, max_weight: 5579}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W28S29'}
							, path_rooms:
								{ W28S29: 'W28S30'
								}
							, escape_path:
								{ W28S30: 'W28S29'
								}
							},
							W22S21:
							{ containers: {weight: 5583}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '2', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '3', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '4', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '5', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '6', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '7', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '8', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '9', time: 0, min_weight: 5580, max_weight: 5589}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '2', time: 0, min_weight: 5580, max_weight: 5589}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '2', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '3', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '4', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '5', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '6', time: 0, min_weight: 5580, max_weight: 5589}
								, {name: '7', time: 0, min_weight: 5580, max_weight: 5589}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22', W22S22: 'W22S21'
								}
								, escape_path:
								{ W22S21: 'W22S22', W22S22: 'W22S23', W22S23: 'W21S23', W21S23: 'W20S23'
								, W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27'
								, W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W23S21:
							{ containers: {weight: 5593}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '2', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '3', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '4', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '5', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '6', time: 0, min_weight: 5590, max_weight: 5599}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '2', time: 0, min_weight: 5590, max_weight: 5599}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '2', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '3', time: 0, min_weight: 5590, max_weight: 5599}
								, {name: '4', time: 0, min_weight: 5590, max_weight: 5599}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22'
								, W22S22: 'W23S22', W23S22: 'W23S21'
								}
								, escape_path:
								{ W23S21: 'W23S22', W23S22: 'W22S22', W22S22: 'W22S23', W22S23: 'W21S23', W21S23: 'W20S23'
								, W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27'
								, W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W23S22:
							{ containers: {weight: 5603}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ //{x:18, y:23, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '2', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '3', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '4', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '5', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '6', time: 0, min_weight: 5600, max_weight: 5609}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '2', time: 0, min_weight: 5600, max_weight: 5609}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '2', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '3', time: 0, min_weight: 5600, max_weight: 5609}
								, {name: '4', time: 0, min_weight: 5600, max_weight: 5609}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22'
								, W22S22: 'W23S22'
								}
								, escape_path:
								{ W23S22: 'W22S22', W22S22: 'W22S23', W22S23: 'W21S23', W21S23: 'W20S23'
								, W20S23: 'W20S24', W20S24: 'W20S25', W20S25: 'W20S26', W20S26: 'W20S27'
								, W20S27: 'W21S27', W21S27: 'W21S28'
								}
							},
							W23S22:
							{ containers: {weight: 5613}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ {x:17, y:10, type:STRUCTURE_CONTAINER}
								, {x:18, y:10, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '2', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '3', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '4', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '5', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '6', time: 0, min_weight: 5610, max_weight: 5619}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '2', time: 0, min_weight: 5610, max_weight: 5619}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '2', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '3', time: 0, min_weight: 5610, max_weight: 5619}
								, {name: '4', time: 0, min_weight: 5610, max_weight: 5619}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W22S21'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22'
								, W22S21: 'W22S22', W22S22: 'W23S22'
								}
								, escape_path:
								{ W23S22: 'W22S22', W22S22: 'W22S21'
								}
							},
							W22S22:
							{ containers: {weight: 5623}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ {x:5, y:26, type:STRUCTURE_CONTAINER}
								, {x:40, y:38, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '2', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '3', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '4', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '5', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '6', time: 0, min_weight: 5620, max_weight: 5629}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '2', time: 0, min_weight: 5620, max_weight: 5629}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '2', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '3', time: 0, min_weight: 5620, max_weight: 5629}
								, {name: '4', time: 0, min_weight: 5620, max_weight: 5629}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W22S21'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S22'
								, W22S21: 'W22S22'
								}
								, escape_path:
								{ W22S22: 'W22S21'
								}
							},
							W23S24:
							{ containers: {weight: 5633}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ {x:18, y:18, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '2', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '3', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '4', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '5', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '6', time: 0, min_weight: 5630, max_weight: 5639}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '2', time: 0, min_weight: 5630, max_weight: 5639}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '2', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '3', time: 0, min_weight: 5630, max_weight: 5639}
								, {name: '4', time: 0, min_weight: 5630, max_weight: 5639}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W22S24', W22S24: 'W23S24'
								}
								, escape_path:
								{ W23S24: 'W22S24', W22S24: 'W22S23', W22S23: 'W21S23'
								}
							},
							W23S23:
							{ containers: {weight: 5643}
							, towers: {mw:2000000, mr:2000000}
							, sites:
							 	[ {x:22, y:5, type:STRUCTURE_CONTAINER}
							 	]
							, energy_harvesting:
								[ {name: '1', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '2', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '3', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '4', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '5', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '6', time: 0, min_weight: 5640, max_weight: 5649}
								]
							, claiming:
							 	[ {name: '1', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '2', time: 0, min_weight: 5640, max_weight: 5649}
								]
							, attacker:
								[ {name: '1', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '2', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '3', time: 0, min_weight: 5640, max_weight: 5649}
								, {name: '4', time: 0, min_weight: 5640, max_weight: 5649}
								]
							, heal_room:
								{ shard: 'shard1', room: 'W21S23'}
							, path_rooms:
								{ W29S31: 'W30S31', W30S31: 'W30S30', W30S30: 'W29S30'
								, W29S30: 'W29S29', W29S30x:32, W29S29: 'W28S29'
								, W28S29: 'W27S29', W28S29y:30, W27S29: 'W26S29', W27S29y:9
								, W26S29: 'W25S29', W25S29: 'W24S29'
								, W24S28: 'W24S29', W24S29: 'W23S29', W23S29: 'W23S28'
								, W23S28: 'W22S28', W22S28: 'W21S28'
								, W24S27: 'W25S27', W25S27: 'W26S27', W27S24: 'W27S25', W27S25: 'W27S26', W27S26: 'W26S26', W26S26: 'W26S27'
								, W26S27: 'W26S28', W26S28: 'W25S28', W25S28: 'W24S28'
								, W29S27: 'W28S27', W28S27: 'W27S27', W27S27: 'W27S28'
								, W27S28: 'W26S28', W26S28: 'W26S29'
								, W21S28: 'W21S27', W21S28x:38
								, W21S27: 'W20S27', W20S27: 'W20S26', W20S26: 'W20S25', W20S25: 'W20S24'
								, W20S24: 'W20S23', W20S23: 'W21S23', W21S23: 'W22S23', W22S23: 'W23S23'
								}
								, escape_path:
								{ W23S23: 'W22S23', W22S23: 'W21S23'
								}
							}
							//,
						}
					}
				,	shard2:
					{	defaults:
						{ containers: {weight: 2000}
						, towers: {mw:6000000, mr:6000000}
						, heal_room:
							{ shard: 'shard0', room: 'W19S31'}
						, path_rooms:
							{ W20S30: 'W20S31', W20S31: 'W19S31'
							}
							, escape_path:
							{ W20S30: 'W20S31', W20S31: 'W19S31'
							}
						},
						rooms:
						{ W19S31:
							{ containers: {weight: 203}
							, towers: {mw:6000000, mr:6000000}
							, energy_harvesting:
							  [ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								, {name: '4', time: 0, min_weight: 200, max_weight: 209}
								, {name: '5', time: 0, min_weight: 200, max_weight: 209}
								, {name: '6', time: 0, min_weight: 200, max_weight: 209}
								, {name: '7', time: 0, min_weight: 200, max_weight: 209}
								, {name: '8', time: 0, min_weight: 200, max_weight: 209}
								, {name: '9', time: 0, min_weight: 200, max_weight: 209}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								]
							, attacker:
							  [ {name: '0', time: 0, min_weight: 200, max_weight: 209}
								, {name: '1', time: 0, min_weight: 200, max_weight: 209}
								, {name: '2', time: 0, min_weight: 200, max_weight: 209}
								, {name: '3', time: 0, min_weight: 200, max_weight: 209}
								, {name: '4', time: 0, min_weight: 200, max_weight: 209}
								, {name: '5', time: 0, min_weight: 200, max_weight: 209}
								, {name: '6', time: 0, min_weight: 200, max_weight: 209}
								, {name: '7', time: 0, min_weight: 200, max_weight: 209}
								, {name: '8', time: 0, min_weight: 200, max_weight: 209}
								, {name: '9', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'A', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'B', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'C', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'D', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'E', time: 0, min_weight: 200, max_weight: 209}
								, {name: 'F', time: 0, min_weight: 200, max_weight: 209}
								]
							,
							heal_room: 'W19S31'
							//heal_room: 'W20S31'
							, path_rooms:
							  { shard1:
									{ W21S29: 'W20S29'
									, W21S28: 'W21S27', W21S28x:39, W21S27: 'W20S27', W20S27: 'W20S28'
									, W20S28: 'W20S29', W20S29: 'W20S30', W20S30: 'shard2'
									, W21S29: 'W20S29'
									}
								, shard2:
									{ shard1_W20S30: 'W20S30'
									, W20S30: 'W19S30', W20S30y:43
// 									, W20S30: 'W20S31', W20S31: 'W19S31'
									, W19S30: 'W19S31'
									, W20S31: 'W19S31'
									, W18S31: 'W19S31'
									}
								}
							, escape_path:
								{ shard1:
									{ W20S30: 'W20S29', W20S29: 'W21S29', W20S28: 'W20S27', W20S27: 'W21S27', W21S27: 'W21S28'
									}
								, shard2:
									{ W20S30: 'W19S30', W19S30: 'W19S31', W20S31: 'W19S31'
									}
								, W20S30: 'W19S30', W19S30: 'W19S31', W20S31: 'W19S31'
								}
							},
						  W19S30:
							{ containers: {weight: 213}
							, towers: {mw:6000000, mr:6000000}
							, energy_harvesting:
							  [ {name: '1', time: 0, min_weight: 210, max_weight: 219}
								, {name: '2', time: 0, min_weight: 210, max_weight: 219}
								, {name: '3', time: 0, min_weight: 210, max_weight: 219}
								, {name: '4', time: 0, min_weight: 210, max_weight: 219}
								, {name: '5', time: 0, min_weight: 210, max_weight: 219}
								, {name: '6', time: 0, min_weight: 210, max_weight: 219}
								, {name: '7', time: 0, min_weight: 210, max_weight: 219}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 210, max_weight: 219}
								, {name: '2', time: 0, min_weight: 210, max_weight: 219}
								]
							, attacker:
							  [ {name: '1', time: 0, min_weight: 210, max_weight: 219}
								, {name: '2', time: 0, min_weight: 210, max_weight: 219}
								, {name: '3', time: 0, min_weight: 210, max_weight: 219}
								, {name: '4', time: 0, min_weight: 210, max_weight: 219}
								, {name: '5', time: 0, min_weight: 210, max_weight: 219}
								, {name: '6', time: 0, min_weight: 210, max_weight: 219}
								, {name: '7', time: 0, min_weight: 210, max_weight: 219}
								]
							,
							heal_room: 'W19S31'
							, path_rooms:
							  { shard1:
									{ W21S29: 'W20S29'
									, W21S28: 'W21S27', W21S28x:39, W21S27: 'W20S27', W20S27: 'W20S28'
									, W20S28: 'W20S29', W20S29: 'W20S30', W20S30: 'shard2'
									, W21S29: 'W20S29'
									}
								, shard2:
									{ shard1_W20S30: 'W20S30', W20S30: 'W19S30'
									, W18S30: 'W19S30'
									, W19S31: 'W19S30'
									, W20S31: 'W20S30'
									}
								}
							, escape_path:
								{ W20S30: 'W19S30', W19S30: 'W19S31'
								, W20S31: 'W19S31'
								, W18S31: 'W19S31'
								}
							},
						  W18S31:
							{ containers: {weight: 223}
							, towers: {mw:6000000, mr:6000000}
							, energy_harvesting:
							  [ {name: '1', time: 0, min_weight: 220, max_weight: 229}
								, {name: '2', time: 0, min_weight: 220, max_weight: 229}
								, {name: '3', time: 0, min_weight: 220, max_weight: 229}
								, {name: '4', time: 0, min_weight: 220, max_weight: 229}
								, {name: '5', time: 0, min_weight: 220, max_weight: 229}
								, {name: '6', time: 0, min_weight: 220, max_weight: 229}
								, {name: '7', time: 0, min_weight: 220, max_weight: 229}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 220, max_weight: 229}
								, {name: '2', time: 0, min_weight: 220, max_weight: 229}
								]
							, attacker:
							  [ {name: '1', time: 0, min_weight: 220, max_weight: 229}
								, {name: '2', time: 0, min_weight: 220, max_weight: 229}
								, {name: '3', time: 0, min_weight: 220, max_weight: 229}
								, {name: '4', time: 0, min_weight: 220, max_weight: 229}
								, {name: '5', time: 0, min_weight: 220, max_weight: 229}
								, {name: '6', time: 0, min_weight: 220, max_weight: 229}
								, {name: '7', time: 0, min_weight: 220, max_weight: 229}
								]
							,
							heal_room: 'W19S31'
							, path_rooms:
							  { shard1:
									{ W21S29: 'W20S29'
									, W21S28: 'W21S27', W21S28x:39, W21S27: 'W20S27', W20S27: 'W20S28'
									, W20S28: 'W20S29', W20S29: 'W20S30', W20S30: 'shard2'
									, W21S29: 'W20S29'
									}
								, shard2:
									{ shard1_W20S30: 'W20S30', W20S30: 'W19S30', W20S30y:22
									, W19S30: 'W18S30', W19S30y:22
									, W18S30: 'W18S31', W18S30x:10
									, W20S31: 'W19S31', W19S31: 'W18S31'
									}
								}
							, escape_path:
								{ W18S31: 'W19S31'
								, W20S31: 'W19S31'
								, W19S30: 'W19S31'
								}
							},
						  W31S29:
							{ containers: {weight: 233}
							, towers: {mw:6000000, mr:6000000}
							, energy_harvesting:
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
							, claiming:
							  [ {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								]
							, attacker:
							  [ {name: '1', time: 0, min_weight: 230, max_weight: 239}
								, {name: '2', time: 0, min_weight: 230, max_weight: 239}
								, {name: '3', time: 0, min_weight: 230, max_weight: 239}
								, {name: '4', time: 0, min_weight: 230, max_weight: 239}
								, {name: '5', time: 0, min_weight: 230, max_weight: 239}
								, {name: '6', time: 0, min_weight: 230, max_weight: 239}
								, {name: '7', time: 0, min_weight: 230, max_weight: 239}
								]
							, heal_room: 'W31S29'
							, path_rooms:
							  { shard1:
									{ W29S29: 'W29S30', W29S30: 'W30S30', W30S30: 'shard2'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									}
								, shard2:
									{ shard1_W30S30: 'W30S30', shard3_W30S30: 'W30S30'
									, W30S30: 'W30S29', W30S30x:7
									, W30S29: 'W31S29'
									}
								, shard3:
									{ W31S28: 'W30S28', W30S28: 'W30S29'
									, W30S29: 'W30S30', W30S29x:22
									, W30S30: 'shard2'
									}
								}
							, escape_path:
								{ W30S30: 'W30S29', W30S30x:7, W30S29: 'W31S29'
								, W31S28: 'W31S29'
								}
							},
						  W31S28:
							{ containers: {weight: 243}
							, towers: {mw:6000000, mr:6000000}
							, sites:
							 	[ {x:10, y:46, type:STRUCTURE_CONTAINER}
								]
							, energy_harvesting:
							  [ {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								, {name: '4', time: 0, min_weight: 240, max_weight: 249}
								, {name: '5', time: 0, min_weight: 240, max_weight: 249}
								, {name: '6', time: 0, min_weight: 240, max_weight: 249}
								, {name: '7', time: 0, min_weight: 240, max_weight: 249}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								]
							, attacker:
							  [ {name: '1', time: 0, min_weight: 240, max_weight: 249}
								, {name: '2', time: 0, min_weight: 240, max_weight: 249}
								, {name: '3', time: 0, min_weight: 240, max_weight: 249}
								, {name: '4', time: 0, min_weight: 240, max_weight: 249}
								, {name: '5', time: 0, min_weight: 240, max_weight: 249}
								, {name: '6', time: 0, min_weight: 240, max_weight: 249}
								, {name: '7', time: 0, min_weight: 240, max_weight: 249}
								]
							, heal_room: 'W31S29'
							, path_rooms:
							  { shard1:
									{ W29S29: 'W29S30', W29S30: 'W30S30', W30S30: 'shard2'
									}
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'W30S29', W30S30x:7
									, W30S29: 'W31S29', W31S29: 'W31S28'
									}
								}
							, escape_path:
								{ W31S28: 'W31S29'
								}
							}
						 //,
						}
					}
				,	shard3:
					{	defaults:
						{ containers: {weight: 10}
						, towers: {mw:6000000, mr:6000000}
						, heal_room:
							{ shard: 'shard3', room: 'W31S28'}
						, path_rooms:
							{ W30S30: 'W30S29', W30S29: 'W30S28', W30S28: 'W31S28'
							}
							, escape_path:
							{ W30S30: 'W30S29', W30S29: 'W30S28', W30S28: 'W31S28'
							}
						},
						rooms:
						{ W31S28:
							{ containers: {weight: 13}
							, towers: {mw:6000000, mr:6000000}
							, energy_harvesting:
							  [ {name: '1', time: 0, min_weight: 10, max_weight: 19}
								, {name: '2', time: 0, min_weight: 10, max_weight: 19}
								, {name: '3', time: 0, min_weight: 10, max_weight: 19}
								, {name: '4', time: 0, min_weight: 10, max_weight: 19}
								, {name: '5', time: 0, min_weight: 10, max_weight: 19}
								, {name: '6', time: 0, min_weight: 10, max_weight: 19}
								, {name: '7', time: 0, min_weight: 10, max_weight: 19}
								, {name: '8', time: 0, min_weight: 10, max_weight: 19}
								, {name: '9', time: 0, min_weight: 10, max_weight: 19}
								]
							, claiming:
							  [ {name: '1', time: 0, min_weight: 10, max_weight: 19}
								, {name: '2', time: 0, min_weight: 10, max_weight: 19}
								]
							, attacker:
							  [ {name: '0', time: 0, min_weight: 10, max_weight: 19}
								, {name: '1', time: 0, min_weight: 10, max_weight: 19}
								, {name: '2', time: 0, min_weight: 10, max_weight: 19}
								, {name: '3', time: 0, min_weight: 10, max_weight: 19}
								, {name: '4', time: 0, min_weight: 10, max_weight: 19}
								, {name: '5', time: 0, min_weight: 10, max_weight: 19}
								, {name: '6', time: 0, min_weight: 10, max_weight: 19}
								, {name: '7', time: 0, min_weight: 10, max_weight: 19}
								, {name: '8', time: 0, min_weight: 10, max_weight: 19}
								, {name: '9', time: 0, min_weight: 10, max_weight: 19}
								]
							,
							heal_room: 'W31S28'
							, path_rooms:
							  { shard1:
									{ W29S29: 'W29S30', W29S30: 'W30S30', W30S30: 'shard2'
									, W28S29: 'W29S29', W28S30: 'W29S30'
									, W29S31: 'W30S31', W30S31: 'W30S30'
									}
								, shard2:
									{ shard1_W30S30: 'W30S30', W30S30: 'shard3'
									, W31S29: 'W30S29', W30S29: 'W30S30'
									}
								, shard3:
									{ shard2_W30S30: 'W30S30', W30S30: 'W30S29'
									, W30S29: 'W30S28', W30S28: 'W31S28'
									}
								}
							, escape_path:
								{ W30S30: 'W30S29', W30S30x:7, W30S29: 'W31S29'
								, W31S28: 'W31S29'
								}
							},
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
