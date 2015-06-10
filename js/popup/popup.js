rb.onDomReady.then(function () {
    var message_el      = document.getElementById('message'),
        test_el         = document.getElementById('test'),
        source_el       = document.getElementById('source'),
        translation_el  = document.getElementById('translation'),
        show_answer_btn = document.getElementById('show-answer-btn'),
        mark_area       = document.getElementById('mark-area');

    bgAPI.receive('cards', function (cards) {
        var getCardInfo, showNextCard, init, handleResponse, reset, saveChanges, finished, current;

        init = function () {
            rb.hide([ message_el, mark_area ]);
            rb.show(test_el);

            show_answer_btn.addEventListener('click', function () {
                rb.hide(show_answer_btn);
                rb.show([ mark_area, translation_el ]);
            });

            mark_area.addEventListener('click', function (e) {
                var quality = e.target.dataset.quality;

                if (quality) {
                    handleResponse(quality);
                }
            });
        };

        reset = function () {
            source_el.innerHTML = '';
            translation_el.innerHTML = '';
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

        finished = function () {
            reset();
            message_el.innerHTML = 'Nothing to learn';
            rb.hide(test_el);
            rb.show(message_el);
        };

        showNextCard = function () {
            var card_info = getCardInfo();

            if (card_info) {
                source_el.innerHTML = card_info.name;
                translation_el.innerHTML = card_info.card.t.join(', ');

                current = card_info;
            } else {
                finished();
            }
        };

        saveChanges = function () {
            bgAPI.send('cards', cards);
        };

        init();
        showNextCard();
    });
});