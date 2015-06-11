var storage_name = 'sync',
    Storage = chrome.storage[storage_name],

    Data = {
        languages       : AJAX.getJSON('/data/languages.json'),
        actions         : AJAX.getJSON('/data/actions.json'),
        default_config  : AJAX.getJSON('/data/default_config.json'),
        PoS             : AJAX.getJSON('/data/PoS_enum.json')
    };

Config.init();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var response,
        data = message.data;

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
                case 'PoS':
                    Data.PoS.then(sendResponse);
                    break;
                case 'cards':
                    CardsStorage.getCards().then(sendResponse);
                    break;
                default:
            }

            break;
        case 'set':
            switch (message.type) {
                case 'config':
                    Config.setConfig(data);
                    break;
                case 'cards':
                    CardsStorage.setCards(data);
                    break;
                default:
            }

            break;
        case 'add':
            switch (message.type) {
                case 'card':
                    CardsStorage.addCard(data);
                    break;
                default:
            }

            break;
        case 'translate':
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

chrome.contextMenus.create({
    title: 'Translate with Rememberry',
    contexts: [ 'selection' ],

    onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, { method: 'translate', type: 'selection' });
    }
});