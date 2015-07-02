import rb from 'js/utils/common';
import bgAPI from 'js/utils/bgAPI';
import TranslationWindow from './TranslationWindow';

import 'less/content.extract.less';

let init, page_config, showError,
    props = {},
    ERROR_MESSAGE = chrome.i18n.getMessage('no_connection_to_extension', [ chrome.i18n.getMessage('ext_name') ]);

showError = e => {
    if (e.message.includes('Error connecting to extension')) {
        window.setTimeout(() => {
            window.alert(ERROR_MESSAGE);
        });
    }
};

init = () => {
    let handleEvent = e => {
            let { modifier } = page_config.action;

            if (modifier === 'none' || e[modifier]) {
                TranslationWindow.translateText();
            }
        },

        initConfig = new_config => {
            if (page_config && page_config.action.name !== new_config.action.name) {
                document.removeEventListener(page_config.action.name, handleEvent);
            }

            document.addEventListener(new_config.action.name, handleEvent);

            page_config = new_config;
            props.source_lang = page_config.source_lang;
            props.target_lang = page_config.target_lang;
        };

    bgAPI.receive([ 'config', 'PoS' ]).spread(new_config => initConfig(new_config));

    chrome.runtime.onMessage.addListener(message => {
        switch (message.method) {
            case 'set':
                switch (message.type) {
                    case 'config':
                        initConfig(message.data);
                        break;
                    default:
                }

                break;
            case 'translate':
                switch (message.type) {
                    case 'selection':
                        TranslationWindow.translateText();
                        break;
                    case 'text':
                        TranslationWindow.translateText(message.data);
                        break;
                    default:
                }

                break;
            default:
        }
    });
};

TranslationWindow.init(props);

window.addEventListener('error', showError);
rb.DOM.onReady.then(init);