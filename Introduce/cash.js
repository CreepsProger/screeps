const constants = require('main.constants');
const tools = require('tools');

var cash = {

	version: 33,
	time: 0,

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
			Memory.cash[type][entry_id][subentry_id] = { ids:0, time:0 };
		}

		return Memory.cash[type][entry_id][subentry_id];
	},

	getEntry: function(cash_objects, type, entry_path, get) {
		var t = Game.cpu.getUsed();
		const entry_id = !entry_path ? 0 : !entry_path.length ? entry_path : entry_path.length > 0 ? entry_path[0]:0;
		const subentry_id = !entry_path ? 100 : !entry_path.length ? 100 : entry_path.length > 1 ? entry_path[1]:100;
		var entry = cash.initEntry(type, entry_id, subentry_id);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0)
			cash.time = Game.time;
		if(entry.time == 0 || entry.time < cash.time || !cash_objects[entry_id] || !cash_objects[entry_id][subentry_id]) {
 			entry.ids = get().map((obj) => obj.id);
			if(!cash_objects[entry_id]) {
				cash_objects[entry_id] = {};
			}
			cash_objects[entry_id][subentry_id] = {dt:0, n:0, ids: entry.ids, objs: []};
		}
		var cash_o = cash_objects[entry_id][subentry_id];
		if(true && entry.time != Game.time) {
			cash_o.objs = cash_o.ids.map((id) => Game.getObjectById(id));
 			entry.time = Game.time;
 		}
		cash_o.n++;
		cash_o.dt = Math.round((cash_o.dt + Game.cpu.getUsed() - t)*10000)/10000;
		if(Game.time % constants.TICKS_TO_CHECK_CPU == 0 && cash_o.dt/cash_o.n > 0.1 || (false && type == STRUCTURE_EXTENSION)) {
			console.log( '💵', Math.trunc(Game.time/10000), Game.time%10000
									, '[' + type + '][' + entry_id + '][' + subentry_id + ']'
									, 'dt:', cash_o.dt, 'n:', cash_o.n
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
				filter: (structure) => (structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION) && q == Math.floor(structure.pos.x/5)*10 + Math. floor(structure.pos.y/5)});
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getEntry(cash.extensions, STRUCTURE_EXTENSION, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION });
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getEntry(cash.links, STRUCTURE_LINK, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LINK });
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
				filter: (structure) => structure.structureType == STRUCTURE_ROAD ||
				 											structure.structureType == STRUCTURE_CONTAINER });
			});
	},

	all_my_terminals: {},
	getAllMyTerminals: function() {
		return cash.getEntry(cash.all_my_terminals, STRUCTURE_TERMINAL, 0, () => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TERMINAL);
			 });
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
	}

};

module.exports = cash;
