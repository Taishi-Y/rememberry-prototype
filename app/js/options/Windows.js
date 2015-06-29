var rb = require('js/utils/common'),
    AJAX = require('js/utils/AJAX'),
    bgAPI = require('js/utils/bgAPI'),
    Message = require('./Message'),
    OptionsWindow = require('./windows/Options'),
    LoginWindow = require('./windows/Login'),
    ExportWindow = require('./windows/Export');

var Windows, active, cards_to_export,

    windows = {
        options : OptionsWindow,
        login   : LoginWindow,
        'export': ExportWindow
    };

Windows = {
    init: function () {
        Message.init();

        windows.options.init({
            onExportStart: function (cards) {
                cards_to_export = cards;
                Windows.show('login');
            }
        });

        windows.login.init({
            onBack: function () {
                Windows.show('options');
                cards_to_export = null;
            },
            onLogin: function (data) {
                Windows.show('export', data, cards_to_export);
            }
        });

        windows.export.init({
            onBack: function () {
                Windows.show('login');
            },
            onSuccess: function () {
                Message.show(chrome.i18n.getMessage('Successfully_exported'), true, 2000);
                Windows.show('options');
            }
        })
    },

    show: function (name) {
        var data_args = Array.prototype.slice.call(arguments, 1);

        if (active) {
            active.hide();
        }

        active = windows[name];
        active.show.apply(active, data_args);
    }
};

module.exports = Windows;