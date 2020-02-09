var mainSettings = {

    check1: function() {
        console.log('Checking 1 settings');

        console.log('creeps number = ', Memory.settings.creeps.number);
        return function () { return mainSettings.check2(); };
    }
    
    check2: function() {
        console.log('Checking 2 settings');

        console.log('creeps number = ', Memory.settings.creeps.number);
        return function () { return mainSettings.check1(); };
    }

    init: function() {
        console.log('Initializing settings');

        Memory.settings =
        { inited: true
        , creeps: { number: 6 }
        }
        return function () { return mainSettings.check1(); }
    }
};

module.exports = mainSettings;
