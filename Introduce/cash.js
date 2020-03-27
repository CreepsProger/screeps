const constants = require('main.constants');

var cash = {

	version: 14,

	initEntry: function(type, entry_path = 'all') {
		if(!Memory.cash ||
			 !Memory.cash.version ||
				Memory.cash.version != cash.version) {
			Memory.cash = {version:cash.version};
		}
		if(!Memory.cash[type]) {
			Memory.cash[type] = {};
		}
		const dir = entry_path+'|all'.split('|');
		const entry = dir[0];
		const subentry = dir[1];
		if(!Memory.cash[type][entry]) {
			Memory.cash[type][entry] = {};
		}
		if(!Memory.cash[type][entry][subentry]) {
			Memory.cash[type][entry][subentry] = { ids:0, time:0 };
		}

		return Memory.cash[type][entry][subentry];
	},

	getEntry: function(cash_objects, type, entry_name, get_ids) {
		var entry = cash.initEntry(type, entry_name);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || entry.time == 0) {
 			entry.ids = get_ids();
		}
		if(entry.time != Game.time) {
			cash_objects[entry_name] = entry.ids.map((id) => Game.getObjectById(id));
 			entry.time = Game.time;
 		}
		return cash_objects[entry_name];
	},

	controller: {},
	getController: function(room) {
		return cash.getEntry(cash.controller, STRUCTURE_CONTROLLER, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER }).map((obj) => obj.id);
			})[0];
	},

	storage: {},
	getStorage: function(room) {
		return cash.getEntry(cash.storage, STRUCTURE_STORAGE, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_STORAGE }).map((obj) => obj.id);
			})[0];
	},

	containers: {},
	getContainers: function(room) {
		return cash.getEntry(cash.containers, STRUCTURE_CONTAINER, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTAINER }).map((obj) => obj.id);
			});
	},

	pos_extensions: {},
	getPosExtensions: function(creep) {
		return cash.getEntry( cash.pos_extensions, STRUCTURE_EXTENSION
												 , creep.room.name + '|' + creep.pos.x + ',' + creep.pos.y
												 , () => {
			return creep.pos.findInRange(FIND_STRUCTURES, 2, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION}).map((obj) => obj.id);
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getEntry(cash.extensions, STRUCTURE_EXTENSION, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getEntry(cash.links, STRUCTURE_LINK, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LINK }).map((obj) => obj.id);
			});
	},

	towers: {},
	getTowers: function(room) {
		return cash.getEntry(cash.towers, STRUCTURE_TOWER, room.name, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
			});
	},

	all_my_towers: {},
	getAllMyTowers: function() {
		return cash.getEntry(cash.all_my_towers, STRUCTURE_TOWER, 'all', () => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER).map((obj) => obj.id);
			 });
 	},

	all_my_storages: {},
	getStorages: function() {
		return cash.getEntry(cash.all_my_storages, STRUCTURE_STORAGE, 'all', () => {
 			return _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
			 });
 	}

};

module.exports = cash;
