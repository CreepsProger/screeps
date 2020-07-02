const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

const labs = {

	getLabsToInOut: function() {
    return cash.getLabs(creep.room).filter((l) => !!l && !!l.my && !!l.store);
  },

  getLabsToRun: function() {
    return cash.getLabs(creep.room).filter((l) => !!l && !!l.my && !!l.store); 
  },
  
  run: function() { 
    if(Game.time % constants.TICKS_TO_LAB_RUN != 0)
      return;
      
    const labs = labs.getLabsToRun();
    console.log('⚗️🧪🔬🧬🧫', Math.trunc(Game.time/10000), Game.time%10000
                            , JSON.stringify( { labs:'run', labs:labs}); 
	 }
};

module.exports = labs
