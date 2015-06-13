var JSON_data = (function () {
    var closure = function (file_name) {
        var data = AJAX.getJSON('/data/' + file_name + '.json');

        return function () {
            return data;
        };
    };

    return {
        getLanguages    : closure('languages'),
        getActions      : closure('actions'),
        getDefaultConfig: closure('default_config'),
        getPartsOfSpeech: closure('PoS_enum')
    };
}());

Config.init().then(function () {
    DeckStorage.init();
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    var data = message.data;

    switch (message.method) {
        case 'get':
            switch (message.type) {
                case 'config':
                    Config.getConfig().then(sendResponse);
                    break;
                case 'languages':
                    JSON_data.getLanguages().then(sendResponse);
                    break;
                case 'actions':
                    JSON_data.getActions().then(sendResponse);
                    break;
                case 'PoS':
                    JSON_data.getPartsOfSpeech().then(sendResponse);
                    break;
                case 'cards':
                    CardsStorage.getCards().then(sendResponse);
                    break;
                case 'deck':
                    DeckStorage.getDeck(data).then(sendResponse);
                    break;
                case 'decks':
                    DeckStorage.getDecks().then(sendResponse);
                    break;
                default:
            }

            break;
        case 'set':
            switch (message.type) {
                case 'config':
                    Config.extendConfig(data);
                    break;
                case 'cards':
                    CardsStorage.setCards(data);
                    break;
                case 'active-deck':
                    DeckStorage.selectDeck(data);
                    break;
                case 'deck':
                    DeckStorage.updateDeck(data);
                    break;
                default:
            }

            break;
        case 'add':
            switch (message.type) {
                case 'card':
                    CardsStorage.addCard(data);
                    break;
                case 'deck':
                    DeckStorage.createDeck(data.name, data.desc).then(sendResponse);
                    break;
                default:
            }

            break;
        case 'remove':
            switch (message.type) {
                case 'deck':
                    DeckStorage.removeDeck(data).then(sendResponse);
                    break;
                default:
            }

            break;
        case 'translate':
            AJAX.translate(data.text, data.source, data.target).then(sendResponse);
            break;
        default:
    }

    return true;
});

chrome.contextMenus.create({
    title: chrome.i18n.getMessage('Translate_with', [ chrome.i18n.getMessage('ext_name') ]),
    contexts: [ 'selection' ],

    onclick: function (info, tab) {
        chrome.tabs.sendMessage(tab.id, { method: 'translate', type: 'selection' });
    }
});