const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var towers = {

	sleep: 0,

   run: function() {

		 if(sleep > 0 && Game.ticks % sleep == 0)
			 return;

		 var target;

		 cash.getAllMyTowers().forEach(function(tower,i) {
			 target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
					 filter: (hostile) => {
						 return hostile.pos.x%48 > 1 || hostile.pos.y%48 > 1;
					 }
				 });
			 if(!!target) {
				 tower.attack(target);
				 sleep = 0;
			 }

			 if(!target) {
				 target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
					 filter: (mycreep) => {
						 return mycreep.hitsMax - mycreep.hits > 0;
					 }
				 });

				 if(target) {
					 tower.heal(target);
					 sleep = 0;
				 }
			 }

			 if(!target) {
				 const targets = tower.pos.findInRange(FIND_MY_CREEPS, 5, {
					 filter: (mycreep) => {
						 return (mycreep.hitsMax - mycreep.hits > 0 &&
										 mycreep.memory.heal_time != Game.time);
					 }
				 });

				 if(targets.length > 0) {
					 target = targets[0];
				 }

				 if(target) {
					 tower.heal(target);
					 target.memory.healer = tower.id;
					 target.memory.heal_time = Game.time;
					 sleep = 0;
				 }
			 }

 			 if(!target) {
 				 target = tower.pos.findClosestByRange(FIND_STRUCTURES, {
 					 filter: (structure) => {
 						 if(structure.structureType == STRUCTURE_WALL) {
 							 return structure.hits < 32000;// 8000 E = 10 * 8000 / 800 = 100
 						 }
 						 if(structure.structureType == STRUCTURE_RAMPART) {
 							 return structure.hits < 160000;// 8000 E = 10 * 8000 / 800 = 100
 						 }
 						 return structure.hitsMax - structure.hits > 2400; //towers.length*800;
 					 }
 				 });

				// var structures = cash.getStructures(tower.room).filter((structure) => {
				// 	 if(structure.structureType == STRUCTURE_WALL) {
				// 		 return structure.hits < 32000;// 8000 E = 10 * 8000 / 800 = 100
				// 	 }
				// 	 if(structure.structureType == STRUCTURE_RAMPART) {
				// 		 return structure.hits < 160000;// 8000 E = 10 * 8000 / 800 = 100
				// 	 }
				// 	 return structure.hitsMax - structure.hits > 2400; //towers.length*800;
				// });
				//
				// if(structures.length > 0) {
 				// 	target = structures.reduce((p,c) => tower.pos.getRangeTo(p) < tower.pos.getRangeTo(c)? p:c);
 				// }

 				 if(target) {
 					 tower.repair(target);
					 sleep = 0;
 				 }
 			 }

			 if(!target && sleep <= 5) {
				 sleep++;
			 }
		 });
	 }
};

module.exports = towers;
