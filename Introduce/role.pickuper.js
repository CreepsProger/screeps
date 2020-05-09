const roleNext = require('role.withdrawer');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
const tools = require('tools');


var rolePickuper = {

    /** @param {Creep} creep **/
    run: function(creep,executer = undefined) {
			if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
				return roleNext.run(creep);
			}

			if(creep.memory.pickuping && creep.store.getFreeCapacity() == 0) {
				creep.memory.pickuping = false;
			}

			const this_room = creep.room.name;
			const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

			if(!creep.memory.pickuping &&
				 this_room == my_room &&
				 creep.getActiveBodyparts(CARRY) > 0 &&
				 (creep.store.getUsedCapacity() == 0 ||
					(creep.store.getFreeCapacity() > 0 && creep.memory.rerun))) {
				creep.memory.pickuping = true;
			}

			if(creep.memory.pickuping) {

				const DP = flags.flags.DP;
				const DP1 = flags.flags.DP1;
				const DP2 = flags.flags.DP2;

				var target;

				if(!target) {
					var droppeds = creep.room.find(FIND_DROPPED_RESOURCES, {
						filter: (dropped) => {
							return dropped.resourceType == RESOURCE_ENERGY &&
							 			(!dropped.pos.findInRange(FIND_HOSTILE_CREEPS, 5).length > 0 ||
										 (!!DP && DP.pos.roomName == creep.room.name) ||
										 (!!DP1 && DP1.pos.roomName == creep.room.name && DP1.pos.findPathTo(dropped).length < 5) ||
										 (!!DP2 && DP2.pos.roomName == creep.room.name && DP2.pos.findPathTo(dropped).length < 5)) &&
								tools.checkTarget(executer,dropped.id);
						}
					});
					if(droppeds.length > 0) {
						var dropped = droppeds.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
						if(!!dropped) {
							target = tools.setTarget(creep,dropped,dropped.id,rolePickuper.run);
						}
					}
				}

				if(!!target) {
					var err = creep.pickup(target);
					if(err == ERR_NOT_IN_RANGE) {
						creep.say('🔜👊');
						err = tools.moveTo(creep,target);
						if(flags.flags.LP || flags.flags.L) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '🔜👊', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, err
													, 'moving for pickuping:'
													, targetinfo);
						}
					}
					else if(!err) {
						creep.say('👊');
            if(flags.flags.LP || flags.flags.L) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '👊', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'pickuping:'
													, targetinfo);
						}
					}
					else {
						creep.memory.pickuping = false;
            if(flags.flags.LP || flags.flags.L) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '👊⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'pickuping :'
													, target.name?target.name:target.structureType
													, 'with err:'
													, err);
						}
					}
				}
				else {
					creep.memory.pickuping = false;
				}
			}

			metrix.cpu.role_time(creep, 'pickuping');
			if(!creep.memory.pickuping) {
				return roleNext.run(creep);
			}
		}
};

module.exports = rolePickuper;
