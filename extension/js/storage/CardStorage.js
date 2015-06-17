var CardStorage = (function () {
    var setCards = function (cards) {
            DeckStorage.getActiveDeck().then(function (active_deck) {
                active_deck.cards = cards;
                DeckStorage.updateDeck(active_deck);
            });
        },

        getCards = function () {
            return DeckStorage.getActiveDeck().then(function (active_deck) {
                return active_deck.cards;
            });
        },

        addCard = function (info) {
            getCards().then(function (cards) {
                var card,
                    source = info.orig,
                    translation = info.translation;

                if (!cards.hasOwnProperty(source)) {
                    cards[source] = rb.extend({ t: translation}, SM2.getInitData());
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