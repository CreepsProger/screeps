// $Id$
const constants = require('main.constants');
const log = require('main.log');
const tools = require('tools');

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
	getBoostsConfig: function(roomName) {
		// W29S29.boosts:0-2 ["XGH2O"], ["XKH2O"], ["XZHO2"]
		// W29S29.boosts:3-5 ["XGHO2"], ["XLHO2"], ["XUH2O"]
		// config == ["XGH2O"], ["XKH2O"], ["XZHO2"], ["XGHO2"], ["XLHO2"], ["XUH2O"]
		const prefix = roomName + '.boosts';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags).filter((name)=>name.substring(0,prefix.length) == prefix)
																					.sort((l,r) => l.localeCompare(r))
																					.map((s,i,arr) => s.substring(s.indexOf('[')) + ((i!=arr.length-1)?',':']') )
																					.reduce((p,c) => p+c, '[');
			try {
				if(json != '[')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🏳️‍✒️⛔⚠️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify({flags:'getBoostsConfig', json:json, e_name:e.name, e_message:e.message }));
			}
		}
		if(!flags.flags[prefix]) {
			if(!!Memory.boosts)
				return Memory.boosts;
		}
		return flags.flags[prefix];
	},
	getLabsConfig: function(roomName) {
		// W29S29.labs:0-2 ["ZHO2",23], ["Z"], ["ZO",14]
		// W29S29.labs:3-5 ["OH",45], ["O"], ["H"]
		// config == [["ZHO2",23],["Z"],["ZO",14],["OH",45],["O"],["H"]]
		const boosts = flags.getBoostsConfig(roomName);
		if (!!boosts)
			return boosts;
		const prefix = roomName + '.labs';
		if(flags.flags[prefix] === undefined) {
			const json = Object.keys(Game.flags).filter((name)=>name.substring(0,prefix.length) == prefix)
																					.sort((l,r) => l.localeCompare(r))
																					.map((s,i,arr) => s.substring(s.indexOf('[')) + ((i!=arr.length-1)?',':']') )
																					.reduce((p,c) => p+c, '[');
			try {
				if(json != '[')
					flags.flags[prefix] = JSON.parse(json);
			}
			catch (e) {
				console.log( '🏳️‍✒️⛔⚠️', Math.trunc(Game.time/10000), Game.time%10000
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
	cashFlags: function() {
		if(flags.time != Game.time) {
			flags.time = Game.time;
			flags.flags =
				{   CONT: Game.flags['CONT']			// use setTarget for a container in this room
				,    NP1: Game.flags['NP1']			// don't pick up in range 11-NW1.color
				,    NW1: Game.flags['NW1']			// don't withdraw in range 11-NW1.color 
				,DSOURCE: Game.flags['DSOURCE']			// DISMATLING SOURCE
				,     XB: Game.flags['XB']			// eXtraBuild - 'B' in all rooms
				,     XU: Game.flags['XU']			// eXtraUpgrade
				,      C: Game.flags['C']			// Claim the room
				,     A2: Game.flags['A2']		// attack only in range = 5*A2.color
				,    DP1: Game.flags['DP1']		// defence point 1
				,    DP2: Game.flags['DP2']		// defence point 2
				,      R: Game.flags['R']			// repair only this pos
				,      B: Game.flags['B']			// build in spite of energyAvailable != energyCapacityAvailable or sources are empty or MAIN_ROOM_CRISIS
				,     BB: Game.flags['BB']		// build in spite of sources are empty or MAIN_ROOM_CRISIS
				,      U: Game.flags['U']			// upgrade in spite of and harvest from containers
				,     UU: Game.flags['UU']		// upgrade in spite of sources
				,     TW: Game.flags['TW']		// transfer from workers to workers
				,      D: Game.flags['D']			// dismanle all
				,     D1: Game.flags['D1']		// dismanle in range 11-D1.color
			 	,     D2: Game.flags['D2']		// dismanle in range 11-D2.color
				,     NB: Game.flags['NB']		// don't build
			 	,    NB1: Game.flags['NB1']		// don't build
			 	,    NB2: Game.flags['NB2']		// don't build
			 	,     NR: Game.flags['NR']		// don't repair
			 	,    NR1: Game.flags['NR1']		// don't repair
			 	,    NR2: Game.flags['NR2']		// don't repair
			 	,     MW: Game.flags['MW']		// multiplier to repair wall
			 	,     MR: Game.flags['MR']		// multiplier to repair rampart
				 
				
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
            flags[lastFlagRemoved.name](lastFlagRemoved);
        }
        Flag1.remove();
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
