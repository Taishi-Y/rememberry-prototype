var ConfigStorage = (function () {
    var init = function () {
            return getIt().then(function (config) {
                if (!config) {
                    return setIt('default');
                } else {
                    return JSON_Storage.getDefaultConfig().then(function (default_config) {
                        return setIt(rb.override(config, default_config, { new_only: true }));
                    });
                }
            });
        },

        extendIt = function (ext_config) {
            return getIt().then(function (old_config) {
                return setIt(rb.override(old_config, ext_config, { concat_arrays: true }));
            });
        },

        setIt = function (new_config) { return new Promise(function (resolve) {
            var setIt_local = function (config) {
                Storage.setItem({ config: config }).then(function () {
                    resolve();
                    contentAPI.send('config', config);
                });
            };

            if (new_config === 'default') {
                JSON_Storage.getDefaultConfig().then(function (default_config) {
                    setIt_local(default_config);
                });
            } else {
                setIt_local(new_config);
            }
        })},

        getIt = function () {
            return Storage.getItem('config').then(function (data) {
                return data.config;
            });
        };

    return {
        init    : init,
        setIt   : setIt,
        getIt   : getIt,
        extendIt: extendIt
    };
}());