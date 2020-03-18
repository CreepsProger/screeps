const constants = require('main.constants');

var cash = {

	initProperty: function(room,property) {
		if(!Memory.cash) {
			Memory.cash = {};
		}
		if(!Memory.cash[my_room]) {
			Memory.cash[my_room] = {};
		}
	},

	getObject: function(room,property) {
		var obj;
		if(!!Memory.cash && !!Memory.cash[my_room] && !!Memory.cash[room][property]) {
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

module.exports = tools;
