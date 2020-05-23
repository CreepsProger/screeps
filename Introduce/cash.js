const constants = require('main.constants');
const tools = require('tools');

var cash = {

	version: 45,
	time: 0,

	resetList:[],
	onBuilt: function(roomName, target, data) {
		const before = cash.resetList.length;
		if(!!target && target.progressTotal - target.progress < 300) {
			if(target.structureType == STRUCTURE_CONTAINER) {
				const entry = STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_CONTAINER+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			// else {
			// 	const entry = target.structureType+tools.getRoomCode(roomName);
			// 	cash.resetList.push({entry:entry, time:Game.time, id:target.id});
			// }
			if(target.structureType == STRUCTURE_ROAD) {
				const entry = STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_ROAD+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_EXTENSION) {
				const entry = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const q = Math.floor(target.pos.x/5)*10 + Math. floor(target.pos.y/5);
				const entry2 = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + q;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_LAB) {
				const entry = STRUCTURE_LAB+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_CONTROLLER) {
				const entry = STRUCTURE_CONTROLLER+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_SPAWN) {
				const entry = STRUCTURE_SPAWN+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
				const q = Math.floor(target.pos.x/5)*10 + Math. floor(target.pos.y/5);
				const entry3 = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + q;
				cash.resetList.push({entry:entry3, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_POWER_SPAWN) {
				// const entry = STRUCTURE_SPAWN+tools.getRoomCode(roomName) + 100;
				// cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
				const q = Math.floor(target.pos.x/5)*10 + Math. floor(target.pos.y/5);
				const entry3 = STRUCTURE_EXTENSION+tools.getRoomCode(roomName) + q;
				cash.resetList.push({entry:entry3, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_LINK) {
				const entry = STRUCTURE_LINK+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_STORAGE) {
				const entry = STRUCTURE_STORAGE+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_STORAGE + 0 + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_TOWER) {
				const entry = STRUCTURE_TOWER+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_TOWER + 0 + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			if(target.structureType == STRUCTURE_TERMINAL) {
				const entry = STRUCTURE_TERMINAL+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
				const entry2 = STRUCTURE_TERMINAL + 0 + 100;
				cash.resetList.push({entry:entry2, time:Game.time, id:target.id});
			}
			if(false) {
				const entry = LOOK_STRUCTURES+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:target.id});
			}
		}
		if(data.structureType == STRUCTURE_RAMPART ||
			data.structureType == STRUCTURE_WALL) {
				const entry = 'buildings'+tools.getRoomCode(roomName) + 100;
				cash.resetList.push({entry:entry, time:Game.time, id:data.targetId});
		}
		if(before < cash.resetList.length) {
			console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({cash:'onBuilt', roomName:roomName, resetList:cash.resetList}));
		}
	},

	haveToReset: function(entry) {/*
		 if(Game.shard.name == 'shard0' && entry_id == 5752 &&
		 		(	type == STRUCTURE_EXTENSION ||
		 			type == STRUCTURE_CONTAINER ||
		 			type == STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER)) {
			 console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
		 									, JSON.stringify({cash:'try haveToReset', type:type, entry_id:entry_id, resetList:cash.resetList, shard:Game.shard}))
		}*/
		if(!!cash.resetList.find((item) => item.entry == entry && item.time < Game.time && !Game.getObjectById(item.id))) {
			const newResetList = cash.resetList.filter((item) => !(item.entry == entry && item.time < Game.time && !Game.getObjectById(item.id)));
			console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({cash:'haveToReset', entry:entry, resetList:cash.resetList, newResetList:newResetList}));
      cash.resetList = newResetList;
			return true;
		}
		return false;
	},

	initEntry: function(type, entry_id, subentry_id) {
		if(!cash.time)
				cash.time = Game.time;
		if(!Memory.cash ||
			 !Memory.cash.version ||
				Memory.cash.version != cash.version) {
			Memory.cash = {version:cash.version};
		}
		if(!Memory.cash[type]) {
			Memory.cash[type] = {};
		}
		if(!Memory.cash[type][entry_id]) {
			Memory.cash[type][entry_id] = {};
		}
		if(!Memory.cash[type][entry_id][subentry_id]) {
			Memory.cash[type][entry_id][subentry_id] = { ids:0, ids_time:0};
		}

		return Memory.cash[type][entry_id][subentry_id];
	},

	getEntry: function(cash_objects, type, entry_path, get, ticksToReset = 0) {
		var t = Game.cpu.getUsed();
		const entry_id = !entry_path ? 0 : !entry_path.length ? entry_path : entry_path.length > 0 ? entry_path[0]:0;
		const subentry_id = !entry_path ? 100 : !entry_path.length ? 100 : entry_path.length > 1 ? entry_path[1]:100;
		var entry = cash.initEntry(type, entry_id, subentry_id);
 		if(Game.time - cash.time > constants.TICKS_TO_RESET_CASH)
			cash.time = Game.time;
		if(entry.ids_time < cash.time ||
			 !cash_objects[entry_id] ||
			 !cash_objects[entry_id][subentry_id] ||
			 cash_objects[entry_id][subentry_id].time < cash.time ||
			 (ticksToReset > 0 && Game.time - entry.ids_time > ticksToReset) ||
			 cash.haveToReset(type+entry_id+subentry_id)
			) {
 			entry.ids = get().map((obj) => obj.id);
			entry.ids_time = Game.time;
			if(!cash_objects[entry_id]) {
				cash_objects[entry_id] = {};
			}
			cash_objects[entry_id][subentry_id] = {dt:0, n:0, ids: entry.ids, objs: [], dn:0, time:0};
		}
		var cash_o = cash_objects[entry_id][subentry_id];
		if(true && cash_o.time != Game.time) {
			if(false && cash_o.ids.length == cash_o.objs.length) {
				cash_o.objs.forEach(function(obj,i) {
					var t = obj;
					cash_o.dn++;
					obj = Game.getObjectById(cash_o.ids[i]);
					delete t;
				});
			}
			else {
				cash_o.objs = cash_o.ids.map((id) => Game.getObjectById(id));
			}
 			cash_o.time = Game.time;
 		}
		cash_o.n++;
		cash_o.dt = Math.round((cash_o.dt + Game.cpu.getUsed() - t)*10000)/10000;
		if(Game.time % constants.TICKS_TO_CHECK_CPU == 0 && cash_o.dt/cash_o.n > 0.05 || (false && type == STRUCTURE_EXTENSION)) {
			console.log( '💵', Math.trunc(Game.time/10000), Game.time%10000
									, '[' + type + '][' + entry_id + '][' + subentry_id + ']'
									, 'dt:', cash_o.dt, 'n:', cash_o.n, 'dn:', cash_o.dn
									, 'length:', cash_o.objs.length, JSON.stringify(cash_o.objs)
								 );
		}
		return cash_o.objs;
	},

	controller: {},
	getController: function(room) {
		return cash.getEntry(cash.controller, STRUCTURE_CONTROLLER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER });
			})[0];
	},

	storage: {},
	getStorage: function(room) {
		return cash.getEntry(cash.storage, STRUCTURE_STORAGE, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_STORAGE });
			})[0];
	},

	containers: {},
	getContainers: function(room) {
		return cash.getEntry(cash.containers, STRUCTURE_CONTAINER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTAINER });
			});
	},

	labs: {},
	getLabs: function(room) {
		return cash.getEntry(cash.labs, STRUCTURE_LAB, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LAB });
			});
	},

	pos_extensions: {},
	getPosExtensions: function(creep) {
		var q = Math.floor(creep.pos.x/5)*10 + Math. floor(creep.pos.y/5);
		return cash.getEntry( cash.pos_extensions, STRUCTURE_EXTENSION
												 , [tools.getRoomCode(creep.room.name),q]
												 , () => {
			return creep.pos.findInRange(FIND_STRUCTURES, 10, {
				filter: (s) => (s.structureType == STRUCTURE_SPAWN || s.structureType == STRUCTURE_EXTENSION) &&
				 							 // q == Math.floor(s.pos.x/5)*10 + Math. floor(s.pos.y/5) &&
											 Math.abs(s.pos.x - Math.floor(creep.pos.x/5)*5 - 2) < 5 &&
											 Math.abs(s.pos.y - Math.floor(creep.pos.y/5)*5 - 2) < 5
											 });
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getEntry(cash.extensions, STRUCTURE_EXTENSION, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_POWER_SPAWN ||
															 structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION });
			});
	},

	spawns: {},
	getSpawns: function(room) {
		return cash.getEntry(cash.spawns, STRUCTURE_SPAWN, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN });
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getEntry(cash.links, STRUCTURE_LINK, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType ==
			STRUCTURE_LINK });
			});
	},

	towers: {},
	getTowers: function(room) {
		return cash.getEntry(cash.towers, STRUCTURE_TOWER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_TOWER });
			});
	},

	structers_to_repaire: {},
	getStructuresToRepaire: function(room) {
		return cash.getEntry(cash.structers_to_repaire, STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => (structure.structureType == STRUCTURE_ROAD ||
				 											structure.structureType == STRUCTURE_CONTAINER) &&
														 structure.hitsMax - structure.hits > structure.hitsMax/2 });
			}, 500);
	},

	my_buildings: {},
	getMyBuildings: function(room) {
		return cash.getEntry(cash.my_buildings, 'buildings', tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_WALL ||
				 											 structure.structureType == STRUCTURE_RAMPART ||
														   ((!!structure.my ||
																  structure.structureType == STRUCTURE_ROAD ||
																	structure.structureType == STRUCTURE_CONTAINER) &&
																structure.hitsMax - structure.hits > structure.hitsMax/2) });
			}, 500);
	},

	structures: {},
	getStructures: function(room) {
		return cash.getEntry(cash.structures, LOOK_STRUCTURES, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES);});
 	},

	sources: {},
	getSources: function(room) {
		return cash.getEntry(cash.sources, 'source', tools.getRoomCode(room.name), () => {
			return room.find(FIND_SOURCES);});
 	},

	all_my_terminals: {},
	getAllMyTerminals: function() {
		return cash.getEntry(cash.all_my_terminals, STRUCTURE_TERMINAL, 0, () => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TERMINAL);
			 });
 	},

	getTotalEnergy: function() {
		var all = cash.getAllMyTerminals();
		return all.reduce((p,c) => p + c.store.getUsedCapacity(RESOURCE_ENERGY)
																		 + (!!c.room.storage? c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0),0);
	},

	all_my_towers: {},
	getAllMyTowers: function() {
		return cash.getEntry(cash.all_my_towers, STRUCTURE_TOWER, 0, () => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER);
			 });
 	},

	all_my_storages: {},
	getStorages: function() {
		return cash.getEntry(cash.all_my_storages, STRUCTURE_STORAGE, 0, () => {
 			return _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE);
			 });
 	},

	areEmptyContainers: function(creep) {
		return cash.getContainers(creep.room).filter( (cont) => !!cont && cont.store.getUsedCapacity(RESOURCE_ENERGY) > 0).length == 0;
	},

	areFullContainers: function(creep) {
		return cash.getContainers(creep.room).filter( (cont) => !!cont && cont.store.getFreeCapacity() > 0).length == 0;
	},

	areEmptySources: function(creep) {
		const sources = cash.getSources(creep.room).filter((source) => {
				return source.energy > 0  &&
					(!source.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0 ||
						(!!DP2 && DP2.pos.roomName == this_room && DP2.pos.getRangeTo(source) <= 5));
			 });
		return sources.length == 0;
	},

	areEmptySourcesByPath: function(creep) {
		if(cash.areEmptySources(creep))
			 return true;

		const source = creep.pos.findClosestByPath(FIND_SOURCES, {
					 filter: function(source) { return source.energy > 0;}});

		return !source;
	},

	renewCreep: function(creep) {
		var spawns = cash.getSpawns(creep.room);
		if(spawns.length > 0 && (creep.ticksToLive < 1000 || (creep.memory.renewing && creep.ticksToLive < 1400))) {
			var spawn = spawns.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
			if(creep.pos.getRangeTo(spawn) == 1) {
				spawn.renewCreep(creep);
				creep.memory.renewing = true;
			}
		}
		else {
			creep.memory.renewing = false;
		}
	}
};

module.exports = cash;
