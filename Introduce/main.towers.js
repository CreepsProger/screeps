const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');
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

		const D = flags.flags.D;
		const D1 = flags.flags.D1;
		const D2 = flags.flags.D2;
		const NR1 = flags.flags.NR1;
		const NR2 = flags.flags.NR2;

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

		const allMyTowers = cash.getAllMyTowers();
		towers.count = allMyTowers.length;

		allMyTowers.forEach(function(tower,i) {

			var target;

			if(!!towers.sleep[i] && towers.sleep[i] > 0 && Game.time % towers.sleep[i]) {
				towers.work_sleep.sleep++;
				return;
			}

			towers.work_sleep.work++;

			if(!tower.pos)
				return;

			const NAT = flags.flags.NAT && flags.flags.NAT.pos.roomName == tower.pos.roomName;
			const R = flags.flags.R;
			const NR = flags.flags.NR;
			const NR1 = flags.flags.NR1;
			const NR2 = flags.flags.NR2;
			const D = flags.flags.D;
			const D1 = flags.flags.D1;
			const D2 = flags.flags.D2;
			const mw = config.getMW(tower.pos.roomName);
			const mr = config.getMR(tower.pos.roomName);

			if(!NAT) {
				target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
						 filter: (hostile) => {
							 return hostile.pos.x%48 > 1 || hostile.pos.y%48 > 1;
						 }
					 });
				if(!!target && OK == tower.attack(target)) {
					delete towers.sleep[i];
				}
				else target = null;
			}

			if(!target) {
			 	target = tower.pos.findClosestByRange(FIND_MY_CREEPS, {
				 	filter: (mycreep) => {
					 	return mycreep.hitsMax - mycreep.hits > 0;
				 	}
			 	});

			 	if(!!target && OK == tower.heal(target)) {
				 	delete towers.sleep[i];
			 	}
				else target = null;
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

			 	if(!!target && OK == tower.heal(target)) {
				 	target.memory.healer = tower.id;
				 	target.memory.heal_time = Game.time;
				 	delete towers.sleep[i];
			 	}
				else target = null;
			}

		 	if(!target && (!NR || R)) {
				// const rps = tower.pos.findInRange(FIND_STRUCTURES, 50, {
				const rps = cash.getMyBuildings(tower.room).filter((structure) => {
						if(!structure || !structure.structureType)
							return false;

						const r = (!!R &&
							 				structure.pos.roomName == R.pos.roomName &&
							 				structure.pos.x == R.pos.x &&
											structure.pos.y == R.pos.y)?(11-R.color)*(11-R.secondaryColor):1;
						var repair = false;
						if(!repair && structure.structureType == STRUCTURE_WALL && r) {
 							repair = structure.hits < constants.STRUCTURE_WALL_HITS*mw*r;// 8000 E = 10 * 8000 / 800 = 100
 						}
 						if(!repair && structure.structureType == STRUCTURE_RAMPART && r) {
 							repair = structure.hits < constants.STRUCTURE_RAMPART_HITS*mr*r;// 8000 E = 10 * 8000 / 800 = 100
 						}
						if(structure.structureType != STRUCTURE_WALL &&
							 structure.structureType != STRUCTURE_RAMPART &&
							 (structure.hitsMax - structure.hits > structure.hitsMax/
								 (2+98*(!!towers.prev_target[i] && structure.id == towers.prev_target[i])))) {
							repair = true;
						}
						if(!repair)
						 	return false;
						if(	!!D1 && D1.pos.roomName == structure.pos.roomName &&
							   D1.pos.getRangeTo(structure) <= 10-D1.color) {
							return false;
						}
						if(	!!D2 && D2.pos.roomName == structure.pos.roomName &&
								D2.pos.getRangeTo(structure) <= 10-D2.color) {
							return false;
						}
						if(	!!NR1 && NR1.pos.roomName == structure.pos.roomName &&
								NR1.pos.getRangeTo(structure) <= 10-NR1.color) {
							return false;
						}
						if(	!!NR2 && NR2.pos.roomName == structure.pos.roomName &&
								NR2.pos.getRangeTo(structure) <= 10-NR2.color) {
							return false;
						}
						return  true;
					});
				if(rps.length > 0) {
					target = rps.reduce((p,c) => tower.pos.getRangeTo(p) * (p.hits + 1) // dp*ec < dc*ep !! it is right! don't change
																				< tower.pos.getRangeTo(c) * (c.hits + 1)
																				? p:c);
					if(target && (Game.time % constants.TICKS_TO_CHECK_CPU == 0)) {
						console.log( '🗼', Math.trunc(Game.time/10000), Game.time%10000
		 												, JSON.stringify({mw:mw, mr:mr, R:R, target:target})
		 										);
					}
				}

 				if(!!target && OK == tower.repair(target)) {
					towers.prev_target[i] = target.id;
					delete towers.sleep[i];
 				}
				else target = null;
 			}

			if(!target && (!towers.sleep[i] || towers.sleep[i] < constants.TICKS_MAX_TOWERS_SLEEPING )) {
				if(!towers.sleep[i])
					towers.sleep[i] = 0;
				 	towers.sleep[i]++;
				 	delete towers.prev_target[i];
			 	}
		 	}
		);
	}
};

module.exports = towers;
