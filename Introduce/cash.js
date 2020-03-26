const constants = require('main.constants');

var cash = {

	version: 5,

	initProperty: function(property, room = 'all', ids = '') {
		if(!Memory.cash) {
			Memory.cash = {};
		}
		if(!Memory.cash[room]) {
			Memory.cash[room] = {};
		}
		if(!Memory.cash[room][property] ||
			 !Memory.cash[room][property].ver ||
			 Memory.cash[room][property].ver != cash.version) {
			Memory.cash[room][property] = { ids:ids, time:0, ver:cash.version };
		}
		return Memory.cash[room][property];
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

	extensions: {},
	getExtensions: function(room) {
		var property = cash.initProperty(STRUCTURE_EXTENSION,room.name);
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
		var property = cash.initProperty(STRUCTURE_LINK,room.name);
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
		var property = cash.initProperty(STRUCTURE_TOWER,room.name);
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
		var property = cash.initProperty(STRUCTURE_TOWER);
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
		var property = cash.initProperty(STRUCTURE_STORAGE);
 		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
 			property.ids = _.filter(Game.structures,
 				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
 		}
		if(property.time != Game.time) {
			cash.storages = property.ids.map((id) => Game.getObjectById(id));
 			property.time = Game.time;
 		}
		return cash.storages;
	},

	getObject: function(room,property) {
		var property = cash.initProperty(room,property);
		if((Game.time % constants.TICKS_TO_RESET_CASH != 0) && property.time != 0) {
			obj = Game.getObjectById(Memory.cash[room][property]);
		}
		return obj;
	},

	setObject: function(room,property,id) {
		var property = cash.initProperty(room,property,id);
		if(!!id) {
			Memory.cash[room][property] = id;
		}
	}

};

module.exports = cash;
