const roleNext = require('role.builder');
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
				roleNext.run(creep);
				return;
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
				
				var target;
				
				if(!target) {
					var droppeds = creep.room.find(FIND_DROPPED_RESOURCES, {
						filter: (dropped) => {
							return (!dropped.pos.findInRange(FIND_HOSTILE_STRUCTURES, 5).length > 0
											|| (!!Game.flags['DP2'] && Game.flags['DP2'].room.name == creep.room.name && Game.flags['DP2'].pos.findPathTo(dropped).length < 5)) &&
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
						if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
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
						if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
							var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
							console.log( '👊', Math.trunc(Game.time/10000), Game.time%10000
													, creep.name
													, 'pickuping:'
													, targetinfo);
						}
					}
					else {
						creep.memory.pickuping = false;
						if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
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
				roleNext.run(creep);
			}
		}
};

module.exports = rolePickuper;
