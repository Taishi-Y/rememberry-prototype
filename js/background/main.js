var storage_name = 'sync',
    Storage = chrome.storage[storage_name],

    loadJSON = function (path) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else if (xhr.status === 404) {
                    reject(404);
                }
            };

            xhr.open('GET', path);
            xhr.send();
        });
    },

    Data = {
        languages       : loadJSON('/data/languages.json'),
        actions         : loadJSON('/data/actions.json'),
        default_prefs   : loadJSON('/data/default_prefs.json')
    };

Preferences.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response;

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
            switch (message.type) {
                case 'preferences':
                    Preferences.setPrefs(message.data);
                    break;
                default:
            }
            break;
        default:
    }

    if (response) {
        sendResponse(response);
    } else {
        return true;
    }
});