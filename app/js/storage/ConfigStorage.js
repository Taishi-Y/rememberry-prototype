var rb = require('js/utils/common'),
    Storage = require('./Storage'),
    JSON_Storage = require('./JSON_Storage'),
    contentAPI = require('js/utils/contentAPI');

var init = function () {
        return getIt().then(function (config) {
            if (!config) {
                return setIt('default');
            } else {
                return setIt(rb.override(config, JSON_Storage.getDefaultConfig(), { new_only: true }));
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

        setIt_local(
            new_config === 'default' ?
                JSON_Storage.getDefaultConfig() :
                new_config
        );
    })},

    getIt = function () {
        return Storage.getItem('config').then(function (data) {
            return data.config;
        });
    };

module.exports = {
    init    : init,
    setIt   : setIt,
    getIt   : getIt,
    extendIt: extendIt
};