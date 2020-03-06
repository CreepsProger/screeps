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
			const  Ts = Math.trunc(type%100000000000000/1000000000000);
			const CLs = Math.trunc(type%1000000000000/10000000000);
			const RAs = Math.trunc(type%10000000000/100000000);
			const  As = Math.trunc(type%100000000/1000000);
			const  Ws = Math.trunc(type%1000000/10000);
			const  Cs = Math.trunc(type%10000/100);
			const  Ms = Math.trunc(type%100);
			for (var i = 0; i <  Ts; i++) {body.push(TOUGH);}
			for (var i = 0; i < CLs; i++) {body.push(CLAIM);}
			for (var i = 0; i < RAs; i++) {body.push(RANGED_ATTACK);}
			for (var i = 0; i <  As; i++) {body.push(ATTACK);}
			for (var i = 0; i <  Ws; i++) {body.push(WORK);}
			for (var i = 0; i <  Cs; i++) {body.push(CARRY);}
			for (var i = 0; i <  Ms; i++) {body.push(MOVE);}
			const cost = 10*Ts + 600*CLs + 150*RAs + 80*As + 100*Ws + 50*Cs + 50*Ms;
			var existsNumber = 0;
			const full_type = '' + type + '/' + weight;
			if(Memory.CreepsNumberByType[full_type])
				existsNumber = Memory.CreepsNumberByType[full_type];
			const needsNumber = needed - existsNumber;
			const newName = 'creep-<' + weight + '>-' + Ts + '.' + CLs + '.' + RAs + '.' + As + '.' + Ws + '.' + Cs + '.' + Ms + '-' + Game.time % 10000;
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
				var err = spawn.spawnCreep(body
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
					spawns.tryCreateCreep(spawn,          1608, 30, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,        120408, 39, 1); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn,          3015, 40, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,        111111, 49, 1); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn,25000800000017,53, 8); // V 1-2 E  2300 Attacker
				}
				else {
					spawns.tryCreateCreep(spawn,          1608, 30, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,        120408, 39, 1); // V 1-1 E  1800   Worker
					spawns.tryCreateCreep(spawn,          3015, 40, 1); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,        111111, 49, 2); // V 1-1 E  1800   Worker
	 				spawns.tryCreateCreep(spawn,          3015, 50, 2); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,   20000000002, 51, 1); // V 1-1 E  1300  Claimer
					spawns.tryCreateCreep(spawn,        111111, 59, 2); // V 1-1 E  1800   Worker
	        spawns.tryCreateCreep(spawn,          3015, 60, 2); // V 1-1 E  1800   Carier
					spawns.tryCreateCreep(spawn,   20000000002, 61, 1); // V 1-1 E  1300  Claimer
					spawns.tryCreateCreep(spawn,        111111, 69, 2); // V 1-1 E  1800   Worker
          spawns.tryCreateCreep(spawn, 25000800000017,66, 2); // V 1-2 E  2300 Attacker
		    	// spawns.tryCreateCreep(spawn,25000800000017, 53, 8); // V 1-2 E  2300 Attacker
				// spawns.tryCreateCreep(spawn, 5000400000014,100, 7); // V 1-1 E   700 Attacker
				// spawns.tryCreateCreep(spawn,   20000000002,101, 0); // V 1-1 E  1300  Claimer
// 				spawns.tryCreateCreep(spawn, 5000200000007,110, 2); // V 1-1 E   700 Attacker
// 				spawns.tryCreateCreep(spawn, 5000200000007,120, 0); // V 1-1 E   700 Attacker
				// spawns.tryCreateCreep(spawn,             1, 92, 4); // V 1-1 E    50 Attacker
				// spawns.tryCreateCreep(spawn,10000800000018, 93, 4); // V 1-1 E  2200 Attacker
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
