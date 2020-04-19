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
			return !!p && !!c && !!p.store && !!c.store &&
							p.store.getUsedCapacity(RESOURCE_ENERGY)
							+ (!!p.room.storage && !!p.room.storage.store)? p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0
			 				> c.store.getUsedCapacity(RESOURCE_ENERGY)
							+ (!!c.room.storage && !!c.room.storage.store)? c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0
			 				? p:c;
					});
		var to = all.reduce((p,c) => {
			return !!p && !!c && !!p.store && !!c.store &&
							p.store.getUsedCapacity(RESOURCE_ENERGY)
							+ (!!p.room.storage && !!p.room.storage.store)? p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0
			 				< c.store.getUsedCapacity(RESOURCE_ENERGY)
							+ (!!c.room.storage && !!c.room.storage.store)? c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0
			 				? p:c;
					});
		var from_a = (!!from && !!from.store)? from.store.getUsedCapacity(RESOURCE_ENERGY):0
		 					 + (!!from && !!from.room && !!from.room.storage && !!from.room.storage.store)?
							   from.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0;
		var to_a   = (!!to && !!to.store)? to.store.getUsedCapacity(RESOURCE_ENERGY):0
		 					 + (!!to && !!to.room && !!to.room.storage && !!to.room.storage.store)?
							   to.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0;
		var amount = Math.floor((from_a - to_a) / all.length);
				amount = amount > constants.MIN_ENERGY_TO_TERMINAL_SEND? amount:0;
				amount = Math.min(amount,(!!from && !!from.store)?from.store.getUsedCapacity(RESOURCE_ENERGY):0-constants.MIN_TERMINAL_ENERGY);


		var values = all.map((t) => t.pos.roomName
																+ '(' + t.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '+' + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '=' + (t.store.getUsedCapacity(RESOURCE_ENERGY)
																					+t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
																+ ')');

		var value = all.reduce((p,c) => p + c.store.getUsedCapacity(RESOURCE_ENERGY)
																		 + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY),0);

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
