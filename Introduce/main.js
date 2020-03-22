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
var role = require('role.claimer');

module.exports.loop = function () {
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
									, name, weight, 'sum_pst:', sum_pst, JSON.stringify(Memory.CreepsIdleTicksByWeight[weight])
									, 'total_sum_pst:', total_sum_pst
									, 'total_cnt_pst:', total_cnt_pst
									, 'total_avg_pst:', total_avg_pst
									, JSON.stringify(Memory.CreepsIdleTicksByWeight));
			Memory.CreepsIdleTicksByWeight[weight] = {};
			delete Memory.creeps[name];
		}
	}

	metrix.run();
	config.run();
	flags.run()
	links.run();
	towers.run();
	spawns.run();
	metrix.output();

	Memory.targets = {};
	Memory.cpu = {};
	Memory.cpu = { creep: {dt: 0, creep: '', t: Math.round((Game.cpu.getUsed()) * 100)/100, n:1}
							 , role : {dt: 0, creep: '', role: '', t: Math.round((Game.cpu.getUsed()) * 100)/100}
							 , step : {dt: 0, creep: '', role: '', step: '', t: Math.round((Game.cpu.getUsed()) * 100)/100}
						   };

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
		if(!creep.spawning) {
			creep.memory.rerun = 0;
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
	if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
		console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
								, 'CPU:'
								, JSON.stringify({bucket:Game.cpu.bucket, delta: Game.cpu.bucket - Memory.cpu_prev_bucket})
								, JSON.stringify({max:{weight:0, role: '', sum_dt: 0}})
								, JSON.stringify(Memory.cpu));
		Memory.cpu_prev_bucket = Game.cpu.bucket;
	}
}
