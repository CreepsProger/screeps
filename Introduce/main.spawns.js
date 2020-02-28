const constants = require('main.constants');

var lastFlagRemoved;

var last_game_time_created_creep = 0;

var spawns = {
    
   work_efficiency: function(type,range) {
       var RAs = Math.trunc(type%10000000000/100000000);
       var  As = Math.trunc(type%100000000/1000000);
       var  Ws = Math.trunc(type%1000000/10000);
       var  Cs = Math.trunc(type%10000/100);
       var  Ms = Math.trunc(type%100);

       var fatigue_parts = Cs + Ws + As + RAs;
       var harvest_ticks = Math.ceil(Cs * 50 / 2 / Ws);
      var move_to_rc_ticks = range * Math.ceil(fatigue_parts / Ms / 2);
      var upgrade_ticks = Math.ceil(Cs * 50 / Ws);
      var move_from_rc_ticks = range * Math.ceil((fatigue_parts - Cs) / Ms / 2);
      return Math.floor(300 * Cs * 50 / (harvest_ticks + move_to_rc_ticks + upgrade_ticks + move_from_rc_ticks));
   },
    
    tryCreateCreep: function(type, weight, needed = 0) {
        var body = [];
        var  Ts = Math.trunc(type%100000000000000/1000000000000);
        var CLs = Math.trunc(type%1000000000000/10000000000);
        var RAs = Math.trunc(type%10000000000/100000000);
        var  As = Math.trunc(type%100000000/1000000);
        var  Ws = Math.trunc(type%1000000/10000);
        var  Cs = Math.trunc(type%10000/100);
        var  Ms = Math.trunc(type%100);
        for (var i = 0; i <  Ts; i++) {body.push(TOUGH);}
        for (var i = 0; i < CLs; i++) {body.push(CLAIM);}
        for (var i = 0; i < RAs; i++) {body.push(RANGED_ATTACK);}
        for (var i = 0; i <  As; i++) {body.push(ATTACK);}
        for (var i = 0; i <  Ws; i++) {body.push(WORK);}
        for (var i = 0; i <  Cs; i++) {body.push(CARRY);}
        for (var i = 0; i <  Ms; i++) {body.push(MOVE);}
        var cost = 10*Ts + 600*CLs + 150*RAs + 80*As + 100*Ws + 50*Cs + 50*Ms;
        var existsNumber = 0;
			  const full_type = '' + type + '/' + weight;
        if(Memory.CreepsNumberByType[full_type])
            existsNumber = Memory.CreepsNumberByType[full_type];
        var needsNumber = needed - existsNumber;
        var newName = 'creep-<' + weight + '>-' + Ts + '.' + CLs + '.' + RAs + '.' + As + '.' + Ws + '.' + Cs + '.' + Ms + '-' + Game.time % 10000;
//         console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
//                     , 'trying create a creep:'
//                     , newName
//                     , 'exists:'
//                     , existsNumber
//                     , 'needs:'
//                     , needsNumber
//                     , 'cost:'
//                     , cost
//                     , 'preverr:'
//                     , preverr
//                   );
        if(last_game_time_created_creep != Game.time && needsNumber > 0) {
            var err = Game.spawns['Spawn2'].spawnCreep(body
                                                   , newName
                                                   , {memory: {n: Memory.CreepsCounter, weight: weight, type: type, role: 'creep', transfering: { energy: { to: { all: false, nearest: {lighter: false }}}}}});
            if(err) {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                            , 'Can\'t spawn new creep:'
                            , newName
                            , 'err:'
                            , err);
            }
            else {
                console.log( '✒️', Math.trunc(Game.time/10000), Game.time%10000
                        , 'Spawning new creep:'
                        , newName);
                if(!Memory.CreepsNumberByType[full_type])
                    Memory.CreepsNumberByType[full_type] = 0;
                Memory.CreepsNumberByType[full_type]++;
                Memory.CreepsCounter++;
							last_game_time_created_creep = Game.time;
            }
        }
    }
};

module.exports = spawns;
