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
	
	setRampartsPublic: function(roomName, isPublic = true) {
		const room = Game.rooms[roomName];
		if(!room) return;
		const errs = cash.getMyBuildings(room)
										.filter((b) => !!b && !!b.structureType && b.structureType == STRUCTURE_RAMPART)
										.map((rmp) => rmp.setPublic(isPublic))
										.filter((err) => err != OK);
   },
	
	setRampartPublic: function(pos, isPublic = true) {
		const room = Game.rooms[pos.roomName];
		if(!room) return;
		const errs = cash.getMyBuildings(room)
										.filter((b) => !!b && !!b.structureType && b.structureType == STRUCTURE_RAMPART && b.pos.isEqualTo(pos))
										.map((rmp) => rmp.setPublic(isPublic))
										.filter((err) => err != OK);
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
				if(!!boostConf) { // ["XGH2O","XKH2O","XZHO2"] or  [["XGH2O",0],["XLH2O"],"XKH2O",["XZHO2",1]]
					console.log( '🏋️‍♂️', Math.trunc(Game.time/10000), Game.time%10000
														  , JSON.stringify({weight:weight, spawn:spawn, boostConf:boostConf}));
					const labs = cash.getLabs(spawn.room.name);
					const readyBoosts = boostConf.filter((b) => labs.some((l) => ((typeof b === 'string' || b instanceof String) &&// check only mandatory
																														        	 !!l.mineralType && l.mineralType == b &&
																														        	 !!l.energy && l.energy >= 1000 &&
																													          	 !!l.mineralAmount && l.mineralAmount >= 1500)
																																||     (!(typeof b === 'string' || b instanceof String) && !!b.length && b.length > 1 && b[1] == 1 && 
																														        	 !!l.mineralType && l.mineralType == b[0] &&// check only mandatory
																														        	 !!l.energy && l.energy >= 1000 &&
																													          	 !!l.mineralAmount && l.mineralAmount >= 1500)
																															  ||     (!(typeof b === 'string' || b instanceof String) && !!b.length && b.length == 1)
																															  ||     (!(typeof b === 'string' || b instanceof String) && !!b.length && b.length > 1 && b[1] == 0)));
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
					, [161616, 201020, 250817, 400206, 200525, 151025, 102015]  // 7 5600
					, [240816, 153005, 250025, 400010 ]  // 8
					, [  100000002050109,  300000007100525, 201317, 0, 0]  // 9
					],//TTClRrAaHhWwCcMm, TTClRrAaHhWwCcMm

	UPGRADER: [ 151515,           201020, 250817
						, 301505,  500000005011021  // 0  000
						 //        TTClRrAaHhWwCcMm
						],
	
	DEPOSITER: [ 240224, 320216, 300415, 400505  // 0  000
						 // TTClRrAaHhWwCcMm
						],

	ATTACKER: [ [                 0,                0,                0,                0]  //  0  000
						, [           1000001,        200000002,      10000000001,            20002]  //  1  300
						, [           1000001,        400000004,      20000000002,            30003]  //  2  550
						, [           2000002,        600000006,      40000000004,            50005]  //  3  800
						, [           4000004,       1000000010,      60000000006,            80008]  //  4 1300
						, [           6000006,       1300000013,      90000000009,           120012]  //  5 1800
						, [           7000007,       1700000017,     110000000011,           150015]  //  6 2300
						, [          18000018,       2500000025,     250000000025,           250025]  //  7 5600
						, [          25000025,       2005000025,     200005000025,          5200025]  //  8 12900
						, [          20000010,       4002000006,     400002000006,          2400006]  //  9 
						, [          25000025,       1807000025,     180007000025,          7180025]  // 10 
						, [          25000025,       1510000025,     150010000025,         10150025]  // 11 
						, [          40000010,       3010000010,     300010000010,         10300010]  // 12 
						, [  1000000030000010,  500003005000010,  500300005000010, 1000000010101010]  // 13 
						, [  1000000030000010, 1000002505000010, 1000250005000010, 1000000005250010]  // 14
						, [  1500000025000010, 1500002005000010, 1500200005000010, 1500000005200010]  // 15
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
						, [         25000025,       3101000016,     310001000016,          1310016] //1
						, [  800000032000010,  800003002000005,  800300002000005,  800000002300005] //2
						, [ 1100000029000010, 1100002603000005, 1100260003000005, 1100000003260005] //3
						, [ 1500000025000010, 1500002104000005, 1500210004000005, 1500000004210005] //4
						, [ 1800000022000010, 1800001805000005, 1800180005000005, 1800000005180005] //5
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

		var spawn_names = Object.keys(Game.spawns).filter((s,i)=> i%constants.TICKS_TO_SPAWN == I);

		spawn_names.forEach(function(name) {
			var spawn = Game.spawns[name];

// 			console.log('✒️', Math.trunc(Game.time/10000), Game.time%10000
// 									, 'spawn:'
// 									, JSON.stringify({name:name, spawn:spawn, spawn_names:spawn_names, I:I}));

			if(!!spawn && !spawn.spawning && Nspawns) {

				var controller = spawn.room.controller;
				const CL = controller.level;
				var N = Memory.totals.CreepsNumber;
				const extra_upgrade = false;
				const All = !!rerun;
				const Sp1 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn3'  || spawn.name == 'Spawn7'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn13'):
				         		(Game.shard.name == 'shard2')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn2'  || spawn.name == 'Spawn3'):
				            (Game.shard.name == 'shard3')? (All || spawn.name == 'Spawn1'  || spawn.name == 'Spawn2'  || spawn.name == 'Spawn3'):All;
				const Sp2 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn4'  || spawn.name == 'Spawn6'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn2'  || spawn.name == 'Spawn7'  || spawn.name == 'Spawn17'):All;
				const Sp3 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn9'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn3'  || spawn.name == 'Spawn6'  || spawn.name == 'Spawn12'):All;
				const Sp4 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn10' || spawn.name == 'Spawn12' || spawn.name == 'Spawn15'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn5'  || spawn.name == 'Spawn8'  || spawn.name == 'Spawn19'):All;
				const Sp5 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn13' || spawn.name == 'Spawn17'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn9'  || spawn.name == 'Spawn10' || spawn.name == 'Spawn16'):All;
				const Sp6 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn14' || spawn.name == 'Spawn16' || spawn.name == 'Spawn19'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn11' || spawn.name == 'Spawn15' || spawn.name == 'Spawn22'):All;
				const Sp7 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn18' || spawn.name == 'Spawn20' || spawn.name == 'Spawn22'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn14' || spawn.name == 'Spawn18' || spawn.name == 'Spawn21'):All;
				const Sp8 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn21' || spawn.name == 'Spawn23' || spawn.name == 'Spawn24'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn20' || spawn.name == 'Spawn23' || spawn.name == 'Spawn25'):All;
				const Sp9 = (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn25' || spawn.name == 'Spawn31' || spawn.name == 'Spawn36'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn24' || spawn.name == 'Spawn26' || spawn.name == 'Spawn30'):All;
				const Sp10= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn26' || spawn.name == 'Spawn29' || spawn.name == 'Spawn37'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn27' || spawn.name == 'Spawn28' || spawn.name == 'Spawn31'):All;
				const Sp11= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn27' || spawn.name == 'Spawn33' || spawn.name == 'Spawn41'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn29' || spawn.name == 'Spawn32' || spawn.name == 'Spawn34'):All;
				const Sp12= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn28' || spawn.name == 'Spawn32' || spawn.name == 'Spawn40'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn33' || spawn.name == 'Spawn35' || spawn.name == 'Spawn37'):All;
				const Sp13= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn30' || spawn.name == 'Spawn34' || spawn.name == 'Spawn38'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn36' || spawn.name == 'Spawn38' || spawn.name == 'Spawn43'):All;
				const Sp14= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn35' || spawn.name == 'Spawn39' || spawn.name == 'Spawn43'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn39' || spawn.name == 'Spawn40' || spawn.name == 'Spawn41'):All;
				const Sp15= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn42' || spawn.name == 'Spawn47' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn42' || spawn.name == 'Spawn44' || spawn.name == 'Spawn45'):All;
				const Sp16= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn45' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn46' || spawn.name == 'Spawn47' || spawn.name == 'Spawn48'):All;
				const Sp17= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn44' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn49' || spawn.name == 'Spawn50' || spawn.name == 'Spawn51'):All;
				const Sp18= (Game.shard.name == 'shard0')? (All || spawn.name == 'Spawn46' || spawn.name == 'Spawn--' || spawn.name == 'Spawn--'):
				         		(Game.shard.name == 'shard1')? (All || spawn.name == 'Spawn52' || spawn.name == 'Spawn53' || spawn.name == 'Spawn--'):All;


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
				
				if(Game.shard.name == 'shard3') {

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W31S28')) {
  					if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 17);
  				}
  				else {
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, CARIER[7][H], 11);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][H], 12);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][H], 14);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn,  UPGRADER[L], 15);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, CARIER[7][L], 233);
					}

				}

        if(Game.shard.name == 'shard2') {

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W31S29')) {
  					if(Sp1)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 237);
  				}
  				else {
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, CARIER[7][H], 231);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][L], 232);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][H], 234);
 						if(Sp1 && !All) spawns.tryCreateCreep(spawn, UPGRADER[L], 235);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W31S28')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 247);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W31S28')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 240);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 244);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 241);
					}

					if(Game.cpu.bucket >= 8000) {
  					if(Sp1 && !All && (upgrade || !!flags.getFlag('3'))) spawns.tryCreateCreep(spawn, CARIER[7][L], 5013);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, TRANSPORT[3][L], 13);
					}

				}
				
        if(Game.shard.name == 'shard1') {
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   808, 10, 3); // E  800 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   505, 10, 3); // E  500 Carier
  				// if(Memory.totals.CARRY < 25	) spawns.tryCreateCreep(spawn,   303, 10, 3); // E  300 Carier
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 80808, 20, 3); // E 1600 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 40404, 20, 3); // E  800 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 20202, 20, 3); // E  400 Worker
  				// if(Memory.totals.WORK < 25	) spawns.tryCreateCreep(spawn, 10101, 20, 3); // E  200 Worker

  				if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S29')) {
  					if((Sp1 || Sp2 || Sp3) && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5017);
  				}
  				else {
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][H], 5014);
  					if(Sp1 && !All) spawns.tryCreateCreep(spawn, CARIER[7][M], 5011);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 5015);
  				}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S31')) {
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5087);
					}
					else {
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5084);
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5081);
						if(Sp4 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5085);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S29')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5027);
						spawns.setRampartsPublic('W28S29',false);
					}
					else {
						spawns.setRampartsPublic('W28S29')
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5024);
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5021);
						if(Sp2 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5025);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S28')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5037);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W29S28')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5030);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5034);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5031);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S28')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5047);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S28')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5040);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5044);
						if(Sp1)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5041);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S29')) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5057);
					}
					else {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5054);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5051);
						if(Sp3 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5055);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S29')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5067);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W26S29')) {
							if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5060);
						}
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][H], 5064);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5061);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S29')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5077);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W25S29')) {
							if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5070);
						}
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5074);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5071);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S27')) {
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5117);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S27')) {
							if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5110);
						}
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5114);
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5111);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S28')) {
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5137);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S28')) {
							if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5130);
						}
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5134);
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5131);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S28')) {
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 5107);
					}
					else {
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5101);
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5104);
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5105);
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5101);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S27')) {
						if(Sp11 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5097);
					}
					else {
						if(Sp11 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5094);
						if(Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5091);
						if(Sp11 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5095);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S28')) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5127);
					}
					else {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5124);
						if(Sp5)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5121);
						if(Sp5 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5125);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S29')) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5187);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S29')) {
							if(Sp5 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5180);
						}
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5184);
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5181);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S29')) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5177);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S29')) {
							if(Sp5 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5170);
						}
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5174);
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5171);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S28')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5167);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S28')) {
							if(Sp6 && !All) spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5160);
						}
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5164);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5161);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S28')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5217);
					}
					else {
						if(Sp6)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5214);
						if(Sp6)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5211);
						if(Sp6 && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5215);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S27')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5227);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W21S27')) {
							if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5220);
						}
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5224);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5221);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S28')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5247);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S28')) {
							if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5240);
						}
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5244);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5241);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S29')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5237);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S29')) {
							if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5230);
						}
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5234);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5231);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S27')) {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5207);
					}
					else {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][H], 5204);
						if(Sp10)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5201);
						if(Sp10 && upgrade && !All)	spawns.tryCreateCreep(spawn,    UPGRADER[L], 5205);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S27')) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5197);
					}
					else {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][H], 5194);
						if(Sp7)	spawns.tryCreateCreep(spawn,   CARIER[7][M], 5191);
						if(Sp7 && upgrade && !All)	spawns.tryCreateCreep(spawn,   UPGRADER[L], 5195);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S28')) {
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5157);
					}
					else {
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5154);
						if(Sp8)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5151);
						if(Sp8 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5155);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S26') &&
						 tools.getInviderCoreLevel('W25S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W25S26') == 1) {
							if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 5257);
						}
					}
					else if(Game.cpu.bucket >= 8100) {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5258);
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][L], 5254);
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5251);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S26') &&
						 tools.getInviderCoreLevel('W24S26') !== undefined ) {
						if(tools.getInviderCoreLevel('W24S26') == 1) {
							if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 5267);
						}
					}
					else if(Game.cpu.bucket >= 8100) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5268);
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][L], 5264);
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5261);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W29S27')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5277);
					}
					else {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5274);
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5271);
						if(Sp9 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5275);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S26')) {
						const ICL = observer.getInviderCoreLevel('W26S26');
						const fG = flags.getFlag('528G');
						const G = 1 + ((!fG)? 0:10-fG.color); //WHITE = 1+0
						if(ICL !== undefined) {
							console.log( '🎃', Math.trunc(Game.time/10000), Game.time%10000
																, 'INVIDER CORE', JSON.stringify({W26S26:spawn.name, ICL:ICL, fG:fG, G:G})
										);
						}
						if(ICL == 1) {
							if(Sp11 || Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][H], 5288);
						}
						if(ICL == 2 && Game.cpu.bucket >= 8200) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEFENDER[G][L], 5286);
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEFENDER[G][M], 5287);
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEFENDER[G][H], 5288);
						}
						else if(ICL === undefined && Game.cpu.bucket >= 7001) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5288);
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][S+1], 5284);
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5281);
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S27')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5297);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S27')) {
							if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5290);
						}
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5294);
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5291);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S26')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5147);
					}
					else {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5144);
						if((Sp12 || Sp13) && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5141);
						if(Sp12 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5145);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S26')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5317);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S26')) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5310);
						}
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5314);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5311);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S25')) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5307);
					}
					else {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5304);
						if(Sp13)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5301);
						if(Sp13 && upgrade && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5305);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S25') &&
						 tools.getInviderCoreLevel('W26S25') !== undefined ) {
						if(tools.getInviderCoreLevel('W26S25') == 1) {
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 5327);
						}
					}
					else if(Game.cpu.bucket >= 8300) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5328);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][L], 5324);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5321);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S24')) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5347);
					}
					else {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5344);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5341);
						if(Sp13)	spawns.tryCreateCreep(spawn, CARIER[7][M], 5341);
						if(Sp14 && upgrade && !All)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 5345);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S24')) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5357);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S24')) {
							if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][M], 5350);
						}
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5354);
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5351);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W27S23')) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5367);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W27S23')) {
							if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5360);
						}
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5364);
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5361);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W28S23')) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5377);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W28S23')) {
							if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 5370);
						}
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 5374);
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5371);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W26S24')) {
						const ICL = tools.getInviderCoreLevel('W26S24');
						const fG = flags.getFlag('545G');
						if(ICL !== undefined) {
							console.log( '🎃', Math.trunc(Game.time/10000), Game.time%10000
																, 'INVIDER CORE', JSON.stringify({W26S24:spawn.name, ICL:ICL})
										);
						}
						if(ICL == 1) {
							const G = 7 + ((!fG)? 0:10-fG.color); //WHITE = 7+0
							if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][M], 5457);
						}
						if(ICL == 3 && Game.cpu.bucket >= 9500) {
							const G = 13 + ((!fG)? 0:10-fG.color); //WHITE = 13+0
							if(Sp14 && !All) spawns.tryCreateCreep(spawn, ATTACKER[G][L], 5456);
							if(Sp14 && !All) spawns.tryCreateCreep(spawn, ATTACKER[G][M], 5457);
							if(Sp14 && !All) spawns.tryCreateCreep(spawn, ATTACKER[G][H], 5458);
							if(Sp14 && !All) spawns.tryCreateCreep(spawn, ATTACKER[G][S], 5459);
						}
					}
					else if(Game.cpu.bucket >= 8400) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 5458);
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn,   WORKER[7][L], 5454);
            if(Sp14 && !All)	spawns.tryCreateCreep(spawn,   CARIER[7][L], 5451);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W25S24')) {
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S29')) {
						const fG = flags.getFlag('540G');
						const G = 7 + ((!fG)? 0:10-fG.color); //WHITE = 7+0
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][L], 5406);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][M], 5407);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][H], 5408);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5402);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5404);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5401);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5409);
					}
					else {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5402);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5404);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5401);
						if(Sp15 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5405);
					}
					{
						var NAT = Game.flags['W21S23.NAT'];
						var NA = Game.flags['W21S23.NA'];
						var roomW21S23 = Game.rooms['W21S23'];
						var trapPos = roomW21S23.getPositionAt(43,27);
						const isTrapFull = trapPos.findInRange(FIND_HOSTILE_CREEPS, 0).length > 0;
						if(isTrapFull) {
							spawns.setRampartPublic(roomW21S23.getPositionAt(44,26),false);
							spawns.setRampartPublic(roomW21S23.getPositionAt(44,28),false);
							NA.setColor(COLOR_RED);
							NAT.setColor(COLOR_RED);
						}
						else {
							spawns.setRampartPublic(roomW21S23.getPositionAt(44,26));
							spawns.setRampartPublic(roomW21S23.getPositionAt(44,28));
							NA.setColor(COLOR_GREEN);
							NAT.setColor(COLOR_GREEN);
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S23')) { 
						const boost5417 = Game.flags['W21S23.boosts: \"5417\":[\"XZHO2\",\"XLHO2\"]'];
						if(!!boost5417)
							boost5417.setColor(COLOR_GREEN)
						const fG = flags.getFlag('541G');
						const G = 7 + ((!fG)? 0:10-fG.color); //WHITE = 7+0
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5411);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][L], 5416);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][M], 5417);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][H], 5418);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5412);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5414);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5415);
					}
					else {
						var boost5417 = Game.flags['W21S23.boosts: \"5417\":[\"XZHO2\",\"XLHO2\"]'];
						if(!!boost5417)
							boost5417.setColor(COLOR_RED)
						const fG = flags.getFlag('541G');
						const G = 7 + ((!fG)? 0:10-fG.color); //WHITE = 7+0
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5411);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][L], 5416);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][M], 5417);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[G][H], 5418);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5412);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5414);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 5415);
						if(Sp16 && !All) spawns.tryCreateCreep(spawn, TRANSPORT[3][L], 5413);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S24')) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5427);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S24')) {
							if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5420);
						}
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5424);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5421);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S22')) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5437);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W21S22')) {
							if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5430);
						}
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5434);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5431);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S23')) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5447);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S23')) {
							if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5440);
						}
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 5444);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5441);
					}

					{
						var NAT = Game.flags['W22S21.NAT'];
						var NA = Game.flags['W22S21.NA'];
						var roomW22S21 = Game.rooms['W22S21'];
						var trapPos1 = roomW21S23.getPositionAt(44,8);
						const isTrap1Full = trapPos1.findInRange(FIND_HOSTILE_CREEPS, 0).length > 0;
						if(isTrap1Full) {
							spawns.setRampartPublic(roomW22S21.getPositionAt(45,8),false);
							NA.setColor(COLOR_RED);
							NAT.setColor(COLOR_RED);
						}
						else {
							spawns.setRampartPublic(roomW22S21.getPositionAt(45,8));
							NA.setColor(COLOR_GREEN);
							NAT.setColor(COLOR_GREEN);
						}
						var trapPos2 = roomW22S21.getPositionAt(46,13);
						const isTrap2Full = trapPos2.findInRange(FIND_HOSTILE_CREEPS, 0).length > 0;
						if(isTrap2Full) {
							spawns.setRampartPublic(roomW22S21.getPositionAt(47,12),false);
							NA.setColor(COLOR_RED);
							NAT.setColor(COLOR_RED);
						}
						else {
							spawns.setRampartPublic(roomW22S21.getPositionAt(47,12));
							NA.setColor(COLOR_GREEN);
							NAT.setColor(COLOR_GREEN);
						}
					}					
					
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S21')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 5587);
					}
					else {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5581);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5582);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5584);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 5585);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S21')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 5597);
					}
					else {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 5591);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5592);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 5594);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 5595);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S21')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5607);
					}
					else {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5605);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5604);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M/*H*/], 5602);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5601);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S22')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5617);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S22')) {
							if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5610);
						}
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5614);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5611);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W22S22')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5627);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W22S22')) {
							if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5620);
						}
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5624);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5621);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S24')) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5637);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S24')) {
							if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5630);
						}
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5634);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5631);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W23S23')) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5647);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W23S23')) {
							if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5640);
						}
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5644);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5641);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W24S22')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5657);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W24S22')) {
							if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5650);
						}
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5654);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5651);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W21S21')) {
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5667);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W21S21')) {
							if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5660);
						}
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 5664);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5661);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W19S25')) {
// 						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 5697);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W19S25')) {
// 							if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][L], 5690);
						}
