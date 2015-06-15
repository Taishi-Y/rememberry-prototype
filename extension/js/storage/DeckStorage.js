var DeckStorage = (function () {
    var init = function () {
            ConfigStorage.getIt().then(function (config) {
                if (config.decks.names.length === 0) {
                    createDeck('basic', 'Basic deck').then(function (basic_deck) {
                        selectDeck(basic_deck.name);
                    });
                }
            });
        },

        getKey = function (name) {
            return 'deck_' + name;
        },

        createDeck = function (name, description) { return new Promise(function (resolve) {
            var new_deck = {
                name: name,
                desc: description,
                cards: {}
            };

            addDeck(new_deck).then(resolve.bind(null, new_deck));
        })},

        updateDeck = function (deck) { return new Promise(function (resolve) {
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

            Storage.setItem(data).then(function () {
                ConfigStorage.getIt().then(function (config) {
                    var names = config.decks.names;

                    names.splice(names.indexOf(old_name), 1);
                    names.push(deck.name);

                    config.decks.names = names;

                    if (old_name && old_name === config.decks.active_name) {
                        config.decks.active_name = deck.name;
                    }

                    ConfigStorage.setIt(config).then(resolve);
                });
            });
        })},

        addDeck = function (deck) { return new Promise(function (resolve) {
            var data = {},
                key = getKey(deck.name);

            data[key] = deck;

            Storage.setItem(data).then(function () {
                ConfigStorage.extendIt({
                    decks: {
                        names: [ deck.name ]
                    }
                }).then(resolve);
            });
        })},

        selectDeck = function (name) {
            ConfigStorage.extendIt({ decks: { active_name: name  } });
        },

        getDeck = function (name) {
            var key = getKey(name);

            return Storage.getItem(key).then(function (result) {
                return result[key];
            });
        },

        getDecks = function () { return new Promise(function (resolve) {
            ConfigStorage.getIt().then(function (config) {
                var deck_promises = [];

                config.decks.names.forEach(function (deck_name) {
                    deck_promises.push(new Promise(function (resolve) {
                        getDeck(deck_name).then(resolve)
                    }));
                });

                Promise.all(deck_promises).then(function (result) {
                    var obj = {};

                    result.forEach(function (deck) {
                        obj[deck.name] = deck;
                    });

                    resolve(obj);
                });
            });
        })},

        removeDeck = function (deck) { return new Promise(function (resolve) {
            var name = deck.name;

            Storage.removeItem(getKey(name));

            ConfigStorage.getIt().then(function (config) {
                var index = config.decks.names.indexOf(name);

                config.decks.names.splice(index, 1);
                config.decks.active_name = null;
                ConfigStorage.setIt(config).then(resolve);
            });
        })},

        getActiveDeck = function () { return new Promise(function (resolve) {
            ConfigStorage.getIt().then(function (config) {
                getDeck(config.decks.active_name).then(resolve);
            });
        })};

    return {
        init: init,
        createDeck: createDeck,
        getDeck: getDeck,
        getActiveDeck: getActiveDeck,
        getDecks: getDecks,
        selectDeck: selectDeck,
        updateDeck: updateDeck,
        removeDeck: removeDeck
    };
}());