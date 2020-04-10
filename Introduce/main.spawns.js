const constants = require('main.constants');
const conditions = require('main.conditions');
const terminals = require('main.terminals');
const config = require('main.config');
const flags = require('main.flags');
const cash = require('cash');
const tools = require('tools');

var last_game_time_created_creep = {};

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

    tryCreateCreep: function(spawn, type, weight, needed = 0, max_needed = 100) {
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
			var range = 1;
			var mittl = 1667;
			var mittl_to_spawn = 1667;
			const target_idle_sum_pst = 20;
			var sum_pst = 0;
			if(!!Memory.CreepsNumberByWeight[weight]) {
				//existsNumber = Memory.CreepsNumberByType[full_type];
				existsNumber = Memory.CreepsNumberByWeight[weight];
			}
			var plus = 0;
			var minus = 0;
			if(!!Memory.CreepsIdleTicksByWeight[weight]) {
				sum_pst = 1+Object.keys(Memory.CreepsIdleTicksByWeight[weight]).reduce((p,c) => p +
															(!Memory.CreepsIdleTicksByWeight[weight][c].pc?1:Memory.CreepsIdleTicksByWeight[weight][c].pc),0);
				plus = (Game.cpu.bucket < constants.CPU_BUCKET_TO_SPAWN)?0:Math.floor(target_idle_sum_pst/sum_pst);
				// minus = (Game.cpu.bucket < constants.CPU_BUCKET_TO_SPAWN)?0:(target_idle_sum_pst < sum_pst ? -1:0);
			}
			if(!!Memory.CreepsMinTicksToLive[weight] && !!Memory.CreepsMinTicksToLive[weight].pos) {
				range = tools.getRangeTo(spawn.pos,Memory.CreepsMinTicksToLive[weight].pos);
				mittl = Memory.CreepsMinTicksToLive[weight].mittl;
				mittl_to_spawn = Math.round(constants.TICKS_TO_SPAWN*200/(50+range)) + body.length*3;
			}
			const needed_plus = Math.min(needed+plus+minus, max_needed) + (mittl < mittl_to_spawn);
			Memory.CreepsNeedsByWeight[weight] = {needs: needed, needs_plus: needed_plus, bodys: body.length*needed, cost: cost*needed};
			const needsNumber = needed_plus - existsNumber;
			if((!last_game_time_created_creep[spawn.name] || last_game_time_created_creep[spawn.name] != Game.time) && needsNumber > 0) {
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
				var err = spawn.spawnCreep( body
																	, newName
																	, {memory: {n: Memory.CreepsCounter, cost: cost, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
				if(err) {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, spawn.name
											, 'can\'t spawn new creep:'
											, newName
											, 'cost:'
										  , cost
											, 'err:'
											, err);
				}
				else {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, spawn.name
											, 'spawning new creep:'
											, newName
										  , 'cost:'
										  , cost
											, 'exists/needs/+:'
										  , '' + existsNumber + '/' + needed + '/' + needed_plus
											, 'sum_to_plus/sum_idle_pct:'
											, '' + target_idle_sum_pst + '/' + sum_pst
											, 'mittl/to_spawn:'
											, '' + mittl + '/' + mittl_to_spawn
										 );

          Memory.CreepsCounter++;
          Memory.totals.SpawningCreeps++;
					if(!Memory.CreepsNumberByWeight[weight])
						Memory.CreepsNumberByWeight[weight] = 0;
					Memory.CreepsNumberByWeight[weight]++;
					last_game_time_created_creep[spawn.name] = Game.time;
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

    const Nspawns = Object.keys(Game.spawns).length;
    const I = Game.time % constants.TICKS_TO_SPAWN;
		const rerun = (Game.time % constants.TICKS_TO_SPAWN_BY_ANY) < Nspawns;

		if(I >= Nspawns || Game.cpu.bucket < constants.CPU_BUCKET_TO_SPAWN)
			return;

			// console.log('✒️', Math.trunc(Game.time/10000), Game.time%10000
			// 						, 'spawning:'
			// 						, JSON.stringify({I:I,N:Nspawns}));

		if(!!rerun && I == 0)
			Memory.CreepsNeedsByWeight = {};

		// for(var name in Game.spawns)
     {
			var spawn = Game.spawns[Object.keys(Game.spawns)[I]];
			// console.log('✒️', Math.trunc(Game.time/10000), Game.time%10000
			// 						, 'spawn:'
			// 						, JSON.stringify(spawn));

			if(!spawn.spawning && spawn.name != 'Spawn19' && Nspawns) {

				var controller = spawn.room.controller;
				const CL = controller.level;
				var N = Memory.totals.CreepsNumber;
				const total_energy = cash.getTotalEnergy();
				const extra_upgrade = conditions.TO_EXTRA_UPGRADE(total_energy);
				const All = !!rerun;
				const Sp1 = (All || spawn.name == 'Spawn1' || spawn.name == 'Spawn4');
				const Sp2 = (All || spawn.name == 'Spawn2' || spawn.name == 'Spawn6')
				const Sp3 = (All || spawn.name == 'Spawn3');
				const Sp4 = (All || spawn.name == 'Spawn5');
				const Sp12 = (Sp1 || Sp2);
				const Sp23 = (Sp2 || Sp3);
				const Sp34 = (Sp3 || Sp4);
				const Sp123 = (Sp12 || Sp23);
				const Sp234 = (Sp23 || Sp34);

				if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
				if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
				if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
				if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
				if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
				if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
				if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

 				const L = 0; const M = 1; const H = 2; const X = extra_upgrade; const U = !Memory.stop_upgrading;
				                  //   L       M       H
				const WORKER = [ [     0,      0,      0]  // 0  000
											 , [ 10101,  10202,  20101]  // 1  300
											 , [ 10503,  20403,  30203]  // 2  550
											 , [ 30504,  40404,  50204]  // 3  800
											 , [ 50907,  70506,  80406]  // 4 1300
											 , [ 61410,  90909, 120408]  // 5 1800
											 , [130911, 140711, 160410]  // 6 2300
											 , [102216, 161616, 250817]  // 7 5300
                       ];
        const CARIER = [ [     0,      0,      0]  // 0  000
											 , [   101,    201,    402]  // 1  300
											 , [   505,    603,    704]  // 2  550
											 , [   808,    905,   1005]  // 3  800
											 , [  1313,   1407,   1608]  // 4 1300
											 , [  1818,   2010,   2412]  // 5 1800
											 , [  2323,   2613,   3015]  // 6 2300
											 , [  2525,   3216,   3317]  // 7 5300
                       ];
				const ATTACKER = [500000500000010, 1000000500000015];
				const HEALER = 500000007000006;
				const CLAIMER = 2000000000002;

				// 22*1800+2*1300+4*650 = 44800 -> 30 per game tick
				if(false) {
					spawns.tryCreateCreep(spawn,     3015, 31, 1); // Carier
					spawns.tryCreateCreep(spawn,   100608, 39, 1); // Worker
					spawns.tryCreateCreep(spawn,     3015, 40, 1); // Carier
					spawns.tryCreateCreep(spawn,   111111, 49, 2); // Worker
					spawns.tryCreateCreep(spawn, ATTACKER[M], 53, 8);
				}
				else {
					if(conditions.TO_SPAWN_MAIN_ROOMS()) {
						if(Sp12	)	spawns.tryCreateCreep(spawn, WORKER[5][H], 34, 1, 1);
						if(Sp12	)	spawns.tryCreateCreep(spawn, CARIER[6][H], 31, 1, 1);
						if(Sp12	)	spawns.tryCreateCreep(spawn, WORKER[6][H], 44, 1, 1);
						if(Sp12	)	spawns.tryCreateCreep(spawn, CARIER[6][H], 41, 1, 1);
						if(Sp123)	spawns.tryCreateCreep(spawn, WORKER[7][H], 64, 1, 2+X+X);
						if(Sp234)	spawns.tryCreateCreep(spawn, CARIER[6][H], 61, 1, 1);
            if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S35')) {
              if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[M], 125, 1, 1);
            }
            else {
              if(Sp123) spawns.tryCreateCreep(spawn, WORKER[6+X][M+X], 124, 1, 2+X);
              if(Sp34) spawns.tryCreateCreep(spawn, CARIER[4][H], 121, 1, 1);
            }
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S33')) {
							if(Sp123)	spawns.tryCreateCreep(spawn, ATTACKER[M], 55, 1, 1);
						}
            else {
              if(Sp123)	spawns.tryCreateCreep(spawn,      CLAIMER, 50, 1, 1);
  						if(Sp123)	spawns.tryCreateCreep(spawn, WORKER[7][H], 54, 1, 1);
  						if(Sp123)	spawns.tryCreateCreep(spawn, CARIER[6][H], 51, 1, 1);
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S33')) {
								if(Sp234) spawns.tryCreateCreep(spawn, ATTACKER[M], 105, 1, 1);
							}
							else {
								if(Sp234) spawns.tryCreateCreep(spawn,      CLAIMER, 100, 1, 1);
								if(Sp234) spawns.tryCreateCreep(spawn, WORKER[4][H], 104, 1, 1);
								if(Sp234) spawns.tryCreateCreep(spawn, CARIER[4][H], 101, 1, 1);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S34')) {
								if(Sp234) spawns.tryCreateCreep(spawn, ATTACKER[M], 105, 1, 1);
							}
							else {
								if(Sp234) spawns.tryCreateCreep(spawn,      CLAIMER, 110, 1, 1);
								if(Sp234) spawns.tryCreateCreep(spawn, WORKER[4][H], 114, 1, 1);
								if(Sp234) spawns.tryCreateCreep(spawn, CARIER[4][H], 111, 1, 1);
							}
            }
					}
					if(conditions.TO_SPAWN_CLAIMING_ROOMS()) {
            if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S35')) {
              if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[L], 135, 1, 1);
            }
            else {
              if(Sp34) spawns.tryCreateCreep(spawn,      CLAIMER, 130, 1, 1);
              if(Sp34) spawns.tryCreateCreep(spawn, WORKER[6][H], 134, 1, 1);
              if(Sp34) spawns.tryCreateCreep(spawn, CARIER[6][H], 131, 1, 1);
            }
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S36')) {
							if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[L], 145, 1, 1);
						}
						else {
							if(Sp34) spawns.tryCreateCreep(spawn,      CLAIMER, 140, 1, 1);
							if(Sp34) spawns.tryCreateCreep(spawn, WORKER[4][H], 144, 1, 1);
              if(Sp34) spawns.tryCreateCreep(spawn, CARIER[4][H], 141, 1, 1);
							if(conditions.TO_SPAWN_CLAIMING_ROOMS2()) {
								if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S32')) {
									if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[M], 95, 1, 1);
									// if(Sp3) spawns.tryCreateCreep(spawn,  HEALER,97, 1, 1);
								}
								else {
									if(Sp3) spawns.tryCreateCreep(spawn,  CLAIMER, 90, 1, 2);
								}
							}
							if(conditions.TO_SPAWN_CLAIMING_ROOMS3()) {
								if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S37')) {
									if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[M], 155, 1, 1);
									if(Sp34) spawns.tryCreateCreep(spawn,   HEALER, 157, 1, 1);
								}
								else {
									if(Sp34) spawns.tryCreateCreep(spawn,  CLAIMER, 150, 1, 1);
									if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S37')) {
										if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[M], 165, 1, 1);
										if(Sp34) spawns.tryCreateCreep(spawn,   HEALER, 167, 1, 1);
									}
									else {
										if(Sp34) spawns.tryCreateCreep(spawn,  CLAIMER, 160, 1, 2);
									}
								}
							}
						}
					}
					//                                                                                      30)
					//                                                                 TTClRrAaHhWwCcMm,100, 3); // V 1-2 E  Attacker
					if(conditions.TO_SPAWN_KEEPERS_ROOMS()) {
						if(Sp2) spawns.tryCreateCreep(spawn, 1500001000000025, 75, 2, 2); // V 1-2 E  Attacker
						if(Sp2) spawns.tryCreateCreep(spawn,           130911, 74, 1, 2); // V 1-1 E    Worker
						if(Sp2) spawns.tryCreateCreep(spawn,              804, 71, 1, 2); // V 1-1 E    Carier
						if(Sp2) spawns.tryCreateCreep(spawn, 1000100000000010, 76, 0, 0); // V 1-2 E RAttacker
						if(Sp2) spawns.tryCreateCreep(spawn,  HEALER, 77, 1, 1); // V 1-1 E    Healer
					}
					if(conditions.TO_SPAWN_TO_ATTACK()) {
						if(Sp2) spawns.tryCreateCreep(spawn, 1000000005000015, 87, 5, 5); // V 1-1 E    Healer
					}
				}
			}

			if(spawn.spawning) {
				spawn.spawning.setDirections([BOTTOM_RIGHT, RIGHT]);

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
