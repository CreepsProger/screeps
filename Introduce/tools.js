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

		 if(!target && !id) {
			 return mytarget;
		 }

		 if(Memory.targets[id] === undefined) {
			 Memory.targets[id] = creep.id;
			 mytarget = target;
			 return mytarget;
		 }
		 else {
			 var creep2 = Game.getObjectById(Memory.targets[id]);
			 if(creep2 !== undefined) {
				 var path2 = creep2.pos.findPathTo(target);
				 var path = creep.pos.findPathTo(target);
				 if(path2.length > path.length) {
					 mytarget = target;
					 Memory.targets[id] = creep.id;
					 const order = 'move'; // creep2.moveTo.name
					 const err = creep2.cancelOrder(order);
					 if(err != OK) {
						 console.log(creep, 'path:', path.length, creep2, 'path2:', path2.length);
						 console.log('new target owner:', creep, 'insted of:', creep2, 'for', id, JSON.stringify(target));
						 console.log(creep2, 'cancelOrder:', order, 'err:', err);
					 }
					 run(creep2,creep);
					 return mytarget;
				 }
			 }
		 }

		 return mytarget;
	 }

};

module.exports = tools;
