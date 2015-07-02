import rb from 'js/utils/common';
import SM2 from 'js/utils/SM2';
import DeckStorage from './DeckStorage';

let setCards = cards =>
        DeckStorage.getActiveDeck().then(active_deck => {
            active_deck.cards = cards;

            return DeckStorage.updateDeck(active_deck);
        }),

    getCards = () =>
        DeckStorage.getActiveDeck().then(active_deck => active_deck.cards),

    addCard = info =>
        getCards().then(cards => {
            let card,
                { source, translation } = info;

            if (!cards.hasOwnProperty(source)) {
                cards[source] = rb.override({ t: translation }, SM2.getInitData());
            } else {
                card = cards[source];
                card.t = rb.unique(card.t.concat(translation));
            }

            return setCards(cards);
        });

export default {
    addCard,
    setCards,
    getCards
};