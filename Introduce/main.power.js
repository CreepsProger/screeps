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
				.filter((s) => s.store.getUsedCapacity('power') > 0 &&
												s.store.getUsedCapacity('energy') > 50)
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
			if(true) {
				console.log('🔴👨‍🚒', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify({main:'power', pc:pc}));
			}
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
																						, err:err, pcName:pcName, powerSpawn:powerSpawn}));
						}
					}
				});
			}
			else {
				const roomName = pc.pos.roomName;
				const conf = power.getConfig(roomName,pcName);
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
						if(err != ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, pc.room.controller);
							pc.say(err? '🔜💈⚠️'+err:'🔜💈');
						}
					});
				}
				if(!!conf && !!conf.factory) {
					cash.getFactories(roomName)
						.forEach(function(factory,i) {
						const err = pc.usePower(factory);
						pc.say(err? '🏭⚠️'+err:'🏭');
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, pcName:pcName, factory:factory}));
						}
						if(err != ERR_NOT_IN_RANGE ) {
							const err = tools.moveTo(pc, factory);
							pc.say(err? '🔜🏭⚠️'+err:'🔜🏭');
						}
					});
				}
			}
		});
	}
};

module.exports = power
