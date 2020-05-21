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
				console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({event_processor:'run', room:room.name, event:event, target:target}))
				if(!!target ||
					 event.data.structureType == STRUCTURE_RAMPART ||
					 event.data.structureType == STRUCTURE_WALL) {
					if((!!target.my && (target.progressTotal - target.progress < 300)) ) {
	 					console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
	 										 			, JSON.stringify({event_processor:'run', room:room.name, event:event, target:target}))
	 				}
					if(event.data.structureType == STRUCTURE_RAMPART ||
						 event.data.structureType == STRUCTURE_WALL) {
						console.log('🎉', Math.trunc(Game.time/10000), Game.time%10000
											 			, JSON.stringify({event_processor:'run', room:room.name, data:event.data, target:target}))
					}
					cash.onBuilt(room.name, target, event.data);
				}
			});
		});
	}
};

module.exports = event_processor;
