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
