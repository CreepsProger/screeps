const constants = require('main.constants');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const event_processor = require('event.processor');
const links = require('main.links');
const towers = require('main.towers');
const terminals = require('main.terminals');
const factory = require('main.factory');
const labs = require('main.labs')
const spawns = require('main.spawns');
const log = require('main.log');
const cash = require('cash');
const tools = require('tools');
const tasks = require('tasks');
const role = require('role.claimer');

module.exports.loop = function () {

	//Game.cpu.setShardLimits({shard0:60,shard1:4,shard2:4,shard3:22});
	//Game.cpu.setShardLimits({shard0:2,shard1:74,shard2:2,shard3:2});
	/*

	if(Game.shard.name != 'shard0' && Game.shard.name != 'shard3') {
		if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
		console.log( '📙⏳', Math.trunc(Game.time/10000), Game.time%10000, Game.shard.name
								, '📟 CPU:'
								, JSON.stringify({ '🛐':Game.cpu.limit * constants.TICKS_TO_CHECK_CPU
																 , "🛒":Game.cpu.bucket
																 , "🧀": Game.cpu.bucket - Memory.cpu_prev_bucket})
								);
			// const err = Game.cpu.setShardLimits({shard0:50,shard1:5,shard2:5,shard3:20});
			// console.log( '📙⏳', Math.trunc(Game.time/10000), Game.time%10000, Game.shard.name
			//  						, '📟 setShardLimits err:'
			//  						, err
			//  						);
		}

		config.run();
		//flags.run();

		for(var name in Game.creeps) {
			var creep = Game.creeps[name];
			if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
				console.log( '📙', Math.trunc(Game.time/10000), Game.time%10000, Game.shard.name
											 	, JSON.stringify({name:name})
										 );
			}
			if(!creep.spawning) {
				creep.memory.rerun = 0;
				role.run(creep);
			}
		}

		return;
	}*/

	if(!conditions.TO_SPAWN_MAIN_ROOMS() && Game.time % 2)
		return;

	var t = 0;
	// for(var i=0; i < 1000; i++)
	// 	Game.cpu.getUsed();
	// perf.run();
	// if(!Memory.cpu_main_part)
	// 	Memory.cpu_main_part = {perf:0, clearing:0, metrix:0, config:0, flags:0, links:0, towers:0, spawns:0, metrix2:0, others:0};
	if(!Memory.cpu_main_part)
		Memory.cpu_main_part = {};

	Memory.cpu_main_part.perf = Math.round((Memory.cpu_main_part.perf + Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();

	if(Game.time % constants.TICKS_TO_CHECK_NON_EXISTING == 0) {
		// console.log( '⏳', Game.cpu.getUsed() + '/' + Game.cpu.tickLimit);
		for(var name in Memory.creeps) {
			var creep = Game.creeps[name];
			if(!creep) {
				const weight = tools.getWeight(name);
				if(!!Memory.CreepsIdleTicksByWeight) {
					const	total_sum_pst = Object.keys(Memory.CreepsIdleTicksByWeight).reduce((p,w) => p +
																Object.keys(Memory.CreepsIdleTicksByWeight[w]).reduce((pp,c) => pp +
																					(!Memory.CreepsIdleTicksByWeight[w][c].pc?1:Memory.CreepsIdleTicksByWeight[w][c].pc),0),0);
					const	total_cnt_pst = Object.keys(Memory.CreepsIdleTicksByWeight).reduce((p,w) => p +
																Object.keys(Memory.CreepsIdleTicksByWeight[w]).reduce((pp,c) => pp +
																					!!Memory.CreepsIdleTicksByWeight[w][c].w,0),0);
					const	total_avg_pst = Math.round(total_sum_pst/total_cnt_pst);
					const sum_pst = (!Memory.CreepsIdleTicksByWeight[weight])?1:
																Object.keys(Memory.CreepsIdleTicksByWeight[weight]).reduce((p,c) => p +
																	(!Memory.CreepsIdleTicksByWeight[weight][c].pc?1:Memory.CreepsIdleTicksByWeight[weight][c].pc),0);

					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, 'Clearing non-existing creep memory:'
											, name, weight//, 'cpu:', JSON.stringify(creep.memory.cpu)
											, 'sum idle pst:', sum_pst, JSON.stringify(Memory.CreepsIdleTicksByWeight[weight])
											, 'total_sum_pst:', total_sum_pst
											, 'total_cnt_pst:', total_cnt_pst
											, 'total_avg_pst:', total_avg_pst
											, JSON.stringify(Memory.CreepsIdleTicksByWeight));
				}
				else {
					Memory.CreepsIdleTicksByWeight = {};
				}
				Memory.CreepsIdleTicksByWeight[weight] = {};
				delete Memory.creeps[name];
			}
			else if(0 < creep.ticksToLive && creep.ticksToLive <= constants.TICKS_TO_CHECK_NON_EXISTING) {
				const sum_role_cpu = !creep.memory.cpu? -1:Math.round(Object.keys(creep.memory.cpu).reduce((sum,role) => sum + creep.memory.cpu[role],0));
				const max_role_cpu = !creep.memory.cpu? -1:Math.round(Object.keys(creep.memory.cpu).reduce((a,role) =>
																																	!creep.memory.cpu[a.max_role] || creep.memory.cpu[a.max_role] < creep.memory.cpu[role]?
																																  {max_role:role, v:creep.memory.cpu[role]}:
																																	{max_role:a.max_role, v:a.v},
																																	{max_role:'', v:0}));
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, 'ticksToLive:', creep.ticksToLive
										, name
										, 'idle:', creep.memory.idle, JSON.stringify(Memory.CreepsIdleTicksByWeight[tools.getWeight(creep.name)][creep.memory.n])
										, 'cpu:', sum_role_cpu, JSON.stringify(max_role_cpu), JSON.stringify(creep.memory.cpu)
									 );
			}
		}
	}

	Memory.cpu_main_part.clearing = Math.round((Memory.cpu_main_part.clearing+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();

	metrix.run();					Memory.cpu_main_part.metrix = Math.round((Memory.cpu_main_part.metrix+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	config.run();					Memory.cpu_main_part.config = Math.round((Memory.cpu_main_part.config+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	flags.run();					Memory.cpu_main_part.flags = Math.round((Memory.cpu_main_part.flags+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	event_processor.run();Memory.cpu_main_part.event_processor = Math.round((Memory.cpu_main_part.event_processor+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	links.run();					Memory.cpu_main_part.links = Math.round((Memory.cpu_main_part.links+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	towers.run();					Memory.cpu_main_part.towers = Math.round((Memory.cpu_main_part.towers+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	spawns.run();					Memory.cpu_main_part.spawns = Math.round((Memory.cpu_main_part.spawns+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	terminals.run();			Memory.cpu_main_part.terminals = Math.round((Memory.cpu_main_part.terminals+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	labs.run();						Memory.cpu_main_part.labs = Math.round((Memory.cpu_main_part.labs+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	factory.run();				Memory.cpu_main_part.factory = Math.round((Memory.cpu_main_part.factory+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	metrix.output();			Memory.cpu_main_part.metrix2 = Math.round((Memory.cpu_main_part.metrix2+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	
	delete Memory.cpu;
	Memory.cpu = { creep: {max_dt: 0, creep: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100, n:1}
							 , role : {max_dt: 0, creep: '', role: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100}
							 , step : {max_dt: 0, creep: '', role: '', step: '', dt: 0, t: Math.round((Game.cpu.getUsed()) * 100)/100}
							 , max	: {sum:0}
						   };
	var main_part_dt = Math.round((Game.cpu.getUsed()) * 100)/100;
	Memory.cpu_main_part_dt += main_part_dt;

	Memory.cpu_main_part.others = Math.round((Memory.cpu_main_part.others+Game.cpu.getUsed()-t)*100)/100; t = Game.cpu.getUsed();
	if(Game.time % constants.TICKS_TO_CHECK_CPU_MAIN_PART == 0 && Memory.cpu_main_part_dt > constants.TICKS_TO_CHECK_CPU_MAIN_PART) {
		console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
							 , '⚙️ PART CPU:'
							 , JSON.stringify(Memory.cpu_main_part)
						   // , (dt = Math.round((Game.cpu.getUsed()-dt)*100)/100)
						   // , dt
						 );
		delete Memory.cpu_main_part;
		Memory.cpu_main_part = {perf:0, clearing:0, metrix:0, config:0, flags:0, event_processor:0, links:0, towers:0, spawns:0, terminals:0, labs:0, factory:0, metrix2:0, others:0};
	}

	const creeps = Object.keys(Game.creeps).sort((l,r) => tools.getWeight(l) - tools.getWeight(r));

	creeps.forEach(function(name,i) {
		var creep = Game.creeps[name];
		if(!!creep && !creep.spawning) {
			var needToRun = true;
			const livedTicks = (creep.getActiveBodyparts(CLAIM) > 0 ? 600:1500)-creep.ticksToLive;
			if(livedTicks <= 1) {
				console.log( '🎬', Math.trunc(Game.time/10000), Game.time%10000
							 , JSON.stringify( { trigger:'onBirth', creep:creep.name
																 , livedTicks:livedTicks, ticksToLive:creep.ticksToLive, detail:creep}));
				needToRun = !tasks.onBirth(creep);
			}
			else {
				needToRun = !tasks.onRun(creep);
			}
			if(needToRun) {
				creep.memory.rerun = 0;
				if(Memory.cpu.creep.t < 0.5*Game.cpu.tickLimit || tools.getWeight(creep.name) < 70)
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
	});

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
					if(!Memory.cpu.max[role_name][tools.getWeight(creep.name)])
						Memory.cpu.max[role_name][tools.getWeight(creep.name)] = 0;
					Memory.cpu.max.sum += Math.round(creep.memory.cpu[role_name]*100)/100;
					Memory.cpu.max[role_name].sum += Math.round(creep.memory.cpu[role_name]*100)/100;
					Memory.cpu.max[role_name][tools.getWeight(creep.name)] += Math.round(creep.memory.cpu[role_name]*100)/100 ;
					if(Memory.cpu.max[role_name].max_weight_sum < Memory.cpu.max[role_name][tools.getWeight(creep.name)]) {
						Memory.cpu.max[role_name].max_weight_sum = Memory.cpu.max[role_name][tools.getWeight(creep.name)];
						Memory.cpu.max[role_name].max_weight = tools.getWeight(creep.name);
					}
				}
			}
		}
		var max_role = Object.keys(Memory.cpu.max).reduce((p,c) =>
		 																		 Memory.cpu.max[p].sum > Memory.cpu.max[c].sum ? p:c);
		var max_role_by_weight = Object.keys(Memory.cpu.max).reduce((p,c) =>
		 																		 Memory.cpu.max[p].max_weight_sum > Memory.cpu.max[c].max_weight_sum ? p:c);

		console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
								, '📟 CPU:'
								, JSON.stringify({ dt:Math.round(Memory.cpu_dt*100)/100
																	, '⚙️': Math.round(Memory.cpu_main_part_dt*100)/100
																	, "🤖": Math.round(Memory.cpu_creeps_part_dt*100)/100})
								, JSON.stringify({ '🛐':Game.cpu.limit * constants.TICKS_TO_CHECK_CPU
																	, "🛒":Game.cpu.bucket
																	, "🧀": Game.cpu.bucket - Memory.cpu_prev_bucket})
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
