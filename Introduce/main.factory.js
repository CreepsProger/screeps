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
		return cash.getAllMyFactories();
	},
	
	toRun: function(f) {
		var to_run = Math.floor(Math.abs(f.toRun));
		var err = ERR_NOT_IN_RANGE;
		var result =[];
		while(to_run > 0 && err != OK) {
			const resourceToProduce = "battery"
			err = f.produce(resourceToProduce);
			to_run = Math.floor(to_run/100);
			const ilr = (e.i*100+l*10+r)/100;
			result.push({[e.lab.pos.roomName]:ilr, err:err, resourceToProduce:resourceToProduce});
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
