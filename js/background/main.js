console.log('Background Script (BS) started');

var Preferences,
    storage_name = 'sync',
    Storage = chrome.storage[storage_name],

    loadJSON = function (path) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else if (xhr.status === 404) {
                    reject(404);
                }
            };

            xhr.open('GET', path);
            xhr.send();
        });
    },

    Data = {
        languages: loadJSON('/data/languages.json'),
        actions: loadJSON('/data/actions.json'),
        default_prefs: loadJSON('/data/default_prefs.json')
    };

Preferences = (function () {
    var Module,

        validatePrefs = function (prefs) {
            var action,
            // TODO: retrieve valid values from storage (share with options page)
                VALID_EVENTS = [ 'dblclick', 'click' ],
                VALID_MODIFIERS = [ 'none', 'altKey', 'ctrlKey', 'shiftKey' ],
                valid = {};

            if (prefs && typeof prefs === 'object' && Object.keys(prefs).length !== 0) {
                // TODO: validate source and target languages
                if (prefs.source_lang) {
                    valid.source_lang = prefs.source_lang;
                }

                if (prefs.target_lang) {
                    valid.target_lang = prefs.target_lang;
                }

                action = prefs.action;

                if (action && typeof action && Object.keys(action).length !== 0) {
                    valid.action = {};

                    if (action.name && VALID_EVENTS.indexOf(action.name) !== -1) {
                        valid.action.name = action.name;
                    }

                    if (action.modifier && VALID_MODIFIERS.indexOf(action.modifier) !== -1) {
                        valid.action.modifier = action.modifier;
                    }

                    if (Object.keys(valid.action).length === 0) {
                        delete valid.action;
                    }
                }
            }

            return valid;
        };

    Module = {

        setPrefs: function (new_prefs) {
            Module.getPrefs(function (old_prefs) {
                var valid_new_prefs, result_prefs,

                    continueSet = function (prefs) {
                        Storage.set({ prefs: prefs });

                        contentAPI.send('preferences', result_prefs);
                    };

                old_prefs = old_prefs || {};

                if (new_prefs === 'default') {
                    Data.default_prefs.then(continueSet);
                } else {
                    result_prefs = old_prefs;
                    valid_new_prefs = validatePrefs(new_prefs);

                    if (valid_new_prefs.source_lang) {
                        result_prefs.source_lang = valid_new_prefs.source_lang;
                    }

                    if (valid_new_prefs.target_lang) {
                        result_prefs.target_lang = valid_new_prefs.target_lang;
                    }

                    if (valid_new_prefs.action) {
                        if (valid_new_prefs.action.name) {
                            result_prefs.action.name = valid_new_prefs.action.name;
                        }

                        if (valid_new_prefs.action.modifier) {
                            result_prefs.action.modifier = valid_new_prefs.action.modifier;
                        }
                    }

                    continueSet(result_prefs);
                }
            });
        },

        getPrefs: function (cb) {
            Storage.get('prefs', function (data) {
                cb(data.prefs);
            });
        },

        init: function () {
            Module.getPrefs(function (prefs) {
                if (!prefs) {
                    Module.setPrefs('default');
                }
            });
        }
    };

    return Module;
}());

Preferences.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response;

    switch (message.type) {
        case 'get-storage-name':
            response = storage_name;
            break;
        case 'get-preferences':
            Preferences.getPrefs(sendResponse);
            break;
        case 'set-preferences':
            Preferences.setPrefs(message.data);
            break;
        case 'get-languages':
            Data.languages.then(sendResponse);
            break;
        case 'get-actions':
            Data.actions.then(sendResponse);
            break;
        default:
    }

    if (response) {
        sendResponse(response);
    } else {
        return true;
    }
});