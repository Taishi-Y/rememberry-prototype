var storage_name = 'sync',
    Storage = chrome.storage[storage_name],

    Data = {
        languages       : AJAX.getJSON('/data/languages.json'),
        actions         : AJAX.getJSON('/data/actions.json'),
        default_prefs   : AJAX.getJSON('/data/default_prefs.json')
    };

Preferences.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response, data;

    switch (message.method) {
        case 'get':
            switch (message.type) {
                case 'storage-name':
                    response = storage_name;
                    break;
                case 'preferences':
                    Preferences.getPrefs().then(sendResponse);
                    break;
                case 'languages':
                    Data.languages.then(sendResponse);
                    break;
                case 'actions':
                    Data.actions.then(sendResponse);
                    break;
                default:
            }
            break;
        case 'set':
            data = message.data;

            switch (message.type) {
                case 'preferences':
                    Preferences.setPrefs(data);
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