import rb from 'js/utils/common';
import bgAPI from 'js/utils/bgAPI';
import Message from 'js/options/Message';

let window_el, props,

    initDOM = () => {
        window_el = document.querySelector('.options-window');

        (function provideLocalization() {
            window_el.querySelector('#languages-menu h3').innerHTML         = chrome.i18n.getMessage('Languages');
            window_el.querySelector('label[for="source-lang"]').innerHTML   = chrome.i18n.getMessage('Source_language');
            window_el.querySelector('label[for="target-lang"]').innerHTML =
                    window_el.querySelector('label[for="target-lang"]').title = chrome.i18n.getMessage('Target_language');

            window_el.querySelector('#action-menu h3').innerHTML        = chrome.i18n.getMessage('Modifiers');
            window_el.querySelector('label[for="action"]').innerHTML    = chrome.i18n.getMessage('Trigger_action');
            window_el.querySelector('label[for="modifier"]').innerHTML  = chrome.i18n.getMessage('Key_modifier');

            window_el.querySelector('.deck-menu h3').innerHTML                              = chrome.i18n.getMessage('Decks');
            window_el.querySelector('.deck-menu label[for="selected-deck"]').innerHTML      = chrome.i18n.getMessage('Deck');
            window_el.querySelector('.btn-area button[data-action="activate"]').innerHTML   = chrome.i18n.getMessage('Make_active');
            window_el.querySelector('.btn-area button[data-action="add"]').innerHTML        = chrome.i18n.getMessage('Add');
            window_el.querySelector('.btn-area button[data-action="remove"]').innerHTML     = chrome.i18n.getMessage('Remove');
            window_el.querySelector('.btn-area button[data-action="clear"]').innerHTML      = chrome.i18n.getMessage('Clear');
            window_el.querySelector('.btn-area button[data-action="export"]').innerHTML     = chrome.i18n.getMessage('Export_to_Anki');
            window_el.querySelector('.btn-area button[data-action="update"]').innerHTML     = chrome.i18n.getMessage('Update');
            window_el.querySelector('.deck-info label[for="cards-count"]').innerHTML        = chrome.i18n.getMessage('Cards_count');
            window_el.querySelector('.deck-info label[for="deck-name"]').innerHTML          = chrome.i18n.getMessage('Deck_name');
            window_el.querySelector('.deck-info label[for="deck-desc"]').innerHTML          = chrome.i18n.getMessage('Deck_description');
        }());

        (function initLanguageMenu() {
            bgAPI.receive([ 'config', 'languages' ]).spread((config, languages) => {
                let source_lang_el = document.getElementById('source-lang'),
                    target_lang_el = document.getElementById('target-lang');

                (function fillMenusWithLanguages() {
                    let appendOption,
                        source_lang = config.source_lang,
                        target_lang = config.target_lang;

                    appendOption = (parent, value, text, active_value) => {
                        let option_el = rb.DOM.node(`<option value="${value}">${text}</option>`);

                        parent.appendChild(option_el);

                        if (value === active_value) {
                            parent.selectedIndex = parent.children.length - 1;
                        }
                    };

                    appendOption(source_lang_el, 'auto', chrome.i18n.getMessage('Detect'), source_lang);

                    for (let code in languages) {
                        let language = languages[code];

                        appendOption(source_lang_el, code, language, source_lang);
                        appendOption(target_lang_el, code, language, target_lang);
                    }
                }());

                (function listenOnChange() {
                    source_lang_el.addEventListener('change', () => {
                        bgAPI.send('config', {
                            source_lang: source_lang_el.children[source_lang_el.selectedIndex].value
                        });
                    });

                    target_lang_el.addEventListener('change', () => {
                        bgAPI.send('config', {
                            target_lang: target_lang_el.children[target_lang_el.selectedIndex].value
                        });
                    });
                }());
            });
        }());

        (function initActionMenu() {
            bgAPI.receive([ 'config', 'actions' ]).spread((config, actions) => {
                let names_el = document.getElementById('action'),
                    modifiers_el = document.getElementById('modifier');

                (function fillMenusWithActions() {
                    let i, l, appendOption,
                        event_names = actions.names,
                        modifiers = actions.modifiers,
                        selected_event_name = config.action.name,
                        selected_modifier = config.action.modifier;

                    appendOption = (parent, value, active_value) => {
                        let el = rb.DOM.node(`<option value="${value}">${value}</option>`);

                        parent.appendChild(el);

                        if (value === active_value) {
                            parent.selectedIndex = i;
                        }
                    };

                    for (i = 0, l = event_names.length; i < l; i++) {
                        appendOption(names_el, event_names[i], selected_event_name);
                    }

                    for (i = 0, l = modifiers.length; i < l; i++) {
                        appendOption(modifiers_el, modifiers[i], selected_modifier);
                    }
                }());

                (function listenOnChange() {
                    names_el.addEventListener('change', () => {
                        bgAPI.send('config', {
                            action: {
                                name: names_el.selectedOptions[0].value
                            }
                        });
                    });

                    modifiers_el.addEventListener('change', () => {
                        bgAPI.send('config', {
                            action: {
                                modifier: modifiers_el.selectedOptions[0].value
                            }
                        });
                    });
                }());
            });
        }());

        (function initDeckMenu() {
            bgAPI.receive([ 'config', 'decks' ]).spread((config, local_decks) => {
                let selected_deck,
                    startup_active_deck_name    = config.decks.active_name,
                    deck_select_el              = document.getElementById('selected-deck'),
                    info_el                     = window_el.querySelector('.deck-info'),
                    cards_count_el              = window_el.querySelector('.cards-count'),
                    name_el                     = document.getElementById('deck-name'),
                    desc_el                     = document.getElementById('deck-desc'),
                    btn_area_el                 = window_el.getElementsByClassName('btn-area')[0];

                let changeDeck = name => {
                        selected_deck = local_decks[name];
                        rb.DOM.selectByValue(deck_select_el, name);

                        cards_count_el.innerHTML = Object.keys(selected_deck.cards).length;
                        name_el.value = selected_deck.name;
                        desc_el.value = selected_deck.desc;
                    },

                    appendDeckOption = deck => {
                        deck_select_el.appendChild(
                                rb.DOM.node(`<option value="${deck.name}">${deck.name}</option>`));
                    },

                    performAction = action => {
                        switch (action) {
                            case 'activate':
                                bgAPI.send('active-deck', selected_deck.name);
                                break;
                            case 'add':
                                ((() => {
                                    let listener = e => {
                                            if (e.keyCode === 13 && name_el.value.trim().length) {
                                                if (!local_decks.hasOwnProperty(name_el.value)) {
                                                    create(name_el.value);
                                                    name_el.blur();
                                                    desc_el.focus();
                                                } else {
                                                    name_el.blur();
                                                    Message.show(chrome.i18n.getMessage('Deck_with_this_name_already_exists'));
                                                }
                                            }
                                        },

                                        clearInput = () => {
                                            if (name_el.value === '') {
                                                changeDeck(deck_select_el.selectedOptions[0].value);
                                            }

                                            name_el.removeEventListener('keypress', listener);
                                            name_el.removeEventListener('blur', clearInput);
                                        },

                                        create = name => {
                                            bgAPI.add('deck', {
                                                name,
                                                desc: ''
                                            }).then(new_deck => {
                                                local_decks[name] = new_deck;
                                                appendDeckOption(new_deck);
                                                changeDeck(name);
                                                performAction('activate');
                                            });
                                        };

                                    name_el.addEventListener('keypress', listener);
                                    name_el.addEventListener('blur', clearInput);

                                    name_el.value = '';
                                    desc_el.value = '';

                                    rb.DOM.show(info_el);
                                    name_el.focus();
                                })());
                                break;
                            case 'remove':
                                if (Object.keys(local_decks).length > 1) {
                                    ((deck_to_remove => {
                                        bgAPI.remove('deck', deck_to_remove).then(() => {
                                            let first_deck_name;

                                            delete local_decks[deck_to_remove.name];
                                            deck_select_el.removeChild(
                                                    deck_select_el.querySelector(`option[value="${deck_to_remove.name}"]`));

                                            first_deck_name = Object.keys(local_decks)[0];
                                            changeDeck(first_deck_name);
                                            performAction('activate');
                                        });
                                    })(selected_deck));
                                }

                                break;
                            case 'clear':
                                selected_deck.cards = [];
                                cards_count_el.innerHTML = '0';
                                bgAPI.send('deck', selected_deck);
                                break;
                            case 'export':
                                if (window.navigator.onLine) {
                                    if (Object.keys(selected_deck.cards).length) {
                                        ((() => {
                                            let cards = selected_deck.cards,
                                                cards_to_export = [];

                                            for (let card_name in cards) {
                                                if (cards.hasOwnProperty(card_name)) {
                                                    let card = cards[card_name];

                                                    cards_to_export.push({
                                                        orig: card_name,
                                                        translation: card.t.join(', ')
                                                    });
                                                }
                                            }

                                            props.onExportStart(cards_to_export);
                                        })());
                                    } else {
                                        Message.show(chrome.i18n.getMessage('No_cards_in_deck'));
                                    }
                                } else {
                                    Message.show(chrome.i18n.getMessage('You_are_offline'));
                                }

                                break;
                            case 'update':
                                ((() => {
                                    let deck_to_update = JSON.parse(JSON.stringify(selected_deck)),
                                        old_name = selected_deck.name,
                                        option_el = deck_select_el.querySelector(
                                                `option[value="${selected_deck.name}"]`);

                                    deck_to_update.new_name = selected_deck.name = option_el.value = option_el.innerHTML =
                                            name_el.value;
                                    deck_to_update.desc = selected_deck.desc = desc_el.value;
                                    delete local_decks[old_name];
                                    local_decks[name_el.value] = selected_deck;

                                    bgAPI.send('deck', deck_to_update);
                                })());

                                break;
                            default:
                        }
                    };

                deck_select_el.addEventListener('change', () => {
                    changeDeck(deck_select_el.selectedOptions[0].value);
                });

                btn_area_el.addEventListener('click', e => {
                    if (e.target.tagName.toLowerCase() === 'button') {
                        performAction(e.target.dataset.action);
                    }
                });

                for (let deck_name in local_decks) {
                    if (local_decks.hasOwnProperty(deck_name)) {
                        appendDeckOption(local_decks[deck_name]);
                    }
                }

                if (deck_select_el.selectedOptions[0].value === startup_active_deck_name) {
                    changeDeck(startup_active_deck_name);
                } else {
                    rb.DOM.selectByValue(deck_select_el, startup_active_deck_name);
                    changeDeck(deck_select_el.selectedOptions[0].value);
                }
            });
        }());
    };

export default {
    init(initial_props) {
        props = initial_props;
        initDOM();
    },

    show() {
        rb.DOM.show(window_el);
    },

    hide() {
        rb.DOM.hide(window_el);
    }
};