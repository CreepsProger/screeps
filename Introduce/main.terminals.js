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
			return p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
			 				> c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
			 				? p:c;
					});
		var to = all.reduce((p,c) => {
			return p.store.getUsedCapacity(RESOURCE_ENERGY) + p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
			 				< c.store.getUsedCapacity(RESOURCE_ENERGY) + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
			 				? p:c;
					});
		var from_a = from.store.getUsedCapacity(RESOURCE_ENERGY) + from.room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
		var to_a = to.store.getUsedCapacity(RESOURCE_ENERGY) + to.room.storage.store.getUsedCapacity(RESOURCE_ENERGY);
		var amount = Math.floor((from_a - to_a) / 2);
				amount = Math.min(amount,from.store.getUsedCapacity(RESOURCE_ENERGY)-constants.MIN_TERMINAL_ENERGY);
				amount = Math.max(amount,constants.MIN_ENERGY_TO_TERMINAL_SEND);

		var values = all.map((t) => t.pos.roomName
																+ '(' + t.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '+' + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '=' + (t.store.getUsedCapacity(RESOURCE_ENERGY)
																					+t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
																+ ')');

		var value = all.reduce((t) => p + t.store.getUsedCapacity(RESOURCE_ENERGY)
																		 + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY),0);

		var cost = Game.market.calcTransactionCost(amount, from.pos.roomName, to.pos.roomName);
		console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
							 , 'amount:', amount, 'cost:', cost, from.pos.roomName, '->', to.pos.roomName
							 , '\nvalues:', values, '=', value
						 	 );

	 	if(	!!from && !!to &&
			 	amount >= constants.MIN_ENERGY_TO_TERMINAL_SEND &&
		  	from.store.getUsedCapacity(RESOURCE_ENERGY) >= amount + constants.MIN_TERMINAL_ENERGY) {

			var err = from.send(RESOURCE_ENERGY, amount, to.pos.roomName);

	 		console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
								 , '\namount:', amount, 'cost:', cost, 'err:', err
								 , '\nvalues:', values
			 					 , '\nfrom:', from.pos.roomName, JSON.stringify(from)
	 							 , '\nto:', to.pos.roomName, JSON.stringify(to)
	 							 );
		 }
	 }
};

module.exports = terminals;
