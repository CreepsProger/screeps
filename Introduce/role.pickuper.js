var roleNext = require('role.builder');
const tools = require('tools');


var rolePickuper = {

    /** @param {Creep} creep **/
    run: function(creep,executer = undefined) {
        if(creep.memory.pickuping && creep.store.getFreeCapacity() == 0) {
            creep.memory.pickuping = false;
        }

        if(!creep.memory.pickuping &&
  //         creep.getActiveBodyparts(WORK) == 0 &&
           (creep.store.getUsedCapacity() == 0 ||
           (creep.store.getFreeCapacity() > 0 && creep.memory.rerun))) {
            creep.memory.pickuping = true;
        }

        if(creep.memory.pickuping) {
            var target;
            if(!target) {
                var dropped = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES,  {
									filter: (dropped) => {
										return tools.checkTarget(executer,dropped.id);
									}
								});
								if(!!dropped) {
									target = tools.setTarget(creep,dropped,dropped.id,rolePickuper.run);
								}
            }
            if(target) {
                var err = creep.pickup(target);
                if(err == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    creep.say('🔜👊');
                    if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '🔜👊', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'moving for pickuping:'
                                    , targetinfo);
                    }
                }
                else if(!err) {
                    creep.say('👊');
                    if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '👊', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'pickuping:'
                                    , targetinfo);
                    }
                }
                else {
                    creep.memory.pickuping = false;
                    if(Game.flags['LP '] || Game.flags['LP'] || Game.flags['L']) {
                        var targetinfo = target.name ? target.name:target.structureType?target.structureType:JSON.stringify(target);
                        console.log( '👊⚠️', Math.trunc(Game.time/10000), Game.time%10000
                                    , creep.name
                                    , 'pickuping :'
                                    , target.name?target.name:target.structureType
                                    , 'with err:'
                                    , err);
                    }
                }
            }
            else {
                creep.memory.pickuping = false;
            }
        }

        if(!creep.memory.pickuping) {
            roleNext.run(creep);
        }
    }
};

module.exports = rolePickuper;
