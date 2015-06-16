var ConfigStorage = (function () {
    var init = function () {
            return getIt().then(function (config) {
                if (!config) {
                    return setIt('default');
                }
            });
        },

        extendIt = function (ext_config) {
            return getIt().then(function (old_config) {
                return setIt(rb.extend(old_config, ext_config));
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