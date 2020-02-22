

var mainLog = {

	canLog: function(flagNames) {
		console.log(flagNames);
		for(var i in flagNames) {
			var name = flagNames[i];
			var flag = Game.flags[name];
			console.log(i,name,flag);
			if(!!flag) {
				return true;
			}
		}
		return false;
	}
};

module.exports = mainLog;
