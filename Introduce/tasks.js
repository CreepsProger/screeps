const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

//✅ ☑️ ✔️ ✖️ ❌ ❎ 

var tasks = {
	
	taskToBoostCreeps: {
		isToBoostCreeps:true, 
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

			if(found.length == 0)				return undefined;

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
		assignTask: function(creep, resource = RESOURCE_ZYNTHIUM_HYDRIDE, amount = 100) {
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
			tasks.taskToFillBoostingLab.resource = resource;
			tasks.taskToFillBoostingLab.amount = amount;
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
	needToHarvest: function(creep, onlyCheck = true) {//return null;
		if(!onlyCheck) {
			tasks.taskToFillBoostingLab.assignTask(creep);
		} 

		if(creep.memory.task === undefined)
			return null;
		if(creep.memory.task.done !== undefined)
			return null;
		if(creep.memory.task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToHarvest(creep);
		if(creep.memory.task.isToEmptyBoostingLab !== undefined)
			return tasks.taskToEmptyBoostingLab.needToHarvest(creep);
    return null;
	}, 
	needToTransfer: function(creep) {//return null;
		if(creep.memory.task === undefined)
			return null;
		if(creep.memory.task.done !== undefined)
			return null;
		if(creep.memory.task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToTransfer(creep);
		if(creep.memory.task.isToEmptyBoostingLab !== undefined)
			return tasks.taskToEmptyBoostingLab.needToTransfer(creep);
    return null;
	}
};

module.exports = tasks;
