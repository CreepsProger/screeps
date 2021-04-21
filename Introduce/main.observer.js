const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const observer = {

	getConfig: function(roomName) {
		return config.getObserverConfig(roomName);
	}
	
	, rooms: {}, 
	
	getDeposit: function(roomName) {
		const od_room = observer.rooms[roomName];
		return !!od_room? od_room.deposit:undefined;
	},
	
	getInviderCore: function(roomName) {
		const od_room = observer.rooms[roomName];
		return !!od_room? od_room.inviderCore :undefined;
	},
	
	shouldSpawnForDeposit: function(roomName) {
		return !!observer.getDeposit(roomName);
	},
	
	getInviderCoreLevel: function(roomName) {
		const od_inviderCore = observer.getInviderCore(roomName);
		if (!od_inviderCore)
			return undefined;
		return od_inviderCore.obj.level;
	},

	run: function() {
		
		cash.getAllMyObservers()
				.forEach(function(o,i) {
          const o_rooms = observer.getConfig(o.room.name);
          const o_room = o_rooms[Game.time%o_rooms.length];
					const err = o.observeRoom(o_room);
					if(observer.rooms[o_room] === undefined) {
						observer.rooms[o_room] = {lst_time:Game.time+1};
					}
					observer.rooms[o_room].lst_time = Game.time+1;
					if(err == OK) {
						console.log('👀🌀! ⚠️', Math.trunc(Game.time/10000), Game.time%10000
																 , JSON.stringify({main:'observeRoom', room:o.room.name, o_room:o_room, err:err, o_rooms:o_rooms, observer:o}));
					}
		});
		
		Object.keys(observer.rooms).filter((roomName) => observer.rooms[roomName].lst_time == Game.time)
									.forEach(function(roomName,i) {
			const od_room = observer.rooms[roomName];
			const maxLastCooldown = 300;

			if(true) {
				console.log('👀', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify({main:'observeRoom', room:roomName, od_room:od_room}));
			}
			
			if(!od_room.deposit || !od_room.deposit.obj) {
				if(Game.time%101 == 1) {
					const room = Game.rooms[roomName];
					const obj = room.find(FIND_DEPOSITS)
													.filter((d) => tools.nvl(d.lastCooldown,0) < maxLastCooldown)
													.sort((l,r) => (l.ticksToDecay < 10000) ? -1:
																					(r.ticksToDecay < 10000) ? 1:0)
													.shift();
					if(!!obj) {
						od_room.deposit = {obj:obj, id:obj.id};
						od_room.deposit.timeElapsCooldown = Game.time + obj.cooldown;
						console.log('▣👀', Math.trunc(Game.time/10000), Game.time%10000
														, JSON.stringify({main:'observedRoom', roomName:roomName, deposit:od_room.deposit}));
					}
				}
			}
			else if(!!od_room.deposit.timeElapsCooldown && od_room.deposit.timeElapsCooldown <= Game.time) {
				od_room.deposit.obj = Game.getObjectById(od_room.deposit.id);
				od_room.deposit.timeElapsCooldown = Game.time + od_room.deposit.obj.cooldown;
				if(od_room.deposit.lastCooldown > maxLastCooldown) {
					od_room.deposit = undefined;
				}
				if(Game.time%100 == 1) {
					console.log('▣👀', Math.trunc(Game.time/10000), Game.time%10000
										 			, JSON.stringify({main:'observedRoom', roomName:roomName, deposit:od_room.deposit}));
				}
			}

			if(!od_room.power || !od_room.power.obj) {
				if(Game.time%101 == 2) {
					const room = Game.rooms[roomName];
					const obj = room.find(FIND_HOSTILE_STRUCTURES)
													.filter((hs) => hs.structureType == STRUCTURE_POWER_BANK &&
																					tools.nvl(hs.ticksToDecay,0) > 5000)
													.shift();
					if(!!obj) {
						od_room.power = {obj:obj, id:obj.id};
						od_room.power.timeToDecay = Game.time + obj.ticksToDecay;
						od_room.power.timeElapsCooldown = Game.time + od_room.power.obj.cooldown;
						console.log('🔴👀', Math.trunc(Game.time/10000), Game.time%10000
														, JSON.stringify({main:'observedRoom', roomName:roomName, power:od_room.power}));
					}
				}
			}
			else if(!!od_room.power.timeElapsCooldown && od_room.power.timeElapsCooldown <= Game.time) {
				od_room.power.obj = Game.getObjectById(od_room.power.id);
				od_room.power.timeToDecay = Game.time + od_room.power.obj.ticksToDecay;
				od_room.power.timeElapsCooldown = Game.time + od_room.power.obj.cooldown;
				if(od_room.power.timeToDecay < Game.time) {
					od_room.power = undefined;
				}
				if(Game.time%101 == 2) {
					console.log('🔴👀', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify({main:'observedRoom', roomName:roomName, power:od_room.power}));
				}
			}
			
			if(!od_room.inviderCore || !od_room.inviderCore.obj) {
				if(Game.time%1 == 0) {
					const room = Game.rooms[roomName];
					const obj = room.find(FIND_HOSTILE_STRUCTURES, { filter: (hs) => hs.level !== undefined} )
													.shift();
					if(!!obj) {
						od_room.inviderCore = {obj:obj, id:obj.id};
						od_room.inviderCore.timeToDecay = Game.time + obj.ticksToDecay;
						console.log('🎃👀', Math.trunc(Game.time/10000), Game.time%10000
														, JSON.stringify({main:'observedRoom', roomName:roomName, inviderCore:od_room.inviderCore }));
					}
				}
			}
			else {
				od_room.inviderCore.obj = Game.getObjectById(od_room.inviderCore.id);
				od_room.inviderCore.timeToDecay = Game.time + od_room.inviderCore.obj.ticksToDecay;
				if(od_room.inviderCore.timeToDecay < Game.time) {
					od_room.inviderCore = undefined;
				}
				if(Game.time%1 == 0) {
					console.log('🎃👀', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify({main:'observedRoom', roomName:roomName, inviderCore:od_room.inviderCore}));
				}
			}

		});
		
	}
};

module.exports = observer
