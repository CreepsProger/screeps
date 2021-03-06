const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const labs = {
	
	lcash:{},
	
	getConfLabRes: function(conf, i) {
		if(!!conf && !!conf.subConfigN && conf.subConfigN>0) {
			//return conf[i][conf.subConfigN+1];
			return (!!conf[i][conf.subConfigN+1])? conf[i][conf.subConfigN+1]:conf[i][0];
		}
		return (!conf)? null:(!conf[i])? null:conf[i][0];
	},
	
	isNotDefaultSubConfRes: function(conf, i) {
		if(!!conf && !!conf.subConfigN && conf.subConfigN>0) {
			//return conf[i][conf.subConfigN+1];
			return (!!conf[i][conf.subConfigN+1]);
		}
		return (!conf)? false:(!conf[i])? false:!!conf[i][0];
	},
	
	getConfLabAgs: function(conf, i) {
		return (!conf)? null:(!conf[i])? null:conf[i][1];
	},
	
	getLabsToInOut: function(roomName) {
		const cashEntry = roomName + '.getLabsToInOut';
		if(labs.lcash[cashEntry] === undefined)
			labs.lcash[cashEntry] = {entry:[],time:0};
		if(labs.lcash[cashEntry].time < Game.time-5 && Game.time%10 == 0) {
			const conf = config.getLabsConfig(roomName);
			if(!conf)
				return [];/*
			console.log('⚗️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { labs:'getLabsToInOut', roomName:roomName, conf:conf}));*/
			const ls = cash.getLabs(roomName);
			labs.lcash[cashEntry].entry = cash.getLabs(roomName)
								.map((lab,i) => {return { i:i, resource:tools.nvl(lab.mineralType,labs.getConfLabRes(conf,i))
																				, to_empty:(labs.getConfLabRes(conf,i) != '-' && tools.nvl(lab.mineralType,labs.getConfLabRes(conf,i)) != labs.getConfLabRes(conf,i))
																				, toRun:labs.getConfLabAgs(conf,i), configRes:labs.getConfLabRes(conf,i), lab:lab}}) 
								.map((e) => ( e.to_run = Math.abs(tools.nvl(e.toRun,0))
													  , e.l_i = Math.floor(e.to_run/10%10)
													  , e.r_i = Math.floor(e.to_run%10)
													  , e.l_reag = (e.l_i<ls.length)?ls[e.l_i].mineralType:'-'
													  , e.r_reag = (e.r_i<ls.length)?ls[e.r_i].mineralType:'-'
													  , e.reaction = !!REACTIONS[e.l_reag]?REACTIONS[e.l_reag][e.r_reag]:null
														, e.to_boost = e.to_run - Math.floor(e.to_run) > 0
													  , e.toEmpty = !!e.to_empty || (!!e.reaction && tools.nvl(e.lab.mineralType,e.reaction) != e.reaction && !e.to_boost)
													  , e));
			labs.lcash[cashEntry].time = Game.time;
		}
		return labs.lcash[cashEntry].entry;
  },
	
	getLabsToEmpty: function(roomName) {
    return  labs.getLabsToInOut(roomName) 
								.filter((e) => !!e.toEmpty)
								.map((e) => (e.amount = tools.nvl(e.lab.store.getUsedCapacity(e.resource),0),e)) 
								.sort((l,r) => r.amount - l.amount)
  },
	
	getLabsToOut: function(roomName) {
    return  labs.getLabsToInOut(roomName)
								.filter((e) =>  !!e.toEmpty ||
																tools.nvl(e.lab.store.getUsedCapacity(e.resource),0) > (!!e.toEmpty?0:2500))
								.map((e) => {return {lab:e.lab, resource:e.resource, amount:tools.nvl(e.lab.store.getUsedCapacity(e.resource),0)-(!!e.toEmpty?0:2000)}})
								.sort((l,r) => r.amount - l.amount)
  },

	getLabsToIn: function(roomName, res = '-') {
    return  labs.getLabsToInOut(roomName)
								.filter((e) =>  !e.toEmpty &&
																e.configRes != '-' &&
																(e.resource == res || res == '-') &&
																tools.nvl(e.lab.store.getUsedCapacity(e.resource),0) < 1500)
								.map((e) => {return {lab:e.lab, resource:e.resource, amount:2000-tools.nvl(e.lab.store.getUsedCapacity(e.resource),0)}}) 
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
	
	getAmountResourcesForConfigN: function(roomName, conf, N) {
		conf.subConfigN = N;
		const storage = Game.rooms[roomName].storage;
		const ret = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
				.map((i) =>  ({res:labs.getConfLabRes(conf,i), ags:labs.getConfLabAgs(conf,i), isNotDef:labs.isNotDefaultSubConfRes(conf,i)}))
				.map((e,i,arr) => ( e.l_reag = (!!e.ags)? arr[Math.floor(e.ags/10%10)].res:'#'
													, e.r_reag = (!!e.ags)? arr[Math.floor(e.ags%10)].res:'#'
													, e.prod = !!REACTIONS[e.l_reag]?REACTIONS[e.l_reag][e.r_reag]:'#'
													, e.prod = (!!e.prod)? e.prod:'#'
													, e.to_boost = e.ags - Math.floor(e.ags) > 0
													, e))
				.map((e) => ( e.resAmount = tools.nvl(storage.store[e.res],(!!e.ags)?1000000:0)
										, e.prodAmount = tools.nvl(storage.store[e.prod],(!!e.ags)?0:1000000)
										, e))
				.filter((e) => (!!e.ags && !e.to_boost) || e.ags==0)
				.reduce((p,c) => ({ resAmount:Math.min(p.resAmount,c.resAmount)
													, prodAmount:Math.min(p.prodAmount,c.prodAmount)
													, isNotDef:(p.isNotDef||c.isNotDef)
													})
													, {resAmount:Infinity, prodAmount:Infinity, isNotDef:false} );
		/*console.log('⚗️⚖️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'getAmountResourcesForConfigN', roomName:roomName, conf:conf, N:N, ret:ret}));*/
		return ret;
  },
	
	findNextConfigN: function(roomName, conf) {
		/**/console.log('⚗️⚖️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'findNextConfigN?', roomName:roomName, conf:conf}));/**/
		const ret = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
				.map((i) =>  labs.getAmountResourcesForConfigN(roomName,conf,i))
				.filter((e) => !!e.isNotDef)
				.reduce((p,c,i,arr) => (c.resAmount > constants.MIN_RES_TO_LAB_RECONFIG && (c.prodAmount < constants.MAX_PROD_TO_LAB_RECONFIG || i+1 == arr.length) && !p)? {Ns:arr, N:i}:p, null);
		/**/console.log('⚗️⚖️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'findNextConfigN', roomName:roomName, conf:conf, ret:ret}));/**/
		return ret;
  },
	
	reconfig: function() {
		if(true) {
			const rooms  = Object.keys(Game.rooms)
				.map((roomName) =>  ( { roomName:roomName, labsConfig:config.getLabsConfig(roomName)
															, flagLabsSubConfigN:Game.flags[roomName + '.labsSubConfigN']}))
				.filter((room) => !!room.flagLabsSubConfigN)
				.map((room) =>  ( room.CurN = room.labsConfig.subConfigN
												, room.Next = labs.findNextConfigN(room.roomName,room.labsConfig)
												, room.Next = !!room.Next? room.Next:{Ns:null, N:0}
												, room.labsConfig.subConfigN = room.CurN
												, room.err = room.flagLabsSubConfigN.setColor(10-room.Next.N)
												, room));
			console.log('⚗️⚖️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'reconfig', rooms:rooms}));
		}
  },
	
  run: function() { 
    if(Game.time % constants.TICKS_TO_LAB_RECONFIG == 0 || (Game.time % 100 == 0 && !!Game.flags['labsReconfig'])) {
			labs.reconfig();
		}
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
