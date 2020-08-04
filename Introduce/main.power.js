const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const power = {

	getConfig: function(roomName) {
		return config.getPowerConf(roomName);
	},

	run: function() {
		
		cash.getAllMyPowerSpawns()
				.filter((s) => s.store.getUsedCapacity('power') > 0 &&
												s.store.getUsedCapacity('energy') > 50)
				.forEach(function(spawn,i) {
					const err = spawn.processPower();
					if(err != OK) {
						console.log('🔴🌀⚠️', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({main:'processPower', room:spawn.room.name, err:err, spawn:spawn}));
					}
		});

		Object.keys(Game.powerCreeps)
					.forEach(function(name,i) {
						const pc = Game.powerCreeps[name];
						if(true) {
							console.log('🔴👨‍🚒', Math.trunc(Game.time/10000), Game.time%10000
												, JSON.stringify({main:'power', pc:pc}));
					}
		});
	}
};

module.exports = power
