const constants = require('main.constants');
const config = require('main.config');
const flags = require('main.flags');

// C1         C2         C3     T1  T2  T3
// C1(T1)
//            C2(T1,C1(T2))
//                       C3(T1,C2(T3))
//=========================
// C1->T2     C2->T3     C3->T1

var tools = {
	
	checkTarget: function(executer,id) {
		return (executer === undefined)? true:Memory.targets[id] === undefined;
	},
	
	setTarget: function(creep,target,id,run) {
		 var mytarget;

		 if(!!target &&
				!!id &&
				Memory.targets[id] !== undefined) {
			 var creep2 = Game.getObjectById(Memory.targets[id]);
			 if(creep2 !== undefined) {
				 var path2 = creep2.pos.findPathTo(target);
				 var path = creep.pos.findPathTo(target);
				 if(path2.length > path.length) {
					 mytarget = target;
					 Memory.targets[id] = creep.id;
					 creep2.cancelOrder(creep2.moveTo);
					 run(creep2,creep);
				 }
			 }
		 }
		 else {
			 mytarget = target;
			 Memory.targets[id] = creep.id;
		 }

		 return mytarget;
	 }

};

module.exports = tools;
