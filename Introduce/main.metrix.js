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
			Memory.totals = { CreepsNumber: 0
											 , Capacity: 0
											 , FreeCapacity: 0
											 , UsedCapacity: 0
											 , hits: 0
											 , hitsMax: 0
											 , WORK: 0
											 , CARRY: 0
											 , MOVE: 0};

			Memory.CreepsNumberByType = {};
			metrix.updateMovingAverage(Memory.harvestersMovements.Value);
			metrix.updateMovingAverage(Memory.harvestersMovements.Count);
			metrix.updateMovingAverage(Memory.harvestersMovements.Avg);
		}

		if(Game.time % config.ticksToCheckCreepsNumber == 0) {
//          var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
			Memory.totals.CreepsNumber = 0;

			for(var name in Game.creeps) {
				var creep = Game.creeps[name];
				const full_type = '' + creep.memory.type+'/'+creep.memory.weight;

				if(!Memory.CreepsNumberByType[full_type])
					Memory.CreepsNumberByType[full_type] = 0;

				Memory.CreepsNumberByType[full_type]++;
				Memory.totals.CreepsNumber += 1;
				Memory.totals.Capacity += creep.store.getCapacity();
				Memory.totals.FreeCapacity += creep.store.getFreeCapacity();
				Memory.totals.UsedCapacity += creep.store.getUsedCapacity();
				Memory.totals.hits += creep.hits;
				Memory.totals.hitsMax += creep.hitsMax;
				Memory.totals.WORK += creep.getActiveBodyparts(WORK);
				Memory.totals.CARRY += creep.getActiveBodyparts(CARRY);
				Memory.totals.MOVE += creep.getActiveBodyparts(MOVE);

				if(Game.flags['LWE'] || Game.flags['LW'] || Game.flags['L']) {
					console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
											, creep.name
											, 'work_efficiency(12):'
											, flags.work_efficiency(creep.memory.type,12)
											, 'work_efficiency(24):'
											, flags.work_efficiency(creep.memory.type,24)
										 );
				}
			}

			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, 'Creeps Number:'
                  , Memory.totals.CreepsNumber
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
                  , JSON.stringify(Memory.CreepsNumberByType));
		}

		if(Game.time % (config.ticksToCheckCreepsNumber * 20) == 0) {
			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, JSON.stringify(BODYPARTS_ALL));
		}

		if(Game.time % (config.ticksToCheckCreepsNumber * 1000) == 0) {
			console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
									, JSON.stringify(RESOURCES_ALL));
		}

	}
};

module.exports = metrix;
