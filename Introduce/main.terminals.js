const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {

   run: function() {
		 if(Game.time % constants.TICKS_TO_TERMINAL_SEND)
		  	return;

		 var all = cash.getAllMyTerminals();
		 var from = all.reduce((p,c) => {
			 return p.store.getUsedCapacity(RESOURCE_ENERGY) > 20000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		> (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });
		 var to = all.reduce((p,c) => {
			 return p.store.getFreeCapacity(RESOURCE_ENERGY) > 20000 &&
			 	(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 		< (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/10000
			 ? p:c;
		 });
		 var from_a = from.store.getUsedCapacity(RESOURCE_ENERGY) + from.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
		 var to_a = to.store.getUsedCapacity(RESOURCE_ENERGY) + to.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))

		 if(!!from && !!to && from_a - to_a > 20000) {
			 var v = Math.min(from_a - to_a, from.store.getUsedCapacity(RESOURCE_ENERGY));
			 var err = from.send(RESOURCE_ENERGY, v, to.pos.roomName);

	 		 console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
			 						, 'amount:', v, 'err:', err
			 						, '\nfrom:', JSON.stringify(from)
	 							 	, '\nto:', JSON.stringify(to)
	 							 	, '\nall:', JSON.stringify(all)
	 								);
		 }
	 }
};

module.exports = terminals;
