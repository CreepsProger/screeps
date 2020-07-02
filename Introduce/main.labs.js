const constants = require('main.constants');
const terminals = require('main.terminals');
const config = require('main.config');
const tools = require('tools');
const cash = require('cash');

const labs = {

	getLabsToInOut: function(roomName) {
		const conf = config.getLabsConfig(roomName);
    return  cash.getLabs(roomName)
								.map((lab,i) => new {lab:lab, resource:'XGH2O'}) 
  },

	getLabsToIn: function(roomName, res) {
    return  labs.getLabsToInOut(creep.room.name)
								.filter((l) =>  (!l.mineralType || (l.mineralType == res && l.store.getUsedCapacity(res) < 500)))[0];
  },

  getLabsToRun: function() {
		return terminals.getAllMyTerminalsToSpread()
                    .map((t) => cash.getLabs(t.pos.roomName))
                    .filter((arr) => Array.isArray(arr) && arr.length > 0)/*
                    .flat()*/
                    .reduce((a, b) => a.concat(b), [])
                    .filter((l) => !!l && !!l);
  },
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_LAB_RUN != 0)
      return;
      
    const labsToRun = labs.getLabsToRun();
    console.log('⚗️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify( { "labs":'run', length:labsToRun.length, labsToRun:labsToRun})); 
	 }
};

module.exports = labs
