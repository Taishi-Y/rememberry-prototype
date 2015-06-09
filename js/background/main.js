var storage_name = 'sync',
    Storage = chrome.storage[storage_name],

    Data = {
        languages       : AJAX.getJSON('/data/languages.json'),
        actions         : AJAX.getJSON('/data/actions.json'),
        default_config  : AJAX.getJSON('/data/default_config.json')
    };

Config.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response, data;

    switch (message.method) {
        case 'get':
            switch (message.type) {
                case 'storage-name':
                    response = storage_name;
                    break;
                case 'config':
                    Config.getConfig().then(sendResponse);
                    break;
                case 'languages':
                    Data.languages.then(sendResponse);
                    break;
                case 'actions':
                    Data.actions.then(sendResponse);
                    break;
                case 'terms':
                    Terms.getTerms().then(sendResponse);
                    break;
                default:
            }

            break;
        case 'set':
            data = message.data;

            switch (message.type) {
                case 'config':
                    Config.setConfig(data);
                    break;
                case 'term':
                    Terms.addTerm(data);
                    break;
                default:
            }

            break;
        case 'translate':
            data = message.data;
            AJAX.translate(data.text, data.source, data.target).then(sendResponse);
            break;
        default:
    }

    if (response) {
        sendResponse(response);
    } else {
        return true;
    }
});