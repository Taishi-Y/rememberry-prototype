console.log('Loaded within', document.location.href);

var init, page_config, showError,
    ERROR_MESSAGE = chrome.i18n.getMessage('no_connection_to_extension', [ chrome.i18n.getMessage('ext_name') ]);

showError = function (e) {
    if (e.message.indexOf('Error connecting to extension') !== -1) {
        setTimeout(function () {
            alert(ERROR_MESSAGE);
        }, 0);
    }
};

init = function () {
    var handleEvent = function (e) {
            var modifier = page_config.action.modifier;

            if (modifier === 'none' || e[modifier]) {
                TranslationWindow.translateSelection();
            }
        },

        initConfig = function (new_config) {
            if (page_config && page_config.action.name !== new_config.action.name) {
                document.removeEventListener(page_config.action.name, handleEvent);
            }

            document.addEventListener(new_config.action.name, handleEvent);

            page_config = new_config;
        };

    bgAPI.receive([ 'config', 'PoS' ]).spread(function (new_config) {
        initConfig(new_config);
    });

    chrome.runtime.onMessage.addListener(function (message) {
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
                        TranslationWindow.translateSelection();
                        break;
                    default:
                }

                break;
            default:
        }
    });
};

window.addEventListener('error', showError);

rb.onDomReady.then(init);