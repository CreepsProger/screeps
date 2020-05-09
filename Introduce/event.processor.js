const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var event_processor = {

	run: function() {

		_.forEach(Game.rooms, room => {
			const eventLog = room.getEventLog();
			const buildEvents = _.filter(eventLog, {event:EVENT_BUILD});
			buildEvents.forEach(event => {
				const target = Game.getObjectById(event.data.targetId);
				if(target && target.my) {
					console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
										 			, JSON.stringify({room:room.name, event:event, target:target}))
					if(target.structureType == STRUCTURE_CONTAINER) {
						cash.onBuilt(STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER,room.name);
						cash.onBuilt(STRUCTURE_CONTAINER,room.name);
					}
					if(target.structureType == STRUCTURE_ROAD) {
						cash.onBuilt(STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER,room.name);
					}
				}
			});
		});
	}
};

module.exports = event_processor;
