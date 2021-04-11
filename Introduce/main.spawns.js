const constants = require('main.constants');
const conditions = require('main.conditions');
const terminals = require('main.terminals');
const observer = require('main.observer');
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

    tryCreateCreep: function(spawn, type, weight, modification = 0, boosts = undefined, needed = flags.getNeeded(weight), max_needed = flags.getMaxNeeded(weight, needed)) {
			
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
				const newName = 'creep-<' + weight + '/' + flags.getModification(weight, modification) + '>-'
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

				const roomBoostConf = flags.getRoomBoostConfig(spawn.room.name);
				const boostConf = (!roomBoostConf)? roomBoostConf:roomBoostConf[weight];
				if(!!boostConf) { // ["XGH2O","XKH2O","XZHO2"]
					console.log( '🏋️‍♂️', Math.trunc(Game.time/10000), Game.time%10000
														  , JSON.stringify({weight:weight, spawn:spawn, boostConf:boostConf}));
					const labs = cash.getLabs(spawn.room.name);
					const readyBoosts = boostConf.filter((b) => labs.some((l) => !!l.mineralType && l.mineralType == b &&
																														        	 !!l.energy && l.energy >= 1000 &&
																													          	 !!l.mineralAmount && l.mineralAmount >= 1500 ));
					if(readyBoosts.length != boostConf.length) {
						console.log('🏋️‍♂️🚫', Math.trunc(Game.time/10000), Game.time%10000
											           , JSON.stringify( { tasks:'tryCreateCreep', newName:newName
																 , room:spawn.room.name, readyBoosts:readyBoosts, boostConf:boostConf}));
						return false;
					}
				}
				else if(!!boosts) { // [["XUH2O",10,1],["XGHO2"],["XZHO2"],["XLHO2"]]
					console.log( '🏋️‍♂️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({weight:weight, spawn:spawn, boosts:boosts}));
					const labs = cash.getLabs(spawn.room.name);
					const readyBoosts = boosts.filter((b) => !!b[2] && b[2] != 0) // check only mandatory 
												 	  			  .filter((b) => labs.some((l) => !!l.mineralType && l.mineralType == b[0] &&
																													          !!l.energy && l.energy > b[1]*20 &&
																													          !!l.mineralAmount && l.mineralAmount > b[1]*30 ))
																    .map((b) => b[0]);
					if(readyBoosts.length != boosts.length) {
						console.log('🏋️‍♂️🚫', Math.trunc(Game.time/10000), Game.time%10000
											              , JSON.stringify( { tasks:'tryCreateCreep', newName:newName
																		, room:spawn.room.name, readyBoosts:readyBoosts, boosts:boosts}));
						return false;
					}
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
	
	CARIER: [ [     0,      0,      0]  // 0  000
					, [   101,    201,    402]  // 1  300
					, [   505,    603,    704]  // 2  550
					, [   808,    905,   1005]  // 3  800
					, [  1313,   1407,   1608]  // 4 1300
					, [  1616,   1818,   2412]  // 5 1800
					, [  2323,   2613,   3015]  // 6 2300
					, [  2525,   3216,   3317, 4010, 500000000002025]  // 7 5600
					, [ 200000003002025,  200000003003510, 400000006003010 ]  // 8 12900
					, [ 500000010000116,  0, 0 ]  // 9 12900
					//  TTClRrAaHhWwCcMm  TTClRrAaHhWwCcMm TTClRrAaHhWwCcMm
					],
	TRANSPORT: [ [     0,      0,      0]  // 0  000
					, [ 500000000000106,    201,    402]  // 1  
					, [  2525,   3216,   3317, 4010, 500000000002025]  // 2 5600
					, [ 100000001002325,  200000003002025, 400000006003010 ]  // 3 12900
					, [ 500000010000116,  0, 0 ]  // 9 12900
					// TTClRrAaHhWwCcMm  TTClRrAaHhWwCcMm TTClRrAaHhWwCcMm
					],

	WORKER: [ [     0,      0,      0]  // 0  000
					, [ 10101,  10202,  20101]  // 1  300
					, [ 10503,  20403,  30203]  // 2  550
					, [ 30504,  40404,  50303]  // 3  800
					, [ 50907,  60606,  80406]  // 4 1300
					, [ 70707,  90909, 120408]  // 5 1800
					, [130911, 140711, 160410, 111111]  // 6 2300
					, [201020, 161616, 250817, 400206, 200525, 151025, 102015]  // 7 5600
					, [201216, 153005, 250025, 400010 ]  // 8
					, [0, 81612, 201317, 0, 0]  // 9
					],

	UPGRADER: [ 151515,           201020, 250817
						, 301505,  500000005011021  // 0  000
						 //        TTClRrAaHhWwCcMm
						],
	
	DEPOSITER: [ 240224, 320216  // 0  000
						 // TTClRrAaHhWwCcMm
						],

	ATTACKER: [ [                 0,                0,                0]  // 0  000
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
						, [          40000010,       3010000010,     300010000010]//10 
						, [  1000000030000010,  500003005000010,  500300005000010, 1000000010101010]//11 
						, [  1000000030000010, 1000002505000010, 1000250005000010, 1000000005250010]//12
						, [  1500000025000010, 1500002005000010, 1500200005000010, 1500000005200010]//13
						], //TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm

	HEALER: [ [                0,                0,                0]  // 0   000
					, [          1000001,          1000001,          1000001]  // 1   300
					, [          1000001,          1000006,          2000001]  // 2   550
					, [          2000002,          2000004,          2000006]  // 3   800
					, [          4000004,          4000005,          4000006]  // 4  1300
					, [          6000006,          6000006,          6000006]  // 5  1800
					, [          7000007,          7000009,          7000011]  // 6  2300
					, [         16000032,  800000017000025,  300000018000021]  // 7  5600
					, [         25000025,         33000017,         42000008]  // 8 12900
					, [ 2000000020000010,         33000017,         42000008]  // 9 12900
					],

	CLAIMER:  [ [                0,                0,                0]  // 0  000
						, [          			0,                0,                0]  // 1  300
						, [                0,                0,                0]  // 2  550
						, [    1000000000002,    1000000000002,    1000000000002]  // 3  800
						, [    2000000000002,    2000000000002,    2000000000002]  // 4 1300
						, [    2000000000002,    2000000000003,    2000000000004]  // 5 1800
						, [    3000000000003,    3000000000004,    3000000000006]  // 6 2300
						, [    4000000000004,    8000000000010,    8000000000014]  // 7 5600
						, [   10000000000010,   10000000000020,   19000000000019]  // 8 12900
						],
	
	DEFENDER: [ [                 0,                0,                0]  // 0  000
						, [ 1000000030000010,  500003500000010,  500350000000010,  500000035000010] //1
						, [                0,  500002609000005,  0, 0] //2
						],//TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm
	
	DISMANTLER : [ [0, 0, 0]  // 0  000
						, [           250025,           340017,           400010] //1
						, [ 2800000000160006,  0,  0] //2
						],//TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm
	
	
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
				const extra_upgrade = false;
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
				const Sp4 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn10' || spawn.name == 'Spawn12' || spawn.name == 'Spawn15'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn14'):All;
				const Sp5 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn13' || spawn.name == 'Spawn17'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn13'):All;
				const Sp6 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn14' || spawn.name == 'Spawn16' || spawn.name == 'Spawn19'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn15' || spawn.name == 'Spawn22'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn16' || spawn.name == 'Spawn17' || spawn.name == 'Spawn--'):All;
				const Sp7 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn18' || spawn.name == 'Spawn20' || spawn.name == 'Spawn22'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn14' || spawn.name == 'Spawn18' || spawn.name == 'Spawn21'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp8 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn21' || spawn.name == 'Spawn23' || spawn.name == 'Spawn24'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn20' || spawn.name == 'Spawn23' || spawn.name == 'Spawn25'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp9 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn25' || spawn.name == 'Spawn31' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn24' || spawn.name == 'Spawn26' || spawn.name == 'Spawn30'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp10= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn26' || spawn.name == 'Spawn29' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn27' || spawn.name == 'Spawn28' || spawn.name == 'Spawn31'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp11= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn27' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn29' || spawn.name == 'Spawn32' || spawn.name == 'Spawn34'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp12= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn28' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn33' || spawn.name == 'Spawn35' || spawn.name == 'Spawn37'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp13= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn30' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn36' || spawn.name == 'Spawn38' || spawn.name == 'Spawn40'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp14= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn39' || spawn.name == 'Spawn40' || spawn.name == 'Spawn41'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp15= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn42' || spawn.name == 'Spawn44' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp16= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp17= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;
				const Sp18= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn--' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):All;


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

				const CARIER = spawns.CARIER;
				const TRANSPORT = spawns.TRANSPORT;
				const WORKER = spawns.WORKER;
				const UPGRADER = spawns.UPGRADER;
				const DEPOSITER = spawns.DEPOSITER;
				const ATTACKER = spawns.ATTACKER;
				const HEALER = spawns.HEALER;
				const CLAIMER = spawns.CLAIMER;
				const DEFENDER = spawns.DEFENDER;
				const DISMANTLER = spawns.DISMANTLER;
	
				const D = 0; const A = 1; const R = 2; const HR = 3;
				const energyShardAvgAmount = terminals.getShardAvgAmount('energy'); 
				
				if(energyShardAvgAmount > 300000)
					Memory.shardUpgradeEnable = true;
				if(energyShardAvgAmount < 200000)
					Memory.shardUpgradeEnable = false;
				const upgrade = Memory.shardUpgradeEnable;
				
				if(energyShardAvgAmount < 200000)
					Memory.shardHarvestEnable = true;
				if(energyShardAvgAmount > 300000)
					Memory.shardHarvestEnable = false;
				const harvest = Memory.shardHarvestEnable;

        if(Game.shard.name == 'shard1') {
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

  				if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S29')) {
  					if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5016);
  				}
  				else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 5014);
  					if(Sp1) spawns.tryCreateCreep(spawn, CARIER[7][M], 5011);
						if(Sp1 && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 5015);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, CARIER[7][L], 403);
						const tm = Math.floor(Game.time%1200 / 200);
						if(Sp1 && !All && tm == 0) spawns.tryCreateCreep(spawn, WORKER[7][L], 234);
  				}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S31')) {
						if(Sp4)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5086);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5084);
						if(Sp4)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5081);
						if(Sp4 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5085);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S29')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5026);
					}
					else {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5024);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5021);
						if(Sp2 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5025);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S28')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][L], 5036);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5030);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5034);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5031);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S28')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5046);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S28')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5040);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5044);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5041);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S29')) {
						if(Sp23)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5056);
					}
					else {
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5054);
						if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5051);
						if(Sp3 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5055);
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
						if(Sp11)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5106);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S27')) {
							if(Sp11)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5100);
						}
						if(Sp11)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5104);
						if(Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5101);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S28')) {
						if(Sp11)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5116);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S28')) {
							if(Sp11)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5110);
						}
						if(Sp11)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5114);
						if(Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5111);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S28')) {
						if(Sp11)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5136);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S28')) {
							if(Sp11)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5130);
						}
						if(Sp11)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5134);
						if(Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5131);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S27')) {
						if(Sp11)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5096);
					}
					else {
						if(Sp11)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5094);
						if(Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5091);
						if(Sp11 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5095);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5126);
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5124);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5121);
						if(Sp5 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5125);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5186);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5180);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5184);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5181);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S29')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5176);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S29')) {
							if(Sp5)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5170);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5174);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5171);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S28')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5166);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S28')) {
							if(Sp5) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5160);
						}
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5164);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5161);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S28')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5216);
					}
					else {
						const tm = Math.floor(Game.time%1200 / 300);
						if(Sp6 && !All && tm == 0) spawns.tryCreateCreep(spawn, ATTACKER[13][L], 206);
						if(Sp6 && !All && tm == 0) spawns.tryCreateCreep(spawn, ATTACKER[10][L], 216);
						if(Sp6 && !All && tm == 0) spawns.tryCreateCreep(spawn, ATTACKER[10][L], 226);
						if(Sp6 && !All && tm == 1) spawns.tryCreateCreep(spawn, ATTACKER[13][M], 207);
						if(Sp6 && !All && tm == 1) spawns.tryCreateCreep(spawn, ATTACKER[10][M], 217);
						if(Sp6 && !All && tm == 1) spawns.tryCreateCreep(spawn, ATTACKER[10][M], 227);
						if(Sp6 && !All && tm == 2) spawns.tryCreateCreep(spawn, ATTACKER[13][H], 208);
						if(Sp6 && !All && tm == 2) spawns.tryCreateCreep(spawn, ATTACKER[10][H], 218);
						if(Sp6 && !All && tm == 2) spawns.tryCreateCreep(spawn, ATTACKER[10][H], 228);
						
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn,  UPGRADER[M], 205);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, WORKER[7][M], 204);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, CARIER[7][L], 203);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, WORKER[6][S], 202);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, CARIER[7][L], 201);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn,CLAIMER[5][H], 220);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, WORKER[7][M], 224);
						if(Sp6 && !All && tm == 3) spawns.tryCreateCreep(spawn, CARIER[7][L], 221);

						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5214);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5211);
						if(Sp6 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5215);
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
						if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5206);
					}
					else {
						if(Sp10)	spawns.tryCreateCreep(spawn,   WORKER[7][H], 5204);
						if(Sp10)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5201);
						if(Sp10 && upgrade)	spawns.tryCreateCreep(spawn,    UPGRADER[L], 5205);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S27')) {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5196);
					}
					else {
						if(Sp7)	spawns.tryCreateCreep(spawn,   WORKER[7][H], 5194);
						if(Sp7)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5191);
						if(Sp7 && upgrade)	spawns.tryCreateCreep(spawn,   UPGRADER[L], 5195);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S28')) {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5156);
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5154);
						if(Sp8)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5151);
						if(Sp8 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5155);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S26') &&
						 tools.getInviderCoreLevel('W25S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W25S26') == 1) {
							if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5257);
						}
					}
					else if(Game.cpu.bucket >= 5001) {
						if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[9][L], 5256);
						if(Sp10)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5254);
						if(Sp10)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5251);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S26') &&
						 tools.getInviderCoreLevel('W24S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W24S26') == 1) {
							if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5267);
						}
					}
					else if(Game.cpu.bucket >= 6001) {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[9][L], 5266);
						if(Sp7)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5264);
						if(Sp7)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5261);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S27')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5276);
					}
					else {
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5274);
						if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5271);
						if(Sp9 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5275);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S26') &&
						 tools.getInviderCoreLevel('W26S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W26S26') == 1) {
							if(Sp11 || Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5288);
						}
					}
					else if(Game.cpu.bucket >= 7001) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[9][L], 5288);
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5284);
						if(Sp12)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5281);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S27')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5296);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S27')) {
							if(Sp9)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5290);
						}
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5294);
						if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5291);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S26')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5146);
					}
					else {
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5144);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5141);
						if(Sp12 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5145);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S26')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5316);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S26')) {
							if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5310);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5314);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5311);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S25')) {
						if(Sp13)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5306);
					}
					else {
						if(Sp13)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5304);
						if(Sp13)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5301);
						if(Sp13 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5305);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S25') &&
						 tools.getInviderCoreLevel('W26S25') !== undefined ) {
						if(tools.getInviderCoreLevel('W26S25') == 1) {
							if(Sp13)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5327);
						}
					}
					else if(Game.cpu.bucket >= 8001) {
						if(Sp13)	spawns.tryCreateCreep(spawn, ATTACKER[9][L], 5326);
						if(Sp13)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5324);
						if(Sp13)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5321);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S24')) {
						if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5346);
					}
					else {
						if(Sp14)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5344);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5341);
						if(Sp14 && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 5345);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S24')) {
						if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5356);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S24')) {
							if(Sp14)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5350);
						}
						if(Sp14)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5354);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5351);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S23')) {
						if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5366);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S23')) {
							if(Sp14)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5360);
						}
						if(Sp14)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5364);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5361);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S23')) {
						if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5376);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S23')) {
							if(Sp14)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5370);
						}
						if(Sp14)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5374);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5371);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S24')) {
						const ICL = tools.getInviderCoreLevel('W26S24');
						if(ICL !== undefined) {
							console.log( '🎃', Math.trunc(Game.time/10000), Game.time%10000
																, 'INVIDER CORE', JSON.stringify({W26S24:spawn.name, ICL:ICL})
										);
						}
						if(ICL == 1) {
							if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5456);
						}
						if(ICL == 3 && Game.cpu.bucket >= 9500) {
							if(Sp14) spawns.tryCreateCreep(spawn, ATTACKER[11][L], 5456);
							if(Sp14) spawns.tryCreateCreep(spawn, ATTACKER[11][M], 5457);
							if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[11][H], 5458);
							if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[11][S], 5459);
						}
					}
					else if(Game.cpu.bucket >= 9001) {
						if(Sp14)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 5456);
						if(Sp14)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 5454);
            if(Sp14)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 5451);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S24')) {
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S29')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][L], 5406);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][M], 5407);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][H], 5408);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][S], 5409);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5409);
					}
					else {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][S+3], 5402);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5404);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5401);
						// if(Sp15 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5405);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5405);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S23')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][L], 5416);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][M], 5417);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][H], 5418);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][S], 5419);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][M], 5412);
						if(Sp6 && !All)		spawns.tryCreateCreep(spawn, WORKER[7][M], 5412);
					}
					else {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[12][L], 5416);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][M], 5412);
						if(Sp6 && !All)		spawns.tryCreateCreep(spawn, WORKER[7][M], 5412);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 5414);
						if(Sp6 && !All)		spawns.tryCreateCreep(spawn, WORKER[7][M], 5414);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 5411);
						if(Sp6 && !All)		spawns.tryCreateCreep(spawn, CARIER[7][L], 5411);
						//if(Sp15 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5415);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 5415);
						if(Sp6 && !All)		spawns.tryCreateCreep(spawn, WORKER[7][L], 5415);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S24')) {
						if(Sp16)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5427);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S24')) {
							if(Sp16)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 5420);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5424);
						if(Sp16)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5421);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S22')) {
						if(Sp16)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5437);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S22')) {
							if(Sp16)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 5430);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5434);
						if(Sp16)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5431);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S23')) {
						if(Sp16)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5447);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S23')) {
							if(Sp16)	spawns.tryCreateCreep(spawn, CLAIMER[6][M], 5440);
						}
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5444);
						if(Sp16)	spawns.tryCreateCreep(spawn, CARIER[6][L], 5441);
					}

					if(Game.cpu.bucket >= 5000 && observer.shouldSpawnForDeposit('W30S29')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[3][L], 5461, 2);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5464, 2);
					}
					if(Game.cpu.bucket >= 5000 && observer.shouldSpawnForDeposit('W27S30')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[3][L], 5471, 2);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5474, 2);
					}

					if(Game.cpu.bucket >= 5000) {
						if(Sp6 && !All) spawns.tryCreateCreep(spawn, WORKER[1][L], 209);
						if(Sp6 && !All) spawns.tryCreateCreep(spawn, TRANSPORT[3][L], 203);
						if(Sp15 && !All) spawns.tryCreateCreep(spawn, CARIER[6][L], 203);
					}
				}

				if(Game.shard.name == 'shard0') {
					if(false) {
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[3][H], 301);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[5][M], 304);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S52')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 406);
					}
					else {
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[7][H], 404);
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[7][M], 401);
						if(Sp1 && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 405);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S53')) {
						if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 416);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S53')) {
							if(Sp1)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 410);
						}
						if(Sp1)	spawns.tryCreateCreep(spawn, WORKER[5][M], 414);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 411);
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
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S52')) {
						if(Sp4)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 446);
					}
					else {
						if(Sp4)	spawns.tryCreateCreep(spawn, WORKER[7][H], 444);
						if(Sp4)	spawns.tryCreateCreep(spawn, CARIER[7][M], 441);
						if(Sp4 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 445);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 456);
					}
					if(true) {
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[7][M], 454);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][M], 451);
						if(Sp2 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 455);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S51')) {
						if(Sp6)	spawns.tryCreateCreep(spawn, ATTACKER[4][M], 466);
					}
					else {
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][H], 464);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][M], 461);
						if(Sp6 && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 465);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S51')) {
						if(Sp2)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 476);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S51')) {
              if(Sp2)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 470);
						}
						if(Sp2)	spawns.tryCreateCreep(spawn, WORKER[5][M], 474);
						if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][L], 471); // 2
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
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S54')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 516);
					}
					else {
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[7][H], 514);
            if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][M], 511);
						if(Sp9)	spawns.tryCreateCreep(spawn, UPGRADER[L], 515);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 526);
					}
					else {
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[7][H], 524);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 521);
						if(Sp3 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 525);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 536);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W52S51')) {
              if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 530);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[5][M], 534);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 531);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S51')) {
						if(Sp3)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 546);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S51')) {
              if(Sp3)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 540);
						}
						if(Sp3)	spawns.tryCreateCreep(spawn, WORKER[6][S], 544);
            if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][L], 541);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S53')) {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[8][H], 556);
						if(Sp5)	spawns.tryCreateCreep(spawn, DEFENDER[2][A], 557);
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, WORKER[7][M], 554);
            if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][M], 551);
						if(Sp5 && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 555);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S54') &&
						 tools.getInviderCoreLevel('W56S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W56S54') == 1) {
						}
						if(tools.getInviderCoreLevel('W56S54') == 6) {
							if(Sp5) spawns.tryCreateCreep(spawn,    HEALER[9][L], 567);
							if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[12][M], 568);
							if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[12][H], 569);
						}
					}
					else {
						if(Sp5)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 566);
						if(Sp5)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 564);
            if(Sp5)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 561);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S53')) {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 576);
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn, WORKER[7][H], 574);
            if(Sp8)	spawns.tryCreateCreep(spawn, CARIER[7][H], 571);
						if(Sp8 && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 575);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S53')) {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 596);
					}
					else {
						if(Sp7)	spawns.tryCreateCreep(spawn, WORKER[7][H], 594);
            if(Sp7)	spawns.tryCreateCreep(spawn, CARIER[7][H], 591);
						if(Sp7 && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 595);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S52')) {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 606);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W55S52')) {
              if(Sp8)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 600);
						}
						if(Sp8)	spawns.tryCreateCreep(spawn, WORKER[5][M], 604);
            if(Sp8)	spawns.tryCreateCreep(spawn, CARIER[7][L], 601);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S52')) {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 616);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W54S52')) {
              if(Sp7)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 610);
						}
						if(Sp7)	spawns.tryCreateCreep(spawn, WORKER[5][M], 614);
            if(Sp7)	spawns.tryCreateCreep(spawn, CARIER[7][L], 611);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S54') &&
						 tools.getInviderCoreLevel('W55S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W55S54') == 1) {
							if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 637);
						}
						if(tools.getInviderCoreLevel('W55S54') == 3) {
							if(Sp8) spawns.tryCreateCreep(spawn, ATTACKER[11][L], 637);
							if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[11][M], 638);
							if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[11][H], 639);
						}
					}
					else {
						if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 636);
						if(Sp8)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 634);
            if(Sp8)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 631);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S55')) {
							if(tools.getInviderCoreLevel('W55S55') === undefined ) {
								if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 697);
							}
							if(tools.getInviderCoreLevel('W55S55') == 1) {
								if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 697);
							}
						}
						else {
							if(Sp8)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 696);
							if(Sp8)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 694);
							if(Sp8)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 691);
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S54') &&
						 tools.getInviderCoreLevel('W54S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W54S54') == 1) {
							if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 627);
						}
						if(tools.getInviderCoreLevel('W54S54') == 4) {
							if(Sp7)	spawns.tryCreateCreep(spawn, DISMANTLER[2][L], 629, 0, [["XGHO2",40,1],["XZH2O",40,1],["XZHO2",30,1]]);
							if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[11][L], 628, 0, [["XGHO2",40,1],["XUH2O",40,1],["XZHO2",30,1]]);
							if(Sp7) spawns.tryCreateCreep(spawn,   HEALER[9][L], 627, 0, [["XGHO2",40,1],["XLHO2",40,1],["XZHO2",30,1]]);
						}
					}
					else {
						if(Sp7)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 626);
						if(Sp7)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 624);
            if(Sp7)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 621);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S55') &&
						 tools.getInviderCoreLevel('W56S55') !== undefined ) {
						if(tools.getInviderCoreLevel('W56S55') == 1) {
							if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 687);
						}
					}
					else {
						if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[9][M], 687);
						if(Sp10)	spawns.tryCreateCreep(spawn,  WORKER[7][S+1], 684);
            if(Sp10)	spawns.tryCreateCreep(spawn,  CARIER[7][L], 681);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S55')) {
						if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 657);
					}
					else {
						if(Sp10)	spawns.tryCreateCreep(spawn, WORKER[7][H], 654);
            if(Sp10)	spawns.tryCreateCreep(spawn, CARIER[7][M], 651);
						if(Sp10)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 655);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S54')) {
						if(Sp10)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 707);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S54')) {
              if(Sp10)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 700);
						}
						if(Sp10)	spawns.tryCreateCreep(spawn, WORKER[7][M], 704);
            if(Sp10)	spawns.tryCreateCreep(spawn, CARIER[7][L], 701);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S53')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 717);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S53')) {
              if(Sp9)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 710);
						}
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[5][M], 714);
            if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][L], 711);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S53')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 727);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S53')) {
              if(Sp9)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 720);
						}
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[5][M], 724);
            if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][L], 721);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S54')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 737);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S54')) {
              if(Sp9)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 730);
						}
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[5][M], 734);
            if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][L], 731);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S55')) {
						if(Sp9)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 747);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S55')) {
              if(Sp9)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 740);
						}
						if(Sp9)	spawns.tryCreateCreep(spawn, WORKER[5][M], 744);
            if(Sp9)	spawns.tryCreateCreep(spawn, CARIER[7][L], 741);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S56')) {
						if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 757);
					}
					else {
						if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 754);
            if(Sp10 || Sp11)	spawns.tryCreateCreep(spawn, CARIER[6][H], 751);
						if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 755);
						//if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 755);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S54')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 786);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S54')) {
							if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 780);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[5][L], 784);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[6][L], 781);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S54')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 677);
					}
					else {
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[6][H], 674);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[6][H], 671);
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[6][H], 675);
//							if(Sp12)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 675);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W51S54')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 777);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W51S54')) {
							if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 770);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[6][L], 774);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[6][L], 771);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S55')) {
						if(Sp12)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 797);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W52S55')) {
							if(Sp12)	spawns.tryCreateCreep(spawn, CLAIMER[6][H], 790);
						}
						if(Sp12)	spawns.tryCreateCreep(spawn, WORKER[5][L], 794);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[6][L], 791);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S57')) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 767);
					}
					else {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 764);
            if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 761);
            if(All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 761);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][H], 765);
						//if(Sp13 && !All)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 765);
					}

					if(Sp2 && !All && upgrade) spawns.tryCreateCreep(spawn,   CARIER[7][L], 5023);
					//if(Sp1 && (Game.time % 500000 < 250) ) spawns.tryCreateCreep(spawn, HEALER[7][L], 1000);
					//if(Sp1 && (Game.time % 500000 > 250) ) spawns.tryCreateCreep(spawn, CARIER[1][L], 1000);
					/*

					if(Sp1) spawns.tryCreateCreep(spawn,   CARIER[7][L], 511);
					if(Sp1) spawns.tryCreateCreep(spawn,   DISMANTLER[1][H], 514);
					
					//if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][L], 579);
					if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][L], 571);
					//if(Sp5) spawns.tryCreateCreep(spawn,   DISMANTLER[1][L], 574);

					//if(Sp1) spawns.tryCreateCreep(spawn,   HEALER[8][L], 589);
					if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][L], 581);
					if(Sp5) spawns.tryCreateCreep(spawn,   DISMANTLER[1][L], 584);
					*/
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
								if(Sp1 && Game.cpu.bucket > 7000 && (harvest || !!Game.flags['34']))	spawns.tryCreateCreep(spawn, WORKER[7][M], 34,1);
								if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][M], 31);
								if(Sp1 && Game.cpu.bucket > 7000 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 35);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S33')) {
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 46);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   CARIER[7][M], 42);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 47);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 48);
								if(spawn.name == 'Spawn2') spawns.tryCreateCreep(spawn,   HEALER[7][H], 49);
							}
							else {
								if(Sp2 && Game.time % 10000 > 1500 && Game.cpu.bucket > 7000)	spawns.tryCreateCreep(spawn, WORKER[7][H], 44,1);
								if(Sp2)	spawns.tryCreateCreep(spawn, CARIER[7][M], 41);
								if(Sp2 && Game.time % 10000 < 1500 && Game.cpu.bucket > 7000)	spawns.tryCreateCreep(spawn, UPGRADER[L], 45);
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
								if(Sp3 && Game.cpu.bucket > 7000 && (harvest || !!Game.flags['64']))	spawns.tryCreateCreep(spawn, WORKER[7][M], 64,1);
								if(Sp3)	spawns.tryCreateCreep(spawn, CARIER[7][M], 61);
								if(Sp3 && Game.cpu.bucket > 7000 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 65);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S35')) {
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 126);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   CARIER[7][M], 122);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 127);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 128);
								if(spawn.name == 'Spawn5') spawns.tryCreateCreep(spawn,   HEALER[7][H], 129);
							}
							else {
								if(Sp4 && Game.cpu.bucket > 7000 && (harvest || !!Game.flags['124'])) spawns.tryCreateCreep(spawn, WORKER[7][M], 124,1);
								if(Sp4) spawns.tryCreateCreep(spawn, CARIER[7][M], 121);
								if(Sp4 && Game.cpu.bucket > 7000 && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 125);
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
								if(Sp5 && Game.cpu.bucket > 7000 && (harvest || !!Game.flags['174'])) spawns.tryCreateCreep(spawn, WORKER[7][M], 174,1);
								if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[7][M], 171);
								if(Sp5 && Game.cpu.bucket > 7000 && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 175);
								//if(Sp5) spawns.tryCreateCreep(spawn,   CARIER[9][L], 243);
							}
							if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S34')) {
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[3][L], 86);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   CARIER[7][M], 82);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S+1], 87);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn, ATTACKER[7][S], 88);
								if(spawn.name == 'Spawn16') spawns.tryCreateCreep(spawn,   HEALER[7][H], 89);
							}
							else {
								if(Sp6 && Game.cpu.bucket > 7000 && (harvest || !!Game.flags['84'])) spawns.tryCreateCreep(spawn, WORKER[7][M], 84,1);
								if(Sp6) spawns.tryCreateCreep(spawn,   CARIER[7][M], 81);
								if(Sp6 && Game.cpu.bucket > 7000 && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 85);
							}
							if(Sp5 && Game.cpu.bucket > 7000 && upgrade) spawns.tryCreateCreep(spawn,   CARIER[8][L], 5023);
							if(conditions.TO_SPAWN_CLAIMING_ROOMS()) {
							}
							if(conditions.TO_SPAWN_CLAIMING_ROOMS2()) {
							}
							if(conditions.TO_SPAWN_CLAIMING_ROOMS3()) {
							}
							if(conditions.TO_SPAWN_CLAIMING_ROOMS4()) {
							}
							if(conditions.TO_SPAWN_KEEPERS_ROOMS()) {
							}
						}
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
