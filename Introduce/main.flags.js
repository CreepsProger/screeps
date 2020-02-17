// $Id:$
var lastFlagRemoved;

var mainFlags = {
    
    tryCreateCreep: function(err, type, needed = 0, weight) {
        var body = [];
        var RAs = Math.trunc(type%10000000000/100000000);
        var  As = Math.trunc(type%100000000/1000000);
        var  Ws = Math.trunc(type%1000000/10000);
        var  Cs = Math.trunc(type%10000/100);
        var  Ms = Math.trunc(type%100);
        for (var i = 0; i < RAs; i++) {body.push(RANGED_ATTACK);}
        for (var i = 0; i < As; i++) {body.push(ATTACK);}
        for (var i = 0; i < Ws; i++) {body.push(WORK);}
        for (var i = 0; i < Cs; i++) {body.push(CARRY);}
        for (var i = 0; i < Ms; i++) {body.push(MOVE);}
        var energy = 50 * (2*As + 2*Ws + Cs + Ms);
        var existsNumber = 0;
        if(Memory.CreepsNumberByType[type])
            existsNumber = Memory.CreepsNumberByType[type];
        var needsNumber = needed - existsNumber;
        //   var newName = 'creep-' + weight + '-' + As.toString(16) + Ws.toString(16) + Cs.toString(16) + Ms.toString(16) + '-' + Game.time % 10000;
        var twoSymbols = function(Ts,s='00') {return (s=='00'?'':Ts==0?'00':Ts<10?'0':'') + Ts;};
        var newName =
            'creep-' + weight + '-' + 
            twoSymbols(RAs) + 
            twoSymbols(As) +
            twoSymbols(Ws) +
            twoSymbols(Cs) +
            twoSymbols(Ms) + '-' + Game.time % 10000;
        console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , 'trying create a creep:'
                    , newName
                    , type
                    , body
                    , 'exists:'
                    , existsNumber
                    , 'needs:'
                    , needsNumber
                    , 'energy:'
                    , energy
                    , 'weight:'
                    , weight
                  );
        if(err && needsNumber > 0) {
            err = Game.spawns['Spawn1'].spawnCreep(body
                                                   , newName
                                                   , {memory: {n: Memory.CreepsCounter, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
            if(!err) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'Spawning new creep:'
                            , newName);
                if(!Memory.CreepsNumberByType[type])
                    Memory.CreepsNumberByType[type] = 0;
                Memory.CreepsNumberByType[type]++;
                Memory.CreepsCounter++;
            }
        }
        return err;
    },

    /** @param commit **/
    checkMainCommit: function(commit) {
        if(!Memory.commits.main ||
           Memory.commits.main != commit ||
           Game.flags['commit']) {
            Memory.commits.main = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit main'
                        , Memory.commits.main
                        , Game.flags['commit']);
            if(Game.flags['commit']) {
                lastFlagRemoved = Game.flags['commit'];
                lastFlagRemoved.remove();
            } 
            
            Memory.CreepsCounter = 0;
            Memory.CreepsNumberByType = {};
            
            for(var name in Game.creeps) {
                var creep = Game.creeps[name];
                Memory.CreepsCounter++;
                if(!Memory.CreepsNumberByType[creep.memory.type])
                    Memory.CreepsNumberByType[creep.memory.type] = 0;
                Memory.CreepsNumberByType[creep.memory.type]++;
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'Commit main'
                            , commit
                            , creep
                            , 'creep.memory.type'
                            , creep.memory.type
                            , Memory.CreepsNumberByType[creep.memory.type]
                            , Memory.CreepsCounter);
            }
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit main'
                        , commit
                        , 'Memory.CreepsCounter:'
                        , Memory.CreepsCounter
                        , 'Memory.CreepsNumberByType:'
                        , Memory.CreepsNumberByType
                        , JSON.stringify(Memory.CreepsNumberByType));
            
            Memory.totals = { CreepsNumber: 0
                             , Capacity: 0
                             , FreeCapacity: 0
                             , UsedCapacity: 0
                             , HitsMax: 0};
            Memory.harvestersMovements
                = { Value: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
                   , Count: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}
                   ,   Avg: { v: 0, movingAverage: { vs: [0,1,2,3,4,5,6,7,8,9], i: 0, summ: 0, delta: 0, ma:0 }}};
        }
    },
    
    //Flag1: Rerun last flag with a new position
    Flag1: function(Flag1) {
        console.log( '🏳️‍✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(Flag1));
        if(mainFlags[lastFlagRemoved.name]) {
            lastFlagRemoved.pos = Flag1.pos;
            mainFlags[lastFlagRemoved.name](lastFlagRemoved);
        }
        Flag1.remove();
    },
    // T: Test
    T: function(T) {
        var N = 1234;
        var id = '\$\I\d\: \$'; 
        var id2 = '$Id: $'; 
        console.log( 'Ｔ', Math.trunc(Game.time/10000), Game.time%10000
                    , T
                    , 'String.fromCharCode(65):'
                    , String.fromCharCode(65)
                    , 'N:'
                    , N
                    , 'N.toString(16).toUpperCase():'
                    , N.toString(16).toUpperCase()
                    , 'id:'
                    , id
                    , 'id2:'
                    , id2
                   );
        lastFlagRemoved = T;
        lastFlagRemoved.remove();
    },
    // Spawn Creep
    SC: function(SC) {
        var Spawn = Game.spawns['Spawn1'];
        var Controller = Spawn.room.controller;
        const CL = Controller.level;
        var err = ERR_NOT_ENOUGH_ENERGY;
        
        if(CL >= 4) err = mainFlags.tryCreateCreep(err, 60707, 100, 10); // E 1300   Avg
        if(CL >= 3) err = mainFlags.tryCreateCreep(err, 40404, 100, 10); // E 800 Worker
        if(CL >= 2) err = mainFlags.tryCreateCreep(err, 30302, 100, 10); // E 550 Worker
        if(CL >= 1) err = mainFlags.tryCreateCreep(err, 10202, 100, 10); // E 300 Worker

        lastFlagRemoved = SC;
        lastFlagRemoved.remove();
    },
    // Creep Move To Room Controller
    CMTRC: function(CMTRC) {
        const found = CMTRC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            found[0].moveTo(found[0].room.controller);
        }
        lastFlagRemoved = CMTRC;
        lastFlagRemoved.remove();
    },
    // Creep Move To Closest Container
    CMTCC: function(CMTCC) {
        const found = CMTCC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            var creep = found[0];
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(target)
                creep.moveTo(found[0].room.controller);
        }
        
        lastFlagRemoved = CMTCC;
        lastFlagRemoved.remove();
    },
    // Creep Withdraw Energy From Container
    CWEFC: function(CWEFC) {
        const found = CWEFC.pos.lookFor(LOOK_CREEPS);
        if(found.length) {
            var creep = found[0];
            var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            if(target)
                creep.withdrow(target,RESOURCE_ENERGY);
        }
        
        lastFlagRemoved = CWEFC;
        lastFlagRemoved.remove();
    },
    // Destroy Rampart
    DR: function(DR) {
        var rampart = DR.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_RAMPART;
            }
        });
        if(rampart) {
            var err = rampart.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Destroy Rampart:'
                        , rampart
                        , 'err:'
                        , err
                        , JSON.stringify(rampart)
                        , JSON.stringify(DR));
        }
        lastFlagRemoved = DR;
        lastFlagRemoved.remove();
    },
    // Destroy Extention
    DE: function(DE) {
        var extention = DE.pos.findClosestByPath(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_EXTENSION;
            }
        });
        if(extention) {
            var err = extention.destroy();
            console.log( '❌🌕', Math.trunc(Game.time/10000), Game.time%10000
                        , JSON.stringify(DE)
                        , 'destroying extention:'
                        , extention
                        , 'err:'
                        , err);
        }
        lastFlagRemoved = DE;
        lastFlagRemoved.remove();
    },
    // Remove all constructions sites';
    RACS: function(RACS) {
        console.log( '❌⚪️⚪️⚪️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(RACS)
                    , JSON.stringify(Game.constructionSites));
        for(var name in Game.constructionSites) {
            var constructionSite = Game.constructionSites[name];
            if(constructionSite) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'removing constructionSite:'
                            , constructionSite);
                constructionSite.remove();
            }
        }
        lastFlagRemoved = RACS;
        lastFlagRemoved.remove();
    },
    checkFlags: function() {
        for(var name in Game.flags) {
            console.log( '🏳️‍🌈', Math.trunc(Game.time/10000), Game.time%10000
                            , name
                            , Game.flags[name]);
            if(mainFlags[name])
                mainFlags[name](Game.flags[name])
        }
    }
};

module.exports = mainFlags;
