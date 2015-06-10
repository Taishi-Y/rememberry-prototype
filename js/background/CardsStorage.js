var CardsStorage = (function () {
    var setCards = function (cards) {
            Storage.set({ cards: cards });
        },

        getCards = function () {
            return new Promise(function (resolve) {
                Storage.get('cards', function (data) {
                    resolve(data.cards || {});
                })
            });
        },

        addCard = function (info) {
            getCards().then(function (cards) {
                var card,
                    source = info.orig,
                    translation = info.translation;

                if (!cards.hasOwnProperty(source)) {
                    cards[source] = {
                        t: translation,
                        n: 0,
                        i: 0,
                        d: Date.now(),
                        ef: 2.5
                    };
                } else {
                    card = cards[source];
                    card.t = rb.unique(card.t.concat(translation));
                }

                setCards(cards);
            });
        };

    // public API
    return {
        addCard: addCard,
        setCards: setCards,
        getCards: getCards
    };
}());