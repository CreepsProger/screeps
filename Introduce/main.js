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
	spawns.run();
	metrix.output();

	Memory.targets = {};
	Memory.cpu = {};
	Memory.cpu = { creep: {t: Game.cpu.getUsed(), dt: 0, creep: '',                     time: metrix.cpu.creep_time}
							 , role : {t: Game.cpu.getUsed(), dt: 0, creep: '', role: '',           time: metrix.cpu.role_time }
							 , step : {t: Game.cpu.getUsed(), dt: 0, creep: '', role: '', step: '', time: metrix.cpu.step_time }
						   };

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
// 		console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000, 'go', creep);
		if(!creep.spawning) {
			creep.memory.rerun = 0;
			role.run(creep);
			Memory.cpu.creep.time(creep);
		}
	}
// 	console.log('targets:',	JSON.stringify(Memory.targets));
}
