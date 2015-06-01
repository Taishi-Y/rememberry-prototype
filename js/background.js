console.log('Background Script (BS) started');

var Preferences,
    sync = true,
    Storage = chrome.storage[ sync ? 'sync' : 'local' ];

Preferences = (function () {
    var DEFAULT_PREFS = {
            source_lang: 'auto',
            target_lang: 'uk',
            trigger_action: {
                event: 'dblclick',
                modifier: 'altKey'
            }
        },

        getPrefs = function (cb) {
            Storage.get('prefs', function (data) {
                cb(data.prefs);
            });
        },

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

                action = prefs.trigger_action;

                if (action && typeof action && Object.keys(action).length !== 0) {
                    valid.trigger_action = {};

                    if (action.event && VALID_EVENTS.indexOf(action.event) !== -1) {
                        valid.trigger_action.event = action.event;
                    }

                    if (action.modifier && VALID_MODIFIERS.indexOf(action.modifier) !== -1) {
                        valid.trigger_action.modifier = action.modifier;
                    }

                    if (Object.keys(valid.trigger_action).length === 0) {
                        delete valid.trigger_action;
                    }
                }
            }

            return valid;
        };

    return {

        setPrefs: function (new_prefs) {
            getPrefs(function (old_prefs) {
                var valid_new_prefs, result_prefs;

                old_prefs = old_prefs || {};

                if (new_prefs === 'default') {
                    result_prefs = DEFAULT_PREFS;
                } else {
                    result_prefs = old_prefs;
                    valid_new_prefs = validatePrefs(new_prefs);

                    if (valid_new_prefs.source_lang) {
                        result_prefs.source_lang = valid_new_prefs.source_lang;
                    }

                    if (valid_new_prefs.target_lang) {
                        result_prefs.target_lang = valid_new_prefs.target_lang;
                    }

                    if (valid_new_prefs.trigger_action) {
                        if (valid_new_prefs.trigger_action.event) {
                            result_prefs.trigger_action.event = valid_new_prefs.trigger_action.event;
                        }

                        if (valid_new_prefs.trigger_action.modifier) {
                            result_prefs.trigger_action.modifier = valid_new_prefs.trigger_action.modifier;
                        }
                    }
                }

                Storage.set({
                    prefs: result_prefs
                });

                chrome.tabs.query({}, function (tabs) {
                    var i, l;

                    for (i = 0, l = tabs.length; i < l; i++) {
                        chrome.tabs.sendMessage(tabs[i].id, {
                            type: 'preferences-update',
                            prefs: result_prefs
                        });
                    }
                });
            });
        },

        init: function () {
            getPrefs(function (prefs) {
                if (!prefs) {
                    this.setPrefs('default');

                }
            }.bind(this));
        }
    };
}());

Storage.set({
    sync: sync,
    valid_actions: [ 'dblclick', 'click' ],
    valid_modifiers: [ 'none', 'altKey', 'ctrlKey', 'shiftKey' ]
});

Preferences.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response;

    switch (message.type) {
        case 'get-sync-status':
            response = sync;
            break;
        case 'update-preferences':
            Preferences.setPrefs(message.prefs);
            break;
        default:
    }

    if (response) {
        sendResponse(response);
    }
});

Storage.get(null, function (data) { console.log('ALL data:', data); });