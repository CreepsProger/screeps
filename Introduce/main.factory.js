const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const factory = {
	
	lcash:{},
	
	getConfig: function(roomName) {
		return flags.getFactoryConf(roomName);
	},
  
  getFactoriesToRun: function() {
		return cash.getAllMyFactories()
								.filter((f) => !!f && !f.cooldown)
								.map((f) => (f.config = config.getFactoryConfig(f.pos.roomName), f) )
								.filter((f) => !!f.config && !!f.config[0]);
	},
	
	getToIn: function(f,res) {
		const conf = config.getFactoryConfig(f.pos.roomName);
		if(Game.shard.name == 'shard1--') {
			console.log('🏭', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { roomName:f.pos.roomName
																				, res:res, conf:conf}));
		}
		if(!conf || conf.length < 2)
			return f;
		const line = conf.slice(1)
											.filter((c) => res == '-' || res == c[0])
											.map((c,i) => ( c.in = {}
																		, c.in.resource = c[0]
																		, c.in.exist = tools.nvl(f.store[c.in.resource],0)
																		, c.in.line = i+1
																		, c.in.amount = c[2] - c.in.exist
																		, c) )
											.filter((c) => c.in.exist < c[1])
											.filter((c) => res != '-' ||
															tools.nvl(Game.rooms[f.pos.roomName].storage.store[c.in.resource],0) > 0 ||
															c.in.resource == RESOURCE_ENERGY)
											.sort((l,r) => r.in.amount - l.in.amount)
											.shift();
		if(!!line)
			f.in = line.in;
		return f;
	},

	getFactoryToIn: function(roomName, res = '-') {
    return cash.getFactories(roomName)
								.filter((f) => !!f && !!f.my && !!f.store && f.store.getFreeCapacity(RESOURCE_ENERGY) > 5000)
								.map((f) => factory.getToIn(f,res))
								.filter((f) => !!f.in)
								.sort((l,r) => r.in.amount - l.in.amount)
								.shift();
  },
	
	getToOut: function(f) {
		const conf = config.getFactoryConfig(f.pos.roomName);
		if(!conf || conf.length < 2)
			return f;
		const line = conf.slice(1)
											.map((c,i) => ( c.out = {}
																		, c.out.resource = c[0]
																		, c.out.exist = tools.nvl(f.store[c.out.resource],0)
																		, c.out.line = i+1
																		, c.out.amount = c.out.exist - c[2]
																		, c) )
											.filter((c) => c.out.exist > c[3])
											.sort((l,r) => r.out.amount - l.out.amount)
											.shift();
		if(!!line)
			f.out = line.out;
		return f;
	},

  getFactoryToOut: function(roomName) {
		const cashEntry = roomName + '.getFactoryToOut';
		if(factory.lcash[cashEntry] === undefined)
			factory.lcash[cashEntry] = {entry:null,time:0};
		if(factory.lcash[cashEntry].time < Game.time-3 && Game.time%5 == 0) {
			factory.lcash[cashEntry].entry = cash.getFactories(roomName)
								.filter((f) => !!f && !!f.my && !!f.store)
								.map((f) => factory.getToOut(f))
								.sort((l,r) => r.out.amount - l.out.amount)
								.shift();
			factory.lcash[cashEntry].time = Game.time;
		}
		return factory.lcash[cashEntry].entry;
  },
	
	toRun: function(f) {
		var to_run = f.config[0][0];
		var base = 10;
		if (typeof to_run === 'string' || to_run instanceof String) {
			const h = parseInt(to_run, 16);
			to_run = h;
			base = 16;
		}
		var err = ERR_NOT_IN_RANGE;
		var result =[];
		while(to_run > 0 && err != OK) {
			const line = Math.floor(to_run%base);
			const product = f.config[line][0];
			var avg = terminals.getShardAvgAmount(product);
			var max = config.getMaxAvgAmountToProduce(product);
			if(product == RESOURCE_ENERGY || product == RESOURCE_BATTERY) {
				if((product == RESOURCE_ENERGY && terminals.getShardAvgAmount(RESOURCE_ENERGY) < 300000) ||
					 (product == RESOURCE_BATTERY && terminals.getShardAvgAmount(RESOURCE_ENERGY) > 350000)) {
					err = f.produce(product);
				}
			}
			else {
				if(avg < max) {
					err = f.produce(product);
				}
				else {
					err = -20
				}
			}
			to_run = Math.floor(to_run/base);
			result.push({[f.pos.roomName]:line, err:err, product:product, avg:avg, max:max});
		}
		return result;
	},
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_FACTORY_RUN != 0)
      return;
      
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
