const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const factory = {
	
	getConfig: function(roomName) {
		return flags.getFactoryConf(roomName);
	},
  
  getFactoriesToRun: function() {
		return cash.getFactories();
	},
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_FACTORY_RUN != 0)
      return;
      
    const factoriesToRun = factory.getFactoriesToRun();
    console.log('🏭🌀', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "factory":'run', labs:factoriesToRun.length, factoriesToRun:factoriesToRun}));
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
