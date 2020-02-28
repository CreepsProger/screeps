const constants = require('main.constants');

var last_game_time_created_creep = 0;

var spawns = {
    
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
    
    tryCreateCreep: function(type, weight, needed = 0) {
        var body = [];
        var  Ts = Math.trunc(type%100000000000000/1000000000000);
        var CLs = Math.trunc(type%1000000000000/10000000000);
        var RAs = Math.trunc(type%10000000000/100000000);
        var  As = Math.trunc(type%100000000/1000000);
        var  Ws = Math.trunc(type%1000000/10000);
        var  Cs = Math.trunc(type%10000/100);
        var  Ms = Math.trunc(type%100);
        for (var i = 0; i <  Ts; i++) {body.push(TOUGH);}
        for (var i = 0; i < CLs; i++) {body.push(CLAIM);}
        for (var i = 0; i < RAs; i++) {body.push(RANGED_ATTACK);}
        for (var i = 0; i <  As; i++) {body.push(ATTACK);}
        for (var i = 0; i <  Ws; i++) {body.push(WORK);}
        for (var i = 0; i <  Cs; i++) {body.push(CARRY);}
        for (var i = 0; i <  Ms; i++) {body.push(MOVE);}
        var cost = 10*Ts + 600*CLs + 150*RAs + 80*As + 100*Ws + 50*Cs + 50*Ms;
        var existsNumber = 0;
			  const full_type = '' + type + '/' + weight;
        if(Memory.CreepsNumberByType[full_type])
            existsNumber = Memory.CreepsNumberByType[full_type];
        var needsNumber = needed - existsNumber;
        var newName = 'creep-<' + weight + '>-' + Ts + '.' + CLs + '.' + RAs + '.' + As + '.' + Ws + '.' + Cs + '.' + Ms + '-' + Game.time % 10000;
//         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                     , 'trying create a creep:'
//                     , newName
//                     , 'exists:'
//                     , existsNumber
//                     , 'needs:'
//                     , needsNumber
//                     , 'cost:'
//                     , cost
//                     , 'preverr:'
//                     , preverr
//                   );
        if(last_game_time_created_creep != Game.time && needsNumber > 0) {
            var err = Game.spawns['Spawn2'].spawnCreep(body
                                                   , newName
                                                   , {memory: {n: Memory.CreepsCounter, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
            if(err) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'Can\'t spawn new creep:'
                            , newName
                            , 'err:'
                            , err);
            }
            else {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Spawning new creep:'
                        , newName);
                if(!Memory.CreepsNumberByType[full_type])
                    Memory.CreepsNumberByType[full_type] = 0;
                Memory.CreepsNumberByType[full_type]++;
                Memory.CreepsCounter++;
							last_game_time_created_creep = Game.time;
            }
        }
    },

    run: function() {
			
			//      if(((Memory.totals.CreepsNumber < 8) || (2 * Memory.totals.FreeCapacity <=  Memory.totals.UsedCapacity)) && !Spawn.spawning) {
			if(!!Spawn && !Spawn.spawning) {
				var Controller = Spawn.room.controller;
				const CL = Controller.level;
				var N = Memory.totals.CreepsNumber;
				
				if(CL >= 4) mainFlags.tryCreateCreep(        60606, 50, N<(maxCreepsNumber+1)?13:0); // V 1-1 E  1200   Worker
				if(CL >= 5) mainFlags.tryCreateCreep(        90909, 50, N<(maxCreepsNumber+1)?10:0); // V 1-1 E  1800   Worker
				if(CL >= 5) mainFlags.tryCreateCreep(         2412, 36, N<(maxCreepsNumber+1)? 3:0); // V 1-1 E  1800   Worker
				if(CL >= 4) mainFlags.tryCreateCreep(  20000000002,100, N<(maxCreepsNumber+1)? 1:0); // V 1-1 E  1300  Claimer
				if(CL >= 4) mainFlags.tryCreateCreep(5000200000007,100, N<(maxCreepsNumber+1)? 2:0); // V 1-1 E   650 Attacker
				
				if(CL >= 4) mainFlags.tryCreateCreep(        80808, 30, Memory.totals.WORK< 8? 1:0); // E 1600 Worker
				if(CL >= 4) mainFlags.tryCreateCreep(        70707, 30, Memory.totals.WORK< 7? 1:0); // E 1400 Worker
				if(CL >= 3) mainFlags.tryCreateCreep(        60606, 30, Memory.totals.WORK< 6? 1:0); // E 1200 Worker
				if(CL >= 3) mainFlags.tryCreateCreep(        50505, 30, Memory.totals.WORK< 5? 1:0); // E 1000 Worker
				if(CL >= 3) mainFlags.tryCreateCreep(        40404, 30, Memory.totals.WORK< 4? 1:0); // E  800 Worker
				
				if(CL >= 2) mainFlags.tryCreateCreep(          506, 45, Memory.totals.CARRY< 6? 1:0); // E 550 Carier
				
				if(CL >= 1) mainFlags.tryCreateCreep(          303, 45, Memory.totals.CARRY< 3? 1:0); // E 300 Carier
			}
			
			if(!!Spawn && Spawn.spawning) {
				Spawn.spawning.setDirections([RIGHT]);
				
				var spawningCreep = Game.creeps[Spawn.spawning.name];
				Spawn.room.visual.text('🛠️' + Spawn.spawning.name
															 , Spawn.pos.x + 1
															 , Spawn.pos.y
															 , {align: 'left', opacity: 0.8});
			}
		}
};

module.exports = spawns;
