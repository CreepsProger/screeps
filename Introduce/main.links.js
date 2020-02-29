const constants = require('main.constants');

var links = {
    
   run: function() {
		 {
	     const linkFrom = Game.getObjectById('5e56dc7a28e44c6f77878b87');
		   const linkTo = Game.getObjectById('5e583a7b7a54e3585a982b96');
	  	 linkFrom.transferEnergy(linkTo);
		 }
		 {
	     const linkFrom = Game.getObjectById('5e5ab771eadd04714b92ed7d');
		   const linkTo = Game.getObjectById('5e5ab4f1142d6b46f3c86280');
	  	 linkFrom.transferEnergy(linkTo);
		 }
	 }
};

module.exports = links;
