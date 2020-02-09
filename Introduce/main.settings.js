var mainSettings = {

    check: function() {
        console.log('Checking settings');

        console.log('creeps number = ', Memory.settings.creeps.number);
        return mainSettings.check;
    }
    init: function() {
        console.log('Initializing settings');

        Memory.settings =
        { inited: true
        , creeps: { number: 6 }
        }
        return mainSettings.check;
    }
};

module.exports = mainSettings;
