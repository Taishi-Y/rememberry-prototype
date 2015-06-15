rb.DOM.onReady.then(function () {
    var message_el      = document.getElementById('message'),
        test_el         = document.getElementById('test'),
        source_el       = document.getElementById('source'),
        translation_el  = document.getElementById('translation'),
        show_answer_btn = document.getElementById('show-answer-btn'),
        mark_area       = document.getElementById('mark-area');

    (function provideLocalization() {
        message_el.innerHTML = chrome.i18n.getMessage('Loading');
        show_answer_btn.innerHTML = chrome.i18n.getMessage('Show_answer');
        document.querySelector('#mark-area [data-quality="5"]').innerHTML = chrome.i18n.getMessage('Easy');
        document.querySelector('#mark-area [data-quality="4"]').innerHTML = chrome.i18n.getMessage('Good');
        document.querySelector('#mark-area [data-quality="3"]').innerHTML = chrome.i18n.getMessage('Hard');
    }());

    bgAPI.receive('cards').then(function (cards) {
        var getCardInfo, showNextCard, init, handleResponse, saveChanges, setState, current;

        init = function () {
            rb.DOM.hide(message_el);
            rb.DOM.show(test_el);

            show_answer_btn.addEventListener('click', setState.bind(null, 'assess'));

            mark_area.addEventListener('click', function (e) {
                var quality = e.target.dataset.quality;

                if (quality) {
                    handleResponse(quality);
                }
            });
        };

        setState = function (state) {
            switch (state) {
                case 'answer':
                    rb.DOM.show(show_answer_btn);
                    rb.DOM.hide([ mark_area, translation_el ]);
                    break;
                case 'assess':
                    rb.DOM.hide(show_answer_btn);
                    rb.DOM.show([ mark_area, translation_el ]);
                    break;
                case 'complete':
                    source_el.innerHTML = '';
                    translation_el.innerHTML = '';
                    message_el.innerHTML = chrome.i18n.getMessage('Nothing_to_learn');
                    rb.DOM.hide(test_el);
                    rb.DOM.show(message_el);
                    break;
                default:
            }
        };

        handleResponse = function (quality) {
            SM2.updateCardWithQuality(current.card, quality);
            saveChanges();
            showNextCard();
        };

        getCardInfo = function () {
            var source, card;

            for (source in cards) {
                if (cards.hasOwnProperty(source)) {
                    card = cards[source];

                    if (SM2.isCardRipened(card)) {
                        return {
                            name: source,
                            card: card
                        };
                    }
                }
            }
        };

        showNextCard = function () {
            var card_info = getCardInfo();

            if (card_info) {
                setState('answer');
                source_el.innerHTML = card_info.name;
                translation_el.innerHTML = card_info.card.t.join(', ');

                current = card_info;
            } else {
                setState('complete');
            }
        };

        saveChanges = function () {
            bgAPI.send('cards', cards);
        };

        init();
        showNextCard();
    });
});