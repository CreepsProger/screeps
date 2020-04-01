const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {

   run: function() {
		 if(Game.time % constants.TICKS_TO_TERMINAL_SEND)
		  	return;

		 var all = cash.getAllMyTerminals();
		 var from = all.reduce((p,c) => {
			 return p.store.getUsedCapacity(RESOURCE_ENERGY) > 10000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		> (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });
		 var to = all.reduce((p,c) => {
			 return p.store.getFreeCapacity(RESOURCE_ENERGY) > 10000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		< (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });

		 console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
							 , '\nfrom:', JSON.stringify(from)
							 , '\nto:', JSON.stringify(to)
							 , '\nall:', JSON.stringify(all)
							);

		 if(!!from && !!to) {
			 from.send(RESOURCE_ENERGY,from.store.getUsedCapacity(RESOURCE_ENERGY) - 10000,to);
		 }
	 }
};

module.exports = terminals;
