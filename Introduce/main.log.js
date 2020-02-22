

var mainLog = {

	canLog: function(flagNames) {
// 		console.log(flagNames);
		for(var i in flagNames) {
			var name = flagNames[i];
			var flag = Game.flags[name];
// 			console.log(i,name,flag);
			if(!!flag) {
				return (Game.time % flag.color == 0);
			}
		}
		return false;
	}
};

module.exports = mainLog;
