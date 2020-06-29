const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {
//getShardAvgAmount(resource) + constants.MIN_RESOURCE_TO_TERMINAL_SEND < terminals.getRoomAmount(creep,resource
	getRoomAmount: function(creep,resource) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.storage ||
			 !creep.room.storage.my)
			return 0;
		return creep.room.terminal.store[resource]+creep.room.storage.store[resource];
	},
	
	getShardAvgAmount: function(resource) {
		const all = cash.getAllMyTerminals();
		const amount = all.reduce((amount,t) => amount
															+ ((!!t && !!t.store && !!t.store[resource])? t.store[resource]:0)
															+ ((!!t && !!t.room && !!t.room.storage && !!t.room.storage.store && !!t.room.storage.store[resource])? t.room.storage.store[resource]:0)
															, 0);
		return Math.floor(amount/all.length);
	},
	
	getResourceToRecieve: function(creep) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.storage ||
			 !creep.room.storage.my)
			return null;
		
		const all = cash.getAllMyTerminals();
		const resources = Object.keys(creep.room.terminal.store).filter((k) => k != RESOURCE_ENERGY).map((resource) => {
			const amount = all.filter((t) => !!t && !!t.store && !!t.room && !!t.room.storage && !!t.room.storage.store)
												.reduce((amount,t) => amount
																+ ((!!t.store[resource])? t.store[resource]:0)
																+ ((!!t.room.storage.store[resource])? t.room.storage.store[resource]:0)
																, 0);
			const my_amount = creep.room.terminal.store[resource] + creep.room.storage.store[resource];
			return {resource:resource, amount:amount, my_amount:my_amount};
		}).filter((r) => r.my_amount < Math.floor(r.amount/all.length)).sort((l,r) => l.my_amount - r.my_amount);
		if(resources.length == 0)
			return null;
		const min_res = resources[0];
		const ret = {resource:min_res.resource, amount:min_res.my_amount};
		
// 		if(!!ret) {
// 			console.log( '✒️'
// 									, Math.trunc(Game.time/10000), Game.time%10000
// 									, JSON.stringify( { terminals:'getResourceToRecieve', creep:creep.name, room:creep.room.name
// 																		, ret:ret, min_res:min_res
// 																		, resources:resources} ));
// 		}
		return ret;
	},
	
	getResourceToSend: function(creep) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.terminal.store ||
			 !creep.room.storage ||
			 !creep.room.storage.my ||
			 !creep.room.storage.store)
			return null;
		
		const all = cash.getAllMyTerminals();
		const resources = Object.keys(creep.room.storage.store).filter((k) => k != RESOURCE_ENERGY).map((resource) => {
			const amount = all.filter((t) => !!t && !!t.store && !!t.room && !!t.room.storage && !!t.room.storage.store)
												.reduce((amount,t) => amount
																+ ((!!t.store[resource])? t.store[resource]:0)
																+ ((!!t.room.storage.store[resource])? t.room.storage.store[resource]:0)
																, 0);
			const my_amount = creep.room.terminal.store[resource] + creep.room.storage.store[resource];
			return {resource:resource, amount:amount, my_amount:my_amount};
		}).filter((r) => r.my_amount > Math.floor(r.amount/all.length) + constants.MIN_TO_TERMINAL_SEND).sort((l,r) => r.my_amount - l.my_amount);
		if(resources.length == 0)
			return null;
		const max_res = resources[0];
		const ret = {resource:max_res.resource, amount:max_res.my_amount};
		
