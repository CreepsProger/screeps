const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var tasks = {

  taskToFillBoostingLab: {
		pos:{}, 
		isTask:false,
		harvestingBy: function(creep) {
			return ERR_NOT_IN_RANGE;
		},
		transferingBy: function(creep) {
			return ERR_NOT_IN_RANGE;
		}
	},
	isToFillBoostingLab: function(creep) {
    return undefined;
	}, 
	needToHarvest: function(creep) {
		return false;
	}
};

module.exports = tasks;
