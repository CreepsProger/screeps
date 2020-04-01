const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {

   run: function() {

		 var target;

		 var all = cash.getAllMyTerminals();
		 var from = all.reduce((p,c) => {
			 p.store.getUsedCapacity(RESOURCE_ENERGY) > 10000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		> (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });
		 var to = all.reduce((p,c) => {
			 p.store.getFreeCapacity(RESOURCE_ENERGY) > 10000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		< (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });
		 if(!!from && !!to) {
			 from.send(to);
		 }
	 }
};

module.exports = terminals;
