var CardsStorage = (function () {
    var setCards = function (cards) {
            DeckStorage.getActiveDeck().then(function (active_deck) {
                active_deck.cards = cards;
                DeckStorage.updateDeck(active_deck);
            });
        },

        getCards = function () { return new Promise(function (resolve) {
            DeckStorage.getActiveDeck().then(function (active_deck) {
                resolve(active_deck.cards);
            });
        })},

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