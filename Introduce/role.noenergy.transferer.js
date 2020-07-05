var roleNext = require('role.pickuper');
const constants = require('main.constants');
const config = require('main.config');
const metrix = require('main.metrix');
const flags = require('main.flags');
const terminals = require('main.terminals');
const labs = require('main.labs');
const log = require('main.log');
const tasks = require('tasks');
const tools = require('tools');
const cash = require('cash');

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
			 Object.keys(creep.store).length == 0+(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0)) {
				//creep.store.getFreeCapacity() == creep.store.getCapacity() - creep.store.getUsedCapacity(RESOURCE_ENERGY)) {
			creep.memory[role.name].on = false;
		}
	},

	checkOn: function(creep) {
		if(!creep.memory[role.name].on &&
			 Object.keys(creep.store).length > 0+(creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0) &&
			 (creep.store.getFreeCapacity() == 0 || creep.memory.rerun || tasks.needToTransfer(creep))
			) {
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

		const task = tasks.needToTransfer(creep);
		if(!!task){
			return task;
		}
		
		if(creep.getActiveBodyparts(WORK)) {
			const conts = cash.getContainers(creep.room).filter((cont) =>
						!!cont && !!cont.store && cont.store.getFreeCapacity(RESOURCE_ENERGY) > 0	&& creep.pos.getRangeTo(cont) <= 3);
			if(conts && conts.length > 0)
				return conts[0];
		}
		
		if(!creep.getActiveBodyparts(WORK)) {
			const resources = Object.keys(creep.store).filter((k) => k != RESOURCE_ENERGY);
			if(resources.length == 1 && resources[0] == 'G') {
				const nuker = cash.getNukers(creep.room).filter((n) =>
						!!n && !!n.store && n.store.getFreeCapacity('G') > 0).shift();
				if(!!nuker)
					return nuker;
			}
		}
		
		if(!creep.getActiveBodyparts(WORK) /*&& creep.memory.rerun*/) {
			const resources = Object.keys(creep.store).filter((k) => k != RESOURCE_ENERGY);
			if(resources.length == 1) {
				const res = resources[0];
				const labToIn = labs.getLabsToIn(creep.room.name, res)
														.filter((e)=> tools.checkTarget(executer,e.lab.id))
														.shift();
				if(!!labToIn) {/*
					console.log('⚗️⬅️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, roomName:creep.room.name, labToIn:labToIn}));*/
					const lab = tools.setTarget(creep,labToIn.lab,labToIn.lab.id,role.run);
					if(!!lab) {
						const target = {resource:labToIn.resource, amount:labToIn.amount, target:lab};/*
						console.log('⚗️🎯⬅️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({creep:creep.name, roomName:creep.room.name, target:target}));*/
						return target;
					}
				}
			}
		}

		if(!!creep.room.storage && !!creep.room.storage.my /*&& creep.memory.rerun*/){
			if(!!creep.room.terminal && !!creep.room.terminal.my) {
				const resources = Object.keys(creep.store).filter((k) => k != RESOURCE_ENERGY);
				if(resources.length == 1 &&
					 terminals.getStorageAmountAvgDiff(creep.room.terminal, resources[0]) > 0) {
					const target = creep.room.terminal;
					return target;
				} 
			}
			const target = creep.room.storage;
			return target;
		}
		
		if((creep.store.getFreeCapacity() < creep.store.getCapacity()/2 /*&& !creep.room.storage*/) || creep.memory.rerun) {
			const storages = cash.getStorages();
			if(storages.length > 0) {
				const target = storages.reduce((p,c) => tools.getRangeTo(creep.pos,p.pos)
																	 				< tools.getRangeTo(creep.pos,c.pos)
																					? p:c);
				return target;
			}
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

				if(!!target.isTask){
					err = target.transferingBy(creep);
				}
				else if(!!target.target) {
					err = creep.transfer(target.target, target.resource, Math.min(target.amount,creep.store.getUsedCapacity(target.resource)));
					//console.log(creep, JSON.stringify({weight:tools.getWeight(creep.name), err:err, target:target}));
				}
				else if(!!target.id) {
					const resources = Object.keys(creep.store);//.sort((l,r) => tools.getWeight(l) - tools.getWeight(r));
					resources.forEach(function(resource,i) {
						if(err == OK) {
							err = creep.transfer(target, resource);
							target.resource = resource;
						} 
					});
				}

				if(err == ERR_NOT_IN_RANGE) {
					creep.say('🔜💦');
					err = (!!target.target)? config.moveTo(creep, target.target):config.moveTo(creep, target);
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
					creep.say('💦'+tools.nvl(target.resource,''));
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