// 		if(!!ret) {
// 			console.log( '✒️'
// 									, Math.trunc(Game.time/10000), Game.time%10000
// 									, JSON.stringify( { terminals:'getResourceToSend', creep:creep.name, room:creep.room.name
// 																		, ret:ret, max_res:max_res
// 																		, resources:resources} ));
// 		}
		return ret;
	},
	
	getMinResourceRoom: function(resource, skipRoom = '-') {
		const all = cash.getAllMyTerminals();
		return all.filter((t) => !!t && !!t.store && !!t.room && !!t.room.storage && !!t.room.storage.store && t.pos.roomName != skipRoom)
		.sort((l,r) => {
			const l_amount = ((!!l.store[resource])? l.store[resource]:0) + ((!!l.room.storage.store[resource])? l.room.storage.store[resource]:0);
			const r_amount = ((!!r.store[resource])? r.store[resource]:0) + ((!!r.room.storage.store[resource])? r.room.storage.store[resource]:0);
			return l_amount - r_amount;
		})[0].pos.roomName;
	}, 
	
	spreadResources: function() {
		const all = cash.getAllMyTerminals();
		all.forEach((terminal,i) => {
			if(!!terminal &&
				 !!terminal.store &&
				 !!terminal.room &&
				 !!terminal.room.storage &&
				 !!terminal.room.storage.store ) {
				const resources = Object.keys(terminal.store).filter((i) => i != RESOURCE_ENERGY);
				if(resources.length == 0)
					return;
				const res = resources.sort((l,r) => terminal.store[r]+terminal.room.storage.store[r] - terminal.store[l] - terminal.room.storage.store[l])[0];
				const minResourceRoom = terminals.getMinResourceRoom(res,terminal.pos.roomName);
				if(!!minResourceRoom) {
					const amount_to_send = Math.min(terminal.store[res], terminal.store[res]+terminal.room.storage.store[res]-terminals.getShardAvgAmount(res));
					const sending = {from:terminal.pos.roomName, to:minResourceRoom, resource:res, amount:amount_to_send};
					const err = terminal.send(sending.resource, sending.amount, sending.to);
					if(true || OK == err) {
						console.log( '📲'
												, Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { terminals:'spreadResources', err:err, sending:sending} ));
					}
				}
			}
		});
	},
	
	run: function() {
		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000);
		if(Game.time % constants.TICKS_TO_TERMINAL_SEND == 1)
			return terminals.spreadResources();
		if(Game.time % constants.TICKS_TO_TERMINAL_SEND != 0) 
			return;

		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000);

		var all = cash.getAllMyTerminals();
		if(!all || all.length == 0)
		 	return;
		var from = all.reduce((p,c) => {
			return (
								(	(!!p && !!p.store)? p.store.getUsedCapacity(RESOURCE_ENERGY):0)
								+
								( (!!p && !!p.room && !!p.room.storage && !!p.room.storage.store)? p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0)
			 				>
								(	(!!c && !!c.store)? c.store.getUsedCapacity(RESOURCE_ENERGY):0)
								+
								( (!!c && !!c.room && !!c.room.storage && !!c.room.storage.store)? c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0)
						  )
			 				? p:c;
					});
		if(!from)
			return;
		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
		// 					 , 'from:', JSON.stringify(from)
		// 				 	 );
		var to = all.reduce((p,c) => {
			return (
								(	(!!p && !!p.store)? p.store.getUsedCapacity(RESOURCE_ENERGY):0)
								+
								( (!!p && !!p.room && !!p.room.storage && !!p.room.storage.store)? p.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0)
			 				<
								(	(!!c && !!c.store)? c.store.getUsedCapacity(RESOURCE_ENERGY):0)
								+
								( (!!c && !!c.room && !!c.room.storage && !!c.room.storage.store)? c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0)
						  )
			 				? p:c;
					});
		if(!to)
			return;
		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
		// 					 , 'to:', JSON.stringify(to)
		// 				 	 );
		var from_a = ((!!from && !!from.store)? from.store.getUsedCapacity(RESOURCE_ENERGY):0)
		 					 + ((!!from && !!from.room && !!from.room.storage && !!from.room.storage.store)?
							   from.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0);
		var to_a   = ((!!to && !!to.store)? to.store.getUsedCapacity(RESOURCE_ENERGY):0)
		 					 + ((!!to && !!to.room && !!to.room.storage && !!to.room.storage.store)?
							   to.room.storage.store.getUsedCapacity(RESOURCE_ENERGY):0);
		// console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
		// 								 , 'from_a:', JSON.stringify(from_a)
		// 								 , 'to_a:', JSON.stringify(to_a)
		// 				 	 );
		var amount = Math.floor((from_a - to_a) / all.length);
				amount = amount > constants.MIN_ENERGY_TO_TERMINAL_SEND? amount:0;
				amount = Math.min(amount,((!!from && !!from.store)?from.store.getUsedCapacity(RESOURCE_ENERGY):0)-constants.MIN_TERMINAL_ENERGY);
        amount = amount < constants.MAX_ENERGY_TO_TERMINAL_SEND? amount:constants.MAX_ENERGY_TO_TERMINAL_SEND;

		var values = all.map((t) => t.pos.roomName
																+ '(' + t.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '+' + t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY)
																+ '=' + (t.store.getUsedCapacity(RESOURCE_ENERGY)
																					+t.room.storage.store.getUsedCapacity(RESOURCE_ENERGY))
																+ ')\n');

		var value = all.reduce((p,c) => p + c.store.getUsedCapacity(RESOURCE_ENERGY)
																		 + c.room.storage.store.getUsedCapacity(RESOURCE_ENERGY),0);

		var cost = Game.market.calcTransactionCost(amount, from.pos.roomName, to.pos.roomName);
		console.log( '📲', Math.trunc(Game.time/10000), Game.time%10000
							 , 'amount:', amount, 'cost:', cost
							 , from.pos.roomName+'('+from_a+')', '->', to.pos.roomName+'('+to_a+')'
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
