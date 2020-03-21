const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const flags = require('main.flags');
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
			var range = 0;
			var mittl = 1667;
			var diff_mittli_range_bodys = 6667;
			var idle = 0;
			if(!!Memory.CreepsNumberByWeight[weight]) {
				//existsNumber = Memory.CreepsNumberByType[full_type];
				existsNumber = Memory.CreepsNumberByWeight[weight];
			}
			if(!!Memory.CreepsIdleTicksByWeight[weight]) {
				var creepNs = Object.keys(Memory.CreepsIdleTicksByWeight[weight]);
				idle = creepNs.reduce((p,c) => p +
															(!Memory.CreepsIdleTicksByWeight[weight][c].i?0:Memory.CreepsIdleTicksByWeight[weight][c].i),0);
				const bucketWeight = (Game.cpu.bucket <= constants.CPU_BUCKET_TO_SPAWN)? 1:Game.cpu.bucket-constants.CPU_BUCKET_TO_SPAWN;
 				idle = Math.round(idle/(creepNs.length + Math.log(bucketWeight+Math.E)));
			}
			if(!!Memory.CreepsMinTicksToLive[weight] && !!Memory.CreepsMinTicksToLive[weight].pos) {
				range = tools.getRangeTo(spawn.pos,Memory.CreepsMinTicksToLive[weight].pos);
				mittl= Memory.CreepsMinTicksToLive[weight].mittl;
				diff_mittli_range_bodys = mittl + idle - range - body.length*3;
			}
			const needed_plus = needed + (diff_mittli_range_bodys < constants.TICKS_TO_SPAWN);
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
											, 'exists/needs/needs+:'
										  , '' + existsNumber + '/' + needed + '/' + needed_plus
											, 'mittl+idle-range-3*bodys:'
											, '' + mittl + '+' + idle +'-' + range + '-3*' + body.length + '=' + diff_mittli_range_bodys
										 );

          Memory.CreepsCounter++;
          Memory.totals.SpawningCreeps++;
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

				if(Memory.totals.CARRY < 9) spawns.tryCreateCreep(spawn,          808, 10, 2); // E  800 Carier
				if(Memory.totals.CARRY < 9) spawns.tryCreateCreep(spawn,          505, 10, 2); // E  500 Carier
				if(Memory.totals.CARRY < 9) spawns.tryCreateCreep(spawn,          303, 10, 3); // E  300 Carier
				if(Memory.totals.WORK < 32) spawns.tryCreateCreep(spawn,        80808, 20, 1); // E 1600 Worker
				if(Memory.totals.WORK < 16) spawns.tryCreateCreep(spawn,        40404, 20, 2); // E  800 Worker
				if(Memory.totals.WORK <  8) spawns.tryCreateCreep(spawn,        20202, 20, 4); // E  400 Worker
				if(Memory.totals.WORK <  4) spawns.tryCreateCreep(spawn,        10101, 20, 8); // E  200 Worker

				// 22*1800+2*1300+4*650 = 44800 -> 30 per game tick
				if(false) {
					spawns.tryCreateCreep(spawn,             3015, 31, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,           100608, 39, 1); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn,             3015, 40, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,           111111, 49, 2); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn, 2500000800000017, 53, 8); // V 1-2 E  2300 Attacker
				}
				else {
					if(conditions.TO_SPAWN_MAIN_ROOMS()) {
						if(spawn.name == 'Spawn1' || !!rerun) spawns.tryCreateCreep(spawn,            90909, 34, 1); // V 1-1 E    Worker
						if(spawn.name == 'Spawn1' || !!rerun) spawns.tryCreateCreep(spawn,             2412, 31, 1); // V 1-1 E    Carier
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn,            90909, 44, 3); // V 1-1 E    Worker
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn,             2412, 41, 3); // V 1-1 E    Carier
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,            90909, 64, 3); // V 1-1 E    Worker
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,             2412, 61, 3); // V 1-1 E    Carier
					}
					if(conditions.TO_SPAWN_CLAIMING_ROOMS()) {
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,    2000000000002, 50, 1); // V 1-1 E   Claimer
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,             2412, 51, 3); // V 1-1 E    Carier
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,            80808, 54, 3); // V 1-1 E    Worker
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,    2000000000002, 90, 1); // V 1-1 E   Claimer
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,            80808, 94, 1); // V 1-1 E    Worker
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,              201, 91, 1); // V 1-1 E    Carier
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,    2000000000002,100, 1); // V 1-1 E   Claimer
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,            80808,104, 1); // V 1-1 E    Worker
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,             2412,101, 1); // V 1-1 E    Carier
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn, 1000000500000015,105, 1); // V 1-2 E  Attacker
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,    2000000000002,110, 1); // V 1-1 E   Claimer
						if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,            80808,114, 1); // V 1-1 E    Worker
						// if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn,             2412,111, 1); // V 1-1 E    Carier
						// if(spawn.name == 'Spawn3' || !!rerun) spawns.tryCreateCreep(spawn, 1000000500000015,115, 1); // V 1-2 E  Attacker
					}
					//                                                                                      30)
					//                                                                 TTClRrAaHhWwCcMm,100, 3); // V 1-2 E  Attacker
					if(conditions.TO_SPAWN_KEEPERS_ROOMS()) {
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn, 1500001000000025, 75, 2); // V 1-2 E  Attacker
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn,           130911, 74, 1); // V 1-1 E    Worker
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn,              804, 71, 1); // V 1-1 E    Carier
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn, 1000100000000010, 76, 0); // V 1-2 E RAttacker
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn,  500000007000006, 77, 1); // V 1-1 E    Healer
					}
					if(conditions.TO_SPAWN_TO_ATTACK()) {
						if(spawn.name == 'Spawn2' || !!rerun) spawns.tryCreateCreep(spawn, 1000000005000015, 87, 5); // V 1-1 E    Healer
					}
				}
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
