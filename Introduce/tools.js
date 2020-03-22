const constants = require('main.constants');

// C1         C2         C3     T1  T2  T3
// C1(T1)
//            C2(T1,C1(T2))
//                       C3(T1,C2(T3))
//=========================
// C1->T2     C2->T3     C3->T1
var last_tick = 0;

var tools = {


	getRoomX: function(roomName) {
		const codeO = 'O'.charCodeAt(0);
		const code0 = '0'.charCodeAt(0);
		const sx = roomName.charCodeAt(0) - codeO > 0? 1:-1;
		const xx = 10*(roomName.charCodeAt(1) - code0);
		const x = roomName.charCodeAt(2) - code0;
		const X = sx*(xx+x);
		return X;
	},

	getRoomY: function(roomName) {
		const codeO = 'O'.charCodeAt(0);
		const code0 = '0'.charCodeAt(0);
		const sy = roomName.charCodeAt(3) - codeO > 0? 1:-1;
		const yy = 10*(roomName.charCodeAt(4) - code0);
		const y = roomName.charCodeAt(5) - code0;
		const Y = sy*(yy+y);
		return Y;
	},

	getRoomRange: function(room1, room2) {
		return Math.abs(tools.getRoomX(room1)-tools.getRoomX(room2))
				 + Math.abs(tools.getRoomY(room1)-tools.getRoomY(room2));
	},

	getRangeTo: function(pos1,pos2) {
		if(pos1.roomName == pos2.roomName) {
			return pos1.getRangeTo(pos2);
		}
		const range = 50*tools.getRoomRange(pos1.roomName, pos2.roomName);

		if(false && last_tick != Game.time) {
			last_tick = Game.time;
			console.log( '✒️', 'tools.getRangeTo:'
		                    , 'pos1.roomName:', pos1.roomName
	  	                  , 'pos2.roomName:', pos2.roomName
	    	                , 'range:', range);
		}
		return range;
	},

	areFullContainers: function(creep) {
		return creep.room.find(FIND_STRUCTURES, {filter: (structure) =>
			structure.structureType == STRUCTURE_CONTAINER &&
			structure.store.getFreeCapacity() > 0}).length == 0;
	},

	moveTo: function(creep,target) {
		var err = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});

		if (err == ERR_NO_PATH) {
			if(err != OK)
				console.log('🔜', creep, err, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));

      if (creep.pos.x <= 1) {
				return creep.move(RIGHT);
      }
      if (creep.pos.x >= 48) {
				return creep.move(LEFT);
      }
      if (creep.pos.y <= 1) {
        return creep.move(BOTTOM);
      }
      if (creep.pos.y >= 48) {
				return creep.move(TOP);
      }
    }
		return err;
		// return constants.ERR_NO_PATH_2;
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
					 const order = 'move'; // creep2.moveTo.name
					 const err = creep2.cancelOrder(order);
					 if(err == OK) {
						 mytarget = target;
						 Memory.targets[id] = creep.id;
						 run(creep2,creep);
					 }
					 else {
						 console.log( creep, 'path:', path.length
												, creep2, 'path2:', path2.length
												, 'cancelOrder:', order, 'err:', err
												, 'for', id, JSON.stringify(target));
					 }
				 }
			 }
		 }
		 return mytarget;
	 }

};

module.exports = tools;
