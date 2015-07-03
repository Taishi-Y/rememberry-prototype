import ConfigStorage from 'js/storage/ConfigStorage';
import DeckStorage from 'js/storage/DeckStorage';
import CardStorage from 'js/storage/CardStorage';
import JSON_Storage from 'js/storage/JSON_Storage';
import AJAX from 'js/utils/AJAX';

ConfigStorage.init().then(() => DeckStorage.init());

chrome.runtime.onMessage.addListener(({ method, type, data }, sender, sendResponse) => {
    switch (method) {
        case 'get':
            switch (type) {
                case 'config':
                    ConfigStorage.getIt().then(sendResponse);
                    break;
                case 'languages':
                    sendResponse(JSON_Storage.getLanguages());
                    break;
                case 'actions':
                    sendResponse(JSON_Storage.getActions());
                    break;
                case 'PoS':
                    sendResponse(JSON_Storage.getPartsOfSpeech());
                    break;
                case 'cards':
                    CardStorage.getCards().then(sendResponse);
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
            switch (type) {
                case 'config':
                    ConfigStorage.extendIt(data);
                    break;
                case 'cards':
                    CardStorage.setCards(data);
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
            switch (type) {
                case 'card':
                    CardStorage.addCard(data);
                    break;
                case 'deck':
                    DeckStorage.createDeck(data.name, data.desc).then(sendResponse);
                    break;
                default:
            }

            break;
        case 'remove':
            switch (type) {
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

    onclick(info, tab) {
        chrome.tabs.sendMessage(tab.id, { method: 'translate', type: 'selection' });
    }
});

chrome.contextMenus.create({
    title: 'Translate desired text',
    contexts: [ 'browser_action' ],

    onclick() {
        let text_to_translate = window.prompt('Enter text to translate');

        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { method: 'translate', type: 'text', data: text_to_translate });
        });
    }
});