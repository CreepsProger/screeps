const roleNext = require('role.dismantler');
const constants = require('main.constants');
const terminals = require('main.terminals');
const conditions = require('main.conditions');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const links = require('main.links');
const log = require('main.log');
const cash = require('cash');
const tools = require('tools');


var roleRenewer = {


	/** @param {Creep} creep **/
	run: function(creep) {
		if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
			roleNext.run(creep);
			return;
		}

		const this_room = creep.room.name;
		const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;

		if(this_room == my_room && creep.getActiveBodyparts(WORK)) {

			if(creep.memory.renewing && creep.ticksToLive > 1000) {
				creep.memory.renewing = false;
			}

			if(!creep.memory.renewing && creep.ticksToLive < 500) {
				creep.memory.renewing = true;
			}

			if(creep.memory.renewing) {
				var spawns = cash.getSpawns(creep.room);
				if(spawns.length > 0) {
					var spawn = spawns.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
					if(creep.pos.getRangeTo(spawn) == 1) {
						var rc1 = spawn.renewCreep(creep);
						var rc2 = ERR_NOT_IN_RANGE;
						if(creep.memory.upgrading && creep.pos.getRangeTo(creep.room.controller) <= 3) {
							rc2 = creep.upgradeController(creep.room.controller);
						}
						var sign = (OK == rc1)? '👨':'';
						sign += (OK == rc2)? '🛠':'';
						creep.say(sign);
					}
					else {
						var rc = tools.moveTo(creep,spawn);
						if(OK == rc) {
							creep.say('🔜👨');
						}
						else {
							creep.memory.renewing = false;
						}
					}
				}
			}
		}

		metrix.cpu.role_time(creep, 'renewer');
		if(!creep.memory.renewing) {
			roleNext.run(creep);
		}
	}
};

module.exports = roleRenewer;
