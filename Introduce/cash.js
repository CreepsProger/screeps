const constants = require('main.constants');
const tools = require('tools');

var cash = {

	version: 22,

	initEntry: function(type, entry_id, subentry_id) {
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

	getEntry: function(cash_objects, type, entry_path, get_ids) {
		var t = Game.cpu.getUsed();
		const entry_id = !entry_path ? 0 : !entry_path.length ? entry_path : entry_path.length > 0 ? entry_path[0]:0;
		const subentry_id = !entry_path ? 100 : !entry_path.length ? 100 : entry_path.length > 1 ? entry_path[1]:100;
		var entry = cash.initEntry(type, entry_id, subentry_id);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || entry.time == 0) {
 			entry.ids = get_ids();
		}
		if(entry.time != Game.time) {
			if(!cash_objects[entry_id]) {
				cash_objects[entry_id] = {};
			}
			cash_objects[entry_id][subentry_id] = entry.ids.map((id) => Game.getObjectById(id));
 			entry.time = Game.time;
 		}
		var objects = cash_objects[entry_id][subentry_id];
		var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
		if(dt > 0.1 || type == STRUCTURE_TOWER) {
			console.log( '💵', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt
									, '[' + type + '][' + entry_id + '][' + subentry_id + ']'
									, 'objects.length:', objects.length
								 );
		}
		return objects;
	},

	controller: {},
	getController: function(room) {
		return cash.getEntry(cash.controller, STRUCTURE_CONTROLLER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER }).map((obj) => obj.id);
			})[0];
	},

	storage: {},
	getStorage: function(room) {
		return cash.getEntry(cash.storage, STRUCTURE_STORAGE, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_STORAGE }).map((obj) => obj.id);
			})[0];
	},

	containers: {},
	getContainers: function(room) {
		return cash.getEntry(cash.containers, STRUCTURE_CONTAINER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTAINER }).map((obj) => obj.id);
			});
	},

	pos_extensions: {},
	getPosExtensions: function(creep) {
		return cash.getEntry( cash.pos_extensions, STRUCTURE_EXTENSION
												 , [tools.getRoomCode(creep.room.name),(Math.floor(creep.pos.x/5)*10 + Math. floor(creep.pos.y/5))]
												 , () => {
			return creep.pos.findInRange(FIND_STRUCTURES, 1, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION}).map((obj) => obj.id);
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getEntry(cash.extensions, STRUCTURE_EXTENSION, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getEntry(cash.links, STRUCTURE_LINK, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LINK }).map((obj) => obj.id);
			});
	},

	towers: {},
	getTowers: function(room) {
		return cash.getEntry(cash.towers, STRUCTURE_TOWER, tools.getRoomCode(room.name), () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
			});
	},

	all_my_towers: {},
	getAllMyTowers: function() {
		return cash.getEntry(cash.all_my_towers, STRUCTURE_TOWER, 0, () => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER).map((obj) => obj.id);
			 });
 	},

	all_my_storages: {},
	getStorages: function() {
		return cash.getEntry(cash.all_my_storages, STRUCTURE_STORAGE, 0, () => {
 			return _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
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
