const constants = require('main.constants');

var cash = {

	initProperty: function(room,property) {
		if(!Memory.cash) {
			Memory.cash = {};
		}
		if(!Memory.cash[room]) {
			Memory.cash[room] = {};
		}
	},

	getStorages: function() {
		var obj;
		if((Game.time % constants.TICKS_TO_RESET_CASH != 0) || !Memory.cash.storages_ids) {
			Memory.cash.storages_ids = _.filter(Game.structures,
				 (structure) => !!structure.my && structure.structureType == STRUCTURE_STORAGE).map((obj) => obj.id);
				 // console.log( '🔜💡1️⃣', Math.trunc(Game.time/10000), Game.time%10000
					// 					 , 'Memory.cash.storages_ids:', JSON.stringify(Memory.cash.storages_ids)
					// 					 , 'storages:', JSON.stringify(Memory.cash.storages_ids.map((id) => Game.getObjectById(id)))
					// 				);
		}
		if(Memory.cash.storages_time != Game.time){
			Memory.cash.storages = Memory.cash.storages_ids.map((id) => Game.getObjectById(id));
			Memory.cash.storages_time = Game.time;
		}
		return Memory.cash.storages;
	},

	getObject: function(room,property) {
		var obj;
		if((Game.time % constants.TICKS_TO_RESET_CASH != 0) && !!Memory.cash && !!Memory.cash[room] && !!Memory.cash[room][property]) {
			obj = Game.getObjectById(Memory.cash[room][property]);
		}
		return obj;
	},

	setObject: function(room,property,id) {
		cash.initProperty(room,property);
		if(!!id) {
			Memory.cash[room][property] = id;
		}
	}

};

module.exports = cash;
