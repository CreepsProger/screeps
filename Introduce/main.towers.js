const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var towers = {
	
	count: 99999,
	sleep: {},
	work_sleep: {work:0, sleep:0},
	prev_target: {}, 
	
	run: function() {

		if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
			console.log( '🗼', Math.trunc(Game.time/10000), Game.time%10000
									, 'Towers('+towers.count+')', JSON.stringify(towers.work_sleep)
									, JSON.stringify(towers.sleep), Object.keys(towers.sleep).length
									, 'prev targets:', JSON.stringify(towers.prev_target) 
									);
		}

		if(Object.keys(towers.sleep).length == towers.count && Game.time % 5) {
				 towers.work_sleep.sleep += towers.count;
				 return;
		}
		
		var target;
		
		const allMyTowers = cash.getAllMyTowers();
		towers.count = allMyTowers.length;

		allMyTowers.forEach(function(tower,i) {
			if(!!towers.sleep[i] && towers.sleep[i] > 0 && Game.time % towers.sleep[i]) {
				towers.work_sleep.sleep++;
				return;
			}
			
			towers.work_sleep.work++;
			 
			target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
					 filter: (hostile) => {
						 return hostile.pos.x%48 > 1 || hostile.pos.y%48 > 1;
					 }
				 });
			 if(!!target) {
				 tower.attack(target);
				 delete towers.sleep[i];
			 }

			 if(!target) {
				 target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
					 filter: (mycreep) => {
						 return mycreep.hitsMax - mycreep.hits > 0;
					 }
				 });

				 if(target) {
					 tower.heal(target);
					 delete towers.sleep[i];
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
					 delete towers.sleep[i];
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
 						 return structure.hitsMax - structure.hits > structure.hitsMax/
							 (2+98*(!!towers.prev_target[i] && structure.id == towers.prev_target[i])) ;
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

 				 if(target && OK == tower.repair(target)) {
					 towers.prev_target[i] = target.id;
					 delete towers.sleep[i];
 				 }
 			 }

			 if(!target && (!towers.sleep[i] || towers.sleep[i] < 5)) {
				 if(!towers.sleep[i])
					 towers.sleep[i] = 0;
				 towers.sleep[i]++;
				 delete towers.prev_target[i];
			 }
		 });
	 }
};

module.exports = towers;
