import rb from 'js/utils/common';
import AJAX from 'js/utils/AJAX';
import bgAPI from 'js/utils/bgAPI';
import Message from './Message';
import OptionsWindow from './windows/Options';
import LoginWindow from './windows/Login';
import ExportWindow from './windows/Export';

let Windows, active, cards_to_export,

    windows = {
        options : OptionsWindow,
        login   : LoginWindow,
        'export': ExportWindow
    };

Windows = {
    init() {
        Message.init();

        windows.options.init({
            onExportStart(cards) {
                cards_to_export = cards;
                Windows.show('login');
            }
        });

        windows.login.init({
            onBack() {
                Windows.show('options');
                cards_to_export = null;
            },
            onLogin(data) {
                Windows.show('export', data, cards_to_export);
            }
        });

        windows.export.init({
            onBack() {
                Windows.show('login');
            },
            onSuccess() {
                Message.show(chrome.i18n.getMessage('Successfully_exported'), true, 2000);
                Windows.show('options');
            }
        })
    },

    show(name, ...data_args) {
        if (active) {
            active.hide();
        }

        active = windows[name];
        active.show(active, ...data_args);
    }
};

export default Windows;