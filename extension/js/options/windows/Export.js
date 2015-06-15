rb.DOM.onReady.then(function () {
    var window_el       = document.getElementById('export-window'),
        models_dropdown = document.getElementById('model'),
        decks_dropdown  = document.getElementById('deck'),
        export_btn      = document.getElementById('export-btn'),
        back_btn        = window_el.getElementsByClassName('back')[0],

        initWithData = function (data) {
            var models = data.models,
                decks = data.decks;

            models.forEach(function (model) {
                models_dropdown.appendChild(
                    rb.DOM.node('<option value="' + model.id + '">' + model.name +'</option>'));
            });

            decks.forEach(function (deck) {
                decks_dropdown.appendChild(
                    rb.DOM.node('<option value="' + deck + '">' + deck + '</option>'));
            });
        },

        exportData = function () {
            var anki_model_id = models_dropdown.selectedOptions[0].value,
                anki_deck_name = decks_dropdown.selectedOptions[0].value,
                cards = Windows.cards_to_export.slice(),

                finish = function () {
                    Message.show(chrome.i18n.getMessage('Successfully_exported'), true, 2000);
                    Windows.show('options');
                },

                saveNext = function () {
                    var next, data;

                    if (cards.length) {
                        next = cards.shift();

                        data = {
                            data: JSON.stringify([ [ next.orig, next.translation ], '' ]),
                            mid : anki_model_id,
                            deck: anki_deck_name
                        };

                        AJAX.request('get', 'https://ankiweb.net/edit/save', data).then(saveNext);
                    } else {
                        finish();
                    }
                };

            Message.show(chrome.i18n.getMessage('Exporting'), false);

            saveNext();
        };

    (function provideLocalization() {
        window_el.querySelector('h3').innerHTML                 = chrome.i18n.getMessage('Choose_Anki_model_and_deck');
        window_el.querySelector('label[for="model"]').innerHTML = chrome.i18n.getMessage('Model');
        window_el.querySelector('label[for="deck"]').innerHTML  = chrome.i18n.getMessage('Deck');
        window_el.querySelector('#export-btn').innerHTML        = chrome.i18n.getMessage('Export');
        window_el.querySelector('.back').innerHTML              = chrome.i18n.getMessage('Back');
    }());

    export_btn.addEventListener('click', exportData);

    back_btn.addEventListener('click', function () {
        Windows.show('login');
    });

    Windows.add('export', {
        show: function (anki_data) {
            rb.DOM.show(window_el);
            models_dropdown.focus();

            initWithData(anki_data);
        },

        hide: function () {
            rb.DOM.hide(window_el);
        }
    });
});