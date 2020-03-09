const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');

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

    tryCreateCreep: function(spawn, type, weight, needed = 0) {
			var body = [];
			const  Ts = Math.trunc(type%10000000000000000/100000000000000);
			const CLs = Math.trunc(type%100000000000000  /1000000000000);
			const RAs = Math.trunc(type%1000000000000    /10000000000);
			const  As = Math.trunc(type%10000000000      /100000000);
			const  Hs = Math.trunc(type%100000000        /1000000);
			const  Ws = Math.trunc(type%1000000          /10000);
			const  Cs = Math.trunc(type%10000            /100);
			const  Ms = Math.trunc(type%100              /1);
			for (var i = 0; i <  Ts; i++) {body.push(TOUGH);}
			for (var i = 0; i < CLs; i++) {body.push(CLAIM);}
			for (var i = 0; i < RAs; i++) {body.push(RANGED_ATTACK);}
			for (var i = 0; i <  As; i++) {body.push(ATTACK);}
			for (var i = 0; i <  Hs; i++) {body.push(HEAL);}
			for (var i = 0; i <  Ws; i++) {body.push(WORK);}
			for (var i = 0; i <  Cs; i++) {body.push(CARRY);}
			for (var i = 0; i <  Ms; i++) {body.push(MOVE);}
			const cost = 10*Ts + 600*CLs + 150*RAs + 80*As + 250*Hs + 100*Ws + 50*Cs + 50*Ms;
			var existsNumber = 0;
			const full_type = '' + type + '/' + weight;
			if(Memory.CreepsNumberByWeight[weight]) {
				//existsNumber = Memory.CreepsNumberByType[full_type];
				existsNumber = Memory.CreepsNumberByWeight[weight];
			}
			const needsNumber = needed - existsNumber;
			const newName = 'creep-<' + weight + '/' + Memory.CreepsCounter % 10 + '>-'
			 								+ (Ts>0  ? Ts +'t' :'')
											+ (CLs>0 ? CLs+'l' :'')
											+ (RAs>0 ? RAs+'r' :'')
											+ (As>0  ? As +'a' :'')
											+ (Hs>0  ? Hs +'h' :'')
											+ (Ws>0  ? Ws +'w' :'')
											+ (Cs>0  ? Cs +'c' :'')
											+ (Ms>0  ? Ms +'m' :'#') + '-' + Memory.CreepsCounter;
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
				var err = spawn.spawnCreep( body
																	, newName
																	, {memory: {n: Memory.CreepsCounter, cost: cost, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
				if(err) {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, 'Can\'t spawn new creep:'
											, newName
											, 'cost:'
										  , cost
											, 'err:'
											, err);
				}
				else {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, 'Spawning new creep:'
											, newName
										  , 'cost:'
										  , cost);
					Memory.CreepsCounter++;
					last_game_time_created_creep = Game.time;
				}
			}
		},

	renew: function(Spawn) {
		if(!!Spawn && !Spawn.spawning) {
			if(false && Spawn.store.getUsedCapacity(RESOURCE_ENERGY) > 0) {
				Spawn.pos.findInRange(FIND_MY_CREEPS, 1).forEach(function(creep) {
					const creep_target_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
					if(creep_target_room == Spawn.room.name &&
						 Memory.totals.CreepsNumber == maxCreepsNumber &&
						 creep.ticksToLive < constants.TICKS_TO_LIVE_TO_RENEW) {
						if(OK == Spawn.renewCreep(creep)) {
							console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
													, Spawn.name, 'renew', creep.name);
							creep.say('👨');
						}
					}
				});
			}
		}
	},

	run: function() {

		if(Game.time % config.ticksToCheckCreepsNumber != 0)
			return;

		for(var name in Game.spawns) {
			var spawn = Game.spawns[name];
/*
			console.log('✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'spawn:'
									, JSON.stringify(spawn));
									*/

			if(!spawn.spawning && spawn.name != 'Spawn19') {
				var controller = spawn.room.controller;
				const CL = controller.level;
				var N = Memory.totals.CreepsNumber;
				// 22*1800+2*1300+4*650 = 44800 -> 30 per game tick
				if(false) {
					spawns.tryCreateCreep(spawn,             3015, 31, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,           100608, 39, 1); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn,             3015, 40, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,           111111, 49, 2); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn, 2500000800000017, 53, 8); // V 1-2 E  2300 Attacker
				}
				else {
					spawns.tryCreateCreep(spawn,             1608, 31, 2); // V 1-1 E    Carier
					spawns.tryCreateCreep(spawn,            80406, 39, 2); // V 1-2 E    Worker
					spawns.tryCreateCreep(spawn,             1608, 41, 3); // V 1-1 E    Carier
					spawns.tryCreateCreep(spawn,           121011, 49, 3); // V 1-1 E    Worker
					spawns.tryCreateCreep(spawn,    2000000000002, 50, 1); // V 1-1 E   Claimer
	 				spawns.tryCreateCreep(spawn,             3015, 51, 2); // V 1-1 E    Carier
					spawns.tryCreateCreep(spawn,           121011, 59, 3); // V 1-1 E    Worker
					spawns.tryCreateCreep(spawn,    2000000000002, 60, 1); // V 1-1 E   Claimer
	        spawns.tryCreateCreep(spawn,             3015, 61, 2); // V 1-1 E    Carier
					spawns.tryCreateCreep(spawn,           121011, 69, 3); // V 1-1 E    Worker
          //                                                22
					//                           TTClRrAaHhWwCcMm, 66, 3); // V 1-2 E   Attacker
          spawns.tryCreateCreep(spawn, 1500001000000025, 66, 1); // V 1-2 E   Attacker
          spawns.tryCreateCreep(spawn, 1000000007000009, 67, 1); // V 1-2 E     Healer
          spawns.tryCreateCreep(spawn,  500100000000015, 68, 1); // V 1-2 E  RAttacker
					//                           TTClRrAaHhWwCcMm,100, 3); // V 1-2 E   Attacker
					spawns.tryCreateCreep(spawn,  500100000000015,100, 2); // V 1-2 E  RAttacker
					spawns.tryCreateCreep(spawn,  200000008000005, 99, 1); // V 1-2 E     Healer
          //                                                 6
					spawns.tryCreateCreep(spawn,           130911, 79, 2); // V 1-1 E    Worker
   				//																					 +2 = 24
				}

				if(CL >= 4) spawns.tryCreateCreep(spawn,        80808, 20, Memory.totals.WORK< 8? 1:0); // E 1600 Worker
				if(CL >= 4) spawns.tryCreateCreep(spawn,        70707, 20, Memory.totals.WORK< 7? 1:0); // E 1400 Worker
				if(CL >= 3) spawns.tryCreateCreep(spawn,        60606, 20, Memory.totals.WORK< 6? 1:0); // E 1200 Worker
				if(CL >= 3) spawns.tryCreateCreep(spawn,        50505, 20, Memory.totals.WORK< 5? 1:0); // E 1000 Worker
				if(CL >= 3) spawns.tryCreateCreep(spawn,        40404, 20, Memory.totals.WORK< 4? 1:0); // E  800 Worker

				if(CL >= 2) spawns.tryCreateCreep(spawn,          506, 15, Memory.totals.CARRY< 6? 1:0); // E 550 Carier

				if(CL >= 1) spawns.tryCreateCreep(spawn,          303, 10, Memory.totals.CARRY< 3? 1:0); // E 300 Carier
			}

			if(spawn.spawning) {
				spawn.spawning.setDirections([RIGHT]);

				var spawningCreep = Game.creeps[spawn.spawning.name];
				spawn.room.visual.text('🛠️' + spawn.spawning.name
															 , spawn.pos.x + 1
															 , spawn.pos.y
															 , {align: 'left', opacity: 0.8});
			}
		}
	}
};

module.exports = spawns;
