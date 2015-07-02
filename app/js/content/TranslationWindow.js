import rb from 'js/utils/common';
import bgAPI from 'js/utils/bgAPI';
import AJAX from 'js/utils/AJAX';

// private members
const BASE_ID = 'rememberry-popup';

let props,
    tr_id       = 0,    // used to provide translation-response validation (use only latest response)
    is_created  = false,
    is_shown    = false,
    CSS = AJAX.request('get',
        'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/css/content.min.css'),

    els = { // DOM elements
        host    : null,
        header  : null,
        belly   : null,
        footer  : null,
        save_btn: null,
        sections: null
    },

    state = {
        orig        : null,
        translation : null
    },

    create = () => {
        let host_el     = rb.DOM.node(`<div id="${BASE_ID}" hidden></div>`),
            root_el     = host_el.createShadowRoot(),
            body_el     = rb.DOM.node('<div class="body"></div>'),
            header_el   = rb.DOM.node('<div class="header"></div>'),
            belly_el    = rb.DOM.node('<div class="belly"></div>'),
            footer_el   = createFooter(),
            style_el    = document.createElement('style');

        body_el.appendChild(header_el);
        body_el.appendChild(belly_el);
        body_el.appendChild(footer_el);

        root_el.appendChild(style_el);
        root_el.appendChild(body_el);

        CSS.then((css_text) => {
            style_el.innerHTML = css_text;
        });

        document.body.appendChild(host_el);

        els.host    = host_el;
        els.root    = root_el;
        els.header  = header_el;
        els.belly   = belly_el;
        els.footer  = footer_el;
        els.sections = [];

        is_created = true;
    },

    createFooter = () => {
        let footer_el = rb.DOM.node('<div class="footer" hidden></div>'),
            save_btn = rb.DOM.node(
                    '<button class="save-btn">' +
                        chrome.i18n.getMessage('Save') +
                    '</button>'),
            add_custom_btn = rb.DOM.node(
                    '<button class="custom-btn">' +
                        chrome.i18n.getMessage('Custom') +
                    '</button>');

        els.save_btn = save_btn;
        save_btn.addEventListener('click', handleSave);
        add_custom_btn.addEventListener('click', addCustomTranslation);
        footer_el.appendChild(save_btn);
        footer_el.appendChild(add_custom_btn);

        return footer_el;
    },

    createTermLine = (term, is_checked, editable) => {
        let line_el     = rb.DOM.node('<div class="term-line"></div>'),
            checkbox_el = rb.DOM.node('<input type="checkbox" class="term-line-checkbox"/>'),
            text_el     = rb.DOM.node(`<span class="term">${term}</span>`);

        checkbox_el.checked = !!is_checked;

        if (editable) {
            text_el.setAttribute('contenteditable', 'true');

            text_el.addEventListener('keypress', e => {
                if (e.keyCode === 13) { // Enter key-code
                    e.preventDefault();
                    els.save_btn.focus();
                }
            });
        }

        checkbox_el.addEventListener('click', e => {
            e.stopPropagation();
        });

        line_el.appendChild(checkbox_el);
        line_el.appendChild(text_el);

        line_el.addEventListener('click', () => {
            if (!editable) {
                checkbox_el.checked = !checkbox_el.checked;
            } else {
                text_el.focus();
            }
        });

        return {
            el: line_el,

            getText: () => text_el.innerText,

            focus() {
                text_el.focus();
            },

            isChecked: () => checkbox_el.checked
        };
    },

    show = pos => {
        if (!is_shown) {
            rb.DOM.show(els.host);
            setPosition(pos);
            document.body.addEventListener('click', handleClick, true);
            document.body.addEventListener('keyup', handleKeyUp, true);
            is_shown = true;
        }
    },

    destroy = () => {
        if (is_shown) {
            rb.DOM.hide([ els.host, els.footer ]);
            document.body.removeEventListener('click', handleClick, true);
            document.body.removeEventListener('keyup', handleKeyUp, true);
            reset();
            is_shown = false;
        }
    },

    getSection = type => {
        if (!els.sections[type]) {
            els.sections[type] = rb.DOM.node(
                `<div class="pos-container">
                    <div class="pos-header">${type}</div>
                </div>`);

            els.belly.appendChild(els.sections[type]);
        }

        return els.sections[type];
    },

    handleResponse = translation => {
        let checked = true;

        state.translation = [];

        for (let type in translation) {
            if (translation.hasOwnProperty(type)) {
                let data = translation[type],
                    section_el = getSection(data.name),
                    { terms } = data;

                terms.forEach(term => {
                    let term_line = createTermLine(term, checked);

                    state.translation.push(term_line);
                    section_el.appendChild(term_line.el);

                    if (checked) {
                        checked = false;
                    }
                });
            }
        }

        setLoader(false);
        rb.DOM.show(els.footer);
        els.save_btn.focus();
    },

    setLoader = set_active => {
        let LOADING_ATTR_NAME = 'loading';

        if (set_active) {
            els.belly.setAttribute(LOADING_ATTR_NAME, '');
        } else {
            els.belly.removeAttribute(LOADING_ATTR_NAME);
        }
    },

    setPosition = pos => {
        if (pos) {
            rb.override(els.host.style, pos);
        } else {
            els.host.removeAttribute('style');
        }
    },

    handleKeyUp = e => {
        if (e.keyCode === 27) { // Escape key code
            destroy();
        }
    },

    handleClick = e => {
        if (els.host !== e.target) {
            destroy();
        }
    },

    reset = () => {
        els.belly.innerHTML = '';
        els.sections = [];

        setPosition(null);
        setLoader(false);
        state = {};
    },

    handleSave = () => {
        let checked_terms = [];

        state.translation.forEach(term => {
            if (term.isChecked() && term.getText().trim().length) {
                checked_terms.push(term.getText());
            }
        });

        if (checked_terms.length) {
            bgAPI.add('card', {
                orig: state.orig,
                translation: checked_terms
            });

            destroy();
        } else {
            window.alert(chrome.i18n.getMessage('Make_your_choice'));
        }
    },

    addCustomTranslation = () => {
        let term = createTermLine('', true, true);

        getSection(chrome.i18n.getMessage('Custom').toLowerCase()).appendChild(term.el);
        term.focus();
        state.translation.push(term);
    };

