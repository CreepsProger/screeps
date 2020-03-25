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
		 , { from: '5e70e2cac19c1cd2f3542b55', to: '5e709d440d4f3d0d9ab5c369'}
	 ],

	 getTargetLinkToTransferEnergy: function(creep, executer, role_run, link_weight) {
		 var target;
		 if(link_weight < creep.memory.weight) {
			 var link_objs = cash.getLinks(creep.room).filter( (link) => {
					 return link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
						 			creep.pos.inRangeTo(link, 5) &&
									!!links.links.find((ft) => ft.from == link.id) &&
									// (	link.id == '5e62c05bf15a4888dff60e26' ||
									// 	link.id == '5e61d337f15a48007bf5b603' ||
									// 	link.id == '5e6778dfcfa64f5485786f84' ||
									// 	link.id == '5e5f8ed0124b9b1087db5d47' ||
									// 	link.id == '5e56dc7a28e44c6f77878b87' ||
									// 	link.id == '5e70e2cac19c1cd2f3542b55' ) &&
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

	 getTargetLinkToHarvest: function(creep, executer, role_run) {
		 var target;
		 if(true) {
			 var link_objs = cash.getLinks(creep.room).filter( (link) => {
					 return link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
					 				!!(links.links.find((ft) => ft.to == link.id)) &&
					 				tools.checkTarget(executer,link.id);
			   }
			 );
			 // var link = Game.getObjectById('5e583a7b7a54e3585a982b96');
			 // if(!target && creep.room.name == link.room.name &&
				// 	link.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				// 	tools.checkTarget(executer,link.id)) {
				//  target = tools.setTarget(creep,link,link.id,role_run);
			 // }
			 // link = Game.getObjectById('5e5ab4f1142d6b46f3c86280');
			 // if(!target && creep.room.name == link.room.name &&
				// 	link.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				// 	tools.checkTarget(executer,link.id)) {
				//  target = tools.setTarget(creep,link,link.id,role_run);
			 // }
			 // link = Game.getObjectById('5e709d440d4f3d0d9ab5c369');
			 // if(!target && creep.room.name == link.room.name &&
				// 	link.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				// 	tools.checkTarget(executer,link.id)) {
				//  target = tools.setTarget(creep,link,link.id,role_run);
			 // }
			 if(link_objs.length > 0) {
				 var link = link_objs.reduce((p,c) => tools.checkTarget(executer,p.id) &&
				 creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				 if(!!link) {
					 target = tools.setTarget(creep,link,link.id,role_run);
				 }
			 }
		 }
		 // else {
			//  var link = creep.room.find(FIND_MY_STRUCTURES, {
			// 	 filter: (structure) => {
			// 		 return (structure.structureType == STRUCTURE_LINK) &&
			// 			 (structure.id == '5e583a7b7a54e3585a982b96' ||
			// 				structure.id == '5e5ab4f1142d6b46f3c86280') &&
			// 			 structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
			// 			 tools.checkTarget(executer,structure.id);
			// 	 }
			//  });
			//  if(!!link) {
			// 	 target = tools.setTarget(creep,link,link.id,role_run);
			//  }
		 // }
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
