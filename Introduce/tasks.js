const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var tasks = {

  taskToFillBoostingLab: {
		pos:{},
		lab:{},
		storage:{},
		isTask:false,
		harvestingBy: function(creep) {
			if(!tasks.taskToFillBoostingLab.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			return creep.withdraw(tasks.taskToFillBoostingLab.storage, RESOURCE_CATALYZED_UTRIUM_ACID,100);
		},
		transferingBy: function(creep) {
			if(!tasks.taskToFillBoostingLab.pos.inRangeTo(creep,1))
				return ERR_NOT_IN_RANGE;
			return creep.transfer(tasks.taskToFillBoostingLab.lab, RESOURCE_CATALYZED_UTRIUM_ACID);
		}
	},
	isToFillBoostingLab: function(creep) {
		if(Game.shard.name != 'shard1')
			return undefined;
		if(!creep.room.storage)
			return undefined;
		
		if(tasks.taskToFillBoostingLab.isTask)
			return tasks.taskToFillBoostingLab;
		
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

		tasks.taskToFillBoostingLab.isTask = true;
		tasks.taskToFillBoostingLab.storage = creep.room.storage;
		tasks.taskToFillBoostingLab.lab = lab;
		tasks.taskToFillBoostingLab.pos = pos;
    return tasks.taskToFillBoostingLab;
	}, 
	needToHarvest: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		if(!tasks.taskToFillBoostingLab.isTask)
			return false;
		
		const lab = tasks.taskToFillBoostingLab.lab;
		if(lab.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) +
			 creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID)  < 100) {
			tasks.taskToFillBoostingLab.pos = creep.room.storage.pos;
			return true;
		}
		
		return false;
	}, 
	needToTransfer: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		if(!tasks.taskToFillBoostingLab.isTask)
			return false;
		if(creep.store.getUsedCapacity(RESOURCE_CATALYZED_UTRIUM_ACID) > 0) {
			tasks.taskToFillBoostingLab.pos = tasks.taskToFillBoostingLab.lab.pos;
			return true;
		}

		return false;
	}
};

module.exports = tasks;
