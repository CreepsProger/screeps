const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const observer = {

	getConfig: function(roomName) {
		return config.getObserverConfig(roomName);
	}
	
	, deposits: {}, 
	
	depositExists: function(roomName) {
		return false;
	},
	
	shouldSpawnForDeposit: function(spawn) {
		return false;
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
		
		Object.keys(observer.rooms).filter((roomName) => observer.rooms[roomName].lst_time == Game.time)
									.forEach(function(roomName,i) {
			const od_room = observer.rooms[roomName];
			const room = Game.rooms[roomName];
			if(!od_room.deposit) {
				od_room.deposit = room.find(FIND_DEPOSITS, { filter: (d) => tools.nvl(d.ticksToDecay,0) > 2000});
				od_room.deposit.timeToDecay = Game.time + od_room.deposit.ticksToDecay;
			}
			else if(od_room.deposit.timeToDecay < Game.time) {
				od_room.deposit = undefined;
			}
			if(!od_room.power) {
				od_room.power = room.find(FIND_HOSTILE_STRUCTURES, { filter: (hs) => hs.structureType == STRUCTURE_POWER_BANK});
			}
			else if(od_room.power.timeToDecay < Game.time) {
				od_room.power = undefined;
			}
			console.log('👀🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
													 , JSON.stringify({main:'observedRoom', roomName:roomName, od_room:od_room, room:room}));
		});
	}
};

module.exports = observer
