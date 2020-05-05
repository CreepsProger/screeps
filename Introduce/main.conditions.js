const constants = require('main.constants');

const conditions = {
	  MAIN_ROOM_CRISIS: 						function() {
																			return 	Memory.totals.WORK < 25 || Memory.totals.CARRY < 75;}
	, CLAIMING_ROOM_CRISIS: 				function() {
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
																			return 	room.find(FIND_HOSTILE_CREEPS).length > 0;}
	, TO_SPAWN_ROOM_EXTRA_DEFENDERS:function(roomName) {
																			const room = Game.rooms[roomName];
																			if(!room) return false;
																			return 	room.find(FIND_HOSTILE_CREEPS, { filter: (hc) => !!hc.effects && hc.effects.length > 0 && (hc.getActiveBodyparts(ATTACK) > 0 || hc.getActiveBodyparts(RANGED_ATTACK) > 0)}).length > 0;}
	, TO_SPAWN_ROOM_CLAIMER:				function(roomName) {
																			const room = Game.rooms[roomName];
																			if(!room) return false;
																			var rc = room.controller;
																			const to_spawn = !!rc && !rc.upgradeBlocked && !rc.reservation || rc.reservation.ticksToEnd < 1000;
																			// if(to_spawn)
																		  // 	console.log('TO_SPAWN_ROOM_CLAIMER('+ roomName +') =' , to_spawn, JSON.stringify(rc));
																		  return to_spawn;}
	, TO_EXTRA_UPGRADE:			function(total_energy) {
																			return Game.cpu.bucket > constants.CPU_BUCKET_TO_EXTRA_UPGRADE &&
															total_energy > constants.TOTAL_ENERGY_TO_EXTRA_UPGRADE;}
};


module.exports = conditions;
