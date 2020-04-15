
const constants = {
	  TICKS_TO_CHECK_CREEPS_NUMBER: 25 // 1 minute
	, TICKS_TO_RESET_CASH: 10000
	, TICKS_TO_CHECK_STOP_UPGRADING: 25
	, TICKS_TO_CHECK_NON_EXISTING: 25
	, TICKS_TO_TERMINAL_SEND: 25
	, TICKS_MAX_TOWERS_SLEEPING: 10
	, MIN_TERMINAL_ENERGY: 5000
	, MIN_ENERGY_TO_TERMINAL_SEND: 5000
	, CPU_BUCKET_TO_SPAWN: 1000
	, CPU_BUCKET_TO_SPAWN_MAIN_ROOMS: 1000
	, CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS: 5000
	, CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS2: 7000
	, CPU_BUCKET_TO_EXTRA_UPGRADE: 8000
	, CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS3: 9000
	, CPU_BUCKET_TO_SPAWN_CLAIMING_ROOMS4: 9500
	, CPU_BUCKET_TO_SPAWN_KEEPERS_ROOMS: 15000
	, CPU_BUCKET_TO_START_SPAWN_TO_ATTACK: 19000
	, CPU_BUCKET_TO_STOP_SPAWN_TO_ATTACK: 15000
	, TOTAL_ENERGY_TO_EXTRA_UPGRADE : 400000
	, TICKS_TO_SPAWN: 25
	, TICKS_TO_SPAWN_BY_ANY: 200
	, TICKS_TO_CHECK_CPU: 25
	, TICKS_TO_CHECK_CPU_MAIN_PART: 25
	, RANGE_TO_STORE_1_TO_CONSOLE_LOG: 50
	, RANGE_TO_STORE_2_TO_CONSOLE_LOG: 50
	, RANGE_TO_STORE_3_TO_CONSOLE_LOG: 50
	, HARVEST_RANGE_TO_STORE_2_TO_CONSOLE_LOG: 50
	, ROLE_ENERGY_HARVESTING: 'energy_harvesting'
	, TICKS_TO_LIVE_TO_RENEW: 1200
	, TICKS_TO_LIVE_TO_TRANSFER_ENERGY_TO_SPAWN: 1000
	, MIN_STORAGE_ENERGY: 25000
	, STOP_UPGRADING_ENERGY : 10000
	, START_UPGRADING_ENERGY : 20000
	, CPU_LIMIT_OF_CREEP_RUN : 5
	, CPU_LIMIT_OF_CREEP_ROLE_RUN : 5
	, CPU_LIMIT_OF_CREEP_ROLE_STEP_RUN : 5
	, ERR_NO_PATH_2 : -22
};

module.exports = constants;
