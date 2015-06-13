var Config = {

    extendConfig: function (ext_config) { return new Promise(function (resolve) {
        Config.getConfig().then(function (old_config) {
            Config.setConfig(rb.extend(old_config, ext_config)).then(resolve);
        });
    })},

    setConfig: function (new_config) { return new Promise(function (resolve) {
        var setConfig = function (config) {
            Storage.setItem({ config: config }).then(function () {
                resolve();
                contentAPI.send('config', config);
            });
        };

        if (new_config === 'default') {
            JSON_data.getDefaultConfig().then(function (default_config) {
                setConfig(default_config);
            });
        } else {
            setConfig(new_config);
        }
    })},

    getConfig: function () { return new Promise(function (resolve) {
        Storage.getItem('config').then(function (data) {
            resolve(data.config);
        });
    })},

    init: function () { return new Promise(function (resolve) {
        Config.getConfig().then(function (config) {
            if (!config) {
                Config.setConfig('default').then(resolve);
            }
        });
    })}
};