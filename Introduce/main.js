//import {checkFlags} from 'main.flags.js';
//import {checkMainCommit} from 'main.flags.js';
const constants = require('main.constants');
const links = require('main.links');
const towers = require('main.towers');
const metrix = require('main.metrix');
const spawns = require('main.spawns');
const flags = require('main.flags');
const log = require('main.log');
var role = require('role.claimer');

module.exports.loop = function () {

	for(var name in Memory.creeps) {
		var creep = Game.creeps[name];
		if(!creep) {
			if(Memory.creeps[name].type) {
				const full_type = '' + Memory.creeps[name].type + '/' + Memory.creeps[name].weight;
				Memory.CreepsNumberByType[full_type]--;
			}
			delete Memory.creeps[name];
			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'Clearing non-existing creep memory:'
									, name);
		}
	}

	links.run();
	towers.run();
	metrix.run();
	spawns.run();
	
	Memory.targets = {};

	for(var name in Game.creeps) {
		var creep = Game.creeps[name];
// 		console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000, 'go', creep);
		if(creep.memory.role == 'creep') {
			creep.memory.rerun = 0;
			role.run(creep);
		}
	}
// 	console.log('targets:',	JSON.stringify(Memory.targets));
}
