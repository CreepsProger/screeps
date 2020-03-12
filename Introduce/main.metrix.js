const constants = require('main.constants');
const config = require('main.config');
const log = require('main.log');


var metrix = {

	updateMovingAverage: function(x) {
		//    console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
		//                    , 'updateMovingAverage');
		x.movingAverage.delta = x.v - x.movingAverage.vs[x.movingAverage.i];
		x.movingAverage.summ += x.movingAverage.delta;
		x.movingAverage.ma = x.movingAverage.summ / x.movingAverage.vs.length;
		x.movingAverage.vs[x.movingAverage.i] = x.v;
		x.movingAverage.i = (x.movingAverage.i + 1) % x.movingAverage.vs.length;
	},

	run: function() {

		if(Game.time % config.ticksToCheckCreepsNumber == 0) {

			Memory.totals = { CreepsNumber: 0, NeedsCreeps: 0, NeedsPlusCreeps: 0
											 , Cost: 0, NeedsCost: 0
											 , Bodys : 0, NeedsBodys: 0
											 , Capacity: 0
											 , FreeCapacity: 0
											 , UsedCapacity: 0
											 , hits: 0
											 , hitsMax: 0
											 , WORK: 0
											 , CARRY: 0
											 , MOVE: 0};

			Memory.CreepsNumberByType = {};
			Memory.CreepsNumberByWeight = {};
			Memory.CreepsMinTicksToLive = {};
			metrix.updateMovingAverage(Memory.harvestersMovements.Value);
			metrix.updateMovingAverage(Memory.harvestersMovements.Count);
			metrix.updateMovingAverage(Memory.harvestersMovements.Avg);
		}

		Memory.totals.NeedsCreeps = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].needs,0);
		Memory.totals.NeedsPlusCreeps = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].needs_plus,0);

		if(Game.time % config.ticksToCheckCreepsNumber == 0) {
//          var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
			Memory.totals.CreepsNumber = 0;

			for(var name in Game.creeps) {
				var creep = Game.creeps[name];
				const full_type = '' + creep.memory.type+'/'+creep.memory.weight;

				if(!Memory.CreepsNumberByType[full_type])
					Memory.CreepsNumberByType[full_type] = 0;

				if(!Memory.CreepsNumberByWeight[creep.memory.weight])
					Memory.CreepsNumberByWeight[creep.memory.weight] = 0;
				
				if(!Memory.CreepsMinTicksToLive[creep.memory.weight])
					Memory.CreepsMinTicksToLive[creep.memory.weight] = 1500;
				
				Memory.CreepsNumberByType[full_type]++;
				Memory.CreepsNumberByWeight[creep.memory.weight]++;
				if((!!creep.ticksToLive?creep.ticksToLive:1500) < Memory.CreepsMinTicksToLive[creep.memory.weight]) {
					Memory.CreepsMinTicksToLive[creep.memory.weight] = 
						{ mittl: creep.ticksToLive
						, pos: creep.pos
						};
				}
				Memory.totals.CreepsNumber += 1;				
				Memory.totals.Cost += !!creep.memory.cost? creep.memory.cost:0;
				Memory.totals.Bodys += creep.body.length;
				Memory.totals.Capacity += creep.store.getCapacity();
				Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
				Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
				Memory.totals.hits += creep.hits;
				Memory.totals.hitsMax += creep.hitsMax;
				Memory.totals.WORK += creep.getActiveBodyparts(WORK);
				Memory.totals.CARRY += creep.getActiveBodyparts(CARRY);
				Memory.totals.MOVE += creep.getActiveBodyparts(MOVE);
			}
		}
	},
	
	output: function() {
		
		if(Game.time % config.ticksToCheckCreepsNumber == 0) {
			if(Game.flags['LWE'] || Game.flags['LW'] || Game.flags['L']) {
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, creep.name
										, 'work_efficiency(12):'
										, flags.work_efficiency(creep.memory.type,12)
										, 'work_efficiency(24):'
										, flags.work_efficiency(creep.memory.type,24)
									 );
			}

			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'Creeps:'
									, '' + Memory.totals.CreepsNumber + '/' + Memory.totals.NeedsCreeps + '/' + Memory.totals.NeedsPlusCreeps
									,'Body:'
									, Memory.totals.Bodys
									,'Cost:'
									, Memory.totals.Cost
									, 'h/hM:'
									, Memory.totals.hits
									, Memory.totals.hitsMax
									, 'C/FC/UC:'
									, Memory.totals.Capacity
									, Memory.totals.FreeCapacity
									, Memory.totals.UsedCapacity
									, 'W/C/M:'
									, Memory.totals.WORK
									, Memory.totals.CARRY
									, Memory.totals.MOVE
		// 									, 'EA/ECA'
		// 									, Spawn.room.energyAvailable
		// 									, Spawn.room.energyCapacityAvailable
		//                   , 'hmV/hmC/hmA:'
		//                   , Memory.harvestersMovements.Value.v
		//                   , Memory.harvestersMovements.Count.v
		//                   , Memory.harvestersMovements.Avg.v
		//                   , 'hmVd/hmCd/hmdA/hmAd:'
		//                   , Memory.harvestersMovements.Value.movingAverage.delta
		//                   , Memory.harvestersMovements.Count.movingAverage.delta
		//                   , Math.floor(Memory.harvestersMovements.Value.movingAverage.delta / Memory.harvestersMovements.Count.movingAverage.delta)
		//                   , Memory.harvestersMovements.Avg.movingAverage.delta
									, JSON.stringify(Memory.CreepsNumberByWeight)
									, JSON.stringify(Memory.CreepsNumberByType)
									, JSON.stringify(Memory.CreepsMinTicksToLive)
								 );
			if(Game.time % (config.ticksToCheckCreepsNumber * 20) == 0) {
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(BODYPARTS_ALL));
			}
			
			if(Game.time % (config.ticksToCheckCreepsNumber * 1000) == 0) {
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(RESOURCES_ALL));
			}
		}
	}
		
};

module.exports = metrix;
