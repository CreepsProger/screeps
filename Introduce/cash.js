const constants = require('main.constants');

var cash = {

	version: 10,

	initEntity: function(type, room = 'all') {
		if(!Memory.cash ||
			 !Memory.cash.version ||
				Memory.cash.version != cash.version) {
			Memory.cash = {version:cash.version};
		}
		if(!Memory.cash[type]) {
			Memory.cash[type] = {};
		}
		if(!Memory.cash[type][room]) {
			Memory.cash[type][room] = { ids:0, time:0 };
		}

		return Memory.cash[type][room];
	},

	getEntity: function(type, cash_objects, room, get_ids) {
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

	controller: {},
	getController: function(room) {
		return cash.getEntity(STRUCTURE_CONTROLLER, cash.controller, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTROLLER }).map((obj) => obj.id);
			})[0];
	},

	storage: {},
	getStorage: function(room) {
		return cash.getEntity(STRUCTURE_STORAGE, cash.storage, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_STORAGE }).map((obj) => obj.id);
			})[0];
	},

	containers: {},
	getContainers: function(room) {
		return cash.getEntity(STRUCTURE_CONTAINER, cash.containers, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_CONTAINER }).map((obj) => obj.id);
			});
	},

	pos_extensions: {},
	getPosExtensions: function(creep) {
		return cash.getEntity( STRUCTURE_EXTENSION, cash.pos_extensions
												 , creep.room.name + '-' + creep.pos.x + ',' + creep.pos.y
												 , (room) => {
			return creep.pos.findInRange(FIND_STRUCTURES, 2, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION}).map((obj) => obj.id);
			});
	},

	extensions: {},
	getExtensions: function(room) {
		return cash.getEntity(STRUCTURE_EXTENSION, cash.extensions, room, () => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_SPAWN ||
															 structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
			});
	},

	links: {},
	getLinks: function(room) {
		return cash.getEntity(STRUCTURE_LINK, cash.links, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_LINK }).map((obj) => obj.id);
			});
	},

	towers: {},
	getTowers: function(room) {
		return cash.getEntity(STRUCTURE_TOWER, cash.towers, room, (room) => {
			return room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
			});
	},

	all_my_towers: {},
	getAllMyTowers: function() {
		return cash.getEntity(STRUCTURE_TOWER, cash.all_my_towers, 'all', (room) => {
			return _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_TOWER).map((obj) => obj.id);
			 });
 	},

	all_my_storages: {},
	getStorages: function() {
		return cash.getEntity(STRUCTURE_STORAGE, cash.all_my_storages, 'all', (room) => {
 			return _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
			 });
 	}

};

module.exports = cash;
