var Storage = require('./Storage'),
    ConfigStorage = require('./ConfigStorage');

var init = function () {
        return ConfigStorage.getIt().then(function (config) {
            if (config.decks.names.length === 0) {
                return createDeck('basic', 'Basic deck').then(function (basic_deck) {
                    return selectDeck(basic_deck.name);
                });
            }
        });
    },

    getKey = function (name) {
        return 'deck_' + name;
    },

    createDeck = function (name, description) {
        var new_deck = {
            name: name,
            desc: description,
            cards: {}
        };

        return addDeck(new_deck).then(function () {
            return new_deck;
        });
    },

    updateDeck = function (deck) {
        var old_key, old_name, key,
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

        return Storage.setItem(data).then(function () {
            return ConfigStorage.getIt().then(function (config) {
                var names = config.decks.names;

                names.splice(names.indexOf(old_name), 1);
                names.push(deck.name);

                config.decks.names = names;

                if (old_name && old_name === config.decks.active_name) {
                    config.decks.active_name = deck.name;
                }

                return ConfigStorage.setIt(config);
            });
        });
    },

    addDeck = function (deck) {
        var data = {},
            key = getKey(deck.name);

        data[key] = deck;

        return Storage.setItem(data).then(function () {
            return ConfigStorage.extendIt({
                decks: {
                    names: [ deck.name ]
                }
            });
        });
    },

    selectDeck = function (name) {
        return ConfigStorage.extendIt({ decks: { active_name: name } });
    },

    getDeck = function (name) {
        var key = getKey(name);

        return Storage.getItem(key).then(function (result) {
            return result[key];
        });
    },

    getDecks = function () {
        return ConfigStorage.getIt().then(function (config) {
            var deck_promises = config.decks.names.map(function (deck_name) {
                return getDeck(deck_name);
            });

            return Promise.all(deck_promises).then(function (result) {
                var obj = {};

                result.forEach(function (deck) {
                    obj[deck.name] = deck;
                });

                return obj;
            });
        });
    },

    removeDeck = function (deck) {
        var name = deck.name;

        return Promise.all([ Storage.removeItem(getKey(name)), ConfigStorage.getIt().then(function (config) {
            var index = config.decks.names.indexOf(name);

            config.decks.names.splice(index, 1);
            config.decks.active_name = null;

            return ConfigStorage.setIt(config);
        })]);
    },

    getActiveDeck = function () {
        return ConfigStorage.getIt().then(function (config) {
            return getDeck(config.decks.active_name);
        });
    };

module.exports = {
    init            : init,
    createDeck      : createDeck,
    getDeck         : getDeck,
    getActiveDeck   : getActiveDeck,
    getDecks        : getDecks,
    selectDeck      : selectDeck,
    updateDeck      : updateDeck,
    removeDeck      : removeDeck
};