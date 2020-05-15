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
				mittl_to_spawn = range < 50? body.length*3 + range + 15: body.length*3;
			}
			const needed_plus = Math.min(needed+plus+minus, max_needed) + (mittl < mittl_to_spawn);

			// if(Game.shard.name == 'shard0') {
			// 	console.log('Memory.CreepsNeedsByWeight:'
			// 		, JSON.stringify({weight:weight, CreepsNeedsByWeight:Memory.CreepsNeedsByWeight}));
			// }

			if(!Memory.CreepsNeedsByWeight)
				Memory.CreepsNeedsByWeight = {};

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
				const Sp1 = (All || spawn.name == 'Spawn1' || spawn.name == 'Spawn4' || spawn.name == 'Spawn11');
				const Sp2 = (All || spawn.name == 'Spawn2' || spawn.name == 'Spawn6');
				const Sp3 = (All || spawn.name == 'Spawn3' || spawn.name == 'Spawn7');
				const Sp4 = (All || spawn.name == 'Spawn5' || spawn.name == 'Spawn8');
				const Sp5 = (All || spawn.name == 'Spawn9' || spawn.name == 'Spawn10');
				const Sp12 = (Sp1 || Sp2);
				const Sp23 = (Sp2 || Sp3);
				const Sp34 = (Sp3 || Sp4);
				const Sp35 = (Sp3 || Sp5);
				const Sp123 = (Sp12 || Sp23);
				const Sp234 = (Sp23 || Sp34);


 				const L = 0; const M = 1; const H = 2; const S = 3; const X = extra_upgrade; const U = !Memory.stop_upgrading;

				if(false) {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, 'EXTRA UPGRADE:'
											, JSON.stringify({total_energy:total_energy, extra_upgrade:extra_upgrade, X:X})
										);
				}

				                  //   L       M       H
				const WORKER = [ [     0,      0,      0]  // 0  000
											 , [ 10101,  10202,  20101]  // 1  300
											 , [ 10503,  20403,  30203]  // 2  550
											 , [ 30504,  40404,  50303]  // 3  800
											 , [ 50907,  60606,  80406]  // 4 1300
											 , [ 61410,  90909, 120408]  // 5 1800
											 , [130911, 140711, 160410]  // 6 2300
											 , [201020, 161616, 250817]  // 7 5600
                       ];
        const CARIER = [ [     0,      0,      0]  // 0  000
											 , [   101,    201,    402]  // 1  300
											 , [   505,    603,    704]  // 2  550
											 , [   808,    905,   1005]  // 3  800
											 , [  1313,   1407,   1608]  // 4 1300
											 , [  1818,   2010,   2412]  // 5 1800
											 , [  2323,   2613,   3015]  // 6 2300
											 , [  2525,   3216,   3317]  // 7 5600
                       ];
				const ATTACKER = [ [                0,                0,                0]  // 0  000
											 	 , [        200000002,        200000002,        200000002]  // 1  300
											 	 , [        400000004,        400000004,        400000004]  // 2  550
											 	 , [        600000006,        600000006,        600000006]  // 3  800
											 	 , [       1000000010,       1000000010,       1000000010]  // 4 1300
											 	 , [       1300000013,       1300000013,       1300000013]  // 5 1800
											 	 , [       1700000017,       1700000017,       1700000017]  // 6 2300
											 	 , [       2005000025,     250000000025,       1213000025
														,       2112000017,     190006000025]  // 7 5600
												 , [     250008000017,     200013000017,     300010000010 // 8 12900
														,       2515000010,     400000000010,       4000000010]
										   	 ];//TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm
				const HEALER =   [ [                0,                0,                0]  // 0   000
											 	 , [          1000001,          1000001,          1000001]  // 1   300
											 	 , [          1000001,          1000006,          2000001]  // 2   550
											 	 , [          2000002,          2000004,          2000006]  // 3   800
											 	 , [          4000004,          4000005,          4000006]  // 4  1300
											 	 , [          6000006,          6000006,          6000006]  // 5  1800
											 	 , [          7000007,          7000009,          7000011]  // 6  2300
												 , [         16000032,  800000017000025,  300000018000021]  // 7  5600
												 , [         25000025,         33000017,         40000010]  // 8 12900
										   	 ];
				const CLAIMER =  [ [                0,                0,                0]  // 0  000
											 	 , [           			0,                0,                0]  // 1  300
											 	 , [                0,                0,                0]  // 2  550
											 	 , [    1000000000002,    1000000000002,    1000000000002]  // 3  800
											 	 , [    2000000000002,    2000000000002,    2000000000002]  // 4 1300
											 	 , [    2000000000002,    2000000000003,    2000000000004]  // 5 1800
											 	 , [    3000000000003,    3000000000004,    3000000000006]  // 6 2300
												 , [    2000000000004,    8000000000010,    8000000000014]  // 7 5600
												];

        if(Game.shard.name == 'shard1') {
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

  				if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S29')) {
  					if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[1][M], 15, 1, 1);
  				}
  				else {
  					const f = 0+!!flags.flags['11'];
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[3][M], 16, 4, 4);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[3][M], 15, 3, 3);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[3][M], 14, 2, 2);
  					if(Sp1) spawns.tryCreateCreep(spawn, CARIER[2][H], 11, 1+f, 1+f);
  					//if(Sp1) spawns.tryCreateCreep(spawn,   WORKER[7][H], 404, 3, 3);
  				}
        }

				if(Game.shard.name == 'shard0') {
					// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
					// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
					// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
					// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
					// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
					// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
					// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker
					if(true) {
						const f = 0+!!flags.flags['304'];
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[5][M], 304, 0+f, 0+f);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 405, 1, 1);
					}
					else {
						const f = 0+!!flags.flags['401'];
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[6][H], 404, 3, 3);
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[4][H], 401, 2+f, 2+f);
						//if(Sp1) spawns.tryCreateCreep(spawn,   WORKER[7][H], 404, 3, 3);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S53')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 415, 1, 1);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S53')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 410, 1, 1);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 414, 1, 1);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][L], 411, 1, 1);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 425, 1, 1);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 420, 1, 1);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 424, 1, 1);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[6][L], 421, 1, 1);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 435, 1, 1);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 430, 1, 1);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 434, 1, 1);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[6][L], 431, 1, 1);
					}/*
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S51')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[4][M], 455, 1, 1);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S51')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[4][H], 450, 1, 1);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[4][M], 454, 1, 1);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[4][L], 451, 2, 2);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[4][M], 445, 1, 1);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[4][H], 440, 1, 1);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[4][L], 441, 1, 1);
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[4][M], 444, 1, 1);
					}*//*
					if(Sp1 && (Game.time % 2000 < 500) ) spawns.tryCreateCreep(spawn,   HEALER[2][M], 1000, 1, 1);
          if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[6][L], 461, 1, 1);*/
				}

				if(Game.shard.name == 'shard3') {

					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker
					// 22*1800+2*1300+4*650 = 44800 -> 30 per game tick
					if(false) {
						spawns.tryCreateCreep(spawn,     3015, 31, 1); // Carier
						spawns.tryCreateCreep(spawn,   100608, 39, 1); // Worker
						spawns.tryCreateCreep(spawn,     3015, 40, 1); // Carier
						spawns.tryCreateCreep(spawn,   111111, 49, 2); // Worker
						spawns.tryCreateCreep(spawn, ATTACKER[7][L], 53, 8);
					}
					else {
						if(conditions.TO_SPAWN_MAIN_ROOMS()) {
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S33')) {
								if(Sp1) spawns.tryCreateCreep(spawn,   CARIER[7][H], 32, 1, 1);
								if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 36, 1, 1);
								if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 35, 1, 1);
								if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[7][H], 37, 1, 1);
							}
							else {
								const f = 0+!!flags.flags['31'];
								if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[7][H], 34, 1, 1);
								if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][M], 31, 1+f, 1+f);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S33')) {
								if(Sp2) spawns.tryCreateCreep(spawn,   CARIER[7][H], 42, 1, 1);
								if(Sp2) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 46, 1, 1);
								if(Sp2) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 45, 1, 1);
								if(Sp2) spawns.tryCreateCreep(spawn,   HEALER[7][H], 47, 1, 1);
							}
							else {
								const f = 0+!!flags.flags['41'];
								if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[7][H-X], 44, 1+X+X+X, 1+X+X+X);
								if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][M], 41, 1+f, 1+f);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S33')) {
								if(Sp3) spawns.tryCreateCreep(spawn,   CARIER[7][H], 62, 1, 1);
								if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 66, 1, 1);
								if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 65, 1, 1);
								if(Sp3) spawns.tryCreateCreep(spawn,   HEALER[7][H], 67, 1, 1);
							}
							else {
								const f = 0+!!flags.flags['61'];
								if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 64, 1+X+X, 1+X+X);
								if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 61, 1+f, 1+f);
							}
							// if(Sp3) spawns.tryCreateCreep(spawn,  ATTACKER[7][H], 95, 1, 1);
							// if(Sp3) spawns.tryCreateCreep(spawn,  ATTACKER[7][H],175, 1, 1);
	            if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S33')) {
	              if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 55, 1, 1);
	            }
	            else {
	              if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S33')) {
	                if(Sp23)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 50, 1, 1);
	              }
	              if(Sp23)	spawns.tryCreateCreep(spawn, WORKER[7][H], 54, 1, 1);
	              if(Sp23)	spawns.tryCreateCreep(spawn, CARIER[7][M], 51, 1, 1);
	            }
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S35')) {
								if(Sp4) spawns.tryCreateCreep(spawn,   CARIER[7][H], 122, 1, 1);
								if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 126, 1, 1);
								if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 125, 1, 1);
								if(Sp4) spawns.tryCreateCreep(spawn,   HEALER[7][H], 127, 1, 1);
							}
							else {
								const f = 0+!!flags.flags['121'];
								if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][H], 124, 1, 1);
								if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 121, 1+f, 1+f);
							}
							// if(Sp3) spawns.tryCreateCreep(spawn, CARIER[3][L],  91, 1, 1);
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S32')) {
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][H], 172, 1, 1);
								if(Sp5) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 176, 1, 1);
								if(Sp5) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 175, 1, 1);
								if(Sp5) spawns.tryCreateCreep(spawn,   HEALER[7][H], 177, 1, 1);
							}
							else {
								// if(Sp5) spawns.tryCreateCreep(spawn, ATTACKER[7][S], 175, 1, 1);
								// if(Sp5) spawns.tryCreateCreep(spawn,   HEALER[7][H], 177, 1, 1);
								const f = 0+!!flags.flags['171'];
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][H], 171, 1+f, 1+f);
								if(Sp5) spawns.tryCreateCreep(spawn,   WORKER[7][H], 174, 1, 1);
								// if(Sp5) spawns.tryCreateCreep(spawn,   CLAIMER[7][L], 400, 1, 1);
								// if(Sp5) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 335, 1, 1);
								// if(Sp5) spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 336, 1, 1);

								if(Sp5 && !!flags.flags['404']) spawns.tryCreateCreep(spawn,   WORKER[7][H], 404, 1, 1);
							}
						}

						if(conditions.TO_SPAWN_CLAIMING_ROOMS()) {
							// if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S33')) {
							// 	if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 105, 1, 1);
	            // }
	            // else {
							// 	if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S33')) {
							// 		if(Sp3) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 100, 1, 1);
	            //   }
							// 	if(Sp3) spawns.tryCreateCreep(spawn, WORKER[6][L], 104, 1, 1);
							// 	if(Sp3) spawns.tryCreateCreep(spawn, CARIER[4][H], 101, 1, 1);
	            // }
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S34')) {
								if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 115, 1, 1);
							}
							else {
								if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S34')) {
									if(Sp34) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 110, 1, 1);
	              }
								if(Sp34) spawns.tryCreateCreep(spawn, WORKER[6][L], 114, 1, 1);
								if(Sp34) spawns.tryCreateCreep(spawn, CARIER[4][H], 111, 1, 1);
							}
	            if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S35')) {
	              if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 135, 1, 1);
								//if(Sp4) spawns.tryCreateCreep(spawn,     HEALER[L] , 137, 1, 1);
	            }
	            else {
	              if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S35')) {
	                if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 130, 1, 1);
	              }
	              if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][H], 134, 1, 1);
	              if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 131, 1, 1);
	            }
							// if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S36')) {
							// 	if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 145, 1, 1);
							// }
							// else {
							// 	if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S36')) {
							// 		if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 140, 1, 1);
	            //   }
	            //   if(Sp4) spawns.tryCreateCreep(spawn, WORKER[6][L], 144, 1, 1);
	            //   if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 141, 1, 1);
							// }
	          }

	          if(conditions.TO_SPAWN_CLAIMING_ROOMS2()) {
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S34')) {
								if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 86, 1, 1);
								// if(Sp4) spawns.tryCreateCreep(spawn,   HEALER[7][H], 87, 1, 1);
							}
							else {
								if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S34')) {
									if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][H], 80, 1, 1);
								}
								//if(Sp34) spawns.tryCreateCreep(spawn,   WORKER[7][H], 84, 1, 1);
								//if(Sp34) spawns.tryCreateCreep(spawn,   CARIER[7][H], 81, 1, 1);
							}
						}
					}

					if(conditions.TO_SPAWN_CLAIMING_ROOMS3()) {
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S37')) {
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 155, 1, 1);
	                //if(Sp4) spawns.tryCreateCreep(spawn,      HEALER[L], 157, 1, 1);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S37')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 150, 1, 1);
							}
							if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][M], 154, 1, 1);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 151, 1, 1);
						}

						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S37')) {
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 165, 1, 1);
							//if(Sp4) spawns.tryCreateCreep(spawn,      HEALER[L], 167, 1, 1);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S37')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 160, 1, 1);
							}
							//if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 151, 1, 1);
							if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][H], 164, 1, 1);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 161, 1, 1);
						}
					}

	        if(conditions.TO_SPAWN_CLAIMING_ROOMS4()) {
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S32')) {
							if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 95, 1, 1);
							//if(Sp3) spawns.tryCreateCreep(spawn,   HEALER[7][L], 97, 1, 1);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S32')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][H], 90, 1, 1);
							}
							if(Sp3) spawns.tryCreateCreep(spawn, WORKER[5][H], 94, 1, 1);
							if(Sp3) spawns.tryCreateCreep(spawn, CARIER[5][H], 91, 1, 1);
						}
	        }

					if(conditions.TO_SPAWN_KEEPERS_ROOMS()) {
						// if(Sp1)  spawns.tryCreateCreep(spawn, ATTACKER[7][S], 205, 1, 1);
						if(conditions.TO_SPAWN_ROOM_EXTRA_DEFENDERS('W25S34')) {
							if(Sp1)  spawns.tryCreateCreep(spawn, ATTACKER[8][H], 205, 1, 1);
						}
						if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[8][H+3], 206, 1, 1);
						if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][H], 207, 2, 2);
						// if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S35')) {
						// 	if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 195, 2, 2);
						// 	if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[7][H], 197, 1, 1);
						// }
						// else {
						// 	if(Sp12) spawns.tryCreateCreep(spawn, WORKER[7][H], 194, 3, 3);
						// 	if(Sp12) spawns.tryCreateCreep(spawn, CARIER[7][M], 191, 3, 3);
						// }
						/*
						if(Sp12) spawns.tryCreateCreep(spawn,   WORKER[7][H], 204, 2, 2);
						if(Sp12) spawns.tryCreateCreep(spawn,   CARIER[7][M], 201, 2, 2);*/

						// if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][L], 227, 1, 1);
						// if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][L], 225, 1, 1);
					}

					if(conditions.TO_SPAWN_TO_ATTACK()) {
						// if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 86, 2, 2);
						// if(Sp34) spawns.tryCreateCreep(spawn,   HEALER[7][H], 87, 1, 1);
					}
				}

			}

			if(spawn.spawning) {
				spawn.spawning.setDirections([TOP, TOP_LEFT, LEFT, BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT, RIGHT, TOP_RIGHT]);

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
