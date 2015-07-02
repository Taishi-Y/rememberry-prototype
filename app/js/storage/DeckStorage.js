import Storage from './Storage';
import ConfigStorage from './ConfigStorage';

let init = () =>
        ConfigStorage.getIt().then(config => {
            if (config.decks.names.length === 0) {
                return createDeck('basic', 'Basic deck').then(basic_deck => selectDeck(basic_deck.name));
            }
        }),

    getKey = name => 'deck_' + name,

    createDeck = (name, description) => {
        let new_deck = {
            name,
            desc: description,
            cards: {}
        };

        return addDeck(new_deck).then(() => new_deck);
    },

    updateDeck = deck => {
        let old_key, old_name, key,
            data = {};

        if (deck.new_name) {
            old_name = deck.name;
            old_key = getKey(old_name);

            deck.name = deck.new_name;

            delete deck.new_name;
            Storage.removeItem(old_key);
        }

        key = getKey(deck.name);
        data[key] = deck;

        return Storage.setItem(data).then(() =>
            ConfigStorage.getIt().then(config => {
                let { names } = config.decks;

                names.splice(names.indexOf(old_name), 1);
                names.push(deck.name);

                config.decks.names = names;

                if (old_name && old_name === config.decks.active_name) {
                    config.decks.active_name = deck.name;
                }

                return ConfigStorage.setIt(config);
            })
        );
    },

    addDeck = deck => {
        let data = {},
            key = getKey(deck.name);

        data[key] = deck;

        return Storage.setItem(data).then(() => ConfigStorage.extendIt({
            decks: {
                names: [ deck.name ]
            }
        }));
    },

    selectDeck = name => ConfigStorage.extendIt({ decks: { active_name: name } }),

    getDeck = name => {
        let key = getKey(name);

        return Storage.getItem(key).then(result => result[key]);
    },

    getDecks = () =>
        ConfigStorage.getIt().then(config => {
            let deck_promises = config.decks.names.map(deck_name => getDeck(deck_name));

            return Promise.all(deck_promises).then(result => {
                let obj = {};

                result.forEach(deck => {
                    obj[deck.name] = deck;
                });

                return obj;
            });
        }),

    removeDeck = deck => {
        let { name } = deck;

        return Promise.all([ Storage.removeItem(getKey(name)), ConfigStorage.getIt().then(config => {
            let index = config.decks.names.indexOf(name);

            config.decks.names.splice(index, 1);
            config.decks.active_name = null;

            return ConfigStorage.setIt(config);
        })]);
    },

    getActiveDeck = () => ConfigStorage.getIt().then(config => getDeck(config.decks.active_name));

export default {
    init,
    createDeck,
    getDeck,
    getActiveDeck,
    getDecks,
    selectDeck,
    updateDeck,
    removeDeck
};