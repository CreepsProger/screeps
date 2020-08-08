const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const power = {

	getConfig: function(roomName,pcName) {
		return config.getPowerConfig(roomName, pcName);
	},

	run: function() {
		
		cash.getAllMyPowerSpawns()
				.filter((s) => s.store.getUsedCapacity(RESOURCE_POWER) > 0 &&
												s.store.getUsedCapacity(RESOURCE_ENERGY) > 50)
				.forEach(function(powerSpawn,i) {
					const err = powerSpawn.processPower();
					if(err != OK) {
						console.log('🔴🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({main:'processPower', room:powerSpawn.room.name, err:err, powerSpawn:powerSpawn}));
					}
		});

		Object
			.keys(Game.powerCreeps)
			.forEach(function(pcName,i) {

			const pc = Game.powerCreeps[pcName];
			if(false) {
				console.log('🔴👨‍🚒', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify({main:'power', pc:pc}));
			}
			const roomName = !!pc.pos?pc.pos.roomName:'##';
			const conf = power.getConfig(roomName,pcName);
			if(!pc.ticksToLive) {
				cash.getAllMyPowerSpawns()
					.forEach(function(powerSpawn,i) {
					const roomName = powerSpawn.pos.roomName;
					const conf = power.getConfig(roomName,pcName);
					if(!!conf && !!conf.spawn) {
						const err = pc.spawn(powerSpawn);
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'spawn', room:roomName
																						, err:err, pcName:pcName, powerSpawn:powerSpawn, pc:pc}));
						}
					}
				});
			}
			else if(!!conf && (!!conf.renew || !!conf.n || !!conf.oflrn) && pc.ticksToLive < 500) {
				cash.getPowerSpawns(pc.pos.roomName)
					.forEach(function(powerSpawn,i) {
					const err = pc.renew(powerSpawn);
					pc.say(err? '👨‍🚒⚠️'+err:'👨‍🚒');
					if(err != OK) {
						console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { main:'withdrawOps', room:pc.pos.roomName
																					, err:err, pcName:pcName, powerSpawn:powerSpawn}));
					}
					if(err == ERR_NOT_IN_RANGE ) {
						const err = tools.moveTo(pc, powerSpawn);
						pc.say(err? '🔜👨‍🚒⚠️'+err:'🔜👨‍🚒');
						return;
					}
				});
			}
			else {
				if(pc.store.getUsedCapacity(RESOURCE_OPS) < 200 &&
					 !!pc.room.storage &&
					 !!pc.room.storage.my &&
					 !!pc.room.storage.store &&
					 pc.room.storage.store.getUsedCapacity(RESOURCE_OPS) > 0) {
					const amount = Math.min(200-pc.store.getUsedCapacity(RESOURCE_OPS),pc.room.storage.store.getUsedCapacity(RESOURCE_OPS));
					const err = pc.withdraw(pc.room.storage, RESOURCE_OPS, amount);
					pc.say(err? '🏨➡️♉⚠️'+err:'🏨➡️♉');
					if(err != OK) {
						console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { main:'withdrawOps', room:pc.pos.roomName
																					, err:err, pcName:pcName, storage:pc.room.storage}));
					}
					if(err == ERR_NOT_IN_RANGE ) {
						const err = tools.moveTo(pc, pc.room.storage);
						pc.say(err? '🔜🏨➡️♉⚠️'+err:'🔜🏨➡️♉');
						return;
					}
				}
				if(pc.store.getUsedCapacity(RESOURCE_OPS) > 300 &&
					 !!pc.room.storage &&
					 !!pc.room.storage.my &&
					 !!pc.room.storage.store &&
					 pc.room.storage.store.getFreeCapacity(RESOURCE_OPS) > 0) {
					const amount = Math.min(pc.store.getUsedCapacity(RESOURCE_OPS)-200,pc.room.storage.store.getFreeCapacity(RESOURCE_OPS));
					const err = pc.transfer(pc.room.storage, RESOURCE_OPS, amount);
					pc.say(err? '♉➡️🏨⚠️'+err:'♉➡️🏨');
					if(err != OK) {
						console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify( { main:'transferOps', room:pc.pos.roomName
																					, err:err, pcName:pcName, storage:pc.room.storage}));
					}
					if(err == ERR_NOT_IN_RANGE ) {
						const err = tools.moveTo(pc, pc.room.storage);
						pc.say(err? '🔜♉➡️🏨⚠️'+err:'🔜♉➡️🏨');
						return;
					}
				}
				if(!!conf && !!conf.enableRoom &&
					 !!pc.room.controller &&
					 !!pc.room.controller.my &&
					 !pc.room.controller.isPowerEnabled) {
					cash.getFactories(roomName)
						.forEach(function(factory,i) {
						const err = pc.enableRoom(pc.room.controller);
						pc.say(err? '💈⚠️'+err:'💈');
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'enableRoom', room:roomName
																						 , err:err, pcName:pcName, controller:pc.room.controller}));
						}
						if(err == ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, pc.room.controller);
							pc.say(err? '🔜💈⚠️'+err:'🔜💈');
						}
					});
				}
				var PWR = PWR_OPERATE_FACTORY;
				var time = tools.time.power.factory;
				if(Game.time > time.on &&
					 !!pc.powers[PWR] &&
					 !!conf && (!!conf.factory || !!conf.f)) {
					if(!!pc.powers[PWR].cooldown) {
						tools.timeOn(time, pc.powers[PWR].cooldown);
						return;
					}
					cash.getFactories(roomName)
						.forEach(function(factory,i) {//"effects":[{"power":19,"effect":19,"level":2,"ticksRemaining":923}],
						if(!!factory.cooldown) {
								tools.timeOn(time, factory.cooldown); 
								return;
						}
						if(!!factory.effects) {
							const effect = factory.effects.find((e) => e.effect == PWR && e.ticksRemaining > 0);
							if(!!effect) {
								tools.timeOn(time, effect.ticksRemaining);
								return;
							}
						}
						tools.timeOn(time);
						const err = pc.usePower(PWR, factory);
						pc.say(err? '🏭⚠️'+err:'🏭');
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, pcName:pcName, factory:factory}));
						}
						if(err == ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, factory);
							pc.say(err? '🔜🏭⚠️'+err:'🔜🏭');
							return;
						}
					});
				}//power.use(PWR_REGEN_SOURCE, !!conf && (!!conf.sources || !!conf.r), tools.time.power.source);
				PWR = PWR_REGEN_SOURCE;
				time = tools.time.power.source;
				if(Game.time > time.on &&
					 !!pc.powers[PWR] &&
					 !!conf && (!!conf.sources || !!conf.s)) {
					if(!!pc.powers[PWR].cooldown) {
						tools.timeOn(time, pc.powers[PWR].cooldown);
						return;
					}
					cash.getSources(roomName)
						.forEach(function(source,i) {
						if(!!source.effects) {
							const effect = source.effects.find((e) => e.effect == PWR && e.ticksRemaining > 0);
							if(!!effect) {
								tools.timeOn(time, effect.ticksRemaining);
								return;
							}
						}
						if(!!source.energy && tooos.nvl(source.ticksToRegeneration,0) > 250)
							return;
						tools.timeOn(time);
						const err = pc.usePower(PWR, source);
						pc.say(err? '⚡⚠️'+err:'⚡');
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, pcName:pcName, source:source}));
						}
						if(err == ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, source);
							pc.say(err? '🔜⚡⚠️'+err:'🔜⚡');
							return;
						}
					});
				}
				if(!!conf && (!!conf.labs || !!conf.l || !!conf.oflr || !!conf.oflrn) &&
					 !!pc.powers[PWR_OPERATE_LAB] &&
					 !pc.powers[PWR_OPERATE_LAB].cooldown) {
					cash.getLabs(roomName)
						.forEach(function(lab,i) {
						//if(!!factory.effects && factory.effects.find(PWR_OPERATE_FACTORY))
						const err = pc.usePower(PWR_OPERATE_LAB, lab);
						pc.say(err? '⚗️⚠️'+err:'⚗️');
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, pcName:pcName, lab:lab}));
						}
						if(err == ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, lab);
							pc.say(err? '🔜⚗️⚠️'+err:'🔜⚗️');
							return;
						}
					});
				}
				if(!!conf && (!!conf.ops || !!conf.o || !!conf.oflr || !!conf.oflrn) &&
					 !!pc.powers[PWR_GENERATE_OPS] &&
					 !pc.powers[PWR_GENERATE_OPS].cooldown) {
					const err = pc.usePower(PWR_GENERATE_OPS);
					pc.say(err? '♉⚠️'+err:'♉');
					if(err != OK) {
						console.log('🔴👨‍🚒♉⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, pcName:pcName, pc:pc}));
					}
				}
				
			}
		});
	}
};

module.exports = power
