

var mainLog = {

	canLog: function(flagNames) {
		console.log(flagNames);
		for(var name in flagNames) {
			var flag = Game.flags[name];
			if(!!Game.flags[name]) {
				return true;
			}
		}
		return false;
	}
};

module.exports = mainLog;
