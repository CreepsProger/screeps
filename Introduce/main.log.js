

var mainLog = {

	canLog: function(flagNames, creep) {
// 		console.log(flagNames);
		for(var i in flagNames) {
			var name = flagNames[i];
			var flag = Game.flags[name];
// 			console.log(i,name,flag);
			if(!!flag &&
				 !!creep &&
				 flag.pos.roomName == creep.pos.roomName && (!false || creep.memory.n == 6898)) {
				return (Game.time % flag.color == 0);
			}
		}
		return false;
	}
};

module.exports = mainLog;
