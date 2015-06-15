var ConfigStorage = (function () {
    var extendIt = function (ext_config) { return new Promise(function (resolve) {
            getIt().then(function (old_config) {
                setIt(rb.extend(old_config, ext_config)).then(resolve);
            });
        })},

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

        getIt = function () { return new Promise(function (resolve) {
            Storage.getItem('config').then(function (data) {
                resolve(data.config);
            });
        })},

        init = function () { return new Promise(function (resolve) {
            getIt().then(function (config) {
                if (!config) {
                    setIt('default').then(resolve);
                }
            });
        })};

    return {
        init    : init,
        setIt   : setIt,
        getIt   : getIt,
        extendIt: extendIt
    };
}());