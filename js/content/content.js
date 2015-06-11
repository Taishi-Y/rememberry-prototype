console.log('Loaded within', document.location.href);

var init, page_config;

init = function () {
    var handleEvent = function (e) {
            var modifier = page_config.action.modifier;

            if (modifier === 'none' || e[modifier]) {
                Popup.show();
            }
        },

        initConfig = function (new_config) {
            if (page_config && page_config.action.name !== new_config.action.name) {
                document.removeEventListener(page_config.action.name, handleEvent);
            }

            document.addEventListener(new_config.action.name, handleEvent);

            page_config = new_config;
        };

    bgAPI.receive('config', initConfig);

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
                        Popup.show();
                        break;
                    default:
                }

                break;
            default:
        }
    });
};

rb.onDomReady.then(init);