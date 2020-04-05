const constants = require('main.constants');
const log = require('main.log');
const tools = require('tools');

var metrix = {

	idle: function(creep) {
		if(!Memory.CreepsIdleTicksByWeight) {
			Memory.CreepsIdleTicksByWeight = {};
		}
		if(!Memory.CreepsIdleTicksByWeight[creep.memory.weight]) {
			Memory.CreepsIdleTicksByWeight[creep.memory.weight] = {};
		}
		if(!Memory.CreepsIdleTicksByWeight[creep.memory.weight][creep.memory.n]) {
			Memory.CreepsIdleTicksByWeight[creep.memory.weight][creep.memory.n] = {};
		}
		if(!creep.memory.idle_time) {
			creep.memory.idle = 0;
			creep.memory.idle_time = 0;
		}
		if(creep.memory.idle_time != Game.time) {
			creep.memory.idle_time = Game.time;
			creep.memory.idle++;
			const livedTicks = (creep.getActiveBodyparts(CLAIM) > 0 ? 600:1500)-creep.ticksToLive;
			const percent = Math.round(100*creep.memory.idle/(!livedTicks?1:livedTicks));
			Memory.CreepsIdleTicksByWeight[creep.memory.weight][creep.memory.n] = {i:creep.memory.idle, lt:livedTicks, pc:percent, w:creep.memory.weight};
		}
	},

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
		time: function(cpu_time, limit, creep = undefined, role = undefined, step = undefined) {
			cpu_time.dt = Math.round((Game.cpu.getUsed() - cpu_time.t) * 1000)/1000;
			if(cpu_time.dt > cpu_time.max_dt) {
				cpu_time.max_dt = cpu_time.dt;
				if(!!creep)
				 	cpu_time.creep = creep.name;
				if(!!role)
				  	cpu_time.role = role;
				if(!!step)
				  	cpu_time.step = step;
				if(cpu_time.dt > limit) {
					// console.log( '⏳', cpu_time.dt, cpu_time.creep, cpu_time.role, cpu_time.step);
					console.log( '⏳', Math.trunc(Game.time/10000), Game.time%10000
											, JSON.stringify(cpu_time)
											, Memory.cpu.creep.n
											, JSON.stringify(creep.pos));
				}
			}
			cpu_time.t = Math.round((Game.cpu.getUsed()) * 1000)/1000;
		},

		step_time: function(creep, role, step) {
			// return;
			metrix.cpu.time(Memory.cpu.step, constants.CPU_LIMIT_OF_CREEP_ROLE_STEP_RUN, creep, role, step);
		},

		role_time: function(creep, role) {
			metrix.cpu.step_time(creep, role, 'end step');
			// return;
			metrix.cpu.time(Memory.cpu.role, constants.CPU_LIMIT_OF_CREEP_ROLE_RUN, creep, role);
			if(!creep.memory.cpu)
				creep.memory.cpu = {};
			if(!creep.memory.cpu[role] || typeof creep.memory.cpu[role] !== 'number')
				creep.memory.cpu[role] = 0;
			creep.memory.cpu[role] = Math.round((creep.memory.cpu[role] + Memory.cpu.role.dt) * 1000)/1000
		},

		creep_time: function(creep) {
			metrix.cpu.role_time(creep, 'end role');
			// return;
			metrix.cpu.time(Memory.cpu.creep, constants.CPU_LIMIT_OF_CREEP_RUN, creep);
			Memory.cpu.creep.n++;
		}
	},

	run: function() {

		if(Game.time % constants.TICKS_TO_CHECK_CREEPS_NUMBER == 0) {

			Memory.totals = { CreepsNumber: 0, SpawningCreeps:0, NeedsCreeps: 0, NeedsPlusCreeps: 0
											 , Bodys : 0, NeedsBodys: 0
											 , Cost: 0, NeedsCost: 0
											 , ticksToLive: 0
											 , livedTicks: 0
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
			// metrix.updateMovingAverage(Memory.harvestersMovements.Value);
			// metrix.updateMovingAverage(Memory.harvestersMovements.Count);
			// metrix.updateMovingAverage(Memory.harvestersMovements.Avg);

			Memory.totals.NeedsCreeps = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].needs,0);
			Memory.totals.NeedsPlusCreeps = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].needs_plus,0);
			Memory.totals.NeedsBodys = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].bodys,0);
			Memory.totals.NeedsCost = Object.keys(Memory.CreepsNeedsByWeight).reduce((p,c) => p + Memory.CreepsNeedsByWeight[c].cost,0);
		}

		if(Game.time % constants.TICKS_TO_CHECK_CREEPS_NUMBER == 0) {
//          var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == 'creep');
			Memory.totals.CreepsNumber = 0;
			Memory.totals.SpawningCreeps = 0;

			for(var name in Game.creeps) {
				var creep = Game.creeps[name];
				const full_type = '' + creep.memory.type+'/'+creep.memory.weight;

				if(!Memory.CreepsNumberByType[full_type])
					Memory.CreepsNumberByType[full_type] = 0;

				if(!Memory.CreepsIdleTicksByWeight[creep.memory.weight])
					Memory.CreepsIdleTicksByWeight[creep.memory.weight] = 0;

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
				if(creep.spawning) Memory.totals.SpawningCreeps += 1;
				Memory.totals.Cost += !!creep.memory.cost? creep.memory.cost:0;
				Memory.totals.Bodys += creep.body.length;
				Memory.totals.ticksToLive += !creep.ticksToLive?0:creep.ticksToLive;
				Memory.totals.livedTicks += 1500-(!creep.ticksToLive?0:creep.ticksToLive);
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

		if(Game.time % constants.TICKS_TO_CHECK_CREEPS_NUMBER == 0) {
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
									, '🤖 CREEPS:'
									, '' + Memory.totals.CreepsNumber - Memory.totals.SpawningCreeps + (!Memory.totals.SpawningCreeps?'':'(' + Memory.totals.SpawningCreeps +')') + '/' + Memory.totals.NeedsCreeps + '/' + Memory.totals.NeedsPlusCreeps
									,'lt/ttl:'
									, '' + Memory.totals.livedTicks + '/'+ Memory.totals.ticksToLive
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
									, JSON.stringify(Memory.CreepsNumberByWeight)
									, JSON.stringify(Memory.CreepsNumberByType)
									, JSON.stringify(Memory.CreepsMinTicksToLive)
								 );
			if(Game.time % (constants.TICKS_TO_CHECK_CREEPS_NUMBER * 20) == 0) {
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(BODYPARTS_ALL));
			}

			if(Game.time % (constants.TICKS_TO_CHECK_CREEPS_NUMBER * 1000) == 0) {
				console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify(RESOURCES_ALL));
			}
		}
	}

};

module.exports = metrix;
