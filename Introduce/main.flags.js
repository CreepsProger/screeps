// $Id$
const constants = require('main.constants');
const log = require('main.log');
const tools = require('tools');
const cash = require('cash');

var lastFlagRemoved;

var last_game_time_created_creep = 0;

var flags = {

	time:0,
	flags:{},getFlag: function(flagName) {
		if(flags.flags[flagName] === undefined) {
			flags.flags[flagName] = Game.flags[flagName];
		}
		return flags.flags[flagName];
	},
	
	getPassConfig: function(roomName) {
		// W55S54.pass:0
		// W55S54.pass:1
		// config == [RoomPosition(12,23,'W55S54'),{x:23,y:34}]
		const prefix = roomName + '.pass:';
		if(flags.flags[prefix] === undefined) {
			flags.flags[prefix] = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((fname) => Game.flags[fname].pos);
		}
		return flags.flags[prefix];
	},
	
	getRoomPowerConfig: function(roomName) {
		// W29S29.power:"pc-op-01":{"spawn":true,"factory":true}
		// W29S29.power:"pc-op-02":{"spawn":false,"factory":true}
		// config == {"pc-op-01":{"spawn":true,"factory":true}, "pc-op-02":{"spawn":false,"factory":true}}
		const prefix = roomName + '.power:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf(':')+1) + ((i!=arr.length-1)?',':'}') )
													.reduce((p,c) => p+c, '{');
			try {
				if(json != '{')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🔴👨‍🚒📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getRoomPowerConfig', roomName:roomName, json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	},
	getPowerConfig: function(roomName, pcName) {
		const roomPowerConf = flags.getRoomPowerConfig(roomName);
		if(!roomPowerConf)
			return roomPowerConf;
		return roomPowerConf[pcName];
	},
	
	getStoreConfig: function(roomName) {
		// W29S29.store: "wire":100,"switch":2
		// W29S29.store: "XLHO2":1000,"battery":20000
		// config == {"wire":100,"switch":2,"XLHO2":1000,"battery":20000}
		const prefix = roomName + '.store:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf('\"')) + ((i!=arr.length-1)?',':'}') )
													.reduce((p,c) => p+c, '{');
			try {
				if(json != '{')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '📦🏨📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getStoreConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	},
	getStoreConfigAmount: function(roomName,resource) {
		const storeConfig = flags.getStoreConfig(roomName);
		return (!!storeConfig)?storeConfig[resource]:null;
	},
	
	getDealConfig: function(roomName) {
		// W29S29.deals: "wire":100,"switch":2
		// W29S29.deals: "XLHO2":1000,"battery":20000
		// config == {"wire":100,"switch":2,"XLHO2":1000,"battery":20000}
		const prefix = roomName + '.deals:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf('\"')) + ((i!=arr.length-1)?',':'}') )
													.reduce((p,c) => p+c, '{');
			try {
				if(json != '{')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🤝💲💠📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getDealConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	},
	getDealConfigAmount: function(roomName,resource) {
		const dealConfig = flags.getDealConfig(roomName);
		return (!!dealConfig)?dealConfig[resource]:null;
	},

	getTransferConfig: function(roomName) {
		// W29S32.transfer: "5011":["U","K"]
		// W57S51.transfer: "5012":["X"] 
		// config == {"5011":["U","K"], "5012":["X"]}
		const prefix = roomName + '.transfer:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf(':')+1) + ((i!=arr.length-1)?',':'}') )
													.reduce((p,c) => p+c, '{');
			try {
				if(json != '{')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🚚📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getTransferConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	}, 
	getTransferCreepConfig: function(creepName, roomName) {
		const transferConfig = flags.getTransferConfig(roomName);
		return (!!transferConfig)?transferConfig[tools.getWeight(creepName)]:null;
	},
	getRoomBoostConfig: function(roomName) {
		// W29S29.boosts:"5084":["XGH2O","XKH2O","XZHO2"]
		// W29S29.boosts:"5081":["XGHO2","XLHO2","XUH2O"]
		// config == {"5084":["XGH2O","XKH2O","XZHO2"], "5081":["XGHO2","XLHO2","XUH2O"]}
		const prefix = roomName + '.boosts:';
		const prefix2 = 'boosts:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name) =>
																	name.substring(0,prefix.length) == prefix ||
																	(name.substring(0,prefix2.length) == prefix2 &&  Game.flags[name].pos.roomName == roomName) )
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf(':')+1) + ((i!=arr.length-1)?',':'}') )
													.reduce((p,c) => p+c, '{');
			try {
				if(json != '{')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '💉📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getRoomBoostConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
// 		if(!flags.flags[prefix]) {
// 			if(!!Memory.boosts)
// 				return Memory.boosts;
// 		}
		return flags.flags[prefix];
	},
	getBoostConfig: function(creep) {
		const roomBoostConf = flags.getRoomBoostConfig(creep.room.name);
		if(!roomBoostConf)
			return roomBoostConf;
		return roomBoostConf[tools.getWeight(creep.name)];
	},
	getBoostLabsConfig: function(roomName) {
		// W29S29.boostLabs:0-2 ["XGH2O"], ["XKH2O"], ["XZHO2"]
		// W29S29.boostLabs:3-5 ["XGHO2"], ["XLHO2"], ["XUH2O"]
		// config == ["XGH2O"], ["XKH2O"], ["XZHO2"], ["XGHO2"], ["XLHO2"], ["XUH2O"]
		const prefix = roomName + '.boostLabs:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf('[')) + ((i!=arr.length-1)?',':']') )
													.reduce((p,c) => p+c, '[');
			try {
				if(json != '[')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '⚗️💉📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getBoostLabsConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		if(!flags.flags[prefix]) {
			if(!!Memory.boosts)
				return Memory.boosts;
		}
		return flags.flags[prefix];
	},
	
	getFactoryConfig: function(roomName) {
		// W29S29.factory:0 [654321]
		// W29S29.factory:1-2 ["energy",0,10000,10000], ["battery",0,0,20000]
		// config == [[654321], ["energy",0,10000,10000], ["battery",0,0,20000]]
		const prefix = roomName + '.factory:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf('[')) + ((i!=arr.length-1)?',':']') )
													.reduce((p,c) => p+c, '[');
			try {
				if(json != '[')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🏭📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getFactoryConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	},
	getLabsSubConfigN: function(roomName) {
		const name = roomName + '.labsSubConfigN';
		if(flags.flags[name] === undefined) {
			flags.flags[name] = !Game.flags[name]?0:(10-Game.flags[name].color);
		}
		return flags.flags[name];
	},
	
	getLabsConfig: function(roomName) {
		// W29S29.labs:0-2 ["ZHO2",23], ["Z"], ["ZO",14]
		// W29S29.labs:3-5 ["OH",45], ["O"], ["H"]
		// config == [["ZHO2",23],["Z"],["ZO",14],["OH",45],["O"],["H"]]
		const boosts = flags.getBoostLabsConfig(roomName);
		if (!!boosts)
			return boosts;
		const prefix = roomName + '.labs:';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix)
													.sort((l,r) => l.localeCompare(r))
													.map((s,i,arr) => s.substring(s.indexOf('[')) + ((i!=arr.length-1)?',':']') )
													.reduce((p,c) => p+c, '[');
			try {
				if(json != '[') {
					flags.flags[prefix] = JSON.parse(json);
					flags.flags[prefix].subConfigN = flags.getLabsSubConfigN(roomName);
				}
			}
			catch (e) {
				console.log( '⚗️📜⛔', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getLabsConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		return flags.flags[prefix];
	},

	getNeeded: function(weight) {
		const plus = '' + weight;
		if(flags.flags[plus] === undefined) {
			flags.flags[plus] = Game.flags[plus];
		}
		const minus = '' + (-1)*weight;
		if(flags.flags[minus] === undefined) {
			flags.flags[minus] = Game.flags[minus];
		}
		const Plus = flags.flags[plus];
		const Minus = flags.flags[minus];
		return !Plus?(!Minus?1:0):11-Plus.color;
	},
	getMaxNeeded: function(weight, needed) {
		const plus = '' + weight;
		if(flags.flags[plus] === undefined) {
			flags.flags[plus] = Game.flags[plus];
		}
		const Plus = flags.flags[plus];
		return !Plus?needed:11-Plus.secondaryColor;
	},
	getModification: function(weight, modification) {
		const mod = '' + weight + '/';
		if(flags.flags[mod] === undefined) {
			flags.flags[mod] = Game.flags[mod];
		}
		const Mod = flags.flags[mod];
		return !Mod?modification:10-Mod.color;
	},
	cashFlags: function() {
		if(flags.time != Game.time) {
			flags.time = Game.time;
			flags.flags =
				{    NPE: Game.flags['NPE']			// no power spawn is filled energy
				,     SO: Game.flags['SO']			// from storage transfering resources in this room in any time
				,     ST: Game.flags['ST']			// from/to storage transfering resources in this room in any time
				,   CONT: Game.flags['CONT']		// use setTarget for a container in this room
				,    NP1: Game.flags['NP1']			// don't pick up in range 11-NW1.color
				,    NW1: Game.flags['NW1']			// don't withdraw in range 11-NW1.color 
				,      P: Game.flags['P']			// pick by all
				,      W: Game.flags['W']			// withdraw by all
				,DSOURCE: Game.flags['DSOURCE']	// DISMATLING SOURCE
				,     XB: Game.flags['XB']			// eXtraBuild - 'B' in all rooms
				,     XU: Game.flags['XU']			// eXtraUpgrade
				,      C: Game.flags['C']				// Claim the room
				,    NAT: Game.flags['NAT']			// towers don't attack
				,     NA: Game.flags['NA']			// don't attack
				,     A2: Game.flags['A2']			// attack only in range = 5*A2.color
				,    DP1: Game.flags['DP1']			// defence point 1
				,    DP2: Game.flags['DP2']			// defence point 2
				,      R: Game.flags['R']				// repair only this pos
				,     RR: Game.flags['RR']			// repair only this pos by repairer
				,    RR1: Game.flags['RR1']			// repair only this pos by repairer
				,    RR2: Game.flags['RR2']			// repair only this pos by repairer
				,      B: Game.flags['B']				// build in spite of energyAvailable != energyCapacityAvailable or sources are empty or MAIN_ROOM_CRISIS
				,     BB: Game.flags['BB']			// build in spite of sources are empty or MAIN_ROOM_CRISIS
				,      U: Game.flags['U']				// upgrade in spite of and harvest from containers
				,     UU: Game.flags['UU']			// upgrade in spite of sources
				,     TW: Game.flags['TW']			// transfer from workers to workers
				,      D: Game.flags['D']				// dismanle all
				,     D1: Game.flags['D1']			// dismanle in range 11-D1.color
			 	,     D2: Game.flags['D2']			// dismanle in range 11-D2.color
			 	,     D3: Game.flags['D3']			// dismanle in range 11-D3.color
			 	,     D4: Game.flags['D4']			// dismanle in range 11-D4.color
				,    DR1: Game.flags['DR1']			// dismanle ramparts only in range 11-DR1.color
			 	,    DR2: Game.flags['DR2']			// dismanle ramparts only in range 11-DR2.color
				,     NB: Game.flags['NB']			// don't build
			 	,    NB1: Game.flags['NB1']			// don't build
			 	,    NB2: Game.flags['NB2']			// don't build
			 	,     NR: Game.flags['NR']			// don't repair
			 	,    NRR: Game.flags['NRR']			// don't repair by repairer 
			 	,    NR1: Game.flags['NR1']			// don't repair 
			 	,   NRR1: Game.flags['NRR1']		// don't repair by repairer
			 	,    NR2: Game.flags['NR2']			// don't repair
			 	,   NRR2: Game.flags['NRR2']		// don't repair by repairer
			 	,     MW: Game.flags['MW']			// multiplier to repair wall
			 	,     MR: Game.flags['MR']			// multiplier to repair rampart
				 
				
				,    401: Game.flags['401']		// start spawning 401-st one more creep
				,    304: Game.flags['304']		// start spawning 304-th creeps on shard 0
				,    404: Game.flags['404']		// start spawning 404-th one more creep
				,      L: Game.flags['L']			// log
				,     LL: Game.flags['LL']			// special log
				,     LA: Game.flags['LA']		// log attacker
				,     LW: Game.flags['LW']		// log main metrix
				,    LWE: Game.flags['LWE']		// log main metrix
				,     LE: Game.flags['LE']		// log energy
				,    LET: Game.flags['LET']		// log energy transfer
				,     LP: Game.flags['LP']		// log pickuper
				,     LU: Game.flags['LU']		// log upgrader
				,     LR: Game.flags['LR']		// log resources
				,    LRT: Game.flags['LRT']		// log resources transfer
				,  Infra: Game.flags['Infra']	// not use cash for infra
				}
		}
	},

   work_efficiency: function(type,range) {
       var RAs = Math.trunc(type%10000000000/100000000);
       var  As = Math.trunc(type%100000000/1000000);
       var  Ws = Math.trunc(type%1000000/10000);
       var  Cs = Math.trunc(type%10000/100);
       var  Ms = Math.trunc(type%100);

       var fatigue_parts = Cs + Ws + As + RAs;
       var harvest_ticks = Math.ceil(Cs * 50 / 2 / Ws);
      var move_to_rc_ticks = range * Math.ceil(fatigue_parts / Ms / 2);
      var upgrade_ticks = Math.ceil(Cs * 50 / Ws);
      var move_from_rc_ticks = range * Math.ceil((fatigue_parts - Cs) / Ms / 2);
      return Math.floor(300 * Cs * 50 / (harvest_ticks + move_to_rc_ticks + upgrade_ticks + move_from_rc_ticks));
   },

    /** @param commit **/
    checkMainCommit: function(commit) {
        if(!Memory.commits.main ||
           Memory.commits.main != commit ||
           Game.flags['commit']) {
            Memory.commits.main = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit main'
                        , Memory.commits.main
                        , Game.flags['commit']);
            if(Game.flags['commit']) {
                lastFlagRemoved = Game.flags['commit'];
                lastFlagRemoved.remove();
            }

            Memory.CreepsCounter = 0;
            Memory.CreepsNumberByType = {};

            for(var name in Game.creeps) {
                var creep = Game.creeps[name];
                Memory.CreepsCounter++;
  					    const full_type = '' + creep.memory.type + '/' + tools.getWeight(creep.name);
                if(!Memory.CreepsNumberByType[full_type])
                    Memory.CreepsNumberByType[full_type] = 0;
                Memory.CreepsNumberByType[creep.memory.type]++;
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'Commit main'
                            , commit
                            , creep
                            , 'creep.memory.type'
                            , creep.memory.type
                            , 'creep.getActiveBodyparts(WORK)'
                            , creep.getActiveBodyparts(WORK)
                            , Memory.CreepsNumberByType[full_type]
                            , Memory.CreepsCounter);
            }
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit main'
                        , commit
                        , 'Memory.CreepsCounter:'
                        , Memory.CreepsCounter
                        , 'Memory.CreepsNumberByType:'
                        , Memory.CreepsNumberByType
                        , JSON.stringify(Memory.CreepsNumberByType));

            Memory.totals = { CreepsNumber: 0
                             , Capacity: 0
                             , FreeCapacity: 0
                             , UsedCapacity: 0
                             , HitsMax: 0};
            // Memory.harvestersMovements
            //     = { Value: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
            //        , Count: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
            //        ,   Avg: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}};
        }
    },

    //Flag1: Rerun last flag with a new position
    Flag1: function(Flag1) {
        console.log( '🏳️‍✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(Flag1));
        if(flags[lastFlagRemoved.name]) {
            lastFlagRemoved.pos = Flag1.pos;
            lastFlagRemoved.color = Flag1.color;
            flags[lastFlagRemoved.name](lastFlagRemoved);
        }
        Flag1.remove();
    },
	//Reconfig: run Reconfig
	Reconfig: function(Reconfig) {
		require('main.labs').reconfig();
		lastFlagRemoved = Reconfig; 
    lastFlagRemoved.remove()
	},
	//Nuker: launch a Nuker
	Nuker: function(Nuker) {
		const nuker = Object.keys(Game.rooms)
                        .map( (rN) => cash.getNukers(rN))
                        .filter((arr) => Array.isArray(arr) && arr.length > 0)
                        .reduce((a, b) => a.concat(b), []) //.flat()
                        .filter((n) => !n.cooldown)
                        .shift();
		const err = nuker.launchNuke(Nuker.pos);
		console.log('☢️', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify( { Nuker:'Nuker', from:nuker.pos.roomName
																			, to:Nuker.pos , err:err
																			, nuker:nuker}));
		lastFlagRemoved = Nuker; 
    lastFlagRemoved.remove()
	},
	//Limits: set CPU limits on shards
	Limits: function(Limits) {

		if(Game.shard.name == 'shard1' && Limits.color == 9) {
			Game.cpu.setShardLimits({shard0:4,shard1:190,shard2:4,shard3:2});
		}
		if(Game.shard.name == 'shard0' && Limits.color == 4) {
			Game.cpu.setShardLimits({shard0:170,shard1:4,shard2:4,shard3:2});;
		}
		lastFlagRemoved = Limits; 
    lastFlagRemoved.remove()
	},
	// Flags: generate flags on map
	Flags: function(Flags) {
		const prefix = 'Flags>';
		var n = 0;

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.prefix = f.name.substring(f.name.indexOf('>')+1,f.name.indexOf('.'))
															, f.otype = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf('-'))
															, f.resource = f.name.substring(f.name.indexOf('-')+1,f.name.indexOf(':'))
															, f.suffix = +f.name.substring(f.name.indexOf(':')+1)
															, f))
						.forEach(function(fFlags)
				{
				console.log('👉🏳️🏴', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Flags:fFlags.prefix, fFlags:fFlags}));
				const err = Object.keys(Game.market.orders)
													.map((name) => Game.market.orders[name])
													.filter((order) => order.resourceType == fFlags.resource &&
																							order.type == (fFlags.otype == 'buy'? ORDER_BUY:ORDER_SELL))
													.map((order,i) => ( order.pos = new RoomPosition(fFlags.pos.x, fFlags.pos.y+2+i+i, fFlags.pos.roomName)
																						, order.err = order.pos.createFlag(fFlags.prefix+'.'+order.id+(!!fFlags.suffix?':'+fFlags.suffix:''))
																						, order.err))
													.reduce((p,c) => p!=OK?p:OK, OK);
				console.log('👉🏳️🏴', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Flags:fFlags.prefix, err:err, fFlags:fFlags}));
				if(err == OK) {
					fFlags.room.visual.text('👉🏳️🏴' + fFlags.name + ' 👌'
																	, fFlags.pos.x
																	, fFlags.pos.y
																	, {opacity: 1.0, font:'10px Verdana'});
					fFlags.remove();
				}
				else {
					fFlags.room.visual.text('👉🏳️🏴' + fFlags.name + ' ⚠️ ' + err
																	, fFlags.pos.x
																	, fFlags.pos.y
																	, {color:'red', font:0.9, opacity: 1.0});
				}
			});
		}
		Flags.remove();
	},
	// Cancel: Cancel order on market
	Cancel: function(Cancel) {
		const prefix = 'Cancel.';
		var n = 0;

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.orderId = f.name.substring(f.name.indexOf('.')+1)
															, f))
						.forEach(function(fOrder)
				{
				console.log('👉Ⓜ️🚫', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', fOrder:fOrder}));
				const err = Game.market.cancelOrder(fOrder.orderId);
				console.log('👉Ⓜ️🚫', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', err:err, fOrder:fOrder}));
				if(err == OK) {
					fOrder.room.visual.text('👉Ⓜ️🚫' + fOrder.name + ' 👌'
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {opacity: 1.0, font:'10px Verdana'});
					fOrder.remove();
				}
				else {
					fOrder.room.visual.text('👉Ⓜ️🚫' + fOrder.name + ' ⚠️ ' + err
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {color:'red', font:0.9, opacity: 1.0});
				}
			});
		}
		Cancel.remove();
	},
	// Extend: Change order amount on market
	Extend: function(Extend) {
		const prefix = 'Extend.';
		var n = 0;

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.orderId = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
															, f.newVolume = +f.name.substring(f.name.indexOf(':')+1)
															, f))
						.forEach(function(fOrder)
				{
				console.log('👉Ⓜ️📊', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', fOrder:fOrder}));
				const err = Game.market.extendOrder(fOrder.orderId, fOrder.newVolume);
				console.log('👉Ⓜ️📊', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', err:err, fOrder:fOrder}));
				if(err == OK) {
					fOrder.room.visual.text('👉Ⓜ️📊' + fOrder.name + ' 👌'
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {opacity: 1.0, font:'10px Verdana'});
					fOrder.remove();
				}
				else {
					fOrder.room.visual.text('👉Ⓜ️📊' + fOrder.name + ' ⚠️ ' + err
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {color:'red', font:0.9, opacity: 1.0});
				}
			});
		}
		Extend.remove();
	},
	// Price: Change order price on market
	Price: function(Price) {
		const prefix = 'Price.';
		var n = 0;

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.orderId = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
															, f.newPrice = +f.name.substring(f.name.indexOf(':')+1)
															, f))
						.forEach(function(fOrder)
				{
				console.log('👉Ⓜ️📈📉', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', fOrder:fOrder}));
				const err = Game.market.changeOrderPrice(fOrder.orderId, fOrder.newPrice);
				console.log('👉Ⓜ️📈📉', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', err:err, fOrder:fOrder}));
				if(err == OK) {
					fOrder.room.visual.text('👉Ⓜ️📈📉' + fOrder.name + ' 👌'
																	, fOrder.pos.x
																	, fOrder.pos.y
																	//, {opacity: 0.8, font:'bold 2 Courier New'});
																	//, {opacity: 0.8, font:'1 Arial'});
																	//, {opacity: 1.0, font:'9px monospace'});
																	//, {opacity: 1.0, font:'9px Tahoma'});
																	//, {opacity: 1.0, font:'9px Calibri'});
																	, {opacity: 1.0, font:'10px Verdana'});
					fOrder.remove();
				}
				else {
					fOrder.room.visual.text('👉Ⓜ️📈📉' + fOrder.name + ' ⚠️ ' + err
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {color:'red', font:0.9, opacity: 1.0});
				}
			});
		}
		Price.remove();
	},
	//Order: order on market
	Order: function(Order) {
		const prefix = 'Order-';
		var n = 0;

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.type = f.name.substring(f.name.indexOf('-')+1,f.name.indexOf('.'))
															, f.resource = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
															, f.amount = +f.name.substring(f.name.indexOf(':')+1,f.name.indexOf('*'))
															, f.price = +f.name.substring(f.name.indexOf('*')+1)
															, f))
						.forEach(function(fOrder)
				{
				const roomName = fOrder.pos.roomName;
				const terminal = Game.rooms[roomName].terminal;
				console.log('👉Ⓜ️💠', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', roomName:roomName, fOrder:fOrder}));
				const type = (fOrder.type == 'buy'? ORDER_BUY:ORDER_SELL) 
				const err = Game.market.createOrder( { type: (fOrder.type == 'buy'? ORDER_BUY:ORDER_SELL)
																						 , resourceType: fOrder.resource
																						 , price: fOrder.price
																						 , totalAmount: fOrder.amount
																						 , roomName: fOrder.pos.roomName});
				console.log('👉Ⓜ️💠', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Order:'fOrder', err:err, roomName:roomName, fOrder:fOrder}));
				if(err == OK) {
					fOrder.room.visual.text('👉Ⓜ️💠' + fOrder.name + ' 👌'
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {opacity: 0.8});
					fOrder.remove();
				}
				else {
					fOrder.room.visual.text('👉Ⓜ️💠' + fOrder.name + ' ⚠️ ' + err
																	, fOrder.pos.x
																	, fOrder.pos.y
																	, {color:'red', font:1/Order.color, opacity: 1.0});
				}
			});
		}
		Order.remove();
	},
	//Sell: sell on market
	Sell: function(Sell) {
		var time = tools.timeObj(tools.time.flags, 'sell');
		if(Game.time <= time.on)
			return;
		const prefix = 'Sell.';
		var n = 0;
		const fSelling = Game.flags['Selling'];
		const selling = !fSelling? 0:Math.pow(10,fSelling.color-1)*(fSelling.secondaryColor);
		const fLogSell = Game.flags['LS'];

		if(flags.flags[prefix] === undefined) {
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.resource = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
															, f.min = +f.name.substring(f.name.indexOf(':')+1,f.name.indexOf('>'))
															, f.MaxAvgAmountToSell = +f.name.substring(f.name.indexOf('>')+1)
															, f))
						.forEach(function(fSell)
				{
				const roomName = fSell.pos.roomName;
				const terminal = Game.rooms[roomName].terminal;
				if(!!terminal.cooldown) {
					n++;
					tools.timeOn(time, terminal.cooldown);
					return;
				}
				const ShardAvgAmount = require('main.terminals').getShardAvgAmount(fSell.resource);
				const MaxAvgAmountToSell = !!fSell.MaxAvgAmountToSell? fSell.MaxAvgAmountToSell : require('main.config').getMaxAvgAmountToSell(fSell.resource);
				if(ShardAvgAmount < MaxAvgAmountToSell) {
					fSell.room.visual.text('👉Ⓜ️💲⛔ ' + ShardAvgAmount + ' < ' + MaxAvgAmountToSell
																, fSell.pos.x
																, fSell.pos.y);
					if(!!fLogSell) { 
						console.log('🤝Ⓜ️💲⛔', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Sell:'fSell', roomName:roomName
																						, selling:selling, fSell:fSell
																						, ShardAvgAmount:ShardAvgAmount
																						, MaxAvgAmountToSell:MaxAvgAmountToSell}));
					}
					return;
				}
				if(!!fLogSell) {
					console.log('🤝Ⓜ️💲', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { Sell:'fSell', roomName:roomName, fSell:fSell}));
				}
				const terminalEnergy = terminal.store.getUsedCapacity(RESOURCE_ENERGY);
				const order = Game.market.getAllOrders(order => order.resourceType == fSell.resource &&
																							 //order.roomName.length < 7 &&
																							 order.type == ORDER_BUY &&
																							 order.amount > 0 &&
																							 order.price >= fSell.min)
																	.map((order) => (order.cost = (!order.roomName)? 0:Game.market.calcTransactionCost(order.amount, roomName, order.roomName)
																						, order.cost_price = order.cost*0.125/order.amount
																						, order.full_price = order.price + order.cost_price
																						, order))
																	.sort((l,r) => r.full_price - l.full_price)
																	.shift();
				if(!order)
					return;
				var amount = (!order.roomName)? Math.min(order.amount,Game.resources[order.resourceType]) : Math.min(order.amount, terminal.store.getUsedCapacity(order.resourceType) );
				var half_amount = Math.floor(amount/2);
				var max_cost = order.resourceType==RESOURCE_ENERGY? half_amount:terminalEnergy;
				while( ((!order.roomName)? 0:Game.market.calcTransactionCost(amount, roomName, order.roomName)) > max_cost) {
					amount = half_amount;
					half_amount = Math.floor(amount/2);
					max_cost = order.resourceType==RESOURCE_ENERGY? half_amount:terminalEnergy;
				}
				if(!amount)
					return
				const err = Game.market.deal(order.id, amount, roomName);
				if(!!fLogSell) {
					console.log('🤝Ⓜ️💲🤝', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Sell:'Sell', roomName:roomName
																						, resourse:order.resourceType, price:order.price
																						, amount:(amount==order.amount?amount:''+amount+'('+order.amount+')')
																						, err:err, fSell:fSell, order:order}));
				}
				if(err == OK) {
					fSell.room.visual.text('👉Ⓜ️💲 ' + amount + ' * ' + order.price + ' 👌'
																, fSell.pos.x
																, fSell.pos.y);
				}
				n++;
			});
		}
		if(n == 0 && !selling) {
			lastFlagRemoved = Sell;
			lastFlagRemoved.remove();
		}
		if(selling > 0)
			tools.timeOn(time, Math.floor(Math.random()*selling) );
	},
	//Buy: buy on market
	Buy: function(Buy) {
		var time = tools.timeObj(tools.time.flags, 'buy');
		if(Game.time <= time.on)
			return;
		const fCreditsLimit = Game.flags['creditsLimit'];
		const creditsLimit = !fCreditsLimit? 100000:Math.pow(10,11-fCreditsLimit.color)*(11-fCreditsLimit.secondaryColor);
		const fBuying = Game.flags['Buying'];
		const buying = !fBuying? 0:Math.pow(10,fBuying.color-1)*(fBuying.secondaryColor);
		if(Game.market.credits <= creditsLimit) {
			if(buying > 0)
				tools.timeOn(time, buying);
			return;
		}
		const prefix = 'Buy.';
		var n = 0;

		if(true) {
			const fLogBuy = Game.flags['LB'];
			Object.keys(Game.flags)
						.filter((name)=>name.substring(0,prefix.length) == prefix)
						.sort((l,r) => l.localeCompare(r))
						.map((name) => Game.flags[name])
						.map((f,i,arr) => ( f.resource = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
															, f.min = +f.name.substring(f.name.indexOf(':')+1,f.name.indexOf('÷')) 
															, f.max = +f.name.substring(f.name.indexOf('÷')+1,f.name.indexOf('<')<0?f.name.length:f.name.indexOf('<')) 
															, f.MinAvgAmountToBuy = +f.name.substring(f.name.indexOf('<')+1)
															, f))
						.forEach(function(fBuy)
				{
				const roomName = fBuy.pos.roomName;
				const ShardAvgAmount = require('main.terminals').getShardAvgAmount(fBuy.resource);
				const MinAvgAmountToBuy = !!fBuy.MinAvgAmountToBuy? fBuy.MinAvgAmountToBuy : require('main.config').getMinAvgAmountToBuy(fBuy.resource);
				if(ShardAvgAmount > MinAvgAmountToBuy) {
					fBuy.room.visual.text('👉Ⓜ️💠⛔ ' + ShardAvgAmount + ' > ' + MinAvgAmountToBuy
																, fBuy.pos.x
																, fBuy.pos.y);
					if(!!fLogBuy) {
						console.log('🤝Ⓜ️💠⛔', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Buy:'fBuy', roomName:roomName
																						, buying:buying, creditsLimit:creditsLimit, fBuy:fBuy
																						, ShardAvgAmount:ShardAvgAmount
																						, MinAvgAmountToBuy:MinAvgAmountToBuy}));
					}
					return;
				}
				const terminal = Game.rooms[roomName].terminal;
				if(!!terminal.cooldown) {
					n++;
					tools.timeOn(time, terminal.cooldown);
					return;
				}
				if(!!fLogBuy) {
					console.log('🤝Ⓜ️💠', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Buy:'fBuy', roomName:roomName
																						, buying:buying, creditsLimit:creditsLimit, fBuy:fBuy}));
				}
				const terminalEnergy = terminal.store.getUsedCapacity(RESOURCE_ENERGY);
				const order = Game.market.getAllOrders(order => order.resourceType == fBuy.resource &&
																							 order.roomName.length < 7 &&
																							 order.type == ORDER_SELL &&
																							 order.amount > 0 &&
																							 order.price <= fBuy.max &&
																							 order.price >= fBuy.min)
																	.map((order) => (order.cost = Game.market.calcTransactionCost(order.amount, roomName, order.roomName)
																						, order.cost_price = order.cost*(order.resourceType==RESOURCE_ENERGY? order.price:0.125)/order.amount
																						, order.full_price = order.price + order.cost_price
																						, order))
																	.filter((order) => order.full_price <= fBuy.max)
																	.sort((l,r) => l.full_price - r.full_price)
																	.shift();
				if(!order)
					return;
				var amount = order.amount;
				var max_cost = order.resourceType==RESOURCE_ENERGY? Math.floor(amount*9/10):terminalEnergy;
				while(Game.market.calcTransactionCost(amount, roomName, order.roomName) > max_cost) {
					amount = Math.floor(amount/2);
					max_cost = order.resourceType==RESOURCE_ENERGY? Math.floor(amount*9/10):terminalEnergy;
				}
				if(Game.market.credits - amount*order.price < creditsLimit)
					amount = Math.floor((Game.market.credits - creditsLimit) / order.price);
				if(!amount)
					return;
				const err = Game.market.deal(order.id, amount, roomName);
				if(!!fLogBuy) {
					console.log('🤝Ⓜ️💠🤝', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Buy:'Buy', roomName:roomName
																						, resourse:order.resourceType, price:order.price
																						, amount:(amount==order.amount?amount:''+amount+'('+order.amount+')')
																						, err:err, fBuy:fBuy, order:order, buying:buying, creditsLimit:creditsLimit }));
				}
				if(err == OK) {
					fBuy.room.visual.text('👉Ⓜ️💠 ' + amount + ' * ' + order.price + ' 👌'
																, fBuy.pos.x
																, fBuy.pos.y);
				}
				n++;
			});
		}
		if(n == 0 && !buying) {
			lastFlagRemoved = Buy;
			lastFlagRemoved.remove();
		}
		if(buying > 0)
			tools.timeOn(time, Math.floor(Math.random()*buying) );
	},
	//Deal: market deal 
	Deal: function(Deal) {
		const roomName = Deal.pos.roomName;
		const prefix = 'Deal.';

		if(flags.flags[prefix+roomName] === undefined) {
			const fDeal = Object.keys(Game.flags)
													.filter((name)=>name.substring(0,prefix.length) == prefix && Game.flags[name].pos.roomName == Deal.pos.roomName)
													.sort((l,r) => l.localeCompare(r))
													.map((name) => Game.flags[name])
													.map((f,i,arr) => ( f.orderId = f.name.substring(f.name.indexOf('.')+1,f.name.indexOf(':'))
																						, f.amount = +f.name.substring(f.name.indexOf(':')+1)
																						, f))
													.shift();
			if(!!fDeal) {
				const err = Game.market.deal(fDeal.orderId, fDeal.amount, roomName);
				console.log('🤝💲/💠', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { Deal:'Deal', roomName:roomName
																						, orderId:fDeal.orderId , amount:fDeal.amount
																						, err:err, fDeal:fDeal}));
			}
		}
		lastFlagRemoved = Deal; 
    lastFlagRemoved.remove()
	}, 
	//Totals: refactor totals
    Totals: function(Totals) {
			console.log( '🏳️‍', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(Totals));
			Memory.CreepsNumberByWeight = {};
			Totals.remove();
    },
	// T99'; 
    T99: function(T99) {
			const found = T99.pos.lookFor(LOOK_STRUCTURES); 
			if(found.length == 0) 
				return;
			const store = found[0].store;
			console.log('Ｔ99', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({T99:T99, store:store, found:found}));
			const keys = Object.keys(store);
			const keysLength = keys.length;
			const getFreeCapacity = store.getFreeCapacity();
			const getCapacity = store.getCapacity();
			const getUsedCapacity_RESOURCE_ENERGY = store.getUsedCapacity(RESOURCE_ENERGY);
      console.log('Ｔ99', Math.trunc(Game.time/10000), Game.time%10000 
                    , JSON.stringify( { T99:T99
																			, keys:keys
																			, keysLength:keysLength
																			, getFreeCapacity:getFreeCapacity
																			, getCapacity:getCapacity
																			, getUsedCapacity_RESOURCE_ENERGY:getUsedCapacity_RESOURCE_ENERGY}));
      lastFlagRemoved = T99; 
      lastFlagRemoved.remove(); 
    },
	// BR: Build Rampart
    BR: function(BR) {
			const err = Game.rooms[BR.pos.roomName].createConstructionSite(BR.pos,STRUCTURE_RAMPART);

			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'err:'
									, err
									, 'BR:'
									, JSON.stringify(BR)
								 );
			lastFlagRemoved = BR;
			lastFlagRemoved.remove();
    },
    // T100: Test 100
    T100: function(T100) {
        var N = 1234;
        var id = '$Id$';
        console.log( 'Ｔ100', Math.trunc(Game.time/10000), Game.time%10000
                    , T100
                    , 'String.fromCharCode(65):'
                    , String.fromCharCode(65)
                    , 'N:'
                    , N
                    , 'N.toString(16).toUpperCase():'
                    , N.toString(16).toUpperCase()
                    , 'id:'
                    , id
                   );

        [ 40302
        , 80604
        , 70804
        , 60707
        , 20202
        , 40404
        , 50505
        , 60503
        , 110806
        , 100709
        , 90909].forEach(function(type) {
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , type
                        , 'WE(6):'
                        , flags.work_efficiency(type,6)
                        , 'WE(12):'
                        , flags.work_efficiency(type,12)
                        , 'WE(24):'
                        , flags.work_efficiency(type,24)
                       );
        });
        var maxtype = [0, 0, 0];
        var maxWe = [0, 0, 0];
        var OptyType = [0, 0, 0];
        var OptyWe = [10000, 10000, 10000];
        for (var p = 10; p <= 36; p++) {
            for (var m = 1; m <= 13; m++) {
                for (var c = 1; c <= 11; c++) {
                    var w = Math.floor((p-m-c)/2);
                    var type = w*10000 + c*100 + m;
                    var We = [ flags.work_efficiency(type, 6)
                             , flags.work_efficiency(type,12)
                             , flags.work_efficiency(type,24)];
                    if(maxWe[0] < We[0]) { maxWe[0] = We[0]; maxtype[0] = type; };
                    if(maxWe[1] < We[1]) { maxWe[1] = We[1]; maxtype[1] = type; };
                    if(maxWe[2] < We[2]) { maxWe[2] = We[2]; maxtype[2] = type; };

                    var Opty = [ Math.ceil(3000/flags.work_efficiency(type,  6)) * p * 50
                               , Math.ceil(3000/flags.work_efficiency(type, 12)) * p * 50
                               , Math.ceil(3000/flags.work_efficiency(type, 24)) * p * 50];
                    if(OptyWe[0] > Opty[0] && Opty[0] >= 0) { OptyWe[0] = Opty[0]; OptyType[0] = type; };
                    if(OptyWe[1] > Opty[1] && Opty[1] >= 0) { OptyWe[1] = Opty[1]; OptyType[1] = type; };
                    if(OptyWe[2] > Opty[2] && Opty[2] >= 0) { OptyWe[2] = Opty[2]; OptyType[2] = type; };
                }
            }
        }
        console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'OptyWe'
                        , OptyWe
                        , 'OptyType'
                        , OptyType
                       );
        console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'maxWe'
                        , maxWe
                        , 'maxtype'
                        , maxtype
                       );
        lastFlagRemoved = T100;
        lastFlagRemoved.remove();
    },
    // Spawn Creep
    SC: function(SC) {
        var Spawn = Game.spawns['Spawn1'];
        var Controller = Spawn.room.controller;
        const CL = Controller.level;
        var err = ERR_NOT_ENOUGH_ENERGY;

        if(CL >= 5) flags.tryCreateCreep(90909, 100, 10); // E 1800 Worker
        if(CL >= 5) flags.tryCreateCreep(80808, 100, 10); // E 1600 Worker
        if(CL >= 5) flags.tryCreateCreep(70707, 100, 10); // E 1400 Worker
        if(CL >= 4) flags.tryCreateCreep(60606, 100, 10); // E 1200 Worker
        if(CL >= 4) flags.tryCreateCreep(50505, 100, 10); // E 1000 Worker
        if(CL >= 3) flags.tryCreateCreep(40404, 100, 10); // E  800 Worker
        if(CL >= 3) flags.tryCreateCreep(30303, 100, 10); // E  600 Worker
        if(CL >= 2) flags.tryCreateCreep(20202, 100, 10); // E  400 Worker
        if(CL >= 1) flags.tryCreateCreep(10101, 100, 10); // E  200 Worker

        lastFlagRemoved = SC;
        lastFlagRemoved.remove();
    },
    // Creep Move To Room Controller
    CMTRC: function(CMTRC) {
        const found = CMTRC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            found[0].moveTo(found[0].room.controller);
        }
        lastFlagRemoved = CMTRC;
        lastFlagRemoved.remove();
    },
    // Creep Move To Closest Container
    CMTCC: function(CMTCC) {
        const found = CMTCC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            var creep = found[0];
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if(target)
                tools.moveTo(creep,target);
        }

        lastFlagRemoved = CMTCC;
        lastFlagRemoved.remove();
    },
    // Creep Withdraw Energy From Container
    CWEFC: function(CWEFC) {
        const found = CWEFC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            var creep = found[0];
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store[RESOURCE_ENERGY] > 0;
                }
            });
            if(target) {
                var err = creep.withdraw(target, RESOURCE_ENERGY);
                creep.say('CWEFC ' + err);
            }
        }

        lastFlagRemoved = CWEFC;
        lastFlagRemoved.remove();
    },
	// Creep Withdraw Mineral From Terminal
    CWMFT: function(CWMFT) {
        const found = CWMFT.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            var creep = found[0];
            var terminal = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_TERMINAL);
                }
            });
            if(!!terminal) {
							var err = OK;
							const resources = Object.keys(terminal.store).sort((l,r) => l.length - r.length);
							resources.forEach(function(resource,i) {
								if(err == OK && resource != RESOURCE_ENERGY)
									err = creep.withdraw(terminal, resource);
								if(err != OK)
									console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { CWMFT:'Creep Withdraw Mineral From Terminal', creep:creep.name, action:'withdraw'
																				, resource:resource, err:err
																				, terminal:terminal}));
							});
							if(err != OK)
								tools.moveTo(creep,terminal);
							creep.say('CWMFT ' + err);
            }
        }

        lastFlagRemoved = CWMFT;
        lastFlagRemoved.remove();
    },
    // Creep Suicide  
    CS: function(CS) {
			const found = CS.pos.findInRange(FIND_MY_CREEPS, 10-CS.color);
      if(found.length > 0) {
				const creep = found[0];
        if(creep) {
            var err = creep.suicide();
            console.log( '❌🤖', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Creep Suicide:'
                        , creep
                        , 'err:'
                        , err
                        , JSON.stringify(creep)
                        , JSON.stringify(CS));
        }
			}
      lastFlagRemoved = CS;
      lastFlagRemoved.remove();
    },
    // Destroy Container  
    DC: function(DC) {
        var container = DC.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        });
        if(container) {
            var err = container.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Destroy Container:'
                        , container
                        , 'err:'
                        , err
                        , JSON.stringify(container)
                        , JSON.stringify(DC));
        }
        lastFlagRemoved = DC;
        lastFlagRemoved.remove();
    },
	// Destroy Rampart
    DR: function(DR) {
        var rampart = DR.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART;
            }
        });
        if(rampart) {
            var err = rampart.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Destroy Rampart:'
                        , rampart
                        , 'err:'
                        , err
                        , JSON.stringify(rampart)
                        , JSON.stringify(DR));
        }
        lastFlagRemoved = DR;
        lastFlagRemoved.remove();
    },
	// Destroy Road
    DRo: function(DRo) {
        var road = DRo.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_ROAD;
            }
        });
        if(road) {
            var err = road.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Destroy Road:'
                        , road
                        , 'err:'
                        , err
                        , JSON.stringify(road)
                        , JSON.stringify(DRo));
        }
        lastFlagRemoved = DRo;
        lastFlagRemoved.remove();
    },
    // Destroy Extention
    DE: function(DE) {
        var extention = DE.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        if(extention) {
            var err = extention.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , JSON.stringify(DE)
                        , 'destroying extention:'
                        , extention
                        , 'err:'
                        , err);
        }
        lastFlagRemoved = DE;
        lastFlagRemoved.remove();
    },
    // Remove all constructions sites';
    RACS: function(RACS) {
        console.log( '❌⚪️⚪️⚪️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(RACS)
                    , JSON.stringify(Game.constructionSites));
        for(var name in Game.constructionSites) {
            var constructionSite = Game.constructionSites[name];
            if(constructionSite) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'removing constructionSite:'
                            , constructionSite);
                constructionSite.remove();
            }
        }
        lastFlagRemoved = RACS;
        lastFlagRemoved.remove();
    },
    // Remove construction site'; 
    RCS: function(RCS) {
			const found = RCS.pos.lookFor(LOOK_CONSTRUCTION_SITES); 
			if(found.length == 0) 
				return;
			const cs = found.reduce((p,c) => p.structureType == STRUCTURE_CONSTRUCTION_SITE);
      console.log( '❌⚪️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(RCS)
                    , JSON.stringify(cs));		
			cs.remove(); 
      lastFlagRemoved = RCS;
      lastFlagRemoved.remove();
    }, 
    // Look'; 
    Look: function(Look) {
			const found = Look.pos.look(); 
			if(found.length == 0) 
				return;
      console.log( '❌⚪️', Math.trunc(Game.time/10000), Game.time%10000 
                    , JSON.stringify(Look) 
                    , JSON.stringify(found));    		
      lastFlagRemoved = Look; 
      lastFlagRemoved.remove(); 
    },
    run: function(ticksToLog = constants.TICKS_TO_CHECK_CREEPS_NUMBER) {
			flags.cashFlags();

      var flags_view = [];
      for(var name in Game.flags) {
        flags_view.push(Game.flags[name].name);
        if(flags[name])
            flags[name](Game.flags[name])
      }
      if(Game.time % ticksToLog == 0) {
        console.log( '🏳️‍🌈', Math.trunc(Game.time/10000), Game.time%10000
                    , flags_view);
      }
    }
};

module.exports = flags;
