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
	
	shouldSpawnForDeposit: function(roomName) {
		return !!observer.getDeposit(roomName);
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
					if(err != OK) {
						console.log('👀🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
																 , JSON.stringify({main:'observeRoom', room:o.room.name, o_room:o_room, err:err, o_rooms:o_rooms, observer:o}));
					}
		});
		
		if(Game.time%25 == 1) {
			Object.keys(observer.rooms).filter((roomName) => observer.rooms[roomName].lst_time == Game.time)
									.forEach(function(roomName,i) {
				const od_room = observer.rooms[roomName];

			if(!od_room.deposit || !od_room.deposit.obj) {
				const room = Game.rooms[roomName];
				const obj = room.find(FIND_DEPOSITS)
												.filter((d) => tools.nvl(d.ticksToDecay,0) > 5000)
												.shift();
				if(!!obj) {
					od_room.deposit = {obj:obj, id:obj.id};
					od_room.deposit.timeToDecay = Game.time + obj.ticksToDecay;
					od_room.deposit.timeElapsCooldown = Game.time + obj.cooldown;
					console.log('▣👀', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify({main:'observedRoom', roomName:roomName, deposit:od_room.deposit}));
				}
			}
			else if(!!od_room.deposit.timeElapsCooldown && od_room.deposit.timeElapsCooldown <= Game.time) {
					od_room.deposit.obj = Game.getObjectById(od_room.deposit.id);
					od_room.deposit.timeToDecay = Game.time + od_room.deposit.obj.ticksToDecay;
					od_room.deposit.timeElapsCooldown = Game.time + od_room.deposit.obj.cooldown;
					if(od_room.deposit.timeToDecay < Game.time) {
						od_room.deposit = undefined;
					}
				if(Game.time%100 == 1) {
					console.log('▣👀', Math.trunc(Game.time/10000), Game.time%10000
										 			, JSON.stringify({main:'observedRoom', roomName:roomName, deposit:od_room.deposit}));
				}
			}

			if(!od_room.power || !od_room.power.obj) {
				const room = Game.rooms[roomName];
				const obj = room.find(FIND_HOSTILE_STRUCTURES)
												.filter((hs) => hs.structureType == STRUCTURE_POWER_BANK &&
																				tools.nvl(hs.ticksToDecay,0) > 5000)
												.shift();
				if(!!obj) {
					od_room.power = {obj:obj, id:obj.id};
					od_room.power.timeToDecay = Game.time + obj.ticksToDecay;
					console.log('🔴👀', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify({main:'observedRoom', roomName:roomName, power:od_room.power}));
				}
			}
			else if(Game.time%100 == 1) {
					od_room.power.obj = Game.getObjectById(od_room.power.id);
					od_room.power.timeToDecay = Game.time + od_room.power.obj.ticksToDecay;
					if(od_room.power.timeToDecay < Game.time) {
						od_room.power = undefined;
					}
					console.log('🔴👀', Math.trunc(Game.time/10000), Game.time%10000
										 			, JSON.stringify({main:'observedRoom', roomName:roomName, power:od_room.deposit}));
			}

		});
	}
};

module.exports = observer
