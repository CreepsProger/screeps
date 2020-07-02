const constants = require('main.constants');
const terminals = require('main.terminals');
const tools = require('tools');
const cash = require('cash');

const labs = {

	getLabsToInOut: function(roomName) {
    return cash.getLabs(roomName).filter((l) => !!l && !!l.my && !!l.store);
  },
	
	getLabToIn: function(creep, res) {
    return labs.getLabsToInOut(creep.room).filter((l) => !!l);
  },

  getLabsToRun: function() {
		return = terminals.getAllMyTerminalsToSpread()
                      .map((t) => cash.getLabs(t.pos.roomName))
                      .flat()
                      .filter((l) => !!l && !!l.my && !!l.store);
  },
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_LAB_RUN != 0)
      return;
      
    const labs = labs.getLabsToRun();
    console.log('⚗️🧪🔬🧬🧫', Math.trunc(Game.time/10000), Game.time%10000
                            , JSON.stringify( { labs:'run', length:labs.length, labs:labs}); 
	 }
};

module.exports = labs
