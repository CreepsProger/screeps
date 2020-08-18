const constants = require('main.constants');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

var terminals = {

	getAllMyTerminalsToSpread: function() {
		return cash.getAllMyTerminals().filter((t) => !!t && !!t.store && !!t.room && !!t.room.storage && !!t.room.storage.store);
	},

	shardValues:{},

	calcShardValues: function(resource) {
		const value = terminals.shardValues[resource];
		if(value === undefined || value.time < Game.time) {
			const all = terminals.getAllMyTerminalsToSpread();
			const inCreeps =  Object.keys(Game.creeps).map((n) => tools.nvl(Game.creeps[n].store[resource],0))
																								.reduce((amount,a) => amount+a,0);
			const amount = all.reduce((amount,t) => amount + terminals.getAmount(t,resource), inCreeps);
			const amountWithoutDeals = all.reduce((amount,t) => amount + terminals.getAmountWithoutDeal(t,resource), inCreeps);
			terminals.shardValues[resource] = { time:Game.time
																				, amount:amount
																				, avgAmount:Math.floor(amount/all.length)
																				, avgAmountWithoutDeals:Math.floor(amountWithoutDeals/all.length)};
		}
	},

	getShardAmount: function(resource) {
		terminals.calcShardValues(resource);
		return terminals.shardValues[resource].amount;
	},

	getShardAvgAmount: function(resource) {
		terminals.calcShardValues(resource);
		return terminals.shardValues[resource].avgAmount;
	},
	
	getShardAvgAmountWithoutDeals: function(resource) {
		terminals.calcShardValues(resource);
		return terminals.shardValues[resource].avgAmountWithoutDeals;
	},

	roomsValues:{},
	
	calcRoomsValues: function(terminal,resource) {
		const value = terminals.roomsValues[terminal.pos.roomName+resource];
		if(value === undefined || value.time < Game.time) {
			const terminalAmount = tools.nvl(terminal.store[resource],0);
			const storageAmount = tools.nvl(terminal.room.storage.store[resource],0);
			const dealAmount = tools.nvl(config.getAmountToDeal(terminal.pos.roomName,resource),0);
			const storeAmount = tools.nvl(config.getAmountToStore(terminal.pos.roomName,resource),0);
			const amount = (storageAmount < storeAmount)?
						storageAmount-storeAmount:
						terminalAmount-dealAmount + storageAmount-storeAmount;
			const amountWithoutDeal = (storageAmount < storeAmount)?
						storageAmount-storeAmount:
						terminalAmount + storageAmount-storeAmount;
			terminals.roomsValues[terminal.pos.roomName+resource] =
				{ time:Game.time
				, amount:amount
				, amountWithoutDeal:amountWithoutDeal
				, amountToStore:storeAmount
				, amountToDeal:dealAmount};
		}
	},

	getAmount: function(terminal,resource) {
		terminals.calcRoomsValues(terminal,resource);
		return terminals.roomsValues[terminal.pos.roomName+resource].amount;
	},
	
	getAmountWithoutDeal: function(terminal,resource) {
		terminals.calcRoomsValues(terminal,resource);
		return terminals.roomsValues[terminal.pos.roomName+resource].amountWithoutDeal;
	},

	getAmountToStore: function(terminal,resource) {
		terminals.calcRoomsValues(terminal,resource);
		return terminals.roomsValues[terminal.pos.roomName+resource].amountToStore;
	},

	getAmountToDeal: function(terminal,resource) {
		terminals.calcRoomsValues(terminal,resource);
		return terminals.roomsValues[terminal.pos.roomName+resource].amountToDeal;
	},

	getRoomAmount: function(creep,resource) {
		if(!creep.room.terminal ||
			 !creep.room.terminal.my ||
			 !creep.room.storage ||
			 !creep.room.storage.my)
			return 0;
		const creepRoomId = Math.floor(tools.getWeight(creep.name)/10);
		const inCreeps =  Object.keys(Game.creeps).filter((n) => Math.floor(tools.getWeight(n)/10) == creepRoomId)
																							.map((n) => tools.nvl(Game.creeps[n].store[resource],0))
																							.reduce((amount,a) => amount+a,0);
		return inCreeps + terminals.getAmount(creep.room.terminal, resource);
	},
	
	getShardMinAmount: function(resource) {
		const all = terminals.getAllMyTerminalsToSpread();
		return all.reduce((minAmount,t) => Math.min(minAmount,terminals.getAmount(t,resource)), Infinity);
	},

	getAmountAvgDiff: function(terminal,resource) {
		return terminals.getAmount(terminal,resource) - terminals.getShardAvgAmount(resource);
	},

	getStorageAmountAvgDiff: function(terminal, resource) {
		const storageAmount = tools.nvl(terminal.room.storage.store[resource],0);
		const storeAmount = terminals.getAmountToStore(terminal,resource);
		return storageAmount - storeAmount - terminals.getShardAvgAmount(resource);
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
		const resources = Object.keys(t.store).filter((k) => k != RESOURCE_ENERGY);
		if(resources.length == 0)
			return null;
		const deficit = resources.filter((r) => terminals.getStorageAmountAvgDiff(t,r) < 0);
		if(deficit.length == 0)
			return null;
		const mr = deficit.sort((l,r) => terminals.getStorageAmountAvgDiff(t,l) - terminals.getStorageAmountAvgDiff(t,r) )[0];
		const ret = {resource:mr, amount: 1-terminals.getStorageAmountAvgDiff(t,mr), avg:terminals.getShardAvgAmount(mr)};
		
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
			 !creep.room.storage.store ||
			 creep.room.terminal.store.getFreeCapacity(RESOURCE_ENERGY) < 5000)
			return null;
		
		const all = terminals.getAllMyTerminalsToSpread().filter((t) => t.store.getFreeCapacity(RESOURCE_ENERGY) > 5000);
		const t = creep.room.terminal;
		const resources = Object.keys(creep.room.storage.store).filter((k) => k != RESOURCE_ENERGY);
		if(resources.length == 0)
			return null;
		const surplus = resources.filter((r) => terminals.getStorageAmountAvgDiff(t,r) > 1);
		if(surplus.length == 0)
			return null;
		const mr = surplus.sort((l,r) => terminals.getStorageAmountAvgDiff(t,r) - terminals.getStorageAmountAvgDiff(t,l))[0];
		const ret = {resource:mr, amount:terminals.getStorageAmountAvgDiff(creep,mr)-1, avg:terminals.getShardAvgAmount(mr)};
		
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
							.sort((l,r) => terminals.getAmount(l,resource) - terminals.getAmount(r,resource));
		return (ts.length > 0)? ts[0].pos.roomName:null;
	}, 
	
	spreadResources: function() {
		const all = terminals.getAllMyTerminalsToSpread();
		all.forEach((terminal,i) => {
			const resources = Object.keys(terminal.store).filter((i) => i != RESOURCE_ENERGY);
			if(resources.length == 0)
				return;
			const surplus = resources.filter((r) => terminals.getAmountAvgDiff(terminal,r) > 0);
			if(surplus.length == 0)
				return;
			const res = surplus.sort((l,r) => terminals.getAmountAvgDiff(terminal,r) - terminals.getAmountAvgDiff(terminal,l))[0];
			const minResourceRoom = terminals.getMinResourceRoom(res,terminal.pos.roomName);
			if(!!minResourceRoom) {
				const amountToSend = Math.floor((terminals.getAmount(terminal,res) - terminals.getShardMinAmount(res))/2);
				const amount_to_send = Math.min(terminal.store[res], amountToSend);
				const sending = {from:terminal.pos.roomName, to:minResourceRoom, resource:res, amount:amount_to_send};
				const err = terminal.send(sending.resource, sending.amount, sending.to);
				if(OK != err) {
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
