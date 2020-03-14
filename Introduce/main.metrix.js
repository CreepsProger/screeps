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

	cpu:
	{
		step: function(creep, role, step) {
			const dt = Math.round((Game.cpu.getUsed() - Memory.cpu.step.t) * 100)/100;
			if(dt > Memory.cpu.step.dt) {
				Memory.cpu.step.dt = dt;
				Memory.cpu.step.creep = creep;
				Memory.cpu.step.role = role;
				Memory.cpu.step.step = step;
				if(Memory.cpu.step.dt > 1) {
					console.log( '⏳', Memory.cpu.step.dt, Memory.cpu.step.creep, Memory.cpu.step.role, Memory.cpu.step.step);
				}
			}
			Memory.cpu.step.t = Game.cpu.getUsed();
		},

		role: function(creep, role) {
			metrix.cpu.step(creep, role, 'end');

			const dt = Math.round((Game.cpu.getUsed() - Memory.cpu.t_role) * 100)/100;
			if(dt > Memory.cpu.dt_max_role) {
				Memory.cpu.dt_max_role = dt;
				Memory.cpu.role_max = role;
				Memory.cpu.role_creep_max = creep.name;
				if(Memory.cpu.dt_max_role > 1) {
					console.log( '⏳', Memory.cpu.dt_max_role, Memory.cpu.role_creep_max, Memory.cpu.role_max);
				}
			}
		Memory.cpu.t_role = Game.cpu.getUsed();
		},

		creep: function(creep) {
			const dt = Math.round((Game.cpu.getUsed() - Memory.cpu.t) * 100)/100;
			if(dt > Memory.cpu.dt_max) {
				Memory.cpu.dt_max = dt;
				Memory.cpu.name_max = creep.name;
				if(Memory.cpu.dt_max > 2){
					console.log( '⏳', Memory.cpu.dt_max, Memory.cpu.name_max);
				}
			}
			Memory.cpu.t = Game.cpu.getUsed();
		}
	},

	run: function() {

		if(Game.time % config.ticksToCheckCreepsNumber == 0) {

			Memory.totals = { CreepsNumber: 0, NeedsCreeps: 0, NeedsPlusCreeps: 0
											 , Bodys : 0, NeedsBodys: 0
											 , Cost: 0, NeedsCost: 0
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
		Memory.totals.NeedsBodys = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].bodys,0);
		Memory.totals.NeedsCost = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].cost,0);

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
									, '' + Memory.totals.Bodys + '/' + Memory.totals.NeedsBodys
									,'Cost:'
									, '' + Memory.totals.Cost + '/' + Memory.totals.NeedsCost
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
