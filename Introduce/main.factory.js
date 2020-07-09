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
		return cash.getAllMyFactories()
								.filter((f) => !!f && !f.cooldown)
								.map((f) => (f.config = config.getFactoryConfig(f.pos.roomName), f) )
								.filter((f) => !!f.config && !!f.config[0]);
	},
	
	toRun: function(f) {
		var to_run = f.config[0];
		var err = ERR_NOT_IN_RANGE;
		var result =[];
		while(to_run > 0 && err != OK) {
			const line = Math.floor(to_run%10);
			const product = f.config[line][0]
			err = f.produce(product);
			to_run = Math.floor(to_run/10);
			result.push({[f.pos.roomName]:line, err:err, product:product});
		}
		return result;
	},
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_FACTORY_RUN != 0)
      return;
      
    const factoriesToRun = factory.getFactoriesToRun();
    console.log('🏭🌀', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "factory":'run', factories:factoriesToRun.length, factoriesToRun:factoriesToRun}));
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
