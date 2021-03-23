const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const observer = {

	getConfig: function(roomName) {
		return config.getObserverConfig(roomName);
	},

	run: function() {
		
		cash.getAllMyObservers()
				.forEach(function(observer,i) {
          const o_rooms = observer.getConfig(observer.room.name);
          const o_room = o_rooms[Game.time%o_rooms.length];
					const err = observer.observeRoom(o_room);
					if(err != OK) {
						console.log('🔴🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({main:'observeRoom', room:observer.room.name, o_room:o_room, err:err, o_rooms:o_rooms, observer:observer}));
					}
		});
	}
};

module.exports = observer
