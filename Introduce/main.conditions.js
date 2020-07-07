const constants = require('main.constants');

const conditions = {
	  MAIN_ROOM_CRISIS: 						function() {
			if(Game.shard.name == 'shard0') return Memory.totals.WORK < 10 || Memory.totals.CARRY < 25;
																			return 	Memory.totals.WORK < 25 || Memory.totals.CARRY < 75;}
	, CLAIMING_ROOM_CRISIS: 				function() {
		if(Game.shard.name == 'shard0') return Memory.totals.WORK < 10;
																			return 	Memory.totals.WORK < 50;}
	, TO_SPAWN_MAIN_ROOMS: 					function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_MAIN_ROOMS;}
	, TO_SPAWN_CLAIMING_ROOMS: 			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS &&
						 																	!conditions.MAIN_ROOM_CRISIS();}
	, TO_SPAWN_CLAIMING_ROOMS2:			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS2 &&
		 																					!conditions.CLAIMING_ROOM_CRISIS();}
	, TO_SPAWN_CLAIMING_ROOMS3:			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS3 &&
		 																					!conditions.CLAIMING_ROOM_CRISIS();}
	, TO_SPAWN_CLAIMING_ROOMS4:			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS4 &&
		 																					!conditions.CLAIMING_ROOM_CRISIS();}
	, TO_SPAWN_KEEPERS_ROOMS: 			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_KEEPERS_ROOMS &&
																							!conditions.CLAIMING_ROOM_CRISIS() &&
																							!Memory.stop_upgrading;}
	, TO_SPAWN_TO_ATTACK: 					function(){
																			if(Game.cpu.bucket > constants.CPU_BUCKET_TO_START_SPAWN_TO_ATTACK) {
																				Memory.spawn_to_attack = true;
																			}
																			if(Game.cpu.bucket < constants.CPU_BUCKET_TO_STOP_SPAWN_TO_ATTACK) {
																				Memory.spawn_to_attack = false;
																			}
																			return 	Memory.spawn_to_attack &&
																							!conditions.CLAIMING_ROOM_CRISIS() &&
																							!Memory.stop_upgrading;}
	, TO_SPAWN_ROOM_DEFENDERS:			function(roomName) {
																			const room = Game.rooms[roomName];
																			if(!room) return false;
																			const to_spawn_rd = (room.find(FIND_HOSTILE_CREEPS).length > 0) ||
																						(room.find(FIND_HOSTILE_STRUCTURES, { filter: (hs) => hs.level !== undefined && hs.level == 0} ).length > 0);
		                                  if(to_spawn_rd) {
																				if(!Memory.defence[roomName].attacked) {
																					Memory.defence[roomName].attacked = true;
																					Memory.defence[roomName].time = Game.time;
																				}
																				if(Game.time - Memory.defence[roomName].time < 10)
																					return false;
																				console.log('TO_SPAWN_ROOM_DEFENDERS('+ roomName +') =' , to_spawn_rd, JSON.stringify({hs:room.find(FIND_HOSTILE_STRUCTURES), hc:room.find(FIND_HOSTILE_CREEPS)}));
																			} else {
																				if(!Memory.defence)
																					Memory.defence={};
																				if(!Memory.defence[roomName])
																					Memory.defence[roomName] = {};
																				Memory.defence[roomName].attacked = false;
																			}
																		  return to_spawn_rd;}
	, TO_SPAWN_ROOM_EXTRA_DEFENDERS:function(roomName) {
																			const room = Game.rooms[roomName];
																			if(!room) return false;
																			return 	room.find(FIND_HOSTILE_CREEPS, { filter: (hc) => !!hc.effects && hc.effects.length > 0 && (hc.getActiveBodyparts(ATTACK) > 0 || hc.getActiveBodyparts(RANGED_ATTACK) > 0)}).length > 0;}
	, TO_SPAWN_ROOM_CLAIMER:				function(roomName) {
																			const room = Game.rooms[roomName];
																			if(!room) return false;
																			var rc = room.controller;
																			const to_spawn = !!rc && !rc.upgradeBlocked && !rc.reservation ||
																						(!!rc && !!rc.reservation && rc.reservation.username == 'Invader') ||
																						rc.reservation.ticksToEnd < 1000;
																			// if(!to_spawn)
																		  	// console.log('TO_SPAWN_ROOM_CLAIMER('+ roomName +') =' , to_spawn, JSON.stringify(rc));
																		  return to_spawn;}
	, TO_EXTRA_UPGRADE:			function(total_energy) {
																			return Game.cpu.bucket > constants.CPU_BUCKET_TO_EXTRA_UPGRADE &&
															total_energy > constants.TOTAL_ENERGY_TO_EXTRA_UPGRADE;}

};


module.exports = conditions;
