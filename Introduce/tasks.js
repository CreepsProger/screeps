const constants = require('main.constants');
//const harvester = require('role.harvester');
const config = require('main.config');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

//✅ ☑️ ✔️ ✖️ ❌ ❎ 

var tasks = {
	
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
	
	onRun: function(creep) {
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
		if(tools.getWeight(creep.name) == 5035 && creep.ticksToLive < 1485) {
			return creep.suicide() == OK;
		}
		if(false && tools.getWeight(creep.name) == 173 && creep.ticksToLive > 1000){
			if(creep.room.name == 'W29S32')
				creep.suicide();
			if(!creep.store.X) {
				if(creep.withdraw(creep.room.storage,'X') == ERR_NOT_IN_RANGE) {
					creep.say('🔜');
					tools.moveTo(creep, creep.room.storage);
				}
			}
			else {
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
				const err = tools.moveTo(creep, target);
							console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, target:target, err:err, memory:creep.memory}));
				return OK == err;
			}
		}

		return false;
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
