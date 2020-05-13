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
										 			, JSON.stringify({event_processor:'run', room:room.name, event:event, target:target}))
					if(target.progressTotal - target.progress < 250) { // TODO: recheck this condition
						if(target.structureType == STRUCTURE_CONTAINER) {
							cash.onBuilt(STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER,room.name);
							cash.onBuilt(STRUCTURE_CONTAINER,room.name);
						}
						if(target.structureType == STRUCTURE_ROAD) {
							cash.onBuilt(STRUCTURE_ROAD + '&' + STRUCTURE_CONTAINER,room.name);
						}
						if(target.structureType == STRUCTURE_EXTENSION) {
							cash.onBuilt(STRUCTURE_EXTENSION,room.name);
						}
						if(target.structureType == STRUCTURE_LAB) {
							cash.onBuilt(STRUCTURE_LAB,room.name);
						}
					}
				}
			});
		});
	}
};

module.exports = event_processor;
