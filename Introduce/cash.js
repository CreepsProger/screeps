const constants = require('main.constants');

var cash = {

	version: 7,

	initEntity: function(type, room = 'all') {
		if(!Memory.cash) {
			Memory.cash = {};
		}
		if(!Memory.cash[room]) {
			Memory.cash[room] = {};
		}
		if(!Memory.cash[room][type] ||
			 !Memory.cash[room][type].ver ||
			 Memory.cash[room][type].ver != cash.version) {
			Memory.cash[room][type] = { ids:0, time:0, ver:cash.version };
		}
		return Memory.cash[room][type];
	},

	getRoomEntity: function(type, cash_objects, room, get_ids) {
		var entity = cash.initEntity(type, room.name);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || entity.time == 0) {
 			entity.ids = get_ids(room);
		}
		if(entity.time != Game.time) {
			cash_objects[room.name] = entity.ids.map((id) => Game.getObjectById(id));
 			entity.time = Game.time;
 		}
		return cash_objects[room.name];
	},

	controller: 0,
	getController: function(room) {
		return cash.getRoomEntity(STRUCTURE_CONTROLLER+1, cash.controller, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER }).map((obj) => obj.id);
			})[0];
	},

	storage: 0,
	getStorage: function(room) {
		return cash.getRoomEntity(STRUCTURE_STORAGE+1, cash.storage, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_STORAGE }).map((obj) => obj.id);
			})[0];
	},

	containers: {},
	getContainers: function(room) {
		return cash.getRoomEntity(STRUCTURE_CONTAINER, cash.containers, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTAINER }).map((obj) => obj.id);
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getRoomEntity(STRUCTURE_EXTENSION, cash.extensions, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getRoomEntity(STRUCTURE_LINK, cash.links, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LINK }).map((obj) => obj.id);
			});
	},

	towers: {},
	getTowers: function(room) {
		return cash.getRoomEntity(STRUCTURE_TOWER, cash.towers, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
			});
	},

	all_my_towers: {},
	getAllMyTowers: function() {
		return cash.getRoomEntity(STRUCTURE_TOWER+2, cash.all_my_towers, 'all', (room) => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER).map((obj) => obj.id);
			 });
 	},

	all_my_storages: {},
	getStorages: function() {
		return cash.getRoomEntity(STRUCTURE_STORAGE+2, cash.all_my_storages, 'all', (room) => {
 			return _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
			 });
 	}

};

module.exports = cash;
