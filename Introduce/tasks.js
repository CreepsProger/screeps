const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

//✅ ☑️ ✔️ ✖️ ❌ ❎ 

var tasks = {

  taskToFillBoostingLab: {
		isToFillBoostingLab:true, isTask:false, 
		pos:{},
		lab_id:{},
		storage_id:{},
		needToHarvest: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
				 creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID)  < 100) {
				creep.memory.task.pos = creep.room.storage.pos;
				return tasks.taskToFillBoostingLab;
			}
			creep.memory.task.done = true;
			creep.memory.task.isTask = false;
			tasks.taskToFillBoostingLab.isTask = false;
			if(true) {
				console.log('✔️', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({creep:creep.name, task:creep.memory.task}));
			}
			return null;
		},
		harvestingBy: function(creep) {
			if(!creep.memory.task.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'harvestingBy', creep:creep.name, task:creep.memory.task}));
			const storage = Game.getObjectById(creep.memory.task.storage_id);
			return creep.withdraw(storage, RESOURCE_CATALYZED_UTRIUM_ACID,100);
		},
		needToTransfer: function(creep) {
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			if(creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) > 0) {
				creep.memory.task.pos = lab.pos;
				return tasks.taskToFillBoostingLab;
			}
			return null;
		},
		transferingBy: function(creep) {
			if(!creep.memory.task.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({do:'transferingBy', creep:creep.name, task:creep.memory.task}));
			const storage = Game.getObjectById(creep.memory.task.storage_id);
			const lab = Game.getObjectById(creep.memory.task.lab_id);
			return creep.transfer(lab, RESOURCE_CATALYZED_UTRIUM_ACID);
		}
	},
	isToFillBoostingLab: function(creep) {
		if(Game.shard.name != 'shard1')
			return undefined;
		if(!creep.room.storage)
			return undefined;
		
		//creep.memory.task = null;
		
		//return undefined;// TODO: TypeError: creep.memory.task.pos.inRangeTo is not a function
    //at Object.harvestingBy (tasks:14:30)
		if(creep.memory.task !== undefined &&
			 creep.memory.task.isToFillBoostingLab !== undefined &&
			 creep.memory.task.isTask)
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
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) == 100)
			return undefined;
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.room.storage.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) < 100)
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
	needToHarvest: function(creep, onlyCheck = true) {
		if(!onlyCheck) {
			tasks.isToFillBoostingLab(creep);
		} 

		if(creep.memory.task === undefined)
			return false;
		if(creep.memory.task.isTask === undefined)
			return false;
		if(!creep.memory.task.isTask)
			return false;
		return tasks.taskToFillBoostingLab.needToHarvest(creep);
	}, 
	needToTransfer: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		if(creep.memory.task === undefined)
			return false;
		if(creep.memory.task.isTask === undefined)
			return false;
		if(!creep.memory.task.isTask)
			return false;
		return tasks.taskToFillBoostingLab.needToTransfer(creep);
	}
};

module.exports = tasks;
