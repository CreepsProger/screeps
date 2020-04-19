const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var towers = {
	
	count: 99999,
	sleep: {},
	work_sleep: {work:0, sleep:0},
	prev_target: {},
	
	getStructureToRepaire: function(room) {
		const NR1 = Game.flags['NR1'];// don't repair
		const NR2 = Game.flags['NR2'];// don't repair
		const D1 = Game.flags['D1'];// dismanle
		const D2 = Game.flags['D2'];// dismanle
		
		var structures = cash.getStructuresToRepaire(room).filter((s) => {
			var target;
			if(!!s && s.hitsMax - s.hits > s.hitsMax/(2+98*(!!creep.memory.target && s.id == creep.memory.target.id))) {
				if(!!D1 && D1.pos.roomName == room.roomName &&
					 D1.pos.getRangeTo(s) < 11-D1.color) {
					return false;
				}
				if(!!D2 && D2.pos.roomName == room.roomName &&
					 D2.pos.getRangeTo(s) < 11-D2.color) {
					return false;
				}
				if(!!NR1 && NR1.pos.roomName == room.roomName &&
					 NR1.pos.getRangeTo(s) < 11-NR1.color) {
					return false;
				}
				if(!!NR2 && NR2.pos.roomName == room.roomName &&
					 NR2.pos.getRangeTo(s) < 11-NR2.color) {
					return false;
				}
				return true;
			}
			return false;
		});
		if(structures.length > 0) {
			var structure = structures.reduce((p,c) => tools.checkTarget(executer,p.id) &&
																				creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
			if(!!structure && tools.checkTarget(executer,structure.id)) {
				target = tools.setTarget(creep,structure,structure.id,roleRepairer.run);
			}
		}
		return target;
	},

	run: function() {

		if(Game.time % constants.TICKS_TO_CHECK_CPU == 0) {
			console.log( '🗼', Math.trunc(Game.time/10000), Game.time%10000
									, 'Towers('+towers.count+')', JSON.stringify(towers.work_sleep)
									, Object.keys(towers.sleep).length, JSON.stringify(towers.sleep)
									, 'prev targets:', JSON.stringify(towers.prev_target) 
									);
		}

		if(Object.keys(towers.sleep).length == towers.count && Game.time % constants.TICKS_MAX_TOWERS_SLEEPING) {
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

			 if(!target && (!towers.sleep[i] || towers.sleep[i] < constants.TICKS_MAX_TOWERS_SLEEPING )) {
				 if(!towers.sleep[i])
					 towers.sleep[i] = 0;
				 towers.sleep[i]++;
				 delete towers.prev_target[i];
			 }
		 });
	 }
};

module.exports = towers;
