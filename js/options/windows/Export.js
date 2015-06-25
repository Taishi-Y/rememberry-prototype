var rb = require('../../utils/common'),
    Message = require('../Message'),
    AJAX = require('../../utils/AJAX');

var window_el, models_dropdown, decks_dropdown, export_btn, back_btn, cards_to_export, props,

    initDOM = function () {
        window_el       = document.getElementById('export-window'),
        models_dropdown = document.getElementById('model'),
        decks_dropdown  = document.getElementById('deck'),
        export_btn      = document.getElementById('export-btn'),
        back_btn        = window_el.getElementsByClassName('back')[0],

        // provide localization
        window_el.querySelector('h3').innerHTML                 = chrome.i18n.getMessage('Choose_Anki_model_and_deck');
        window_el.querySelector('label[for="model"]').innerHTML = chrome.i18n.getMessage('Model');
        window_el.querySelector('label[for="deck"]').innerHTML  = chrome.i18n.getMessage('Deck');
        window_el.querySelector('#export-btn').innerHTML        = chrome.i18n.getMessage('Export');
        window_el.querySelector('.back').innerHTML              = chrome.i18n.getMessage('Back');

        // add event listeners
        export_btn.addEventListener('click', exportData);

        back_btn.addEventListener('click', function () {
            props.onBack();
        });
    },

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
            cards = cards_to_export.slice(),
            export_sequence = Promise.resolve();

        Message.show(chrome.i18n.getMessage('Exporting'), false);

        cards.forEach(function (card) {
            export_sequence = export_sequence.then(function () {
                var data = {
                    data: JSON.stringify([ [ card.orig, card.translation ], '' ]),
                    mid : anki_model_id,
                    deck: anki_deck_name
                };

                return AJAX.request('get', 'https://ankiweb.net/edit/save', data);
            });
        });

        export_sequence.then(function () {
            props.onSuccess();
        });
    };

module.exports = {
    init: function (new_props) {
        props = new_props;
        initDOM();
    },

    show: function (anki_data, cards) {
        rb.DOM.show(window_el);
        models_dropdown.focus();

        cards_to_export = cards;
        initWithData(anki_data);
    },

    hide: function () {
        rb.DOM.hide(window_el);
    }
};