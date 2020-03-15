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
			delete Memory.creeps[name];
			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'Clearing non-existing creep memory:'
									, name);
		}
	}

	metrix.run();
	config.run();
	flags.run()
	links.run();
	towers.run();
	const ready_count = spawns.run();
	spawns.run(ready_count);
	metrix.output();

	Memory.targets = {};
	Memory.cpu = {};
	Memory.cpu = { creep: {dt: 0, creep: '', t: Game.cpu.getUsed(), n:1}
							 , role : {dt: 0, creep: '', role: '', t: Game.cpu.getUsed()}
							 , step : {dt: 0, creep: '', role: '', step: '', t: Game.cpu.getUsed()}
						   };

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
// 		console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000, 'go', creep);
		if(!creep.spawning) {
			creep.memory.rerun = 0;
			role.run(creep);
			metrix.cpu.creep_time(creep);
			if(Memory.cpu.creep.t > 40) {
				console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify(Memory.cpu));
		}
	}
// 	console.log('targets:',	JSON.stringify(Memory.targets));
}
