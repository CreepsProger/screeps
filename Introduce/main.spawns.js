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

					if(!!boosts) {
						console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:newName, spawn:spawn, boosts:boosts}));
						tasks.addTasksToFillBoostingLab(newName, spawn.room.roomName, boosts);
					}

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
				const Sp1 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn3'  || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn11'):All;
				const Sp2 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn7'  || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn6'  || spawn.name == 'Spawn15'):All;
				const Sp3 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn3'  || spawn.name == 'Spawn6'  || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn3'  || spawn.name == 'Spawn7'  || spawn.name == 'Spawn12'):All;
				const Sp4 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn14'):All;
				const Sp5 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn13'):All;
				const Sp6 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn16' || spawn.name == 'Spawn17' || spawn.name == 'Spawn--'):All;
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
											 , [  2525,   3216,   3317, 400000006003010]  // 7 5600
												, [ 300000006001625,  200000003003510]  // 8 12900
												// TTClRrAaHhWwCcMm  TTClRrAaHhWwCcMm
											];
				const WORKER = [ [     0,      0,      0]  // 0  000
											 , [ 10101,  10202,  20101]  // 1  300
											 , [ 10503,  20403,  30203]  // 2  550
											 , [ 30504,  40404,  50303]  // 3  800
											 , [ 50907,  60606,  80406]  // 4 1300
											 , [ 70707,  90909, 120408]  // 5 1800
											 , [130911, 140711, 160410, 111111]  // 6 2300
											 , [201020, 161616, 250817, 400206]  // 7 5600
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
												   ,       2515000010,     400000000010,       4400000006
												   ,     170008000025,     170008000025,     170008000025]
													, [ 2700000100160006, 2700001700000006, 1100000029000010]
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

        if(Game.shard.name == 'shard1') {
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

  				if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S29')) {
  					if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5015);
  				}
  				else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 5014);
  					if(Sp12) spawns.tryCreateCreep(spawn, CARIER[7][H], 5011);
						if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, CARIER[8][M], 173);
						if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, CARIER[7][L], 403);
  					//if(Sp1) spawns.tryCreateCreep(spawn,   WORKER[7][H], 404, undefined, 3, 3);
  				}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S31')) {
						if(Sp4)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5085);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5084);
						if(Sp4)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5081);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S29')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5025);
					}
					else {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5024);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5021);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S28')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][L], 5035);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5030);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[1][L], 5036, [{XUH2O:0}, {ZH:30}]);
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5034);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5031);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S28')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5045);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5040);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5044);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][M], 5041);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5055);
					}
					else {
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5054);
						if(Sp23)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5051);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5065);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S29')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5060);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][H], 5064);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5061);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5075);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W25S29')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5070);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5074);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5071);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S27')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5105);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S27')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5100);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5104);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5101);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S28')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5115);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S28')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5110);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5114);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5111);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S28')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5135);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S28')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5130);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5134);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5131);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S27')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5145);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S27')) {
							if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5140);
						}
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5145);
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5144);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5141);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5125);
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5124);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5121);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5155);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W25S28')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5150);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5154);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5151);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5185);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5180);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5184);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5181);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5175);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5170);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5174);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5171);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5165);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S28')) {
							if(Sp5) spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5160);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[6][S], 5164);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5161);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S27')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5195);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W25S27')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5190);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5195);
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5194);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5191);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S27')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5205);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S27')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5200);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5204);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5201);
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5205);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5215);
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5214);
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[6][M], 5214);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[6][H], 5211);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S27')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5225);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W21S27')) {
							if(Sp6)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 5220);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5224);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5221);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5245);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S28')) {
							if(Sp6)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 5240);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5244);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5241);
					}
					if(spawn.name == 'Spawn10') spawns.tryCreateCreep(spawn, ATTACKER[1][L], 5253);
					if(spawn.name == 'Spawn10') spawns.tryCreateCreep(spawn,   HEALER[1][L], 5255);
					if(spawn.name == 'Spawn10') spawns.tryCreateCreep(spawn, ATTACKER[9][L], 5256);
					if(spawn.name == 'Spawn10') spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5257);
					if(spawn.name == 'Spawn10')	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5258);
        }

				if(Game.shard.name == 'shard0') {
					if(true) {
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[3][H], 301);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[5][M], 304);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 405);
					}
					else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 404);
						if(Sp12) spawns.tryCreateCreep(spawn, CARIER[7][M], 401);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S53')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 415);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S53')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 410);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 414);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[5][M], 411);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 425);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 420);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 424);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 421); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 435);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S52')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 430);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 434);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 431);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S51')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 455);
					}
					if(true) {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][H], 454); // 2
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[5][H], 451); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S51')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 475);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S51')) {
              if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 470);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[5][M], 474);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][L], 471); // 2
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 465);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W55S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 460);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 464);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 461); // 3
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 485);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 480);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 484);
            if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 481);
					}/*
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 445);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S52')) {
							if(Sp1) spawns.tryCreateCreep(spawn, CLAIMER[7][H], 440);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 444);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 441);
					}*/
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 495);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 490);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 494);
            if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 491); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 505);
					}
					else {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][L], 504);
            if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 501);
					}
					if(spawn.name == 'Spawn4' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[7][L], 173);
					if(spawn.name == 'Spawn4' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[7][L], 5013);
					if(Sp12 && (Game.time % 50000 < 250) ) spawns.tryCreateCreep(spawn, HEALER[7][L], 1000);
					if(Sp12 && (Game.time % 50000 > 250) ) spawns.tryCreateCreep(spawn, CARIER[1][L], 1000);
				}

				if(Game.shard.name == 'shard3') {
					
					const XU = 0+(!!flags.flags['XU']+!!flags.flags['XB']);

					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   808, undefined, 10, 3); // E  800 Carier
					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   505, undefined, 10, 3); // E  500 Carier
					if(Memory.totals.CARRY < 75	) spawns.tryCreateCreep(spawn,   303, undefined, 10, 3); // E  300 Carier
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, undefined, 10, 3); // E 1600 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, undefined, 10, 3); // E  800 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, undefined, 10, 3); // E  400 Worker
					if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, undefined, 10, 3); // E  200 Worker
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
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 35);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn,   CARIER[7][H], 32);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 36);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 37);
								if(spawn.name == 'Spawn1') spawns.tryCreateCreep(spawn,   HEALER[7][H], 38);
							}
							else {
								const f = 0+!!flags.flags['31'];
								if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[7][H], 34);
								if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][H], 31);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S33')) {
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 45);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   CARIER[7][H], 42);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 46);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 47);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   HEALER[7][H], 48);
							}
							else {
								const f = 0+!!flags.flags['41'];
								if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[7][H], 44);
								if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][H], 41);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S33')) {
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 65);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn,   CARIER[7][H], 62);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 66);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 67);
								if(spawn.name == 'Spawn3') spawns.tryCreateCreep(spawn,   HEALER[7][H], 68);
							}
							else {
								if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 64);
								if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][H], 61);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S35')) {
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 125);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   CARIER[7][H], 122);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 126);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 127);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   HEALER[7][H], 128);
							}
							else {
								const f = 0+!!flags.flags['121'];
								if(Sp4) spawns.tryCreateCreep(spawn, WORKER[7][H], 124);
								if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][H], 121);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S32')) {
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 175);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn,   CARIER[7][H], 172);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 176);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 177);
								if(spawn.name == 'Spawn13') spawns.tryCreateCreep(spawn,   HEALER[7][H], 178);
							}
							else {
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][H], 171);
								if(Sp5) spawns.tryCreateCreep(spawn,   WORKER[7][H], 174);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S34')) {
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 85);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   CARIER[7][H], 82);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 86);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 87);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   HEALER[7][H], 88);
							}
							else {
								if(Sp6) spawns.tryCreateCreep(spawn, WORKER[7][H], 84);
								if(Sp6) spawns.tryCreateCreep(spawn, CARIER[7][H], 81);
								if(Sp2) spawns.tryCreateCreep(spawn, ATTACKER[8][L2], 75);
								if(Sp6) spawns.tryCreateCreep(spawn, CARIER[7][H], 71);
								if(Sp6) spawns.tryCreateCreep(spawn, WORKER[7][H], 74);
							}
							if(spawn.name == 'Spawn9' && (Game.time % 500 < 500) ) spawns.tryCreateCreep(spawn,   CARIER[8][M], 5013);
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
								if(Sp34) spawns.tryCreateCreep(spawn, ATTACKER[5][M], 115);
							}
							else {
								if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S34')) {
									if(Sp34) spawns.tryCreateCreep(spawn, CLAIMER[8][L], 110);
	              }
								if(Sp34) spawns.tryCreateCreep(spawn, WORKER[6][L], 114);
								if(Sp34) spawns.tryCreateCreep(spawn, CARIER[4][H], 111);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S33')) {
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 55);
	              if(spawn.name == 'Spawn2')	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 56);
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
								if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][M], 145);
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
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 155);
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
							if(Sp4) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 165);
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
							if(Sp3) spawns.tryCreateCreep(spawn, ATTACKER[7][H], 95);
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
							if(Sp1)  spawns.tryCreateCreep(spawn, ATTACKER[8][H], 205);
						}
						if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][H], 207);
						if(Sp1) spawns.tryCreateCreep(spawn, ATTACKER[8][H+3], 206);

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
