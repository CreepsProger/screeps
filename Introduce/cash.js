const constants = require('main.constants');

var cash = {

	version: 5,

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
			cash_objects = entity.ids.map((id) => Game.getObjectById(id));
 			entity.time = Game.time;
 		}
		return cash_objects;
	},

	controller: {},
	getController: function(room) {
		var property = cash.initProperty(STRUCTURE_CONTROLLER,room.name);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_CONTROLLER }).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			cash.controller[room.name] = property.ids.map((id) => Game.getObjectById(id))[0];
 			property.time = Game.time;
 		}
		return cash.controller[room.name];
	},

	storage: 0,
	getStorage: function(room) {
		return cash.getRoomEntity(STRUCTURE_STORAGE+1, cash.storage, room, (room) => {
			return room.find(FIND_STRUCTURES, { filter:
				(structure) => 	structure.structureType == STRUCTURE_STORAGE }).map((obj) => obj.id);
			})[0];
	},

	containers: [],
	getContainers: function(room) {
		return cash.getRoomEntity(STRUCTURE_CONTAINER, cash.containers, room, (room) => {
			return room.find(FIND_STRUCTURES, { filter:
				(structure) => 	structure.structureType == STRUCTURE_CONTAINER }).map((obj) => obj.id);
			});
	},

	extensions: {},
	getExtensions: function(room) {
		var property = cash.initEntity(STRUCTURE_EXTENSION,room.name);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_SPAWN ||
																structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			cash.extensions[room.name] = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.extensions[room.name];
	},

	links: {},
	getLinks: function(room) {
		var property = cash.initEntity(STRUCTURE_LINK,room.name);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_LINK }).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			cash.links[room.name] = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.links[room.name];
	},

	towers: {},
	getTowers: function(room) {
		var property = cash.initEntity(STRUCTURE_TOWER,room.name);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			cash.towers[room.name] = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.towers[room.name];
	},

	all_my_towers: 0,
	getAllMyTowers: function() {
		var property = cash.initEntity(STRUCTURE_TOWER);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			cash.all_my_towers = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.all_my_towers;
	},

	storages: 0,
	getStorages: function() {
		var property = cash.initEntity(STRUCTURE_STORAGE);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
 			property.ids = _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
 		}
		if(property.time != Game.time) {
			cash.storages = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.storages;
	}

};

module.exports = cash;