export default {
    init(initial_props) {
        props = initial_props;
    },

    translateText(text) {
        if (window.navigator.onLine) {
            let pos;

            if (text) {
                pos = {
                    position: 'fixed',
                    top: '0px',
                    right: '0px'
                };
            } else {
                let selection = document.getSelection(),
                    selected_text = selection.toString().trim();

                if (selected_text.length) {
                    let text_range = selection.getRangeAt(0),
                        rect = text_range.getBoundingClientRect();

                    pos = {
                        position: 'absolute',
                        top: window.scrollY + rect.bottom + 'px',
                        left: window.scrollX + rect.left + 'px'
                    };

                    text = selected_text;
                }
            }

            if (!is_created) {
                create();
            }

            if (is_shown) {
                destroy();
            }

            if (text.length) {
                state.orig = text;

                show(pos);
                setLoader(true);

                if (text.length < 3) {
                    text += '..';
                }

                ((id => {
                    //setTimeout(() => {
                    bgAPI.translate(text, props.source_lang, props.target_lang)
                        .then((...args) => {
                            if (id === tr_id) {
                                handleResponse(...args);
                            }
                        }, (...args) => {
                            if (id === tr_id) {
                                destroy(...args);
                            }
                        });
                    //}, 2000);
                })(++tr_id));
            }
        } else {
            window.alert(chrome.i18n.getMessage('You_are_offline'));
        }
    }
};