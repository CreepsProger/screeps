const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var tasks = {

  taskToFillBoostingLab: {
		pos:{}, 
		isTask:false,
		harvestingBy: function(creep) {
			return ERR_NOT_IN_RANGE;
		},
		transferingBy: function(creep) {
			return ERR_NOT_IN_RANGE;
		}
	},
	isToFillBoostingLab: function(creep) {
		if(Game.shard.name != 'shard1')
			return undefined;
		
		const pos = new RoomPosition(11, 25, creep.room.name);
		
		const found = pos.lookFor(LOOK_STRUCTURES);// , {(s) => s.structureType == STRUCTURE_LAB});
		if(found.length == 0)
			return undefined;
		const lab = found.reduce((p,c) => p.structureType == STRUCTURE_LAB);
		if(true) {//✅ ☑️ ✔️ ✖️ ❌ ❎ 
			console.log('✅', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify({tasks:'isToFillBoostingLab', creep:creep.name, lab:lab}));
		}
    return undefined;
	}, 
	needToHarvest: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		return false;
	}, 
	needToTransfer: function(creep) {
		if(Game.shard.name != 'shard1')
			return false;
		return false;
	}
};

module.exports = tasks;
