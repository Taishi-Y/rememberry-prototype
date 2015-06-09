console.log('Loaded within', document.location.href);

var init, page_prefs;

init = function () {
    var handleEvent = function (e) {
            var modifier = page_prefs.action.modifier;

            if (modifier === 'none' || e[modifier]) {
                Popup.translateSelection();
            }
        },

        initPreferences = function (new_prefs) {
            if (page_prefs && page_prefs.action.name !== new_prefs.action.name) {
                document.removeEventListener(page_prefs.action.name, handleEvent);
            }

            document.addEventListener(new_prefs.action.name, handleEvent);

            page_prefs = new_prefs;
        };

    bgAPI.receive('preferences', initPreferences);

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

document.addEventListener('DOMContentLoaded', init);