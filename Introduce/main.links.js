const tools = require('tools');
const constants = require('main.constants');

var links = {

   links: [
		   { from: '5e62c05bf15a4888dff60e26', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e61d337f15a48007bf5b603', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e56dc7a28e44c6f77878b87', to: '5e583a7b7a54e3585a982b96'}
		 , { from: '5e5f8ed0124b9b1087db5d47', to: '5e583a7b7a54e3585a982b96'}
	 ],

	 getTargetLinkToHarvest: function(creep,executer) {
		 var target;
		 var link = creep.pos.findClosestByPath(FIND_STRUCTURES, {
			 filter: (structure) => {
				 return (structure.structureType == STRUCTURE_LINK) &&
					 (structure.id == '5e583a7b7a54e3585a982b96' ||
						structure.id == '5e5ab4f1142d6b46f3c86280') &&
					 structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
						 tools.checkTarget(executer,structure.id);
			 }
		 });
		 if(!!link) {
			 target = tools.setTarget(creep,link,link.id,role.run);
		 }
		 return target;
	 },

   run: function() {
		 links.links.forEach(function(link) {
			 const from = Game.getObjectById(link.from);
			 const to = Game.getObjectById(link.to);
			 if(!!from && !!to) {
				 from.transferEnergy(to);
			 }
		 });
	 }
};

module.exports = links;
