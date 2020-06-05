const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var tasks = {

  taskToFillBoostingLab: {
		isToFillBoostingLab:true, isTask:true, 
		pos:{},
		lab:{},
		storage:{},
		harvestingBy: function(creep) {
			if(!creep.memory.task.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			return creep.withdraw(creep.memory.task.storage, RESOURCE_CATALYZED_UTRIUM_ACID,100);
		},
		transferingBy: function(creep) {
			if(!creep.memory.task.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			return creep.transfer(creep.memory.task.lab, RESOURCE_CATALYZED_UTRIUM_ACID);
		}
	},
	isToFillBoostingLab: function(creep) {
		if(Game.shard.name != 'shard1')
			return undefined;
		if(!creep.room.storage)
			return undefined;
		
		//return undefined;// TODO: TypeError: creep.memory.task.pos.inRangeTo is not a function
    //at Object.harvestingBy (tasks:14:30)
		if(!!creep.memory.task && !!creep.memory.task.isToFillBoostingLab)
			return creep.memory.task;
		
		const pos = new RoomPosition(11, 25, creep.room.name);
		
		const found = pos.lookFor(LOOK_STRUCTURES);// , {(s) => s.structureType == STRUCTURE_LAB});
		if(found.length == 0)
			return undefined;
		const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
		if(!lab)
			return undefined;
		if(true) {//✅ ☑️ ✔️ ✖️ ❌ ❎ 
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({tasks:'isToFillBoostingLab', creep:creep.name, lab:lab}));
		}
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) == 100)
			return undefined;
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.room.storage.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) < 100)
			return undefined;

		tasks.taskToFillBoostingLab.isToFillBoostingLab = true;
		tasks.taskToFillBoostingLab.isTask = true;
		tasks.taskToFillBoostingLab.storage = creep.room.storage;
		tasks.taskToFillBoostingLab.lab = lab;
		tasks.taskToFillBoostingLab.pos = pos;
		creep.memory.task = tasks.taskToFillBoostingLab;
    return creep.memory.task;
	}, 
	needToHarvest: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		if(!creep.memory.task)
			return false;
		if(!creep.memory.task.isTask)
			return false;
		
		const lab = creep.memory.task.lab;
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID)  < 100) {
			creep.memory.task.pos = creep.room.storage.pos;
			return true;
		}
		
		return false;
	}, 
	needToTransfer: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		if(!creep.memory.task)
			return false;
		if(!creep.memory.task.isTask)
			return false;

		if(creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) > 0) {
			creep.memory.task.pos = creep.memory.task.lab.pos;
			return true;
		}

		return false;
	}
};

module.exports = tasks;
