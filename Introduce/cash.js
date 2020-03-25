const constants = require('main.constants');

var cash = {

	initProperty: function(room, property, ids = '') {
		if(!Memory.cash) {
			Memory.cash = {};
		}
		if(!Memory.cash[room]) {
			Memory.cash[room] = {};
		}
		if(!Memory.cash[room][property]) {
			Memory.cash[room][property] = { ids:ids, time:0, objects:{} };
		}
		return Memory.cash[room][property];
	},

	getController: function(room) {
		var property = cash.initProperty(room.name,STRUCTURE_CONTROLLER);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_CONTROLLER });
		}
		if(property.time != Game.time) {
			property.objects = property.ids.map((id) => Game.getObjectById(id));
			property.time = Game.time;
		}
		return property.objects[0];
	},

	getExtensions: function(room) {
		var property = cash.initProperty(room.name,STRUCTURE_EXTENSION+2);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_SPAWN ||
																structure.structureType == STRUCTURE_EXTENSION }).map((obj) => obj.id);
		}
		if(property.time != Game.time) {
			property.objects = property.ids.map((id) => Game.getObjectById(id));
			property.time = Game.time;
		}
		return property.objects;
	},

	getTowers: function(room) {
		var property = cash.initProperty(room.name,STRUCTURE_TOWER+2);
		if(Game.time % constants.TICKS_TO_RESET_CASH == 0 || property.time == 0) {
			property.ids = room.find(FIND_STRUCTURES, {
				filter: (structure) => 	structure.structureType == STRUCTURE_TOWER }).map((obj) => obj.id);
			// console.log( 'C', Math.trunc(Game.time/10000), Game.time%10000, room.name
			// 						, 'property.ids.length:', property.ids.length
			// 				 		);
		}
		if(property.time != Game.time) {
			property.objects = property.ids.map((id) => Game.getObjectById(id));
			property.time = Game.time;
			// console.log( 'C', Math.trunc(Game.time/10000), Game.time%10000, room.name
			// 						, 'property.objects.length:', property.objects.length
			// 				 		);
		}
		return property.objects;
	},

	getStorages: function() {
		if((Game.time % constants.TICKS_TO_RESET_CASH == 0) || !Memory.cash.storages_ids) {
			Memory.cash.storages_ids = _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
				 // console.log( '🔜💡1️⃣', Math.trunc(Game.time/10000), Game.time%10000
					// 					 , 'Memory.cash.storages_ids:', JSON.stringify(Memory.cash.storages_ids)
					// 					 , 'storages:', JSON.stringify(Memory.cash.storages_ids.map((id) => Game.getObjectById(id)))
					// 				);
		}
		if(!Memory.cash.storages_time || Memory.cash.storages_time != Game.time){
			Memory.cash.storages = Memory.cash.storages_ids.map((id) => Game.getObjectById(id));
			Memory.cash.storages_time = Game.time;
		}
		return Memory.cash.storages;
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
