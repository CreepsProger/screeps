const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');

var last_game_time_created_creep = 0;

var tools = {
    
   setTarget: function(type,range) {

				if(!!tombstone &&
					 !!tombstone.creep.id &&
					 Memory.targets[tombstone.creep.id] !== undefined) {
					var creep2 = Game.getObjectById(Memory.targets[tombstone.creep.id]);
					if(creep2 !== undefined) {
						var path2 = creep2.pos.findPathTo(tombstone);
						var path = creep.pos.findPathTo(tombstone);
						if(path2.length > path.length) {
							target = tombstone;
							creep2.cancelOrder(creep2.moveTo);
							require('role.withdrawer').run(creep2);
						}
					}
				}
				else {
					target = tombstone;
				}
        }
};

module.exports = tools;
