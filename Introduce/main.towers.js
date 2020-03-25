const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var towers = {

   run: function() {
		 // var towers = [];
		 //
		 // towers.push(Game.getObjectById('5e45eb20d4e9fbbbbb4bee7d'));
		 // towers.push(Game.getObjectById('5e4dfed162e84714acb66b58'));
		 // towers.push(Game.getObjectById('5e548bd68e41f2b534bffe4b'));
		 // towers.push(Game.getObjectById('5e5abedb9083d52a982adcf6'));
		 // towers.push(Game.getObjectById('5e6cb0041a23303a5ce6fc0a'));
		 // towers.push(Game.getObjectById('5e70ed814bb541278a0b0039'))

		 var target;

		 cash.getAllMyTowers().forEach(function(tower,i) {
			 target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
					 filter: (hostile) => {
						 return hostile.pos.x%48 > 1 || hostile.pos.y%48 > 1;
					 }
				 });
			 if(!!target) {
				 tower.attack(target);
			 }

			 if(!target) {
				 target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
					 filter: (mycreep) => {
						 return mycreep.hitsMax - mycreep.hits > 0;
					 }
				 });

				 if(target) {
					 tower.heal(target);
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

 				 if(target) {
 					 tower.repair(target);
 				 }
 			 }

		 });
	 }
};

module.exports = towers;
