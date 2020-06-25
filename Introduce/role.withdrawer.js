var roleNext = require('role.upgrader');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
const tools = require('tools');

var roleWithdrawer = {

	/** @param {Creep} creep **/
	run: function(creep,executer = undefined) {
		if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
			return roleNext.run(creep);
		}

		if(creep.memory.withdrawing && creep.store.getFreeCapacity() == 0) {
			creep.memory.withdrawing = false;
		}

		const this_room = creep.room.name;
		const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

		if(!creep.memory.withdrawing &&
			 this_room == my_room &&
			 creep.getActiveBodyparts(CARRY) > 0 &&
			 (creep.store.getUsedCapacity() == 0 ||
				(creep.store.getFreeCapacity() > 0 && creep.memory.rerun))) {
			creep.memory.withdrawing = true;
		}

		if(creep.memory.withdrawing) {

			const DP = flags.flags.DP;
			const DP1 = flags.flags.DP1;
			const DP2 = flags.flags.DP2;
			const NW1 = flags.flags.NW1;

			var target;

			if(!target) {
				var tombstones = creep.room.find(FIND_TOMBSTONES,  {
					filter: (tombstone) => {
						return !!tombstone.store &&
						 				Object.keys(tombstone.store).length > 0 &&
							Object.keys(tombstone.store).reduce((p,c) => p + tombstone.store[c], 0) > creep.pos.getRangeTo(tombstone) &&
							 		 (	!tombstone.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0 ||
										 	(!!DP && DP.pos.roomName == creep.room.name) ||
										 	(!!DP1 && DP1.pos.roomName == creep.room.name && DP1.pos.findPathTo(tombstone).length < 5) ||
										 	(!!DP2 && DP2.pos.roomName == creep.room.name && DP2.pos.findPathTo(tombstone).length < 5)
										) && !(!!NW1 && NW1.pos.roomName == my_room && NW1.pos.getRangeTo(tombstone) < 11-NW1.color) &&
										tools.checkTarget(executer,tombstone.id);
						}
				});
				if(tombstones.length > 0) {
					var tombstone = tombstones.reduce((p,c) => tools.checkTarget(executer,p.id) &&
																						creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					if(!!tombstone && tools.checkTarget(executer,tombstone.id)) {
						target = tools.setTarget(creep,tombstone,tombstone.id,roleWithdrawer.run);
					}
				}
			}
			// console.log(JSON.stringify(Game.getObjectById('5ebd31ddf41ec2834085a90b').store));

			if(!target) {
				var ruins = creep.room.find(FIND_RUINS, {filter: (ruin) => !!ruin.store &&
					 Object.keys(ruin.store).length > 0 &&
					 tools.checkTarget(executer,ruin.id)});
				if(ruins.length > 0) {
					var ruin = ruins.reduce((p,c) => tools.checkTarget(executer,p.id) &&
																						creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					if(!!ruin && tools.checkTarget(executer,ruin.id)) {
						target = tools.setTarget(creep,ruin,ruin.id,roleWithdrawer.run);
					}
				}
			}

			if(target) {

				var err = OK;

				if(!!target.store) {
					const resources = Object.keys(target.store).sort((l,r) => l.length - r.length);
					resources.forEach(function(resource,i) {
						if(err == OK)
							err = creep.withdraw(target, resource);
						// if(err != OK)
						// 	console.log(creep, 'withdrawing ', resource, ' err:', err);
					});
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💼');
					err = tools.moveTo(creep,target);

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
			return roleNext.run(creep);
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
