const constants = require('main.constants');

const conditions = {
	  MAIN_ROOM_CRISIS: 				function() {
																			return 	Memory.totals.WORK < 25 && Memory.totals.CARRY < 50;}
	, CLAIMING_ROOM_CRISIS: 		function() {
																			return 	Memory.totals.WORK < 50;}
	, TO_SPAWN_MAIN_ROOMS: 			function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_MAIN_ROOMS;}
	, TO_SPAWN_CLAIMING_ROOMS: 	function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS &&
						 																	!conditions.MAIN_ROOM_CRISIS() &&
						 																	!Memory.stop_upgrading;}
	, TO_SPAWN_KEEPERS_ROOMS: 	function() {
																			return 	Game.cpu.bucket > constants.CPU_BUCKET_TO_SPAWN_KEEPERS_ROOMS &&
																							!conditions.CLAIMING_ROOM_CRISIS() &&
																							!Memory.stop_upgrading;}
	, TO_SPAWN_TO_ATTACK: 			function(){
																			if(Game.cpu.bucket > constants.CPU_BUCKET_TO_START_SPAWN_TO_ATTACK) {
																				Memory.spawn_to_attack = true;
																			}
																			if(Game.cpu.bucket < constants.CPU_BUCKET_TO_STOP_SPAWN_TO_ATTACK) {
																				Memory.spawn_to_attack = false;
																			}
																			return 	Memory.spawn_to_attack &&
																							!conditions.CLAIMING_ROOM_CRISIS() &&
																							!Memory.stop_upgrading;}
};


module.exports = conditions;
