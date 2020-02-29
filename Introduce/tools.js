const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');

var last_game_time_created_creep = 0;

var tools = {
    
   setTarget: function(creep,target,id,run) {
		 var mytarget;

		 if(!!target &&
				!!id &&
				Memory.targets[id] !== undefined) {
			 var creep2 = Game.getObjectById(Memory.targets[id]);
			 if(creep2 !== undefined) {
				 var path2 = creep2.pos.findPathTo(target);
				 var path = creep.pos.findPathTo(target);
				 if(path2.length > path.length) {
					 mytarget = target;
					 Memory.targets[id] = creep.id;
					 creep2.cancelOrder(creep2.moveTo);
					 run(creep2);
				 }
			 }
		 }
		 else {
			 mytarget = target;
			 Memory.targets[id] = creep.id;
		 }

		 return mytarget;
	 }

};

module.exports = tools;
