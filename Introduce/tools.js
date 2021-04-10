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
	
	getPosByDirection: function(pos, direction) {
		switch (direction) {
			case TOP: return new RoomPosition(pos.x, pos.y-1, pos.roomName);
			case TOP_RIGHT: return new RoomPosition(pos.x+1, pos.y-1, pos.roomName);
			case RIGHT: return new RoomPosition(pos.x+1, pos.y, pos.roomName);
			case BOTTOM_RIGHT: return new RoomPosition(pos.x+1, pos.y+1, pos.roomName);
			case BOTTOM: return new RoomPosition(pos.x, pos.y+1, pos.roomName);
			case BOTTOM_LEFT: return new RoomPosition(pos.x-1, pos.y+1, pos.roomName);
			case LEFT: return new RoomPosition(pos.x-1, pos.y, pos.roomName);
			case TOP_LEFT: return new RoomPosition(pos.x-1, pos.y-1, pos.roomName);
		}
	},
	
	isInWay: function(creep) {
		if(creep.room.name == 'W26S33' &&
			 ((creep.pos.x == 28 && creep.pos.y == 20) ||
				(creep.pos.x == 29 && creep.pos.y == 19) ||
				(creep.pos.x == 30 && creep.pos.y == 18) ||
				(creep.pos.x == 35 && creep.pos.y == 16)))
			return true;
		return false;
	},
	
	dontGetInWay: function(creep) {
		if(creep.pos.findInRange(FIND_MY_SPAWNS, 1).length > 0 ||
			 creep.pos.findInRange(FIND_MY_CREEPS, 1).length > 1 ||
			 tools.isInWay(creep)) {
				const random = Math.floor(Math.random()*8+Game.time)%8+1;
				creep.move(random); // TOP:1 ,..., TOP_LEFT:8
			}
	},

	time: {
		harvest: {
			deposit:{},
			power:{}
		},
		power: {
			ops:{},
			factory:{},
			labs:{},
			source:{},
			controller:{}
		},
		flags: {
			buy:{},
			sell:{}
		}
	},
	
	timeObj: function(time, name) {
		time[name] = tools.nvl(time[name],{on:0});
		return time[name];
	},

	timeOn: function(time, on = 0) {
		time.on = tools.nvl(time.on,0);
		time.on = time.on < Game.time? Game.time + on : Math.min(time.on, Game.time + on);
	},
	
	nvl: function(a,b) {
		return (!a)? b:a;
	},
	
	getN: function(name) {
		if(name.length < 10)
			return 0;
		const prefix = 'creep-<';
		if(name.substring(0,prefix.length) != prefix)
			return 0;
		return Number(name.substr(name.lastIndexOf("-")+1));
	},
	
	getMod: function(name) {
		if(name.length < 10)
			return 0;
		const prefix = 'creep-<';
		if(name.substring(0,prefix.length) != prefix)
			return 0;
		return Number(name.substring(name.indexOf('/')+1, name.indexOf('>')));
	},

	getWeight: function(name) {
		if(name.length < 10)
			return 0;
		const prefix = 'creep-<';
		if(name.substring(0,prefix.length) != prefix)
			return 0;
		const code0 = '0'.charCodeAt(0);
		const nnnn = name.charCodeAt(7) - code0;
		var weight = (nnnn >= 0 && nnnn < 10)? nnnn:0;
		const nnn = name.charCodeAt(8) - code0;
		if(nnn >= 0 && nnn < 10) {
			weight = weight*10+nnn;
			const nn = name.charCodeAt(9) - code0;
			if(nn >= 0 && nn < 10) {
				weight = weight*10+nn;
				const n = name.charCodeAt(10) - code0;
				if(n >= 0 && n < 10) {
					weight = weight*10+n;
				}
			}
		}
		return weight;
	},
	
	getRoomId : function(name) {
		return Math.floor(tools.getWeight(name)/10);
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
// 		if(err != OK)
// 			console.log('🔜', creep, err, 'moving from', JSON.stringify(creep.pos), 'to', JSON.stringify(target));

		if (err == ERR_NO_PATH) {
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

	checkTarget: function(executer,id) {
		//return (executer === undefined)? true:tools.targets[id] === undefined;
		if(tools.targets.time != Game.time) {
			tools.targets = {time:Game.time};
		}
		return tools.targets[id] === undefined;
	},

	targets_prev: {prev_time:{},prev1:{},prev2:{},prev3:{}},
	targets: {time:0},
	setTarget: function(creep,target,id,run) {
		var t = Game.cpu.getUsed();
		if(tools.targets.time != Game.time) {
			tools.targets = {time:Game.time};
		}

		var mytarget;

		if(id == tools.targets_prev.prev2[creep.id] &&
			 tools.targets_prev.prev1[creep.id] == tools.targets_prev.prev3[creep.id]) {
			// return mytarget; TODO stak
		}

		if(!target && !id) {
			return mytarget;
		}

		var creep2;
		var rerun_creep2 = false;
		if(!tools.targets[id]) {
			tools.targets_prev.prev3[creep.id] = tools.targets_prev.prev2[creep.id];
			tools.targets_prev.prev2[creep.id] = tools.targets_prev.prev1[creep.id];
			tools.targets_prev.prev1[creep.id] = id;
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
						tools.targets_prev.prev3[creep.id] = tools.targets_prev.prev2[creep.id];
						tools.targets_prev.prev2[creep.id] = tools.targets_prev.prev1[creep.id];
						tools.targets_prev.prev1[creep.id] = id;
						tools.targets[id] = creep.id;
						run(creep2,creep);
					}
					else {
						console.log( creep, 'range:', range
												, creep2, 'range2:', range2
												, 'cancelOrder:', order, 'err:', err
												, 'for', id/*, JSON.stringify(target)*/);
					}
				}
			}
		}
		var dt = Math.round((Game.cpu.getUsed() - t)*100)/100;
		if((rerun_creep2 && dt > 0.95) || (!rerun_creep2 && dt > 0.25))
			console.log( '🧿', Math.trunc(Game.time/10000), Game.time%10000, 'dt=' + dt, creep
									, 'setTarget', rerun_creep2, creep2
								 );
		return mytarget;
	},

	getInviderCoreLevel: function(roomName) {
		const room = Game.rooms[roomName];
		if(!room) return undefined;
		return room.find(FIND_HOSTILE_STRUCTURES, { filter: (hs) => hs.level !== undefined} )
							.map((hs) => hs.level)
							.sort((l,r) => r-l)
							.shift();
	},

	getStorageOrTerminal: function(creep) {
			var st = [];
 			if(!!creep.room.terminal &&
 				 !!creep.room.terminal.my &&
				 !!creep.room.terminal.store &&
 				   creep.room.terminal.store.getUsedCapacity(RESOURCE_ENERGY) > constants.MIN_TERMINAL_ENERGY) {
 				st.push(creep.room.terminal);
 			}
 			if(!!creep.room.storage &&
 				 !!creep.room.storage.my &&
				 !!creep.room.storage.store &&
 				 	 creep.room.storage.store.getUsedCapacity(RESOURCE_ENERGY) > constants.STOP_UPGRADING_ENERGY + constants.MIN_STORAGE_ENERGY) {
 				st.push(creep.room.storage);
 			}
			if(st.length > 0) {
				return st.reduce((p,c) =>
												 creep.pos.getRangeTo(p)
												 * p.store.getFreeCapacity(RESOURCE_ENERGY)
												 < creep.pos.getRangeTo(c)
												 * c.store.getFreeCapacity(RESOURCE_ENERGY)
												 ? p:c);
			}
		return null;
	}
	
};

module.exports = tools;
