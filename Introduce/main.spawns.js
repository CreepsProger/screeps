const constants = require('main.constants');
const conditions = require('main.conditions');
const terminals = require('main.terminals');
const config = require('main.config');
const flags = require('main.flags');
const cash = require('cash');
const tools = require('tools');
const tasks = require('tasks');

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

    tryCreateCreep: function(spawn, type, weight, boosts = undefined, needed = flags.getNeeded(weight), max_needed = flags.getMaxNeeded(weight, needed)) {
			
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

			if((!last_game_time_created_creep[spawn.name] || last_game_time_created_creep[spawn.name] != Game.time) &&
				 needsNumber > 0) {
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
				var boostLabsReady = true;
				if(!!boosts) { // [["XUH2O",10,1],["XGHO2"],["XZHO2"],["XLHO2"]]
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({weight:weight, spawn:spawn, boosts:boosts}));
					const labs = [];/*
				boostLabsReady = boosts.filter((b) => !!b[2] && b[2] != 0) // check only mandatory 
																.filter((b) => labs.some((l) => !l.e || l.e < b[1]*20 || !l.m || l.m < b[1]*30))
																.reduce((c,p) => c++, 0) == 0;*/
				// tasks.addTasksToFillBoostingLab(newName, spawn.room.roomName, boosts);
				}
				const transferCreepConfig = flags.getTransferCreepConfig(newName, spawn.room.name);
				if(!!transferCreepConfig){
					const storage = spawn.room.storage;
					if(!!storage && !!storage.store ) {
						const amount = Object.keys(storage.store)
																.filter((k) => transferCreepConfig.includes(k))
																.reduce((a,r) => a + storage.store[r], 0);
						if(amount < Cs * 50 * 2) {
							console.log('🚚🚫', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'tryCreateCreep', newName:newName
																				, room:spawn.room.name, amount:amount, transferCreepConfig:transferCreepConfig}));
							return false;
						}
					}
				}
				var err = spawn.spawnCreep( body
																	, newName
																	, {memory: {n: Memory.CreepsCounter, cost: cost, weight: weight, type: type, role: 'creep', boosts:boosts, transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
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
											, '' + mittl + '/' + mittl_to_spawn, 'boosts', boosts
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

			if(!spawn.spawning && Nspawns) {

				var controller = spawn.room.controller;
				const CL = controller.level;
				var N = Memory.totals.CreepsNumber;
				const total_energy = cash.getTotalEnergy();
				const extra_upgrade = conditions.TO_EXTRA_UPGRADE(total_energy);
				const All = !!rerun;
				const Sp1 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn3'  || spawn.name == 'Spawn7'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn13'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn11'):All;
				const Sp2 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn6'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn7'  || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn6'  || spawn.name == 'Spawn15'):All;
				const Sp3 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn--' || spawn.name == 'Spawn8'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn3'  || spawn.name == 'Spawn6'  || spawn.name == 'Spawn12'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn3'  || spawn.name == 'Spawn7'  || spawn.name == 'Spawn12'):All;
				const Sp4 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn10' || spawn.name == 'Spawn12' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn14'):All;
				const Sp5 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn13'):All;
				const Sp6 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn15' || spawn.name == 'Spawn22'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn16' || spawn.name == 'Spawn17' || spawn.name == 'Spawn--'):All;
				const Sp7 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn14' || spawn.name == 'Spawn18' || spawn.name == 'Spawn21'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp8 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn20' || spawn.name == 'Spawn23' || spawn.name == 'Spawn25'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp9 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn24' || spawn.name == 'Spawn26' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp10= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;

				const Sp12 = (Sp1 || Sp2);
				const Sp23 = (Sp2 || Sp3);
				const Sp34 = (Sp3 || Sp4);
				const Sp35 = (Sp3 || Sp5);
				const Sp123 = (Sp12 || Sp23);
				const Sp234 = (Sp23 || Sp34);


 				const L = 0; const M = 1; const H = 2; const S = 3; const X = extra_upgrade; const U = !Memory.stop_upgrading;
				const L2 = 6; const M2 = 7; const H2 = 8;

				if(false) {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, 'EXTRA UPGRADE:'
											, JSON.stringify({total_energy:total_energy, extra_upgrade:extra_upgrade, X:X})
										);
				}

				                  //   L       M       H
				const CARIER = [ [     0,      0,      0]  // 0  000
											 , [   101,    201,    402]  // 1  300
											 , [   505,    603,    704]  // 2  550
											 , [   808,    905,   1005]  // 3  800
											 , [  1313,   1407,   1608]  // 4 1300
											 , [  1616,   1818,   2412]  // 5 1800
											 , [  2323,   2613,   3015]  // 6 2300
											 , [  2525,   3216,   3317, 4010, 500000000002025]  // 7 5600
											 , [ 200000003002025,  200000003003510, 400000006003010 ]  // 8 12900
											 , [ 500000010000116,  0, 0 ]  // 9 12900
												//TTClRrAaHhWwCcMm  TTClRrAaHhWwCcMm TTClRrAaHhWwCcMm
											];
				const WORKER = [ [     0,      0,      0]  // 0  000
											 , [ 10101,  10202,  20101]  // 1  300
											 , [ 10503,  20403,  30203]  // 2  550
											 , [ 30504,  40404,  50303]  // 3  800
											 , [ 50907,  60606,  80406]  // 4 1300
											 , [ 70707,  90909, 120408]  // 5 1800
											 , [130911, 140711, 160410, 111111]  // 6 2300
											 , [201020, 161616, 250817, 400206, 200525, 151025]  // 7 5600
											 , [201216, 153005, 250025, 400010, 151515]  // 8
                       ];
				const UPGRADER = [ 151515, 152510, 201020  // 0  000
                         ];
				const ATTACKER = [ [                 0,                0,                0]  // 0  000
											 	 , [         200000002,        200000002,        200000002]  // 1  300
											 	 , [         400000004,        400000004,        400000004]  // 2  550
											 	 , [         600000006,        600000006,        600000006]  // 3  800
											 	 , [        1000000010,       1000000010,       1000000010]  // 4 1300
											 	 , [        1300000013,       1300000013,       1300000013]  // 5 1800
											 	 , [        1700000017,       1700000017,       1700000017]  // 6 2300
											 	 , [        2005000025,     250000000025,       1213000025
													 ,        2112000017,     190006000025]  // 7 5600
												 , [      250008000017,     170008000025,  400001308000025 // 8 12900
												 ,          2515000010,     400000000010,  400004000000006] 
												 , [      170008000025,     170008000025,     170008000025]//9 
												 , [   500000000200025, 1000002010000010, 2100000019000010]//10 
												 , [  1100002110000006, 2000200000000010, 2000000020000010, 4200000000010007]//11 
												 , [  1000000030000010,  500003500000010, 5000350000000010,  500000035000010]//12
										   	 ]; //TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm
				const HEALER =   [ [                0,                0,                0]  // 0   000
											 	 , [          1000001,          1000001,          1000001]  // 1   300
											 	 , [          1000001,          1000006,          2000001]  // 2   550
											 	 , [          2000002,          2000004,          2000006]  // 3   800
											 	 , [          4000004,          4000005,          4000006]  // 4  1300
											 	 , [          6000006,          6000006,          6000006]  // 5  1800
											 	 , [          7000007,          7000009,          7000011]  // 6  2300
												 , [         16000032,  800000017000025,  300000018000021]  // 7  5600
												 , [         25000025,         33000017,         42000008]  // 8 12900
										   	 ];
				const CLAIMER =  [ [                0,                0,                0]  // 0  000
											 	 , [           			0,                0,                0]  // 1  300
											 	 , [                0,                0,                0]  // 2  550
											 	 , [    1000000000002,    1000000000002,    1000000000002]  // 3  800
											 	 , [    2000000000002,    2000000000002,    2000000000002]  // 4 1300
											 	 , [    2000000000002,    2000000000003,    2000000000004]  // 5 1800
											 	 , [    3000000000003,    3000000000004,    3000000000006]  // 6 2300
												 , [    4000000000004,    8000000000010,    8000000000014]  // 7 5600
												 , [   10000000000010,   10000000000020,   19000000000019]  // 8 12900
												];
				const D = 0; const A = 1; const R = 2; const HR = 3;
				const DEFENDER = [ [                 0,                0,                0]  // 0  000
													, [ 1000000030000010,  500003500000010,  500350000000010,  500000035000010] //1
													, [                0,  500002109000005,  0, 0] //2
										   	 ]; //TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm
	

        if(Game.shard.name == 'shard1') {
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

  				if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S29')) {
  					if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5016);
  				}
  				else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 5014);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[8][M], 5015);
  					if(Sp12) spawns.tryCreateCreep(spawn, CARIER[7][H], 5011);
						if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, CARIER[8][L], 63);
						if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, CARIER[8][L], 173);
						if(spawn.name == 'Spawn4') spawns.tryCreateCreep(spawn, CARIER[7][L], 403);
  					//if(Sp1) spawns.tryCreateCreep(spawn,   WORKER[7][H], 404, undefined, 3, 3);
  				}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S31')) {
						if(Sp4)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5086);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5084);
						if(Sp4)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5081);
						if(Sp4)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5085);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S29')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5026);
					}
					else {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5024);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5021);
						if(Sp2)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5025);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S28')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][L], 5036);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5030);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5034);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5031);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S28')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5046);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5040);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5044);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][M], 5041);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5056);
					}
					else {
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5054);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5051);
						if(Sp3)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5055);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5066);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S29')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5060);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][H], 5064);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5061);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5076);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W25S29')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5070);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5074);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5071);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S27')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5106);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S27')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5100);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5104);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5101);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S28')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5116);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S28')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5110);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5114);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5111);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S28')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5136);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S28')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5130);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5134);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5131);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S27')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5146);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S27')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5140);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5144);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5141);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5126);
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5124);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5121);
						if(Sp5)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5125);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S27')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5276);
					}
					else {
						if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5271);
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5274);
						if(Sp9)	spawns.tryCreateCreep(spawn, UPGRADER[H], 5275);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5186);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5180);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5184);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5181);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5176);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5170);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5174);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5171);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5166);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S28')) {
							if(Sp6) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5160);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5164);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5161);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5216);
					}
					else {
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5214);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5211);
						if(Sp6)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5215);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S27')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5226);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W21S27')) {
							if(Sp6)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5220);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5224);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5221);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5246);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S28')) {
							if(Sp6)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5240);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5244);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5241);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S29')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5236);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S29')) {
							if(Sp6)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5230);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5234);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5231);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S27')) {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5206);
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn,   WORKER[7][M], 5204);
						if(Sp8)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5201);
						if(Sp8)	spawns.tryCreateCreep(spawn,    UPGRADER[H], 5205);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S27')) {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5196);
					}
					else {
						if(Sp7)	spawns.tryCreateCreep(spawn,   WORKER[7][H], 5194);
						if(Sp7)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5191);
						if(Sp7)	spawns.tryCreateCreep(spawn,   UPGRADER[L], 5195);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S26') &&
						 tools.getInviderCoreLevel('W24S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W24S26') == 1) {
							if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5267);
						}
					}
					else {
						if(Sp7)	spawns.tryCreateCreep(spawn,ATTACKER[9][L], 5266);
						if(Sp7)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5264);
						if(Sp7)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5261);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S28')) {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5156);
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5151);
						if(Sp8)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5154);
						if(Sp8)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5155);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S26') &&
						 tools.getInviderCoreLevel('W25S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W25S26') == 1) {
							if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5257);
						}
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn,ATTACKER[9][L], 5256);
						if(Sp8)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5254);
						if(Sp8)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5251);
					}
        }

				if(Game.shard.name == 'shard0') {
					if(true) {
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[3][H], 301);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[5][M], 304);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 406);
					}
					else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 404);
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[7][M], 401);
						if(Sp1) spawns.tryCreateCreep(spawn, UPGRADER[L], 405);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S53')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 416);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S53')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 410);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 414);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][M], 411);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 426);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 420);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 424);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 421); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 436);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 430);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 434);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 431);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S51')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 456);
					}
					if(true) {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][H], 454);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][M], 451);
						if(Sp2)	spawns.tryCreateCreep(spawn, UPGRADER[L], 455);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S51')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 476);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S51')) {
              if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 470);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[5][M], 474);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][L], 471); // 2
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[4][M], 466);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W55S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 460);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 464);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[6][L], 461); // 3
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 486);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 480);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 484);
            if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 481);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 446);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[7][H], 444);
						if(Sp4)	spawns.tryCreateCreep(spawn, CARIER[7][M], 441);
						if(Sp1)	spawns.tryCreateCreep(spawn, UPGRADER[H], 445);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S53')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[8][H], 556);
						if(Sp1)	spawns.tryCreateCreep(spawn, DEFENDER[2][A], 557);
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 568);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn,  WORKER[7][L], 554);
            if(Sp4)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 551);
						if(Sp1)	spawns.tryCreateCreep(spawn, UPGRADER[H], 555);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S54')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 566);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn,  WORKER[7][L], 564);
            if(Sp4)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 561);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 496);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 490);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 494);
            if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 491); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 526);
					}
					else {
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 524);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 521);
						if(Sp3)	spawns.tryCreateCreep(spawn, UPGRADER[L], 525);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 536);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W52S51')) {
              if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 530);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 534);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[6][L], 531);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 546);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S51')) {
              if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 540);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[6][S], 544);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[6][L], 541);
					}
					if(spawn.name == 'Spawn4' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[8][L], 63);
					if(spawn.name == 'Spawn4' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[8][L], 173);
					if(spawn.name == 'Spawn4' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[7][L], 5013);
					if(Sp12 && (Game.time % 500000 < 250) ) spawns.tryCreateCreep(spawn, HEALER[7][L], 1000);
					if(Sp12 && (Game.time % 500000 > 250) ) spawns.tryCreateCreep(spawn, CARIER[1][L], 1000);
				}

				if(Game.shard.name == 'shard3') {
					
					const XU = 0+(!!flags.flags['XU']+!!flags.flags['XB']);

					if(Memory.totals.CARRY < 75 && Game.cpu.bucket > 9500) spawns.tryCreateCreep(spawn,   808, undefined, 10, 3); // E  800 Carier
					if(Memory.totals.CARRY < 75 && Game.cpu.bucket > 9500) spawns.tryCreateCreep(spawn,   505, undefined, 10, 3); // E  500 Carier
					if(Memory.totals.CARRY < 75 && Game.cpu.bucket > 9500) spawns.tryCreateCreep(spawn,   303, undefined, 10, 3); // E  300 Carier
					if(Memory.totals.WORK < 25 && Game.cpu.bucket > 9500 ) spawns.tryCreateCreep(spawn, 80808, undefined, 10, 3); // E 1600 Worker
					if(Memory.totals.WORK < 25 && Game.cpu.bucket > 9500 ) spawns.tryCreateCreep(spawn, 40404, undefined, 10, 3); // E  800 Worker
					if(Memory.totals.WORK < 25 && Game.cpu.bucket > 9500 ) spawns.tryCreateCreep(spawn, 20202, undefined, 10, 3); // E  400 Worker
					if(Memory.totals.WORK < 25 && Game.cpu.bucket > 9500 ) spawns.tryCreateCreep(spawn, 10101, undefined, 10, 3); // E  200 Worker
					// 22*1800+2*1300+4*650 = 44800 -> 30 per game tick
					if(false) {
						spawns.tryCreateCreep(spawn,     3015, 31); // Carier
						spawns.tryCreateCreep(spawn,   100608, 39); // Worker
						spawns.tryCreateCreep(spawn,     3015, 40); // Carier
						spawns.tryCreateCreep(spawn,   111111, 49); // Worker
						spawns.tryCreateCreep(spawn, ATTACKER[7][L], 53);
					}
					else {
						if(conditions.TO_SPAWN_MAIN_ROOMS()) {
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S33')) {
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 36);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn,   CARIER[7][M], 32);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 37);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 38);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn,   HEALER[7][H], 39);
							}
							else {
								if(Sp1 && Game.cpu.bucket > 9000)	spawns.tryCreateCreep(spawn, WORKER[7][H], 34);
								if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][M], 31);
								if(Sp1 && Game.cpu.bucket > 7000)	spawns.tryCreateCreep(spawn, UPGRADER[L], 35);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S33')) {
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 46);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   CARIER[7][M], 42);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 47);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 48);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   HEALER[7][H], 49);
							}
							else {
								if(Sp2 && Game.cpu.bucket > 9000)	spawns.tryCreateCreep(spawn, WORKER[7][H], 44);
								if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][M], 41);
								if(Sp2 && Game.cpu.bucket > 7000)	spawns.tryCreateCreep(spawn, UPGRADER[L], 45);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S33')) {
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[5][M], 106);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S33')) {
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 66);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn,   CARIER[7][M], 62);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 67);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 68);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn,   HEALER[7][H], 69);
							}
							else {
								if(Sp3 && Game.cpu.bucket > 9000)	spawns.tryCreateCreep(spawn, WORKER[7][H], 64);
								if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 61);
								if(Sp3 && Game.cpu.bucket > 7000)	spawns.tryCreateCreep(spawn, UPGRADER[L], 65);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S35')) {
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 126);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   CARIER[7][M], 122);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 127);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 128);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   HEALER[7][H], 129);
							}
							else {
								const f = 0+!!flags.flags['121'];
								if(Sp4 && Game.cpu.bucket > 9000) spawns.tryCreateCreep(spawn, WORKER[7][H], 124);
								if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 121);
								if(Sp4 && Game.cpu.bucket > 7000) spawns.tryCreateCreep(spawn, UPGRADER[L], 125);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S32')) {
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 176);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn,   CARIER[7][M], 172);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, DEFENDER[1][A], 177);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, DEFENDER[1][R], 178);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, DEFENDER[1][HR], 179);
// 								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, DEFENDER[12][D], 176);
							}
							else {
								if(Sp5 && Game.cpu.bucket > 9000) spawns.tryCreateCreep(spawn,   WORKER[7][H], 174);
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][M], 171);
								if(Sp5 && Game.cpu.bucket > 7000) spawns.tryCreateCreep(spawn,    UPGRADER[L], 175);
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[9][L], 243);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S34')) {
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 86);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   CARIER[7][M], 82);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 87);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 88);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   HEALER[7][H], 89);
							}
							else {
								if(Sp6 && Game.cpu.bucket > 9000) spawns.tryCreateCreep(spawn,   WORKER[7][H], 84);
								if(Sp6) spawns.tryCreateCreep(spawn,   CARIER[7][M], 81);
								if(Sp6 && Game.cpu.bucket > 7000) spawns.tryCreateCreep(spawn,   UPGRADER[L], 85);
							}

							if(spawn.name == 'Spawn9' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[8][L], 5013);

							/*
							if(spawn.name == 'Spawn1')	spawns.tryCreateCreep(spawn,    CARIER[7][L], 201);
							if(spawn.name == 'Spawn1')	spawns.tryCreateCreep(spawn, ATTACKER[10][H], 207);
							if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[8][H+4], 206);
							if(Sp1)	spawns.tryCreateCreep(spawn,     WORKER[7][L], 204);
							if(spawn.name == 'Spawn1')	spawns.tryCreateCreep(spawn, ATTACKER[10][L], 205);

							if(Sp4) spawns.tryCreateCreep(spawn, HEALER[8][L], 217);
							if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[8][S], 214); // boost
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][S], 211); // boost
							if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[8][H], 215);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][L], 212);

							if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[8][S], 224); // boost
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][S], 212); // boost
							if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[8][H], 225);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][L], 222);
							
							if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[10][H], 77);
							if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[10][S], 74);
							if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[10][M], 76);
							if(spawn.name == 'Spawn6') spawns.tryCreateCreep(spawn, ATTACKER[10][L], 75);
							if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, CARIER[7][S+1], 71);
							if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 78);
							*/
						}

						if(conditions.TO_SPAWN_CLAIMING_ROOMS()) {
							// if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S33')) {
							// 	if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 105);
	            // }
	            // else {
							// 	if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S33')) {
							// 		if(Sp3) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 100);
	            //   }
							// 	if(Sp3) spawns.tryCreateCreep(spawn, WORKER[6][L], 104);
							// 	if(Sp3) spawns.tryCreateCreep(spawn, CARIER[4][H], 101);
	            // }
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S34')) {
								if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[5][M], 116);
							}
							else {
								if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S34')) {
									if(Sp34) spawns.tryCreateCreep(spawn, CLAIMER[8][L], 110);
	              }
								if(Sp34) spawns.tryCreateCreep(spawn, WORKER[6][L], 114);
								if(Sp34) spawns.tryCreateCreep(spawn, CARIER[4][H], 111);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S33')) {
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 56);
	              if(spawn.name == 'Spawn2')	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 57);
	            }
	            else {
	              if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S33')) {
	                if(Sp23)	spawns.tryCreateCreep(spawn, CLAIMER[8][L], 50);
	              }
	              if(Sp23)	spawns.tryCreateCreep(spawn, WORKER[7][H], 54);
	              if(Sp23)	spawns.tryCreateCreep(spawn, CARIER[7][M], 51);
	            }
							
							/*
	            if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S35')) {
	              if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 135);
								//if(Sp4) spawns.tryCreateCreep(spawn,     HEALER[L], 137);
	            }
	            else {
	              if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S35')) {
	                if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 130);
	              }
	              if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][H], 134);
	              if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 131);
	            }
							*/
	          }

	          if(conditions.TO_SPAWN_CLAIMING_ROOMS2()) {
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S36')) {
								if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 146);
							}
							else {
								if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S36')) {
									if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 140);
	              }
	              if(Sp4) spawns.tryCreateCreep(spawn, WORKER[5][M], 144);
	              if(Sp4) spawns.tryCreateCreep(spawn, CARIER[5][L], 141);
							}
						}
					}

					if(conditions.TO_SPAWN_CLAIMING_ROOMS3()) {
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S37')) {
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 156);
	                //if(Sp4) spawns.tryCreateCreep(spawn,      HEALER[L], 157);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S37')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 150);
							}
							if(Sp4) spawns.tryCreateCreep(spawn, WORKER[6][M], 154);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][L], 151);
						}

						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S37')) {
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 166);
							//if(Sp4) spawns.tryCreateCreep(spawn,      HEALER[L], 167);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S37')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 160);
							}
							//if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 151);
							if(Sp4) spawns.tryCreateCreep(spawn, WORKER[6][M], 164);
							if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][L], 161);
						}
					}

	        if(conditions.TO_SPAWN_CLAIMING_ROOMS4()) {
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S32')) {
							if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 96);
							//if(Sp3) spawns.tryCreateCreep(spawn,   HEALER[7][L], 97);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S32')) {
								if(Sp4) spawns.tryCreateCreep(spawn, CLAIMER[7][H], 90);
							}
							if(Sp3) spawns.tryCreateCreep(spawn, WORKER[5][H], 94);
							if(Sp3) spawns.tryCreateCreep(spawn, CARIER[5][H], 91);
						}
	        }

					if(conditions.TO_SPAWN_KEEPERS_ROOMS()) {
						// if(Sp1)  spawns.tryCreateCreep(spawn, ATTACKER[7][S], 205);
						if(conditions.TO_SPAWN_ROOM_EXTRA_DEFENDERS('W25S34')) {
							if(Sp1)  spawns.tryCreateCreep(spawn, ATTACKER[8][H], 206);
						}
						if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][H], 207);
						if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[8][H+3], 208);

						// if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S35')) {
						// 	if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 195);
						// 	if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[7][H], 197);
						// }
						// else {
						// 	if(Sp12) spawns.tryCreateCreep(spawn, WORKER[7][H], 194);
						// 	if(Sp12) spawns.tryCreateCreep(spawn, CARIER[7][M], 191);
						// }
						/*
						if(Sp12) spawns.tryCreateCreep(spawn,   WORKER[7][H], 204);
						if(Sp12) spawns.tryCreateCreep(spawn,   CARIER[7][M], 201);*/

						// if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][L], 227);
						// if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[7][L], 225);
					}

					if(conditions.TO_SPAWN_TO_ATTACK()) {
						// if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 86);
						// if(Sp34) spawns.tryCreateCreep(spawn,   HEALER[7][H], 87);
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
