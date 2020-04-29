const constants = require('main.constants');
// const cash = require('cash');

// C1         C2         C3     T1  T2  T3
// C1(T1)
//            C2(T1,C1(T2))
//                       C3(T1,C2(T3))
//=========================
// C1->T2     C2->T3     C3->T1
var last_tick = 0;

var tools = {

	getWeight: function(name) {
		const code0 = '0'.charCodeAt(0);
		const nnn = name.charCodeAt(7) - code0;
		var weight = nnn >= 0 && nnn < 10? nnn:0;
		const nn = name.charCodeAt(8) - code0;
		if(nn >= 0 && nn < 10)
			weight = weight*10+nn;
		const n = name.charCodeAt(9) - code0;
		if(n >= 0 && n < 10)
			weight = weight*10+n;
		return weight;
	},

	getRoomCode: function(roomName) {
		const X = tools.getRoomX(roomName);
		const Y = tools.getRoomY(roomName);
		const R = (Math.sign(X)>0?0:1) + (Math.sign(Y)>0?0:1);
		return R*100000+X*100+Y;
	},

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

	moveTo: function(creep,target) {

		var err = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});

		if (err == ERR_NO_PATH) {
			// if(err != OK)
			// 	console.log('🔜', creep, err, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));

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
		return (executer === undefined)? true:tools.targets[id] === undefined;
	},

	targets: {time:0,prev1:'',prev2:'',prev3:''},
	setTarget: function(creep,target,id,run) {
		var t = Game.cpu.getUsed();
		if(tools.targets.time != Game.time) {
			tools.targets.time = time:Game.time;
		}

		var mytarget;

		if(target == prev2 && prev == prev3) {
			return mytarget;
		}

		if(!target && !id) {
			return mytarget;
		}

		var creep2;
		var rerun_creep2 = false;
		if(!tools.targets[id]) {
			prev3 = prev2;
			prev2 = prev1;
			prev1 = tools.targets[id];
			tools.targets[id] = creep.id;
			mytarget = target;
			return mytarget;
		}
		else {
			creep2 = Game.getObjectById(tools.targets[id]);
			if(creep2 !== undefined) {
//				var path2 = creep2.pos.findPathTo(target);
//				var path = creep.pos.findPathTo(target);
				var range2 = creep2.pos.getRangeTo(target);
				var range = creep.pos.getRangeTo(target);
//				if(path2.length > path.length+1) {
        if(range2 > range+7) {
					const order = 'move'; // creep2.moveTo.name
					const err = creep2.cancelOrder(order);
					if(err == OK) {
						rerun_creep2 = true;
						mytarget = target;
						prev3 = prev2;
						prev2 = prev1;
						prev1 = tools.targets[id];
						tools.targets[id] = creep.id;
						run(creep2,creep);
					}
					else {
						console.log( creep, 'range:', range
												, creep2, 'range2:', range2
												, 'cancelOrder:', order, 'err:', err
												, 'for', id, JSON.stringify(target));
					}
				}
			}
		}
		var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
		if((rerun_creep2 && dt > 0.5) || (!rerun_creep2 && dt > 0.05))
			console.log( '🧿', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
									, 'setTarget', rerun_creep2, creep2
								 );
		return mytarget;
	}
};

module.exports = tools;
