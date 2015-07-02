import rb from 'js/utils/common';
import Message from '../Message';
import AJAX from 'js/utils/AJAX';

let window_el, models_dropdown, decks_dropdown, export_btn, back_btn, cards_to_export, props,

    exportData = () => {
        let anki_model_id = models_dropdown.selectedOptions[0].value,
            anki_deck_name = decks_dropdown.selectedOptions[0].value,
            cards = cards_to_export.slice(),
            export_sequence = Promise.resolve();

        Message.show(chrome.i18n.getMessage('Exporting'), false);

        cards.forEach(card => {
            export_sequence = export_sequence.then(() => {
                let data = {
                    data: JSON.stringify([ [ card.orig, card.translation ], '' ]),
                    mid : anki_model_id,
                    deck: anki_deck_name
                };

                return AJAX.request('get', 'https://ankiweb.net/edit/save', data);
            });
        });

        export_sequence.then(() => {
            props.onSuccess();
        });
    },

    initWithData = data => {
        let { models, decks } = data;

        models.forEach(model => {
            models_dropdown.appendChild(
                rb.DOM.node(`<option value="${model.id}">${model.name}</option>`));
        });

        decks.forEach(deck => {
            decks_dropdown.appendChild(
                rb.DOM.node(`<option value="${deck}">${deck}</option>`));
        });
    },

    initDOM = () => {
        window_el       = document.getElementById('export-window');
        models_dropdown = document.getElementById('model');
        decks_dropdown  = document.getElementById('deck');
        export_btn      = document.getElementById('export-btn');
        back_btn        = window_el.getElementsByClassName('back')[0];

        // provide localization
        window_el.querySelector('h3').innerHTML                 = chrome.i18n.getMessage('Choose_Anki_model_and_deck');
        window_el.querySelector('label[for="model"]').innerHTML = chrome.i18n.getMessage('Model');
        window_el.querySelector('label[for="deck"]').innerHTML  = chrome.i18n.getMessage('Deck');
        window_el.querySelector('#export-btn').innerHTML        = chrome.i18n.getMessage('Export');
        window_el.querySelector('.back').innerHTML              = chrome.i18n.getMessage('Back');

        // add event listeners
        export_btn.addEventListener('click', exportData);

        back_btn.addEventListener('click', () => {
            props.onBack();
        });
    };

export default {
    init(initial_props) {
        props = initial_props;
        initDOM();
    },

    show(anki_data, cards) {
        rb.DOM.show(window_el);
        models_dropdown.focus();

        cards_to_export = cards;
        initWithData(anki_data);
    },

    hide() {
        rb.DOM.hide(window_el);
    }
};