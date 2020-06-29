const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var terminals = {
	getAllMyTerminalsToSpread: function() {
		return cash.getAllMyTerminals().filter((t) => !!t && !!t.store && !!t.room && !!t.room.storage && !!t.room.storage.store);
	},

	getAmount: function(terminal,resource) {
		return ((!!terminal.store[resource])? terminal.store[resource]:0)
			+ ((!!terminal.room.storage.store[resource])? terminal.room.storage.store[resource]:0);
	},

	getRoomAmount: function(creep,resource) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.storage ||
			 !creep.room.storage.my)
			return 0;
		return 0+creep.store[resource]+creep.room.terminal.store[resource]+creep.room.storage.store[resource];
	},
	
	getShardAvgAmount: function(resource) {
		const all = terminals.getAllMyTerminalsToSpread();
		const amount = all.reduce((amount,t) => amount + terminals.GetAmount(t,resource), 0);
		return Math.floor(amount/all.length);
	},
	
	getResourceToRecieve: function(creep) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.storage ||
			 !creep.room.storage.my ||
			 !creep.room.storage.store)
			return null;
		
			const all = terminals.getAllMyTerminalsToSpread();
		const t = creep.room.terminal;
		const resources = Object.keys(creep.room.storage.store).filter((k) => k != RESOURCE_ENERGY);
		if(resources.length == 0)
			return null;
		const deficit = resources.filter((r) => terminals.GetAmount(t,r) - terminals.getShardAvgAmount(r) > 100);
		if(deficit.length == 0)
			return null;
		const mr = deficit.sort((l,r) => terminals.GetAmount(t,l) - terminals.GetAmount(t,r))[0];
		const ret = {resource:mr, amount:(terminals.getShardAvgAmount(mr) - terminals.GetAmount(t,mr))};
		
// 		if(!!ret) {
// 			console.log( '✒️'
// 									, Math.trunc(Game.time/10000), Game.time%10000
// 									, JSON.stringify( { terminals:'getResourceToRecieve', creep:creep.name
// 																		, room:creep.room.name, ret:ret, surplus:surplus} ));
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
		
		const all = terminals.getAllMyTerminalsToSpread();
		const t = creep.room.terminal;
		const resources = Object.keys(creep.room.storage.store).filter((k) => k != RESOURCE_ENERGY);
		if(resources.length == 0)
			return null;
		const surplus = resources.filter((r) => terminals.GetAmount(t,r) - terminals.getShardAvgAmount(r) < 100);
		if(surplus.length == 0)
			return null;
		const mr = surplus.sort((l,r) => terminals.GetAmount(t,r) - terminals.GetAmount(t,l))[0];
		const ret = {resource:mr, amount:(terminals.GetAmount(t,mr) - terminals.getShardAvgAmount(mr))};
		
// 		if(!!ret) {
// 			console.log( '✒️'
// 									, Math.trunc(Game.time/10000), Game.time%10000
// 									, JSON.stringify( { terminals:'getResourceToSend', creep:creep.name
// 																		, room:creep.room.name, ret:ret, surplus:surplus} ));
// 		}
		return ret;
	},
	
	getMinResourceRoom: function(resource, skipRoom = '-') {
		const all = terminals.getAllMyTerminalsToSpread();
		const ts = all.filter((t) => t.pos.roomName != skipRoom)
							.sort((l,r) => terminals.GetAmount(l,resource) - terminals.GetAmount(r,resource));
		return (ts.length > 0)? ts[0].pos.roomName:null;
	}, 
	
	spreadResources: function() {
		const all = terminals.getAllMyTerminalsToSpread();
		all.forEach((terminal,i) => {
			const resources = Object.keys(terminal.store).filter((i) => i != RESOURCE_ENERGY);
			if(resources.length == 0)
				return;
			const surplus = resources.filter((r) => terminals.GetAmount(terminal,r) - terminals.getShardAvgAmount(r) > 100);
			if(surplus.length == 0)
				return;
			const res = surplus.sort((l,r) => terminals.GetAmount(terminal,r) - terminals.GetAmount(terminal,l))[0];
			const minResourceRoom = terminals.getMinResourceRoom(res,terminal.pos.roomName);
			if(!!minResourceRoom) {
				const amount_to_send = Math.min(terminal.store[res], terminals.GetAmount(terminal,res) - terminals.getShardAvgAmount(res) - 100);
				const sending = {from:terminal.pos.roomName, to:minResourceRoom, resource:res, amount:amount_to_send};
				const err = terminal.send(sending.resource, sending.amount, sending.to);
				if(true || OK == err) {
					console.log( '📲'
											, Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { terminals:'spreadResources', err:err, sending:sending} ));
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
