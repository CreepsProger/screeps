//import {checkFlags} from 'main.flags.js';
//import {checkMainCommit} from 'main.flags.js';
const constants = require('main.constants');
const config = require('main.config');
const links = require('main.links');
const towers = require('main.towers');
const metrix = require('main.metrix');
const spawns = require('main.spawns');
const flags = require('main.flags');
const log = require('main.log');
const cash = require('cash');
var role = require('role.claimer');

module.exports.loop = function () {

	var dt = Game.cpu.getUsed();

	if(Game.time % constants.TICKS_TO_CHECK_NON_EXISTING == 0) {
		// console.log( '⏳', Game.cpu.getUsed() + '/' + Game.cpu.tickLimit);
		for(var name in Memory.creeps) {
			var creep = Game.creeps[name];
			if(!creep) {
				const code0 = '0'.charCodeAt(0);
				const nnn = name.charCodeAt(7) - code0;
				var weight = nnn >= 0 && nnn < 10? nnn:0;
				const nn = name.charCodeAt(8) - code0;
				if(nn >= 0 && nn < 10)
					weight = weight*10+nn;
				const n = name.charCodeAt(9) - code0;
				if(n >= 0 && n < 10)
					weight = weight*10+n;
				const	total_sum_pst = Object.keys(Memory.CreepsIdleTicksByWeight).reduce((p,w) => p +
														Object.keys(Memory.CreepsIdleTicksByWeight[w]).reduce((pp,c) => pp +
																				(!Memory.CreepsIdleTicksByWeight[w][c].pc?1:Memory.CreepsIdleTicksByWeight[w][c].pc),0),0);
				const	total_cnt_pst = Object.keys(Memory.CreepsIdleTicksByWeight).reduce((p,w) => p +
														Object.keys(Memory.CreepsIdleTicksByWeight[w]).reduce((pp,c) => pp +
																				!!Memory.CreepsIdleTicksByWeight[w][c].w,0),0);
				const	total_avg_pst = Math.round(total_sum_pst/total_cnt_pst);
				const sum_pst = Object.keys(Memory.CreepsIdleTicksByWeight[weight]).reduce((p,c) => p +
																(!Memory.CreepsIdleTicksByWeight[weight][c].pc?1:Memory.CreepsIdleTicksByWeight[weight][c].pc),0);

				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, 'Clearing non-existing creep memory:'
										, name, weight//, 'cpu:', JSON.stringify(creep.memory.cpu)
										, 'sum idle pst:', sum_pst, JSON.stringify(Memory.CreepsIdleTicksByWeight[weight])
										, 'total_sum_pst:', total_sum_pst
										, 'total_cnt_pst:', total_cnt_pst
										, 'total_avg_pst:', total_avg_pst
										, JSON.stringify(Memory.CreepsIdleTicksByWeight));
				Memory.CreepsIdleTicksByWeight[weight] = {};
				delete Memory.creeps[name];
			}
			else if(0 < creep.ticksToLive && creep.ticksToLive <= constants.TICKS_TO_CHECK_NON_EXISTING) {
				const sum_role_cpu = Object.keys(creep.memory.cpu).reduce((sum,role) => sum + creep.memory.cpu[role],0);
				const max_role_cpu = Object.keys(creep.memory.cpu).reduce((a,role) =>
																																	!creep.memory.cpu[a.max_role] || creep.memory.cpu[a.max_role] < creep.memory.cpu[role]?
																																  {max_role:role, v:creep.memory.cpu[role]}:
																																	{max_role:a.max_role, v:a.v},
																																	{max_role:'', v:0});
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, 'ticksToLive:', creep.ticksToLive
										, name
										, 'idle:', creep.memory.idle, JSON.stringify(Memory.CreepsIdleTicksByWeight[creep.memory.weight][creep.memory.n])
										, 'cpu:', sum_role_cpu, JSON.stringify(max_role_cpu), JSON.stringify(creep.memory.cpu)
									 );
			}
		}
	}

	metrix.run();
	config.run();
	flags.run()
	links.run();
	towers.run();
	spawns.run();
	metrix.output();
	// cash.getStorages();

	delete Memory.targets;
	Memory.targets = {};
	delete Memory.cpu;
	Memory.cpu = { creep: {max_dt: 0, creep: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100, n:1}
							 , role : {max_dt: 0, creep: '', role: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100}
							 , step : {max_dt: 0, creep: '', role: '', step: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100}
							 , max	: {sum:0}
						   };

 console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000, 'main run dt:', (dt = Game.cpu.getUsed()-dt,dt));

	var main_part_dt = Math.round((Game.cpu.getUsed()) * 100)/100;
	Memory.cpu_main_part_dt += main_part_dt;

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		if(!creep.spawning) {
			creep.memory.rerun = 0;
			if(Memory.cpu.creep.t < 0.5*Game.cpu.tickLimit || creep.memory.weight < 70)
				role.run(creep);
			metrix.cpu.creep_time(creep);
			if(Memory.cpu.creep.t > 0.9*Game.cpu.tickLimit) {
				console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
										, 'tickLimit:'
										, Game.cpu.tickLimit
										, JSON.stringify(Memory.cpu));
			}
		}
	}

	var cpu_dt = Math.round((Game.cpu.getUsed()) * 100)/100;
	Memory.cpu_dt += cpu_dt;
	Memory.cpu_creeps_part_dt += cpu_dt - main_part_dt;

	if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
		for(var name in Game.creeps) {
			var creep = Game.creeps[name];
			if(!creep.spawning) {
				for(var role_name in creep.memory.cpu) {
					if(!Memory.cpu.max[role_name])
						Memory.cpu.max[role_name] = {sum:0, max_weight:0, max_weight_sum:0};
					if(!Memory.cpu.max[role_name][creep.memory.weight])
						Memory.cpu.max[role_name][creep.memory.weight] = 0;
					Memory.cpu.max.sum += Math.round(creep.memory.cpu[role_name]*100)/100;
					Memory.cpu.max[role_name].sum += Math.round(creep.memory.cpu[role_name]*100)/100;
					Memory.cpu.max[role_name][creep.memory.weight] += Math.round(creep.memory.cpu[role_name]*100)/100 ;
					if(Memory.cpu.max[role_name].max_weight_sum < Memory.cpu.max[role_name][creep.memory.weight]) {
						Memory.cpu.max[role_name].max_weight_sum = Memory.cpu.max[role_name][creep.memory.weight];
						Memory.cpu.max[role_name].max_weight = creep.memory.weight;
					}
				}
			}
		}
		var max_role = Object.keys(Memory.cpu.max).reduce((p,c) =>
		 																		 Memory.cpu.max[p].sum > Memory.cpu.max[c].sum ? p:c);
		var max_role_by_weight = Object.keys(Memory.cpu.max).reduce((p,c) =>
		 																		 Memory.cpu.max[p].max_weight_sum > Memory.cpu.max[c].max_weight_sum ? p:c);

		console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
								, 'CPU:'
								, JSON.stringify({ dt:Math.round(Memory.cpu_dt*100)/100
																	, "main part": Math.round(Memory.cpu_main_part_dt*100)/100
																	, "creeps part": Math.round(Memory.cpu_creeps_part_dt*100)/100})
								, JSON.stringify({ limit:Game.cpu.limit * constants.TICKS_TO_CHECK_CPU
																	, bucket:Game.cpu.bucket
																	, delta: Game.cpu.bucket - Memory.cpu_prev_bucket})
								, JSON.stringify({ "creeps sum":Math.round(Memory.cpu.max.sum*100)/100
																	, "delta":Math.round((Memory.cpu.max.sum - Memory.cpu_prev_creeps_sum) * 100)/100
																 , max_role:max_role
																 , max_role_sum:Math.round(Memory.cpu.max[max_role].sum*100)/100
																 , max_role_by_weight:max_role_by_weight
																 , max_weight:Math.round(Memory.cpu.max[max_role_by_weight].max_weight*100)/100
																 , max_weight_sum:Math.round(Memory.cpu.max[max_role_by_weight].max_weight_sum*100)/100})
								, JSON.stringify(Memory.cpu));
		Memory.cpu_prev_bucket = Game.cpu.bucket;
		Memory.cpu_prev_creeps_sum = Memory.cpu.max.sum;
		Memory.cpu_main_part_dt = 0;
		Memory.cpu_creeps_part_dt = 0;
		Memory.cpu_dt = 0;
	}
	var main_part2_dt = Math.round((Game.cpu.getUsed() - cpu_dt) * 100)/100;
	Memory.cpu_main_part_dt += main_part2_dt;
	Memory.cpu_dt += main_part2_dt;
}
