
    /** @param commit **/
export function checkMainCommit(commit) {
        if(!Memory.commits.main ||
           Memory.commits.main != commit ||
           Game.flags['commit']) {
            Memory.commits.main = commit;
            console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Commit main'
                        , Memory.commits.main
                        , Game.flags['commit']);
            if(Game.flags['commit'])
                Game.flags['commit'].remove();
            
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
                            , creep.memory.type.toString(16)
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
    };


export function checkFlags() {
    //Test;
    var T = Game.flags['T'];
    if(T) {
        var N = 1234;
        console.log( 'Ｔ', Math.trunc(Game.time/10000), Game.time%10000
                    , T
                    , 'String.fromCharCode(65):'
                    , String.fromCharCode(65)
                    , 'N:'
                    , N
                    , 'N.toString(16).toUpperCase():'
                    , N.toString(16).toUpperCase()
                   );
        T.remove();
    }


    //Destroy Rampart;
    var DR = Game.flags['DR'];
    if(DR) {
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
            if(!err) {
                DR.remove();
            }
        }
        else {
            DR.remove();
        }
    }
    
    
    //Destroy Extention;
    var DE = Game.flags['DE'];
    if(DE) {
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
            if(!err) {
                DE.remove();
            }
        }
        else {
            DE.remove();
        }
    }
    
    
    //Remeve all constructions sites';
    var RACS = Game.flags['RACS'];
    if(RACS) {
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
        RACS.remove();
    }
    
    
    //Flag1: Rerun last flag
    var Flag1 = Game.flags['Flag1'];
    if(Flag1) {
        console.log( '🏳️‍✒️', Math.trunc(Game.time/10000), Game.time%10000
                    , JSON.stringify(Flag1));
        Flag1.remove();
    }
    
    for(var name in Game.flags) {
        var flag = Game.flags[name];
        if(flag) {
            console.log( '🏳️‍🌈', Math.trunc(Game.time/10000), Game.time%10000
                        , 'flag:'
                        , flag);
        }
    }
};
