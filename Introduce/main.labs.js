const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const labs = {
	
	getConfLabRes: function(conf, i) {
		return (!conf)? null:(!conf[i])? null:(!conf[i][0])?null:conf[i][0];
	},
	
	getConfLabAgs: function(conf, i) {
		return (!conf)? null:(!conf[i])? null:(!conf[i][1])?null:conf[i][1];
	},
	
	getLabsToInOut: function(roomName) {
		const conf = config.getLabsConfig(roomName);
		if(!conf)
			return [];/*
		console.log('⚗️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { labs:'getLabsToInOut', roomName:roomName, conf:conf}));*/
    return  cash.getLabs(roomName)
								.map((lab,i) => {return { i:i, resource:tools.nvl(lab.mineralType,labs.getConfLabRes(conf,i))
																				, toEmpty:(tools.nvl(lab.mineralType,labs.getConfLabRes(conf,i)) != labs.getConfLabRes(conf,i))
																				, toRun:labs.getConfLabAgs(conf,i), lab:lab}}) 
  },
	
	getLabsToOut: function(roomName) {
    return  labs.getLabsToInOut(roomName)
								.filter((e) =>  !!e.toEmpty ||
																tools.nvl(e.lab.store.getUsedCapacity(e.resource),0) > (!!e.toEmpty?0:2500)
											 )
								.map((e) => {return {lab:e.lab, resource:e.resource, amount:tools.nvl(e.lab.store.getUsedCapacity(e.resource),0)-(!!e.toEmpty?0:1500) }}) 
  },

	getLabsToIn: function(roomName, res = '-') {
    return  labs.getLabsToInOut(roomName)
								.filter((e) =>  !e.toEmpty &&
																(e.resource == res || res == '-') &&
																tools.nvl(e.lab.store.getUsedCapacity(e.resource),0) < 500
											 )
								.map((e) => {return {lab:e.lab, resource:e.resource, amount:1500-tools.nvl(e.lab.store.getUsedCapacity(e.resource),0)}}) 
  },

  getLabsToRun: function() {
		return terminals.getAllMyTerminalsToSpread()
                    .map((t) => labs.getLabsToInOut(t.pos.roomName))
                    .filter((arr) => Array.isArray(arr) && arr.length > 0)
                    .reduce((a, b) => a.concat(b), []) //.flat()
                    .filter((l) => !!l.toRun && !l.lab.cooldown);
  },
	
	toRun: function(e) {
		const labs = cash.getLabs(e.lab.pos.roomName);
		const reverse = (e.toRun < 0)? true:undefined;
		var to_run = Math.floor(Math.abs(e.toRun));
		var err = ERR_NOT_IN_RANGE;
		var result =[];
		while(to_run > 0 && err != OK) {
			const l = Math.floor(to_run/10%10);
			const r = Math.floor(to_run%10);
			err = (!!reverse)? e.lab.reverseReaction(labs[l],labs[r]):e.lab.runReaction(labs[l],labs[r]);
			to_run = Math.floor(to_run/100);
			const ilr = (e.i*100+l*10+r)/100;
			result.push({[e.lab.pos.roomName]:ilr, err:err, reverse:reverse});
		}
		return result;
	},
	
  run: function() { 
    if(Game.time % constants.TICKS_TO_LAB_RUN != 0)
      return;
      
    const labsToRun = labs.getLabsToRun();/*
    console.log('⚗️🧫', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'run', labs:labsToRun.length, labsToRun:labsToRun}));*/
		const results = labsToRun.map((e) => labs.toRun(e))
		                         .filter((arr) => Array.isArray(arr) && arr.length > 0)
		                         .reduce((a, b) => a.concat(b), [])
		if(results.some((r) => r.err != OK)) {
			console.log('⚗️🧫✳️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'run', results:results.length, results:results}));
		}
	}
};

module.exports = labs
