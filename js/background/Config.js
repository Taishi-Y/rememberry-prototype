var Config = (function () {
    var Module,

        validateConfig = function (config) {
            return Promise.all([ Data.actions, Data.languages ]).spread(function (actions, languages) {
                var action,
                    valid = {};

                if (config && typeof config === 'object' && Object.keys(config).length !== 0) {
                    if (config.source_lang && (config.source_lang === 'auto' ||
                            languages.hasOwnProperty(config.source_lang))) {
                        valid.source_lang = config.source_lang;
                    }

                    if (config.target_lang && languages.hasOwnProperty(config.target_lang)) {
                        valid.target_lang = config.target_lang;
                    }

                    action = config.action;

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

        setConfig: function (new_config) {
            Module.getConfig().then(function (old_config) {
                var continueSet = function (config) {
                    Storage.set({ config: config });
                    contentAPI.send('config', config);
                };

                if (new_config === 'default') {
                    Data.default_config.then(continueSet);
                } else {
                    validateConfig(new_config).then(function (valid_new_config) {
                        var result_config = old_config;

                        if (valid_new_config.source_lang) {
                            result_config.source_lang = valid_new_config.source_lang;
                        }

                        if (valid_new_config.target_lang) {
                            result_config.target_lang = valid_new_config.target_lang;
                        }

                        if (valid_new_config.action) {
                            if (valid_new_config.action.name) {
                                result_config.action.name = valid_new_config.action.name;
                            }

                            if (valid_new_config.action.modifier) {
                                result_config.action.modifier = valid_new_config.action.modifier;
                            }
                        }

                        continueSet(result_config);
                    });
                }
            });
        },

        getConfig: function () {
            return new Promise(function (resolve) {
                Storage.get('config', function (data) {
                    resolve(data.config);
                });
            });
        },

        init: function () {
            Module.getConfig().then(function (config) {
                if (!config) {
                    Module.setConfig('default');
                }
            });
        }
    };

    return Module;
}());