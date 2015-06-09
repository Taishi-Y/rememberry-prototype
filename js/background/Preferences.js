var Preferences = (function () {
    var Module,

        validatePrefs = function (prefs) {
            return Promise.all([ Data.actions, Data.languages ]).then(function (data) {
                var action,
                    actions = data[0],
                    languages = data[1],
                    valid = {};

                if (prefs && typeof prefs === 'object' && Object.keys(prefs).length !== 0) {
                    if (prefs.source_lang && (prefs.source_lang === 'auto' ||
                            languages.hasOwnProperty(prefs.source_lang))) {
                        valid.source_lang = prefs.source_lang;
                    }

                    if (prefs.target_lang && languages.hasOwnProperty(prefs.target_lang)) {
                        valid.target_lang = prefs.target_lang;
                    }

                    action = prefs.action;

                    if (action && typeof action && Object.keys(action).length !== 0) {
                        valid.action = {};

                        if (action.name && actions.names.indexOf(action.name) !== -1) {
                            valid.action.name = action.name;
                        }

                        if (action.modifier && actions.modifiers.indexOf(action.modifier) !== -1) {
                            valid.action.modifier = action.modifier;
                        }

                        if (Object.keys(valid.action).length === 0) {
                            delete valid.action;
                        }
                    }
                }

                return valid;
            });
        };

    Module = {

        setPrefs: function (new_prefs) {
            Module.getPrefs().then(function (old_prefs) {
                var continueSet = function (prefs) {
                    Storage.set({ prefs: prefs });
                    contentAPI.send('preferences', prefs);
                };

                if (new_prefs === 'default') {
                    Data.default_prefs.then(continueSet);
                } else {
                    validatePrefs(new_prefs).then(function (valid_new_prefs) {
                        var result_prefs = old_prefs;

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
                    });
                }
            });
        },

        getPrefs: function () {
            return new Promise(function (resolve) {
                Storage.get('prefs', function (data) {
                    resolve(data.prefs);
                });
            });
        },

        init: function () {
            Module.getPrefs().then(function (prefs) {
                if (!prefs) {
                    Module.setPrefs('default');
                }
            });
        }
    };

    return Module;
}());