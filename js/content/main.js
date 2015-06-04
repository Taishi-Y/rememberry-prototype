console.log('Loaded within', document.location.href);

var init, prefs;

init = function () {
    var handleEvent = function (e) {
            var modifier = prefs.action.modifier;

            if (modifier === 'none' || e[modifier]) {
                Popup.translateSelection();
            }
        },

        initPreferences = function (new_prefs) {
            if (prefs && prefs.action.name !== new_prefs.action.name) {
                document.removeEventListener(prefs.action.name, handleEvent);
            }

            document.addEventListener(new_prefs.action.name, handleEvent);

            prefs = new_prefs;
        };

    bgAPI.receive('preferences', function (prefs) {
        initPreferences(prefs);
    });

    chrome.runtime.onMessage.addListener(function (message) {
        switch (message.method) {
            case 'set':
                switch (message.type) {
                    case 'preferences':
                        initPreferences(message.data);
                        break;
                    default:
                }
                break;
            default:
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    init();
});