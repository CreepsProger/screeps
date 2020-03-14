var roleNext = require('role.pickuper');
const tools = require('tools');
const metrix = require('main.metrix');

var roleWithdrawer = {
	/** @param {Creep} creep **/
	run: function(creep,executer = undefined) {

		if(creep.memory.withdrawing && creep.store.getFreeCapacity() == 0) {
			creep.memory.withdrawing = false;
		}

		if(!creep.memory.withdrawing &&
			 creep.getActiveBodyparts(CARRY) > 0 &&
			 (creep.store.getUsedCapacity() == 0 ||
				(creep.store.getFreeCapacity() > 0 && creep.memory.rerun))) {
			creep.memory.withdrawing = true;
		}

		if(creep.memory.withdrawing) {
			var target;

			if(!target) {
				var tombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES,  {
					filter: (structure) => {
						return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
							tools.checkTarget(executer,structure.creep.id);
					}
				});
				if(!!tombstone) {
					target = tools.setTarget(creep,tombstone,tombstone.creep.id,roleWithdrawer.run);
				}
			}

			if(!target) {
				var ruin = creep.pos.findClosestByPath(FIND_RUINS,  {
					filter: (structure) => {
						return structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
							tools.checkTarget(executer,structure.id);
					}
				});
				if(!!ruin) {
					target = tools.setTarget(creep,ruin,ruin.id,roleWithdrawer.run);
				}
			}

			if(target) {
				var err = creep.withdraw(target, RESOURCE_ENERGY);

				if(err == ERR_NOT_ENOUGH_RESOURCES) {
					//
					const found = target.pos.lookFor(LOOK_RESOURCES);
					if(found.lenght > 0)
					{
						console.log('look resources:', JSON.stringify(found));
					}
					err = creep.withdraw(target, RESOURCE_GHODIUM_OXIDE);
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💼');
					creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});

					var id;
					if(!!target.id) {
						id = target.id;
					}
					if(!id && !!target.creep.id) {
						id = target.creep.id;
					}
// 					console.log( '🔜💼', Math.trunc(Game.time/10000), Game.time%10000
// 											, creep.name
// 											, 'moving for withdrawing tombstone:'
// 											, target.name?target.name:target.structureType, 'target id:', id, 'Memory.targets[id]:', Memory.targets[id]);
				}
				else if(!err) {
					creep.say('💼');
// 					console.log( '💼', Math.trunc(Game.time/10000), Game.time%10000
// 											, creep.name
// 											, 'withdrawing:'
// 											, target.name?target.name:target.structureType);
				}
				else {
					creep.memory.withdrawing = false;
					console.log( '💼⚠️', Math.trunc(Game.time/10000), Game.time%10000
											, creep.name
											, 'withdrawing :'
											, target.name?target.name:target.structureType
											, 'with err:'
											, err);
				}
			}
			else {
				creep.memory.withdrawing = false;
			}
		}

		metrix.cpu.role_time(creep, 'withdrawing');
		if(!creep.memory.withdrawing) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleWithdrawer;






//             if(!target) {
//                 target = room.find(FIND_TOMBSTONES).forEach(tombstone => {
//                     if(tombstone.creep.my) {
//                         console.log(`My creep died with ID=${tombstone.creep.id} ` +
//                         `and role=${Memory.creeps[tombstone.creep.name].role}`);
//                         var creep = tombstone.pos.findClosestByPath(FIND_MY_CREEPS, {
//                           filter: (creep) => {
//                           return (creep.structureType == STRUCTURE_TOWER) &&
//                             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
//                           }
//                         }
//                     }
//                 });
//             }
//             if(!target) {
//                 target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
//                     filter: (structure) => {
//                         return (structure.structureType == STRUCTURE_TOWER) &&
//                             structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
//                     }
//                 });
//             }
