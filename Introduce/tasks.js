const constants = require('main.constants');
const flags = require('main.flags');
const tools = require('tools');
const cash = require('cash');

var tasks = {

  taskToFillBoostingLab: {},
	isToFillBoostingLab: function(creep) {
    return undefined;

	}, 
	needToHarvest: function(creep) {
		return false;
	}
};

module.exports = tasks;
