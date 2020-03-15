const constants = require('main.constants');

// C1         C2         C3     T1  T2  T3
// C1(T1)
//            C2(T1,C1(T2))
//                       C3(T1,C2(T3))
//=========================
// C1->T2     C2->T3     C3->T1

var tools = {

	areFullContainers: function(creep) {
		return creep.room.find(FIND_STRUCTURES, {filter: (structure) =>
			structure.structureType == STRUCTURE_CONTAINER &&
			structure.store.getFreeCapacity() > 0}).length == 0;
	},

	moveTo: function(creep,target) {
		var err = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});

		if (err == ERR_NO_PATH) {
      if (creep.pos.x <= 1) {
        if (creep.move(RIGHT) == OK) {
          return OK;
        }
      }
      if (creep.pos.x >= 48) {
        if (creep.move(LEFT) == OK) {
          return OK;
        }
      }
      if (creep.pos.y <= 1) {
        if (creep.move(BOTTOM) == OK) {
          return OK;
        }
      }
      if (creep.pos.y >= 48) {
        if (creep.move(TOP) == OK) {
          return OK;
        }
      }
    }
		else {
			return err;
		}
		return constants.ERR_NO_PATH_2;
	},

	areEmptySources: function(creep) {
		return creep.room.find(FIND_SOURCES, {filter: (source) => source.energy > 0}).length == 0;
	},

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
				 if(path2.length > path.length+1) {
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
