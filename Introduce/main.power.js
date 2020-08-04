const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const power = {

	getConfig: function(roomName) {
		return config.getPowerConfig(roomName);
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
			.forEach(function(name,i) {

			const pc = Game.powerCreeps[name];
			if(true) {
				console.log('🔴👨‍🚒', Math.trunc(Game.time/10000), Game.time%10000
										, JSON.stringify({main:'power', pc:pc}));
			}
			if(!pc.ticksToLive) {
				cash.getAllMyPowerSpawns()
					.forEach(function(powerSpawn,i) {
					const roomName = powerSpawn.pos.roomName;
					const conf = power.getConfig(roomName,name);
					if(!!conf && conf.spawn) {
						const err = pc.spawn(powerSpawn);
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'spawnPower', room:roomName
																						, err:err, name:name, powerSpawn:powerSpawn}));
						}
					}
				});
			}
			else {
				const roomName = pc.pos.roomName;
				const conf = power.getConfig(roomName,name);
				if(!!conf && conf.factory) {
					cash.getFactories(roomName)
						.forEach(function(factory,i) {
						const err = pc.usePower(factory);
						if(err != OK) {
							console.log('🔴👨‍🚒⚠️', Math.trunc(Game.time/10000), Game.time%10000
													, JSON.stringify( { main:'usePower', room:roomName
																						 , err:err, name:name, factory:factory}));
						}
					});
				}
			}
		});
	}
};

module.exports = power
