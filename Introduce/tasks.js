const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

//✅ ☑️ ✔️ ✖️ ❌ ❎ 

var tasks = {

  taskToFillBoostingLab: {
		isToFillBoostingLab:true, isTask:false,
		resource:RESOURCE_ZYNTHIUM_HYDRIDE, resource2:RESOURCE_ZYNTHIUM_HYDRIDE, 
		pos:{},
		lab_id:{},
		storage_id:{},
		needToHarvest: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
				if(lab.store.getUsedCapacity(creep.memory.task.resource) +
				 creep.store.getUsedCapacity(creep.memory.task.resource)  < 100) {
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
			var err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				err = ERR_NOT_IN_RANGE;
			if(err == OK) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				err = creep.withdraw(storage, creep.memory.task.resource,100);
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'harvestingBy', creep:creep.name, err:err, task:creep.memory.task}));
			return err;
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
			var err = OK;
			if(!creep.pos.inRangeTo(creep.memory.task.pos,1))
				err = ERR_NOT_IN_RANGE;
			if(err == OK) {
				const storage = Game.getObjectById(creep.memory.task.storage_id);
				const lab = Game.getObjectById(creep.memory.task.lab_id);
			  err = creep.transfer(lab, creep.memory.task.resource);
			}
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'transferingBy', creep:creep.name, err:err, task:creep.memory.task}));
			return err;
		}
	},
	isToFillBoostingLab: function(creep) {
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
		
		const pos = new RoomPosition(11, 25, creep.room.name);
		
		const found = pos.lookFor(LOOK_STRUCTURES);// , {(s) => s.structureType == STRUCTURE_LAB});
		if(found.length == 0)
			return undefined;
		const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
		if(!lab)
			return undefined;
		if(lab.store.getUsedCapacity(tasks.taskToFillBoostingLab.resource) == 100)
			return undefined;
		if(lab.store.getUsedCapacity(tasks.taskToFillBoostingLab.resource) +
			 creep.store.getUsedCapacity(tasks.taskToFillBoostingLab.resource) +
			 creep.room.storage.store.getUsedCapacity(tasks.taskToFillBoostingLab.resource) < 100)
			return undefined;

		tasks.taskToFillBoostingLab.isToFillBoostingLab = true;
		tasks.taskToFillBoostingLab.isTask = true;
		tasks.taskToFillBoostingLab.storage_id = creep.room.storage.id;
		tasks.taskToFillBoostingLab.lab_id = lab.id;
		tasks.taskToFillBoostingLab.pos = pos;
		creep.memory.task = tasks.taskToFillBoostingLab;
		if(true) {
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, task:creep.memory.task}));
		}
    return creep.memory.task;
	}, 
	needToHarvest: function(creep, onlyCheck = true) {//return null;
		if(!onlyCheck) {
			tasks.isToFillBoostingLab(creep);
		} 

		if(creep.memory.task === undefined)
			return null;
		if(creep.memory.task.done !== undefined)
			return null;
		if(creep.memory.task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToHarvest(creep);
    return null;
	}, 
	needToTransfer: function(creep) {//return null;
		if(creep.memory.task === undefined)
			return null;
		if(creep.memory.task.done !== undefined)
			return null;
		if(creep.memory.task.isToFillBoostingLab !== undefined)
			return tasks.taskToFillBoostingLab.needToTransfer(creep);
    return null;
	}
};

module.exports = tasks;
