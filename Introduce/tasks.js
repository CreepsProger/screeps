const constants = require('main.constants');
//const harvester = require('role.harvester');
const config = require('main.config');
const flags = require('main.flags');
const labs = require('main.labs');
const tools = require('tools');
const cash = require('cash');

//✅ ☑️ ✔️ ✖️ ❌ ❎ 

var tasks = {
	
	getRepairTarget: function(creep) {
		var target;
		
		const RR = flags.flags.RR;
		const RR1 = flags.flags.RR1;
		const RR2 = flags.flags.RR2;
		const NRR = flags.flags.NRR;
		const NRR1 = flags.flags.NRR1;
		const NRR2 = flags.flags.NRR2;
		const D = flags.flags.D;
		const D1 = flags.flags.D1;
		const D2 = flags.flags.D2;
		const mw = 2*config.getMW(creep.pos.roomName);
		const mr = 2*config.getMR(creep.pos.roomName);
		
		if(!target && (!NRR || RR)) {
			const rps = cash.getMyBuildings(creep.room)
			.filter((structure) => {
				if(!structure || !structure.structureType)
					return false;

				const r0 = (!!RR &&
									 structure.pos.roomName == RR.pos.roomName &&
									 structure.pos.x == RR.pos.x &&
									 structure.pos.y == RR.pos.y)?(11-RR.color)*(11-RR.secondaryColor):1;
				const r1 = (!!RR1 &&
									 structure.pos.roomName == RR1.pos.roomName &&
									 structure.pos.x == RR1.pos.x &&
									 structure.pos.y == RR1.pos.y)?(11-RR1.color)*(11-RR1.secondaryColor):1;
				const r2 = (!!RR2 &&
									 structure.pos.roomName == RR2.pos.roomName &&
									 structure.pos.x == RR2.pos.x &&
									 structure.pos.y == RR2.pos.y)?(11-RR2.color)*(11-RR2.secondaryColor):1;
				const r = r0*r1*r2;
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
						(1.5+98.5*(!!creep.memory.target && structure.id == creep.memory.target.id)))) {
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
				if(	!!NRR1 && NRR1.pos.roomName == structure.pos.roomName &&
					 NRR1.pos.getRangeTo(structure) <= 10-NRR1.color) {
					return false;
				}
				if(	!!NRR2 && NRR2.pos.roomName == structure.pos.roomName &&
					 NRR2.pos.getRangeTo(structure) <= 10-NRR2.color) {
					return false;
				}
				return  true;
			});
			if(rps.length > 0) {
				target = rps.reduce((p,c) => creep.pos.getRangeTo(p) * (p.hits + 1) // dp*ec < dc*ep !! it is right! don't change
																				< creep.pos.getRangeTo(c) * (c.hits + 1)
																				? p:c);
				creep.memory.target = {id:target.id, pos:target.pos, time: Game.time};
				if(target && (Game.time % constants.TICKS_TO_CHECK_CPU == 0)) {
					console.log( '🧯', Math.trunc(Game.time/10000), Game.time%10000
		 												, JSON.stringify({mw:mw, mr:mr, RR:RR, target:target})
		 										);
				}
			}
		}
		return target;
	}, 
	
	taskToBoostCreeps: {
		isToBoostCreeps:true, 
		pos:{},
		lab_id:{},
		isTask:false,
		needToRun: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(!!lab.mineralType && lab.store.getUsedCapacity(lab.mineralType) > 0) {
				creep.memory.task.pos = lab.pos;
				tasks.taskToBoostCreeps.isTask = true;
				tasks.taskToBoostCreeps.pos = creep.memory.task.pos;
				return tasks.taskToBoostCreeps;
			}
			creep.memory.task.done = true;
			tasks.taskToBoostCreeps.isTask = false;
			if(true) {
				console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return null;
		},
		run: function(creep) {
			creep.memory.task.err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				creep.memory.task.err = ERR_NOT_IN_RANGE;
			if(creep.memory.task.err == OK) {
				const lab = Game.getObjectById(creep.memory.task.lab_id);
				creep.memory.task.err = lab.boostCreep(creep);
				if(creep.memory.task.err != OK)
					console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'harvestingBy', creep:creep.name, action:'withdrawing'
																				, resource:resource, err:creep.memory.task.err
																				, from_lab:lab}));
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'harvestingBy', creep:creep.name
																				, err:creep.memory.task.err, task:creep.memory.task}));
			return creep.memory.task.err;
		},
		addTask: function(creep, room, resource = RESOURCE_ZYNTHIUM_HYDRIDE, amount = 100, labN = 0) {
			if(Game.shard.name != 'shard1')
				return undefined;
			const task = {name:'taskToBoostCreeps', adder:creep, room:room, resource:resource, amount:amount, labN:labN};
			tasks.addTask(task);
		}, 
		assignTask: function(creep, room, task = {room:room, resource:RESOURCE_ZYNTHIUM_HYDRIDE, amount:100, labN:1} ) {
			if(Game.shard.name != 'shard1')
				return undefined;
			if(!creep.room.storage)
				return undefined;
			if(creep.memory.task !== undefined &&
				 creep.memory.task.isToBoostCreeps !== undefined &&
				 creep.memory.task.done === undefined)
				return creep.memory.task;
			if(tasks.taskToBoostCreeps.isTask)
				return undefined;
			
			const pos = new RoomPosition(11, 25, creep.room.name);

			const found = pos.lookFor(LOOK_STRUCTURES);
			if(found.length == 0)
				return undefined;

			const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
			if(!lab)
				return undefined;

			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'assignTask', creep:creep.name
																				, taskName:'isToBoostCreeps'
																				, task:tasks.taskToBoostCreeps, lab:lab}));
			if(!lab.mineralType || lab.store.getUsedCapacity(lab.mineralType) == 0) {
				console.log('❎', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({ creep:creep.name, isToBoostCreeps:'lab is empty'
																					, lab:lab}));
				return undefined;
			}
			const isFilledEnough = !!lab.store.getUsedCapacity(task.resource) && (lab.store.getUsedCapacity(task.resource) >= task.amount);
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'assignTask', creep:creep.name
																				, taskName:'isToBoostCreeps', resource:task.resource, amount:task.amount
																				, task:tasks.taskToBoostCreeps, lab:lab
																				, lab_mineralType:lab.mineralType
																				, isFilledEnough:isFilledEnough}));
			if(!isFilledEnough) {
				console.log('✅', 'return tasks.taskToFillBoostingLab.assignTask') ;
				return tasks.taskToFillBoostingLab.addTask(creep, task.resource, task.amount, task.labN);
			}

			tasks.taskToBoostCreeps.isToBoostCreeps = true; 
			tasks.taskToBoostCreeps.pos = pos; 
			tasks.taskToBoostCreeps.lab_id = lab.id; 
			tasks.taskToBoostCreeps.resource = task.resource;
			tasks.taskToBoostCreeps.amount = task.amount;
			tasks.taskToBoostCreeps.isTask = true; 
			creep.memory.task = tasks.taskToBoostCreeps;

			if(true) {
				console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}

			return creep.memory.task;
		}
	},

	taskToEmptyBoostingLab: {
		isToEmptyBoostingLab:true,
		pos:{},
		lab_id:{},
		storage_id:{},
		isTask:false,
		needToHarvest: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(!!lab.mineralType && lab.store.getUsedCapacity(lab.mineralType) > 0) {
				creep.memory.task.pos = lab.pos;
				tasks.taskToEmptyBoostingLab.isTask = true;
				tasks.taskToEmptyBoostingLab.pos = creep.memory.task.pos;
				return tasks.taskToEmptyBoostingLab;
			}
			creep.memory.task.done = true;
			tasks.taskToEmptyBoostingLab.isTask = false;
			if(true) {
				console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return null;
		},
		harvestingBy: function(creep) {
			creep.memory.task.err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				creep.memory.task.err = ERR_NOT_IN_RANGE;
			if(creep.memory.task.err == OK) {
				const lab = Game.getObjectById(creep.memory.task.lab_id);
				const resources = Object.keys(lab.store).sort((l,r) => l.length - r.length);
				resources.forEach(function(resource,i) {
					if(creep.memory.task.err == OK && resource != RESOURCE_ENERGY)
							creep.memory.task.err = creep.withdraw(lab, resource);
					if(creep.memory.task.err != OK)
						console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'harvestingBy', creep:creep.name, action:'withdrawing'
																				, resource:resource, err:creep.memory.task.err
																				, from_lab:lab}));
				});
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'harvestingBy', creep:creep.name
																				, err:creep.memory.task.err, task:creep.memory.task}));
			return creep.memory.task.err;
		},
		needToTransfer: function(creep) {
			if(creep.store.getUsedCapacity() > 0) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				creep.memory.task.pos = storage.pos;
				tasks.taskToEmptyBoostingLab.isTask = true;
				tasks.taskToEmptyBoostingLab.pos = creep.memory.task.pos;
				return tasks.taskToEmptyBoostingLab;
			}
			return null;
		},
		transferingBy: function(creep) {
			creep.memory.task.err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				creep.memory.task.err = ERR_NOT_IN_RANGE;
			if(creep.memory.task.err == OK) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				const resources = Object.keys(creep.store).sort((l,r) => l.length - r.length);
				resources.forEach(function(resource,i) {
					if(creep.memory.task.err == OK)
							creep.memory.task.err = creep.transfer(storage, resource);
					if(creep.memory.task.err != OK)
						console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'transferingBy', creep:creep.name, action:'transfer'
																				, resource:resource, err:creep.memory.task.err
																				, to_storage:storage, from_creep:creep}));
				});
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'transferingBy', creep:creep.name
																				, err:creep.memory.task.err, task:creep.memory.task}));
			return creep.memory.task.err;
		},
		assignTask: function(creep) {
			if(Game.shard.name != 'shard1')
				return undefined;
			if(!creep.room.storage)
				return undefined;
			if(creep.memory.task !== undefined &&
				 creep.memory.task.isToEmptyBoostingLab !== undefined &&
				 creep.memory.task.done === undefined)
				return creep.memory.task;
			if(tasks.taskToEmptyBoostingLab.isTask)
				return undefined;
			if(creep.getActiveBodyparts(WORK) > 0)
				return undefined;
			if(tools.getWeight(creep.name)%10 > 3)
				return undefined;

			const pos = new RoomPosition(11, 25, creep.room.name);

			const found = pos.lookFor(LOOK_STRUCTURES);
			if(found.length == 0)
				return undefined;
			const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
			if(!lab)
				return undefined;
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'assignTask', creep:creep.name
																				, taskName:'isToEmptyBoostingLab'
																				, task:tasks.taskToEmptyBoostingLab, lab:lab}));

			if(!lab.mineralType || lab.store.getUsedCapacity(lab.mineralType) == 0) {
				console.log('❎', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({ creep:creep.name, isToEmptyBoostingLab:'lab is empty'
																					, lab:lab}));
				return undefined;
			}

			tasks.taskToEmptyBoostingLab.isToEmptyBoostingLab = true;
			tasks.taskToEmptyBoostingLab.pos = pos;
			tasks.taskToEmptyBoostingLab.lab_id = lab.id;
			tasks.taskToEmptyBoostingLab.storage_id = creep.room.storage.id;
			tasks.taskToEmptyBoostingLab.isTask = true;
			creep.memory.task = tasks.taskToEmptyBoostingLab;
			if(true) {
				console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return creep.memory.task;
		}
	},
  taskToFillBoostingLab: {
		isToFillBoostingLab:true,
		resource:'-', // resource2:RESOURCE_CATALYZED_UTRIUM_ACID,
		amount:0, 
		pos:{},
		lab_id:{},
		storage_id:{},
		isTask:false,
		needToHarvest: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(lab.store.getUsedCapacity(creep.memory.task.resource) +
				 creep.store.getUsedCapacity(creep.memory.task.resource)  < creep.memory.task.amount) {
				creep.memory.task.pos = creep.room.storage.pos;
				tasks.taskToFillBoostingLab.isTask = true;
				tasks.taskToFillBoostingLab.pos = creep.memory.task.pos;
				return tasks.taskToFillBoostingLab;
			}
			creep.memory.task.done = true;
			tasks.taskToFillBoostingLab.isTask = false;
			if(true) {
				console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return null;
		},
		harvestingBy: function(creep) {
			creep.memory.task.err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				creep.memory.task.err = ERR_NOT_IN_RANGE;
			if(creep.memory.task.err == OK) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				creep.memory.task.err = creep.withdraw(storage, creep.memory.task.resource, creep.memory.task.amount);
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'harvestingBy', creep:creep.name, err:creep.memory.task.err, task:creep.memory.task}));
			return creep.memory.task.err;
		},
		needToTransfer: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(creep.store.getUsedCapacity(creep.memory.task.resource) > 0) {
				creep.memory.task.pos = lab.pos;
				tasks.taskToFillBoostingLab.isTask = true;
				tasks.taskToFillBoostingLab.pos = creep.memory.task.pos;
				return tasks.taskToFillBoostingLab;
			}
			return null;
		},
		transferingBy: function(creep) {
			creep.memory.task.err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				creep.memory.task.err = ERR_NOT_IN_RANGE;
			if(creep.memory.task.err == OK) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				const lab = Game.getObjectById(creep.memory.task.lab_id);
			  creep.memory.task.err = creep.transfer(lab, creep.memory.task.resource);
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'transferingBy', creep:creep.name, err:creep.memory.task.err, task:creep.memory.task}));
			return creep.memory.task.err;
		},
		addTask: function(creep, room, resource = RESOURCE_ZYNTHIUM_HYDRIDE, amount = 100, labN = 0) {
			if(Game.shard.name != 'shard1')
				return undefined;
			const task = {name:'taskToFillBoostingLab', adder:creep, room:room, resource:resource, amount:amount, labN:labN};
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'taskToFillBoostingLab.addTask'
																				, task:task}));
			tasks.addTask(task);
		}, 
		assignTask: function(creep, task = {room:creep.room.roomName, resource:RESOURCE_ZYNTHIUM_HYDRIDE, amount:100, labN:1} ) {
			if(Game.shard.name != 'shard1')
				return undefined;
			if(!creep.room.storage)
				return undefined;
			if(creep.memory.task !== undefined &&
				 creep.memory.task.isToFillBoostingLab !== undefined &&
				 creep.memory.task.done === undefined)
				return creep.memory.task;
			if(tasks.taskToFillBoostingLab.isTask)
				return undefined;
			if(creep.getActiveBodyparts(WORK) > 0)
				return undefined;
			if(tools.getWeight(creep.name)%10 > 3)
				return undefined;

			const pos = new RoomPosition(11, 25, creep.room.name);

			const found = pos.lookFor(LOOK_STRUCTURES);// , {(s) => s.structureType == STRUCTURE_LAB});
			if(found.length == 0)
				return undefined;
			const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
			if(!lab)
				return undefined;
			const isFilledEnough = !!lab.store.getUsedCapacity(resource) && (lab.store.getUsedCapacity(resource) >= amount);
			const isNoEnoughAmount = (lab.store.getUsedCapacity(resource)
																+ creep.store.getUsedCapacity(resource)
																+ creep.room.storage.store.getUsedCapacity(resource)) < amount;
			const isAnotherMineralType = !!lab.mineralType && lab.mineralType != resource;
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { do:'assignTask', creep:creep.name
																				, taskName:'isToFillBoostingLab', resource:resource, amount:amount
																				, task:tasks.taskToFillBoostingLab, lab:lab
																				, lab_mineralType:lab.mineralType
																				, isFilledEnough:isFilledEnough
																				, isAnotherMineralType:isAnotherMineralType, isNoEnoughAmount:isNoEnoughAmount}));
			if(isFilledEnough)
				return undefined;
			if(isAnotherMineralType) {
				console.log('✅', 'return tasks.taskToEmptyBoostingLab.assignTask') ;
				return tasks.taskToEmptyBoostingLab.assignTask(creep);
			}
			if(isNoEnoughAmount) {
				console.log('❎', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { creep:creep.name, isToFillBoostingLab:'not enough amount'
																					, resource:resource, amount:amount
																					, lab:lab, storage:creep.room.storage}));
				return undefined;
			}

			tasks.taskToFillBoostingLab.isToFillBoostingLab = true;
			tasks.taskToFillBoostingLab.resource = task.resource;
			tasks.taskToFillBoostingLab.amount = task.amount;
			tasks.taskToFillBoostingLab.pos = pos;
			tasks.taskToFillBoostingLab.lab_id = lab.id;
			tasks.taskToFillBoostingLab.storage_id = creep.room.storage.id;
			tasks.taskToFillBoostingLab.isTask = true;
			creep.memory.task = tasks.taskToFillBoostingLab;
			if(true) {
				console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return creep.memory.task; 
		}
	},

	addTasksToFillBoostingLab: function(creepName, roomName, boosts) {
		const resources = Object.keys(boosts).sort((l,r) => l.length - r.length);
		console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'addTasksToFillBoostingLab'
																				, creepName:creepName, roomName:roomName, boosts:boosts, resources:resources}));
		resources.forEach(function(resource,labN) {
			const amount = boosts[resource];
			if(amount > 0)
				tasks.taskToFillBoostingLab.addTask(creepName, roomName, resource, amount, labN);
		});
	},

	getTask: function(creep) {
    return null;
		if(creep.memory.task === undefined)
			return null;
		if(creep.memory.task.done !== undefined)
			return null;
    return creep.memory.task;
	},
	
	getRoomTodo: function(roomName) {
		if(!Memory.todo)
				Memory.todo = {};
		return Memory.todo[roomName];
	},
	
	onBirth: function(creep) {
		if(creep.memory.boosts !== undefined) {
			const creepName = creep.name;
			const roomName = creep.room.roomName;
			const boosts = creep.memory.boosts;
			const resources = Object.keys(creep.memory.boosts).sort((l,r) => l.length - r.length);
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onBirth'
																				, creepName:creepName, roomName:roomName
																				, boosts:boosts, resources:resources}));
			resources.forEach(function(resource,labN) {
				const amount = boosts[resource];
				if(amount > 0)
					tasks.taskToBoostCreeps.addTask(creepName, roomName, resource, amount, labN);
			});
		}
	},
	
	boostedUpgrader:{},

	addBoostedUpgrader: function(creep) {
		const creepRoomId = tools.getRoomId(creep.name);
		tasks.boostedUpgrader[creepRoomId] = { time:Game.time };
	},
	boostedUpgraderExists: function(creep) {
		const creepRoomId = tools.getRoomId(creep.name);
		const entry = tasks.boostedUpgrader[creepRoomId];
		if(!entry)
			return false;
		return entry.time + 10 > Game.time;
	},
	
	onRun: function(creep) {/*
		if(tools.getWeight(creep.name) % 10 == 3 && Game.time%17 == 0 ) {
			console.log('🚚', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onRun.start', creep:creep.name
																				, room:creep.room.name, pos:creep.pos}));
		}
		if(tools.getWeight(creep.name) % 10 == 5 && Game.time%17 == 0 ) {
			console.log('⚒️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onRun.start', creep:creep.name
																				, room:creep.room.name, pos:creep.pos}));
		}*/
		if(creep.memory.boosts !== undefined) {
			const roomTodo = tasks.getRoomTodo(creep.room.name);
			if(!!roomTodo) {
				roomTodo.some(function(todo,i) {
					if(!!todo.boost && todo.creep == creep.name && !!tasks[todo.name].assignTask(creep, todo) )
						return true; 
					return false;
				});
			}
		}
		const task = tasks.getTask(creep);

		if(!!task &&
			!!task.isToBoostCreeps &&
			 tasks.taskToBoostCreeps.needToRun(creep)) {
			return tasks.taskToBoostCreeps.run(creep);
		}
		const boostConfig = flags.getBoostConfig(creep);
		if(!!boostConfig && boostConfig.length > 0) {
			const ressToBoost = boostConfig.filter((res) => !creep.body.some((b,i) => tools.nvl(b.boost,'-') == res)); 
			if(!!ressToBoost && ressToBoost.length > 0) {
				const resToBoost = ressToBoost[0];
// 				console.log('💉', Math.trunc(Game.time/10000), Game.time%10000
// 							, JSON.stringify( { tasks:'onRun.boost', creep:creep.name
// 																, room:creep.room.name, resToBoost:resToBoost, getLabsToInOut:labs.getLabsToInOut(creep.room.name)}));
				const labToBoost = labs.getLabsToInOut(creep.room.name)
																.filter((lab) => !!lab.lab.mineralType &&
																				lab.lab.store[lab.lab.mineralType] > 30 &&
																				tools.nvl(lab.lab.store.getUsedCapacity(RESOURCE_ENERGY),0) > 20 &&
																				ressToBoost.includes(lab.lab.mineralType) )
																.map((lab) => (lab.m = lab.lab.store[lab.lab.mineralType],lab)) 
																.map((lab) => (lab.e = tools.nvl(lab.lab.store.getUsedCapacity(RESOURCE_ENERGY),0),lab)) 
																.map((lab) => (lab.em = lab.e*lab.m,lab)) 
																.sort((l,r) => r.em - l.em)
																.shift();
				if(!!labToBoost) { 
					const resToBoost = labToBoost.lab.mineralType;
// 					console.log('💉', Math.trunc(Game.time/10000), Game.time%10000
// 								, JSON.stringify( { tasks:'onRun.boost', creep:creep.name
// 																	, room:creep.room.name, resToBoost:resToBoost, labToBoost:labToBoost}));
					const err = labToBoost.lab.boostCreep(creep);
					if(err == ERR_NOT_IN_RANGE) {
						const err2 = tools.moveTo(creep, labToBoost.lab);
						creep.say((OK == err2)?'🔜💉':'🔜💉'+err2);
					}
					else {
						creep.say((OK == err)?'💉':'💉'+err);
						console.log('💉', Math.trunc(Game.time/10000), Game.time%10000
														, JSON.stringify( { tasks:'onRun.boost', creep:creep.name
																							, room:creep.room.name, err:err, labToBoost:labToBoost}));
					}
					return true;
				}
			}
		}
		const type = tools.getWeight(creep.name) % 10;
		const modification = tools.getMod(creep.name);//tools.getMod('creep-<5014/1>-16w16c16m-158110');
		if(type == 3) {
			//W29S32.transfer: "5011":["U","K"] 
			//W57S51.transfer: "5011":["X"]
			const transferCreepConfig = flags.getTransferCreepConfig(creep.name,creep.room.name);
			if(!!transferCreepConfig){/*
				console.log('🚚', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { tasks:'onRun.transfer', creep:creep.name
																					, room:creep.room.name, transferCreepConfig:transferCreepConfig}));*/
				if(!!creep.room.storage && !!creep.room.storage.store && creep.store.getFreeCapacity() > 0 ) {
					const resource = Object.keys(creep.room.storage.store)
																	.filter((k) => transferCreepConfig.includes(k))
																	.sort((l,r) => creep.room.storage.store[r] - creep.room.storage.store[l])
																	.shift();
					if(!!resource && creep.withdraw(creep.room.storage,resource) == ERR_NOT_IN_RANGE) {
						const err = tools.moveTo(creep, creep.room.storage);
						creep.say((OK == err)?'🔜🚚':'🔜🚚'+err);
						return true;
					}
					creep.memory.transfer = true;
				}
			}
			const role = {name:constants.ROLE_ENERGY_HARVESTING}; 
			if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].v === undefined ||
					 creep.memory[role.name].v != config.version) {
					creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
				config.setRoom(creep, role.name);
			}
			const target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
			const err = tools.moveTo(creep, target);/*
			console.log('🚚', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onRun.transfer', creep:creep.name
																				, room:creep.room.name, target:target
																				, err:err, role:creep.memory[role.name] }));*/
			creep.say((OK == err)?'🚚':'🚚'+err);
			
			if(creep.getActiveBodyparts(HEAL) > 0)
				creep.heal(creep);
			
			if(creep.memory[role.name].room == creep.pos.roomName &&
				 creep.memory[role.name].shard == Game.shard.name)
				creep.suicide();

			return true;
		}
		if(type == 5) {
			const role = {name:constants.ROLE_ENERGY_HARVESTING}; 
			if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].v === undefined ||
					 creep.memory[role.name].v != config.version) {
					creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
				config.setRoom(creep, role.name);
			}
			if(creep.memory[role.name].room != creep.pos.roomName ||
				 creep.memory[role.name].shard != Game.shard.name) {
				const target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
				const err = tools.moveTo(creep, target);/*
				console.log('⚒️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onRun.upgrade', creep:creep.name, modification:modification
																				, room:creep.room.name, target:target
																				, err:err, role:creep.memory[role.name] }));*/
				creep.say((OK == err)?'🔜⚒️':'🔜⚒️'+err);
				return true;
			}
			else {
				if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
					const sot = tools.getStorageOrTerminal(creep);
					if(!!sot) {
						const err = creep.withdraw(sot,RESOURCE_ENERGY);
						if(err != ERR_NOT_IN_RANGE) {
							creep.say((OK == err)?'⚡':'⚡'+err);
						}
						else {
							const err = tools.moveTo(creep, sot);
							creep.say((OK == err)?'🔜⚡':'🔜⚡'+err);
						}
					}
					else {
						const container = cash.getContainers(creep.room)
																	.filter((c) => !!c && !!c.store && c.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
																	.sort((l,r) => (l.store.getFreeCapacity()+1) * creep.pos.getRangeTo(l)
                                               - (r.store.getFreeCapacity()+1) * creep.pos.getRangeTo(r))
																	.shift();
						if(!!container) {
							const err = creep.withdraw(container,RESOURCE_ENERGY);
							if(err != ERR_NOT_IN_RANGE) {
								creep.say((OK == err)?'⚡':'⚡'+err);
							}
							else {
								const err = tools.moveTo(creep, container);
								creep.say((OK == err)?'🔜⚡':'🔜⚡'+err);
							}
						}
					}
					return true;
				}
				const err = creep.upgradeController(creep.room.controller);
				if(err != ERR_NOT_IN_RANGE) {
					creep.say((OK == err)?'⚒️':'⚒️'+err);
				}
				else {
					const err = tools.moveTo(creep, creep.room.controller);
					creep.say((OK == err)?'🔜⚒️':'🔜⚒️'+err);
					return true;
				}
			}
			tasks.addBoostedUpgrader(creep);
			tools.dontGetInWay(creep);
			const range = creep.pos.getRangeTo(creep.room.controller);
			if(range > 1) {
				tools.moveTo(creep,creep.room.controller);
			}

			return true;
		}
		const localTransportWeight =    (Game.shard.name == 'shard1')? 5142:552;
		const localTransportFrom =      (Game.shard.name == 'shard1')? 'W25S28':'W56S53';
		const localTransportThrough_x = (Game.shard.name == 'shard1')? 0:0;
		const localTransportThrough_y = (Game.shard.name == 'shard1')? 16:27;
		const localTransportTo =        (Game.shard.name == 'shard1')? 'W26S27':'W54S53';
		if(tools.getWeight(creep.name) == localTransportWeight) {
			if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
				if(creep.room.name != localTransportFrom) {
					const exit = creep.room.findExitTo(localTransportFrom);
					var pos = creep.pos.findClosestByPath(exit);
					if(!!pos && pos.y%49==0 && !!localTransportThrough_x)
						pos.x = localTransportThrough_x;
					if(!!pos && pos.x%49==0 && !!localTransportThrough_y)
						pos.y = localTransportThrough_y;
					const err = tools.moveTo(creep, pos);
					creep.say((OK == err)?'🚚⚡':'🚚⚡'+err);
				}
				else {
					const sot = tools.getStorageOrTerminal(creep);
					if(!!sot) {
						const err = creep.withdraw(sot,RESOURCE_ENERGY);
						if(err != ERR_NOT_IN_RANGE) {
							creep.say((OK == err)?'⚡':'⚡'+err);
						}
						else {
							const err = tools.moveTo(creep, sot);
							creep.say((OK == err)?'🔜⚡':'🔜⚡'+err);
						}
					}
				}
			}
			else {
				if(creep.room.name != localTransportTo) {
					const exit = creep.room.findExitTo(localTransportTo);
					var pos = creep.pos.findClosestByPath(exit);
					if(!!pos && pos.y%49==0 && !!localTransportThrough_x)
						pos.x = localTransportThrough_x;
					if(!!pos && pos.x%49==0 && !!localTransportThrough_y)
						pos.y = localTransportThrough_y;
					const err = tools.moveTo(creep, pos);
					creep.say((OK == err)?'🚚💡':'🚚💡'+err);
				}
				else {
					if(!!creep.room.storage) {
						const err = creep.transfer(creep.room.storage,RESOURCE_ENERGY);
						if(err != ERR_NOT_IN_RANGE) {
							creep.say((OK == err)?'💡':'💡'+err);
						}
						else {
							const err = tools.moveTo(creep, creep.room.storage);
							creep.say((OK == err)?'🔜💡':'🔜💡'+err);
						}
					}
				} 
			}
			
			if(creep.getActiveBodyparts(HEAL) > 0)
				creep.heal(creep);
			
			return true;
		}
		if(type == 4 && creep.body.some((b,i) => tools.nvl(b.boost,'-') == 'XLH2O')) {
			const role = {name:constants.ROLE_ENERGY_HARVESTING}; 
			if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].v === undefined ||
					 creep.memory[role.name].v != config.version) {
					creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
				config.setRoom(creep, role.name);
			}
			var target;
			if(creep.memory[role.name].room != creep.pos.roomName ||
				 creep.memory[role.name].shard != Game.shard.name) {
				const target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
				const err = tools.moveTo(creep, target);
				console.log('🧯', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'onRun.upgrade', creep:creep.name
																				, room:creep.room.name, target:target
																				, err:err, role:creep.memory[role.name] }));
				creep.say((OK == err)?'🔜🧯':'🔜🧯'+err);
				return true;
			}
			else {
				if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
					const sot = tools.getStorageOrTerminal(creep);
					if(!!sot) {
						const err = creep.withdraw(sot,RESOURCE_ENERGY);
						if(err != ERR_NOT_IN_RANGE) {
							creep.say((OK == err)?'⚡':'⚡'+err);
						}
						else {
							const err = tools.moveTo(creep, sot);
							creep.say((OK == err)?'🔜⚡':'🔜⚡'+err);
						}
					}
					return true;
				}
				target = tasks.getRepairTarget(creep);
				const err = creep.repair(target);
				if(err != ERR_NOT_IN_RANGE) {
					creep.say((OK == err)?'🧯':'🧯'+err);
				}
				else {
					const err = tools.moveTo(creep, target);
					creep.say((OK == err)?'🔜🧯':'🔜🧯'+err);
					return true;
				}
			}
			tools.dontGetInWay(creep);
			const range = creep.pos.getRangeTo(target);
			if(range > 1) {
				tools.moveTo(creep,target);
			}

			return true;
		}
		if(type == 4 && modification == 1) {
			const role = {name:constants.ROLE_ENERGY_HARVESTING}; 
			if(creep.memory[role.name] === undefined ||
					 creep.memory[role.name].v === undefined ||
					 creep.memory[role.name].v != config.version) {
					creep.memory[role.name] = { v: config.version
																, on: false
																, room: creep.room.name
																, shard: Game.shard.name
																};
				config.setRoom(creep, role.name);
			}
			if(creep.memory[role.name].room != creep.pos.roomName ||
				 creep.memory[role.name].shard != Game.shard.name) {
				const target = config.findPathToMyRoom(creep,constants.ROLE_ENERGY_HARVESTING);
				const err = tools.moveTo(creep, target);
				console.log('🚜', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify( { tasks:'🚜', creep:creep.name
																				, room:creep.room.name, target:target
																				, err:err, role:creep.memory[role.name] }));
				creep.say((OK == err)?'🔜🚜':'🔜🚜'+err);
				return true;
			}
			else {
				if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
					const link = links.getTargetLinkToTransferEnergy(creep, null, null, 0);
					if(!!link) {
						const err = creep.transfer(link,RESOURCE_ENERGY);
						if(err != ERR_NOT_IN_RANGE) {
							creep.say((OK == err)?'💡':'💡'+err);
						}
						else {
							const err = tools.moveTo(creep, link);
							creep.say((OK == err)?'🔜💡':'🔜💡'+err);
						}
					}
					else {
						creep.say('👀');
						const container = cash.getContainers(creep.room)
																	.filter((c) => !!c && !!c.store && c.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && creep.pos.getRangeTo(c) < 7) 
																	.sort((l,r) => Math.min(r.store.getFreeCapacity(RESOURCE_ENERGY),creep.store.getUsedCapacity(RESOURCE_ENERGY)) * creep.pos.getRangeTo(l)
                                               - Math.min(l.store.getFreeCapacity(RESOURCE_ENERGY),creep.store.getUsedCapacity(RESOURCE_ENERGY)) * creep.pos.getRangeTo(r))
																	.shift();
						if(!!container) {
							const err = creep.transfer(container,RESOURCE_ENERGY);
							if(err != ERR_NOT_IN_RANGE) {
								creep.say((OK == err)?'💡':'💡'+err);
							}
							else {
								const err = tools.moveTo(creep, container);
								creep.say((OK == err)?'🔜💡':'🔜💡'+err);
							}
						}
					}
					return true;
				}
				const source = cash.getSources(creep.room)
														.filter((source) => source.energy > 0)
														.sort((l,r) => (l.energyCapacity - l.energy + 1) * creep.pos.getRangeTo(l)
                                         - (r.energyCapacity - r.energy + 1) * creep.pos.getRangeTo(r))
														.shift();
				if(!!source) {
					const err = creep.harvest(source);
					if(err != ERR_NOT_IN_RANGE) {
						creep.say((OK == err)?'🚜':'🚜'+err);
					}
					else {
						const err = tools.moveTo(creep, source);
						creep.say((OK == err)?'🔜🚜':'🔜🚜'+err);
						return true;
					}
				}
			}
			tools.dontGetInWay(creep);

			return true;
		}
	},

	needToHarvest: function(creep, checkTodo = false) {
		if(checkTodo) {
			const roomTodo = tasks.getRoomTodo(creep.room.name);
			if(!!roomTodo) {
				roomTodo.some(function(todo,i) {
					if(!! tasks[todo.name].assignTask(creep, todo) )
						return true; 
					return false;
				});
			} 
		} 

		const task = tasks.getTask(creep);
		if(!!task && task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToHarvest(creep);
		if(!!task && task.isToEmptyBoostingLab !== undefined)
			return tasks.taskToEmptyBoostingLab.needToHarvest(creep);
    return null;
	}, 
	
	needToTransfer: function(creep) {
		const task = tasks.getTask(creep);
		if(!!task && task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToTransfer(creep);
		if(!!task && task.isToEmptyBoostingLab !== undefined)
			return tasks.taskToEmptyBoostingLab.needToTransfer(creep);
		return null;
	}, 
	
	addTask: function(creep, task) {
		if(Game.shard.name != 'shard1')
			return undefined;
		if(!Memory.todo)
				Memory.todo = {};
		if(!Memory.todo[task.room])
				Memory.todo[task.room] = [];
		if(!Memory.totals)
				Memory.totals = {};
		if(!Memory.totals.TasksCounter)
			Memory.totals.TasksCounter = 0;
		task.addTime = Game.time;
		task.n = ++Memory.totals.TasksCounter;
		var roomTodo = Memory.todo[task.room];
		roomTodo.push(task);
		console.log('☑️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({tasks:'addTask', task:task, roomTodo:roomTodo}));
	}, 
	
	doneTask: function(creep, task) {
		if(Game.shard.name != 'shard1')
			return undefined;
		if(!Memory.todo)
				Memory.todo = {};
		if(!Memory.todo[task.room])
				Memory.todo[task.room] = [];
		
		var roomTodo = Memory.todo[task.room];
		
		if(!!roomTodo.find((todo) => todo.addTime == task.addTime && todo.n == task.n)) {
			const newRoomTodo = roomTodo.filter((todo) => !(todo.addTime == task.addTime && todo.n == task.n));
			console.log('☑️☑️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({tasks:'doneTask', task:task, roomTodo:roomTodo, newRoomTodo:newRoomTodo}));
      Memory.todo[task.room] = newRoomTodo;
		}
	}
};

module.exports = tasks;
