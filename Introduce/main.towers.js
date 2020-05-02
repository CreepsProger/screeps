const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var towers = {

	count: 99999,
	sleep: {},
	work_sleep: {work:0, sleep:0},
	prev_target: {},

	checkTargetToRepaire: function(id) {
		return towers.targetsToRepaire[id] === undefined;
	},
	targetsToRepaire: {time:0},
	setTargetToRepaire: function(my_id,target_id) {
		var t = Game.cpu.getUsed();
		if(towers.targetsToRepaire.time != Game.time) {
			towers.targetsToRepaire = {time:Game.time};
		}

		var mytarget;if(!target && !id) {
			return mytarget;
		}

		var creep2;
		var rerun_creep2 = false;
		if(!tools.targets[id]) {
			tools.targets[id] = creep.id;
			mytarget = target;
			return mytarget;
		}
		else {
			creep2 = Game.getObjectById(tools.targets[id]);
			if(creep2 !== undefined) {
				var range2 = creep2.pos.getRangeTo(target);
				var range = creep.pos.getRangeTo(target);
        if(range2 > range+6) {
					const order = 'move'; // creep2.moveTo.name
					const err = creep2.cancelOrder(order);
					if(err == OK) {
						rerun_creep2 = true;
						mytarget = target;
						tools.targets[id] = creep.id;
						run(creep2,creep);
					}
					else {
						console.log( creep, 'range:', range
												, creep2, 'range2:', range2
												, 'cancelOrder:', order, 'err:', err
												, 'for', id, JSON.stringify(target));
					}
				}
			}
		}
	},

	getStructureToRepaire: function(pos, prev_target, executer, role_rerun_fn) {
		var target;

		const NR1 = Game.flags['NR1'];// don't repair
		const NR2 = Game.flags['NR2'];// don't repair
		const D1 = Game.flags['D1'];// dismanle
		const D2 = Game.flags['D2'];// dismanle

		var structures = cash.getStructuresToRepaire(room).filter((s) => {
			if(!!s && s.hitsMax - s.hits > s.hitsMax/(2+98*(!!prev_target && s.id == prev_target))) {
				if(!!D1 && D1.pos.roomName == pos.roomName &&
					 D1.pos.getRangeTo(s) <= 10-D1.color) {
					return false;
				}
				if(!!D2 && D2.pos.roomName == pos.roomName &&
					 D2.pos.getRangeTo(s) <= 10-D2.color) {
					return false;
				}
				if(!!NR1 && NR1.pos.roomName == pos.roomName &&
					 NR1.pos.getRangeTo(s) <= 10-NR1.color) {
					return false;
				}
				if(!!NR2 && NR2.pos.roomName == pos.roomName &&
					 NR2.pos.getRangeTo(s) <= 10-NR2.color) {
					return false;
				}
				return true;
			}
			return false;
		});
		if(structures.length > 0) {
			if(!role_rerun_fn) {
				target = structures.reduce((p,c) => pos.getRangeTo(p) < pos.getRangeTo(c)? p:c);
			}
			else {
				var structure = structures.reduce((p,c) => tools.checkTarget(executer,p.id) &&
																					pos.getRangeTo(p) < pos.getRangeTo(c)? p:c);
				if(!!structure && tools.checkTarget(executer,structure.id)) {
					target = tools.setTarget(creep,structure,structure.id,role_rerun_fn);
				}
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

			if(!tower.pos)
				return;

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
 							 return structure.hits < 1600000;// 8000 E = 10 * 8000 / 800 = 100
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
