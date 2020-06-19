// $Id$
const constants = require('main.constants');
const log = require('main.log');
const tools = require('tools');

var lastFlagRemoved;

var last_game_time_created_creep = 0;

var flags = {

	time:0,
	flags:{},
	cashFlags: function() {
		if(flags.time != Game.time) {
			flags.time = Game.time;
			flags.flags =
				{    NP1: Game.flags['NP1']			// don't pick up in range 11-NW1.color
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

				,   5011: Game.flags['5011']		// start spawning 5011-st one more creep
				,'-5011': Game.flags['-5011']		// start spawning 5011-st one less creep
				,   5014: Game.flags['5014']		// start spawning 5014-th one more creep
				,'-5014': Game.flags['-5014']		// start spawning 5014-th one less creep
				
				,   5021: Game.flags['5021']		// start spawning 5021-st one more creep
				,'-5021': Game.flags['-5021']		// start spawning 5021-st one less creep
				,   5024: Game.flags['5024']		// start spawning 5024-th one more creep
				,'-5024': Game.flags['-5024']		// start spawning 5024-th one less creep
				
				,   5031: Game.flags['5031']		// start spawning 5031-st one more creep
				,'-5031': Game.flags['-5031']		// start spawning 5031-st one less creep
				,   5034: Game.flags['5034']		// start spawning 5034-th one more creep
				,'-5034': Game.flags['-5034']		// start spawning 5034-th one less creep
				
				,   5041: Game.flags['5041']		// start spawning 5041-st one more creep
				,'-5041': Game.flags['-5041']		// start spawning 5041-st one less creep
				,   5044: Game.flags['5044']		// start spawning 5044-th one more creep
				,'-5044': Game.flags['-5044']		// start spawning 5044-th one less creep
				
				,   5051: Game.flags['5051']		// start spawning 5051-st one more creep
				,'-5051': Game.flags['-5051']		// start spawning 5051-st one less creep
				,   5054: Game.flags['5054']		// start spawning 5054-th one more creep
				,'-5054': Game.flags['-5054']		// start spawning 5054-th one less creep

				,   5061: Game.flags['5061']		// start spawning 5061-st one more creep
				,'-5061': Game.flags['-5061']		// start spawning 5061-st one less creep
				,   5064: Game.flags['5064']		// start spawning 5064-th one more creep
				,'-5064': Game.flags['-5064']		// start spawning 5064-th one less creep
				 
				,   5071: Game.flags['5071']		// start spawning 5071-st one more creep
				,'-5071': Game.flags['-5071']		// start spawning 5071-st one less creep
				,   5074: Game.flags['5074']		// start spawning 5074-th one more creep
				,'-5074': Game.flags['-5074']		// start spawning 5074-th one less creep
				 
				,   5081: Game.flags['5081']		// start spawning 5081-st one more creep
				,'-5081': Game.flags['-5081']		// start spawning 5081-st one less creep
				,   5084: Game.flags['5084']		// start spawning 5084-th one more creep
				,'-5084': Game.flags['-5084']		// start spawning 5084-th one less creep
				 
				,   5091: Game.flags['5091']		// start spawning 5091-st one more creep
				,'-5091': Game.flags['-5091']		// start spawning 5091-st one less creep
				,   5094: Game.flags['5094']		// start spawning 5094-th one more creep
				,'-5094': Game.flags['-5094']		// start spawning 5094-th one less creep

				,   5101: Game.flags['5101']		// start spawning 5101-st one more creep
				,'-5101': Game.flags['-5101']		// start spawning 5101-st one less creep
				,   5104: Game.flags['5104']		// start spawning 5104-th one more creep
				,'-5104': Game.flags['-5104']		// start spawning 5104-th one less creep
				 
				,   5111: Game.flags['5111']		// start spawning 5111-st one more creep
				,'-5111': Game.flags['-5111']		// start spawning 5111-st one less creep
				,   5114: Game.flags['5114']		// start spawning 5114-th one more creep
				,'-5114': Game.flags['-5114']		// start spawning 5114-th one less creep
				 
				,   5121: Game.flags['5121']		// start spawning 5121-st one more creep
				,'-5121': Game.flags['-5121']		// start spawning 5121-st one less creep
				,   5124: Game.flags['5124']		// start spawning 5124-th one more creep
				,'-5124': Game.flags['-5124']		// start spawning 5124-th one less creep
				
				,   5131: Game.flags['5131']		// start spawning 5131-st one more creep
				,'-5131': Game.flags['-5131']		// start spawning 5131-st one less creep
				,   5134: Game.flags['5134']		// start spawning 5134-th one more creep
				,'-5134': Game.flags['-5134']		// start spawning 5134-th one less creep
				 
				,   5141: Game.flags['5141']		// start spawning 5141-st one more creep
				,'-5141': Game.flags['-5141']		// start spawning 5141-st one less creep
				,   5144: Game.flags['5144']		// start spawning 5144-th one more creep
				,'-5144': Game.flags['-5144']		// start spawning 5144-th one less creep
				
				,   5151: Game.flags['5151']		// start spawning 5151-st one more creep
				,'-5151': Game.flags['-5151']		// start spawning 5151-st one less creep
				,   5154: Game.flags['5154']		// start spawning 5154-th one more creep
				,'-5154': Game.flags['-5154']		// start spawning 5154-th one less creep
				 
				,     11: Game.flags['11']		// start spawning 11-th one more creep
				,     31: Game.flags['31']		// start spawning 31-st one more creep
				,     34: Game.flags['34']		// start spawning 34-th one more creep
				,     41: Game.flags['41']		// start spawning 41-st one more creep
				,     44: Game.flags['44']		// start spawning 44-th one more creep
				,     61: Game.flags['61']		// start spawning 61-st one more creep
				,     64: Game.flags['64']		// start spawning 64-th one more creep
				,     81: Game.flags['81']		// start spawning 81-st one more creep
				,     84: Game.flags['84']		// start spawning 84-th one more creep
				,    121: Game.flags['121']		// start spawning 121-st one more creep
				,    124: Game.flags['124']		// start spawning 124-th one more creep
				,    171: Game.flags['171']		// start spawning 171-st one more creep
				,    174: Game.flags['174']		// start spawning 174-th one more creep
				,    401: Game.flags['401']		// start spawning 401-st one more creep
				,    304: Game.flags['304']		// start spawning 304-th creeps on shard 0
				,    404: Game.flags['404']		// start spawning 404-th one more creep
				,      L: Game.flags['L']			// log
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
    // T: Test
    T: function(T) {
        var N = 1234;
        var id = '$Id$';
        console.log( 'Ｔ', Math.trunc(Game.time/10000), Game.time%10000
                    , T
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
        lastFlagRemoved = T;
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
			const found = CS.pos.lookFor(LOOK_CREEPS);
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
