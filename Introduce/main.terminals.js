const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {

	run: function() {
		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000);
		 	if(Game.time % constants.TICKS_TO_TERMINAL_SEND)
		 		return;

		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000);

		var all = cash.getAllMyTerminals();
		var from = all.reduce((p,c) => {
			return p.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_ENERGY_TO_TERMINAL_SEND &&
			 			(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/constants.MIN_ENERGY_TO_TERMINAL_SEND
			 			> (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/constants.MIN_ENERGY_TO_TERMINAL_SEND
			 			? p:c;
					});
		var to = all.reduce((p,c) => {
			return p.store.getFreeCapacity(RESOURCE_ENERGY) > constants.MIN_ENERGY_TO_TERMINAL_SEND &&
			 			(p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/constants.MIN_ENERGY_TO_TERMINAL_SEND
			 			< (c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))/constants.MIN_ENERGY_TO_TERMINAL_SEND
			 			? p:c;
					});
		var from_a = from.store.getUsedCapacity(RESOURCE_ENERGY) + from.room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
		var to_a = to.store.getUsedCapacity(RESOURCE_ENERGY) + to.room.storage.store.getUsedCapacity(RESOURCE_ENERGY);

	 	if(!!from && !!to && from_a - to_a > constants.MIN_ENERGY_TO_TERMINAL_SEND) {
			var before = all.map((t) => t.pos.roomName
			 														+ '(' + t.store.getUsedCapacity(RESOURCE_ENERGY)
				 											 		+ '+' + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
															 		+ '=' + (t.store.getUsedCapacity(RESOURCE_ENERGY)
														 								+t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
															 		+ ')');
			var v = Math.min(from_a - to_a, from.store.getUsedCapacity(RESOURCE_ENERGY));
			var err = from.send(RESOURCE_ENERGY, v, to.pos.roomName);
			var after = all.map((t) => t.pos.roomName
			 														+ '(' + t.store.getUsedCapacity(RESOURCE_ENERGY)
				 											 		+ '+' + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
															 		+ '=' + (t.store.getUsedCapacity(RESOURCE_ENERGY)
														 								+t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
															 		+ ')');

	 		console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
								 , '\namount:', v, 'err:', err
								 , '\nbefore:', before
								 , '\nafter:', after
			 					 , '\nfrom:', from.pos.roomName, JSON.stringify(from)
	 							 , '\nto:', to.pos.roomName, JSON.stringify(to)
	 							 , '\nall:', JSON.stringify(all)
	 							 );
		 }
	 }
};

module.exports = terminals;
