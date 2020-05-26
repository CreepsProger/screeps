var roleNext = require('role.pickuper');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
// const links = require('main.links');
const log = require('main.log');
const tasks = require('tasks');
const tools = require('tools');

var role = {

	name: 'r-transferer',

	logFlags: ['LRT','LRT ','L'],

	log: function(sign, creep, ...args) {
			if(log.canLog(role.logFlags, creep)) {
				console.log( sign, Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, role.name
										, JSON.stringify(creep.memory[role.name])
									  , args);
			}
	},

	init: function(creep) {
		if(creep.memory[role.name] === undefined ||
			 creep.memory[role.name].v === undefined ||
			 creep.memory[role.name].v != config.version) {
			creep.memory[role.name] = { v: config.version
																, on: false
																};
		}
	},
	// Game.creeps['creep-<5011/8>-16c8m-348'].store.getCapacity();
	// Game.creeps['creep-<5011/8>-16c8m-348'].store.getFreeCapacity();
	// console.log(JSON.stringify(Game.creeps['creep-<5011/8>-16c8m-348'].store));
	// console.log( '✒️', JSON.stringify(RESOURCES_ALL));

	checkOff: function(creep) {
		if(	creep.memory[role.name].on &&
				creep.store.getFreeCapacity() == creep.store.getCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 (creep.store.getFreeCapacity() < creep.store.getCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY) &&
			  (creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0 || creep.memory.rerun)) ||
			 tasks.needToTransfer(creep) ) {
			creep.memory[role.name].on = true;
			config.setRoom(creep, constants.ROLE_ENERGY_HARVESTING);
		}
	},

	getTarget: function(creep,executer) {

		const this_room = creep.room.name;
		const my_room = creep.memory[constants.ROLE_ENERGY_HARVESTING].room;
		const my_shard = creep.memory[constants.ROLE_ENERGY_HARVESTING].shard;
		const my_shard_config = Memory.config.shards[my_shard];
		const this_room_config = my_shard_config.rooms[this_room];
		const my_room_config = my_shard_config.rooms[my_room];

		const task01 = tasks.isToFillBoostingLab(creep);
		if(task01){
			return task01;
		} 

		if(!!creep.room.storage && !!creep.room.storage.my){
			return creep.room.storage;
		}

		return config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
	},

	run: function(creep,executer = undefined) {
		if(!creep.memory[constants.ROLE_ENERGY_HARVESTING]) {
			return roleNext.run(creep);
		}

		role.init(creep);																metrix.cpu.step_time(creep, role.name, 'init');
		role.checkOff(creep);														metrix.cpu.step_time(creep, role.name, 'checkOff');
		role.checkOn(creep);														metrix.cpu.step_time(creep, role.name, 'checkOn');

		if(creep.memory[role.name].on) {
			var target = role.getTarget(creep,executer);  metrix.cpu.step_time(creep, role.name, 'getTarget');
			// if(tools.getWeight(creep.name) >= 424) {
			// 	console.log(creep, JSON.stringify({this_room:creep.room.name, target:target}));
			// }

			if(target) {

				var err = OK;

				if(target.isTask){
					err = target.transferingBy(creep);
				}
				else if(!!target.id) {
					const resources = Object.keys(creep.store);//.sort((l,r) => tools.getWeight(l) - tools.getWeight(r));
					resources.forEach(function(resource,i) {
						if(err == OK)
							err = creep.transfer(target, resource);
					});
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💦');
					err = config.moveTo(creep, target);
					if(tools.getWeight(creep.name) == 5011 && err != OK) {
						console.log(creep, JSON.stringify({weight:tools.getWeight(creep.name), err:err, target:target}));
					}
					if(!!flags.flags.LRT || !!flags.flags.LR || !!flags.flags.L) {
						console.log( '🔜💦', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, err
												, 'moving for transfering resources to:', JSON.stringify(target)
												, target.name?target.name:target.structureType);
					}
				}
				else if(!err) {
					creep.say('💦');
					if(!!flags.flags.LRT || !!flags.flags.LR || !!flags.flags.L) {
						console.log( '💦', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering resources to:'
												, target.name?target.name:target.structureType);
					}
				}
				else {
					creep.memory[role.name].on = false;
					if(!!flags.flags.LRT || !!flags.flags.LR || !!flags.flags.L) {
						console.log( '💦⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, creep.name
												, 'transfering resources to:'
												, target.name?target.name:target.structureType, target.id
												, 'with err:'
												, err);
					}
				}
			}
			else {
				creep.memory[role.name].on = false;
			}
		}

		metrix.cpu.step_time(creep, role.name, '💦🔚');
		metrix.cpu.role_time(creep, role.name);

		if(!creep.memory[role.name].on) {
			return roleNext.run(creep);
		}
	}
};

module.exports = role;
