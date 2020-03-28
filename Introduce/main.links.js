const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var links = {

   links: [
		   { from: '5e62c05bf15a4888dff60e26', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e61d337f15a48007bf5b603', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e6778dfcfa64f5485786f84', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e56dc7a28e44c6f77878b87', to: '5e583a7b7a54e3585a982b96'}
		 , { from: '5e5f8ed0124b9b1087db5d47', to: '5e583a7b7a54e3585a982b96'}
		 , { from: '5e70e2cac19c1cd2f3542b55', to: '5e7dc9b130d83f0ebc107bf0'}
		 , { from: '5e7dd868b4377d741d9d7465', to: '5e7dc9b130d83f0ebc107bf0'}
	 ],

	 getTargetLinkToTransferEnergy: function(creep, executer, role_run, link_weight) {
		 var target;
		 if(link_weight < creep.memory.weight) {
			 var link_objs = cash.getLinks(creep.room).filter( (link) => {
					 return !!link && link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
						 			creep.pos.inRangeTo(link, 5) &&
									!!links.links.find((ft) => ft.from == link.id) &&
						 			tools.checkTarget(executer,link.id);
				 }
			 );

			 if(link_objs.length > 0) {
				 var link = link_objs.reduce((p,c) => tools.checkTarget(executer,p.id) &&
				 creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				 if(!!link) {
					 target = tools.setTarget(creep,link,link.id,role_run);
				 }
			 }
		 }

		 return target;
	 },

	 getTargetLinkToHarvest: function(creep, executer) {
		 var link;
		 var link_objs = cash.getLinks(creep.room).filter( (l) => {
				 return !!l && l.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				 				!!links.links.find((ft) => ft.to == l.id) &&
				 				tools.checkTarget(executer,l.id);
		   }
		 );
		 if(link_objs.length > 0) {
			 link = link_objs.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
		 }
		 return link;
	 },

   run: function() {
		 links.links.forEach(function(link) {
			 const from = Game.getObjectById(link.from);
			 const to = Game.getObjectById(link.to);
			 if(!!from && !!to &&
				  !!from.store && from.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					!!to.store && to.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
				 from.transferEnergy(to);
			 }
		 });
	 }
};

module.exports = links;
