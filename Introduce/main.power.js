const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const power = {
getConfig: function(roomName) {
		return flags.getFactoryConf(roomName);
	},
run: function() { 
    if(Game.time % constants.TICKS_TO_POWER_RUN != 0)
      return;
	cash.getAllMyPowerSpawns()
		.filter((s) => s.store.getUsedCapacity('power') > 0 &&
									s.store.getUsedCapacity('energy') > 50)
		.forEach(function(spawn,i) {
		const err = spawn.processPower();
		if(err != OK) {
			console.log('🔴🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({main:'processPower', room:spawn.room.name, err:err, spawn:spawn}));
		}
	});
      
    const factoriesToRun = factory.getFactoriesToRun();
		const results = factoriesToRun.map((f) => factory.toRun(f))
		                         .filter((arr) => Array.isArray(arr) && arr.length > 0)
		                         .reduce((a, b) => a.concat(b), [])
		if(results.some((r) => r.err != OK)) {
			console.log('🏭🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "factory":'run', results:results.length, results:results}));
		}
	}
};

module.exports = factory