// 						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 5694);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5691);
					}

					if(observer.shouldSpawnForDeposit('W30S29') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5461, 2);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5464, 2);
					}
					if(observer.shouldSpawnForDeposit('W27S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5471, 2);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5474, 2);
					}
					if(observer.shouldSpawnForDeposit('W25S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5501, 2);
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5504, 2);
					}
					if(observer.shouldSpawnForDeposit('W30S31') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5481, 2);
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5484, 2);
					}
					if(observer.shouldSpawnForDeposit('W20S23') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 5491, 2);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5494, 2);
					}
					if(observer.shouldSpawnForDeposit('W20S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5511, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5514, 2);
					}
					if(observer.shouldSpawnForDeposit('W30S26') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5521, 2);
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5524, 2);
					}
					if(observer.shouldSpawnForDeposit('W19S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5531, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5534, 2);
					}
					if(observer.shouldSpawnForDeposit('W22S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5541, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5544, 2);
					}
					if(observer.shouldSpawnForDeposit('W20S28') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5551, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5554, 2);
					}
					if(observer.shouldSpawnForDeposit('W23S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5561, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5564, 2);
					}
					if(observer.shouldSpawnForDeposit('W28S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][L], 5571, 2);
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 5574, 2);
					}
					if(observer.shouldSpawnForDeposit('W20S29') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5671, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5674, 2);
					}
					if(observer.shouldSpawnForDeposit('W21S30') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5681, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5684, 2);
					}
					if(observer.shouldSpawnForDeposit('W20S27') && Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][S], 5701, 2);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[S], 5704, 2);
					}

					if(Game.cpu.bucket >= 8000) {
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, TRANSPORT[4][L], 233);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, TRANSPORT[4][L], 473);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, TRANSPORT[3][L], 13);
						if(Sp2 && !All && upgrade) spawns.tryCreateCreep(spawn, TRANSPORT[3][L], 13);
						if(Sp2 && !All && (upgrade || !!flags.getFlag('3'))) spawns.tryCreateCreep(spawn, CARIER[7][L], 473);
						if(Sp4 && !All && (upgrade || !!flags.getFlag('3'))) spawns.tryCreateCreep(spawn, CARIER[7][L], 473);
						if(Sp17 && !All && upgrade) spawns.tryCreateCreep(spawn, CARIER[7][L], 5593);
						if(Sp17 && !All && upgrade) spawns.tryCreateCreep(spawn, CARIER[7][L], 5603);
					}
				}

				if(Game.shard.name == 'shard0') {

					if(false) {
						if(Sp1) spawns.tryCreateCreep(spawn, CARIER[3][H], 301);
						if(Sp1) spawns.tryCreateCreep(spawn, WORKER[5][M], 304);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S52')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 407);
					}
					else {
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, WORKER[7][H], 404);
						if(Sp1 && !All) spawns.tryCreateCreep(spawn, CARIER[7][M], 401);
						if(Sp1 && !All && upgrade) spawns.tryCreateCreep(spawn, UPGRADER[L], 405);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S53')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 417);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S53')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 410);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 414);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 411);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S52')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 427);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S52')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 420);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 424);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 421); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S52')) {
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 437);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S52')) {
							if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 430);
						}
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 434);
						if(Sp1 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 431);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S52')) {
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 447);
					}
					else {
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 444);
						if(Sp4 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 441);
						if(Sp4 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 445);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S51')) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 457);
					}
					if(true) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 454);
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 451);
						if(Sp2 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 455);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S51')) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[4][M], 467);
					}
					else {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 464);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 461);
						if(Sp6 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 465);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S51')) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 487);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S51')) {
              if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 480);
						}
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 484);
            if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 481);
					}
          if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S51')) {
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 497);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W56S51')) {
              if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 490);
						}
						if(Sp2 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 494);
            if(Sp2 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 491); // 2
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S54')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 517);
					}
					else {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 514);
            if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 511);
						if(Sp9 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 515);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S51')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 527);
					}
					else {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 524);
            if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][M], 521);
						if(Sp3 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 525);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S51')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 537);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W52S51')) {
              if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 530);
						}
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 534);
            if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 531);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S51')) {
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 547);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S51')) {
              if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 540);
						}
						if(Sp3 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][S], 544);
            if(Sp3 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 541);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S53')) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 557);
					}
					else {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 554);
            if(Sp5 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 551);
						if(Sp5 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 555);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S54') &&
						 tools.getInviderCoreLevel('W56S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W56S54') == 1) {
						}
						if(tools.getInviderCoreLevel('W56S54') == 6) {
						}
					}
					else if(Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_CENTRAL_ROOMS) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 568);
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn,  WORKER[8][L], 564);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn,  CARIER[6][H], 561);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S53')) {
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 577);
					}
					else {
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 574);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 571);
						if(Sp8 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 575);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S53')) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 597);
					}
					else {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 594);
            if(Sp7 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 591);
						if(Sp7 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 595);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S52')) {
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 607);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W55S52')) {
              if(Sp8 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 600);
						}
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 604);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 601);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S52')) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 617);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W54S52')) {
              if(Sp7 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 610);
						}
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 614);
            if(Sp7 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 611);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S54') &&
						 tools.getInviderCoreLevel('W55S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W55S54') == 1) {
							if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 637);
						}
						if(tools.getInviderCoreLevel('W55S54') == 3) {
							if(Sp8 && !All) spawns.tryCreateCreep(spawn, ATTACKER[13][L], 636);
							if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[13][M], 637);
							if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[13][H], 638);
						}
					}
					else if(Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_CENTRAL_ROOMS) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 638);
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   WORKER[8][L], 634);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   CARIER[6][H], 631);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S55')) {
							if(tools.getInviderCoreLevel('W55S55') === undefined ) {
								if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 697);
							}
							if(tools.getInviderCoreLevel('W55S55') == 1) {
								if(Sp8 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 697);
							}
						}
						else if(Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_CENTRAL_ROOMS) {
							if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 698);
							if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   WORKER[8][L], 694);
							if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   CARIER[6][H], 691);
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S54') &&
						 tools.getInviderCoreLevel('W54S54') !== undefined ) {
						if(tools.getInviderCoreLevel('W54S54') == 1) {
							if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 627);
						}
						if(tools.getInviderCoreLevel('W54S54') == 4) {
						}
					}
					else if(Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_CENTRAL_ROOMS) {
						if(Sp7 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 628);
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   WORKER[8][L], 624);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn,   CARIER[6][H], 621);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W56S55') &&
						 tools.getInviderCoreLevel('W56S55') !== undefined ) {
						if(tools.getInviderCoreLevel('W56S55') == 1) {
							if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[8][M], 687);
						}
					}
					else if(Game.cpu.bucket >= constants.CPU_BUCKET_TO_SPAWN_CENTRAL_ROOMS) {
						if(Sp5 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[9][H], 688);
						if(Sp8 && !All)	spawns.tryCreateCreep(spawn, WORKER[8][L], 684);
            if(Sp8 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 681);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S55')) {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 657);
					}
					else {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 654);
            if(Sp10)	spawns.tryCreateCreep(spawn, CARIER[7][M], 651);
						if(Sp10 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 655);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S54')) {
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 707);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W57S54')) {
              if(Sp10 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 700);
						}
						if(Sp10 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][L], 704);
            if(Sp10 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 701);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S53')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 717);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S53')) {
              if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 710);
						}
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 714);
            if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 711);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S53')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 727);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S53')) {
              if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 720);
						}
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 724);
            if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 721);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S54')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 737);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W59S54')) {
              if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 730);
						}
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 734);
            if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 731);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S55')) {
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 747);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S55')) {
              if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 740);
						}
						if(Sp9 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][M], 744);
            if(Sp9 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 741);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S56')) {
						if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 757);
					}
					else {
						if(Sp11 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 754);
            if(Sp10 || Sp11)	spawns.tryCreateCreep(spawn, CARIER[7][H], 751);
						if(Sp11 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 755);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W58S56')) {
							if((Sp10 || Sp11) && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 807);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W58S56')) {
								if(Sp11 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 800);
							}
							if(Sp11 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 804);
							if(Sp11 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 801);
						}
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S54')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 787);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S54')) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 780);
						}
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 784);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 781);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S54')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 677);
					}
					else {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 674);
						if(Sp12)	spawns.tryCreateCreep(spawn, CARIER[7][H], 671);
						if(Sp12 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 675);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W51S54')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 777);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W51S54')) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 770);
						}
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[6][L], 774);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 771);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S55')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 797);
					}
					else {
						if(conditions.TO_SPAWN_ROOM_CLAIMER('W52S55')) {
							if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 790);
						}
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 794);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 791);
					}

					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S57')) {
						if((Sp13 || Sp12) && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 767);
					}
					else {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 764);
            if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 761);
            if(Sp12 && All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 761);
						if(Sp13 && !All && upgrade)	spawns.tryCreateCreep(spawn,  UPGRADER[L], 765);
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W55S57')) {
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 817);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W55S57')) {
								if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 810);
							}
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 814);
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 811);
						}
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W54S58')) {
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 827);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W54S58')) {
								if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 820);
							}
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 824);
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 821);
						}
						if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S57')) {
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 837);
						}
						else {
							if(conditions.TO_SPAWN_ROOM_CLAIMER('W53S57')) {
								if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CLAIMER[7][H], 830);
							}
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[5][L], 834);
							if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 831);
						}
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W59S51')) {
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 477);
						spawns.setRampartsPublic('W59S51',false);
					}
					else {
						spawns.setRampartsPublic('W59S51')
						if(Sp14 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][H], 474);
						if(Sp14)	spawns.tryCreateCreep(spawn, CARIER[7][H], 471);
						if(Sp14 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 475);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W52S56')) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 847);
					}
					else {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 844);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][H], 841);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 841);
						if(Sp15 && !All && upgrade)	spawns.tryCreateCreep(spawn, UPGRADER[L], 845);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W57S59')) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 857);
					}
					else {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 854);
						if(Sp18 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][H], 851);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 855);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S56')) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 867);
					}
					else {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 864);
						if(Sp16 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][H], 861);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 865);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W53S53')) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 877);
					}
					else {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 874);
						if(Sp17 && !All)	spawns.tryCreateCreep(spawn, CARIER[5][H], 871);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 875);
					}
					if(conditions.TO_SPAWN_ROOM_DEFENDERS('W51S57')) {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[7][M], 887);
					}
					else {
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, ATTACKER[5][M], 889);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, WORKER[7][M], 884);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, CARIER[7][L], 881);
						if(Sp15 && !All)	spawns.tryCreateCreep(spawn, UPGRADER[L], 885);
					}

					if(observer.shouldSpawnForDeposit('W50S52') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1001, 2);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1004, 2);
					}
					if(observer.shouldSpawnForDeposit('W52S60') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1011, 2);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1014, 2);
					}
					if(observer.shouldSpawnForDeposit('W50S55') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1021, 2);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1024, 2);
					}
					if(observer.shouldSpawnForDeposit('W49S60') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1031, 2);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1034, 2);
					}
					if(observer.shouldSpawnForDeposit('W55S50') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_DEPOSITER) {
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][L], 1041, 2);
						if(Sp6 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[M], 1044, 2);
					}
					if(observer.shouldSpawnForDeposit('W56S60') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1051, 2);
						if(Sp13 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1054, 2);
					}
					if(observer.shouldSpawnForDeposit('W50S56') && Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_BOOSTED_DEPOSITER) {
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, CARIER[6][H], 1061, 2);
						if(Sp12 && !All)	spawns.tryCreateCreep(spawn, DEPOSITER[H], 1064, 2);
					}

					if(Sp14 && !All && (upgrade || !!flags.getFlag('3'))) spawns.tryCreateCreep(spawn,   CARIER[7][L], 5023);
					//if(Sp1 && (Game.time % 500000 < 250) ) spawns.tryCreateCreep(spawn, HEALER[7][L], 1000);
					//if(Sp1 && (Game.time % 500000 > 250) ) spawns.tryCreateCreep(spawn, CARIER[1][L], 1000);
				}

			}

			if(!!spawn && spawn.spawning) {
				spawn.spawning.setDirections([TOP, TOP_LEFT, LEFT, BOTTOM_LEFT, BOTTOM, BOTTOM_RIGHT, RIGHT, TOP_RIGHT]);

				var spawningCreep = Game.creeps[spawn.spawning.name];
				spawn.room.visual.text('🛠️' + spawn.spawning.name
															 , spawn.pos.x + 1
															 , spawn.pos.y
															 , {align: 'left', opacity: 0.8});
			}
		}); // forEach
	}
};

module.exports = spawns;
