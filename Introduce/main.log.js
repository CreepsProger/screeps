
var mainLog = {

	canLog: function(flagNames) {
		var flags = [];
		for(var name in flagNames) {
			var flag = Game.flags[name];
			if(!!Game.flags[name]) {
				return true;
			}
		}
	}
};

module.exports = mainLog;
