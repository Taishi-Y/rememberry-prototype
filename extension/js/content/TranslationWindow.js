var TranslationWindow = (function () {
    // private members
    var BASE_ID     = 'rb-tr-popup',
        tr_id       = 0,    // used to provide translation-response validation (use only latest response)
        is_created  = false,
        is_shown    = false,

        els = { // DOM elements
            popup   : null,
            header  : null,
            body    : null,
            footer  : null,
            save_btn: null,
            sections: null
        },

        state = {
            orig        : null,
            translation : null
        },

        create = function () {
            var popup_el    = rb.DOM.node('<div id="' + BASE_ID + '" hidden></div>'),
                header_el   = createHeader(),
                body_el     = rb.DOM.node('<div id="' + BASE_ID + '-body"></div>'),
                footer_el   = createFooter();

            popup_el.appendChild(header_el);
            popup_el.appendChild(body_el);
            popup_el.appendChild(footer_el);

            document.body.appendChild(popup_el);

            els.popup   = popup_el;
            els.header  = header_el;
            els.body    = body_el;
            els.footer  = footer_el;
            els.sections = [];

            is_created = true;
        },

        createHeader = function () {
            var header_el = rb.DOM.node('<div id="' + BASE_ID + '-header"></div>'),
                close_btn = rb.DOM.node('<div id="' + BASE_ID + '-close-btn">x</div>');

            close_btn.addEventListener('click', destroy);
            header_el.appendChild(close_btn);

            return header_el;
        },

        createFooter = function () {
            var footer_el = rb.DOM.node('<div id="' + BASE_ID + '-footer" hidden></div>'),
                save_btn = rb.DOM.node(
                        '<button id="' + BASE_ID +'-save-btn">' + chrome.i18n.getMessage('Save') + '</button>'),
                add_custom_btn = rb.DOM.node(
                        '<button id="' + BASE_ID + '-custom-btn">' + chrome.i18n.getMessage('Custom') + '</button>');

            els.save_btn = save_btn;
            save_btn.addEventListener('click', handleSave);
            add_custom_btn.addEventListener('click', addCustomTranslation);
            footer_el.appendChild(save_btn);
            footer_el.appendChild(add_custom_btn);

            return footer_el;
        },

        createTermLine = function (term, is_checked, editable) {
            var line_el     = rb.DOM.node('<div class="term-line"></div>'),
                checkbox_el = rb.DOM.node('<input type="checkbox" class="term-line-checkbox"/>'),
                text_el     = rb.DOM.node('<span class="term">' + term + '</span>');

            checkbox_el.checked = !!is_checked;

            if (editable) {
                text_el.setAttribute('contenteditable', 'true');

                text_el.addEventListener('keypress', function (e) {
                    if (e.keyCode === 13) { // Enter key-code
                        e.preventDefault();
                        els.save_btn.focus();
                    }
                });
            }

            checkbox_el.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            line_el.appendChild(checkbox_el);
            line_el.appendChild(text_el);

            line_el.addEventListener('click', function () {
                if (!editable) {
                    checkbox_el.checked = !checkbox_el.checked;
                } else {
                    text_el.focus();
                }
            });

            return {
                el: line_el,

                getText: function () {
                    return text_el.innerText;
                },

                focus: function () {
                    text_el.focus();
                },

                isChecked: function () {
                    return checkbox_el.checked;
                }
            };
        },

        show = function (pos) {
            if (!is_shown) {
                rb.DOM.show(els.popup);
                setPosition(pos);
                document.body.addEventListener('click', handleClick, true);
                document.body.addEventListener('keyup', handleKeyUp, true);
                is_shown = true;
            }
        },

        destroy = function () {
            if (is_shown) {
                rb.DOM.hide([ els.popup, els.footer ]);
                document.body.removeEventListener('click', handleClick, true);
                document.body.removeEventListener('keyup', handleKeyUp, true);
                reset();
                is_shown = false;
            }
        },

        getSection = function (type) {
            if (!els.sections[type]) {
                els.sections[type] = rb.DOM.node('<div class="pos-container">' +
                                                '<div class="header">' + type + '</div>' +
                                             '</div>');

                els.body.appendChild(els.sections[type]);
            }

            return els.sections[type];
        },

        handleResponse = function (translation) {
            var type, data, terms, section_el,
                checked = true;

            state.translation = [];

            for (type in translation) {
                if (translation.hasOwnProperty(type)) {
                    data = translation[type];
                    section_el = getSection(data.name);
                    terms = data.terms;

                    terms.forEach(function (term) {
                        var term_line = createTermLine(term, checked);

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

        setLoader = function (set_active) {
            var LOADING_ATTR_NAME = 'loading';

            if (set_active) {
                els.body.setAttribute(LOADING_ATTR_NAME, '');
            } else {
                els.body.removeAttribute(LOADING_ATTR_NAME);
            }
        },

        setPosition = function (pos) {
            pos = pos || {};
            pos.x = pos.x !== undefined ? pos.x + 'px' : '';
            pos.y = pos.y !== undefined ? pos.y + 'px' : '';

            els.popup.style.left = pos.x;
            els.popup.style.top  = pos.y;
        },

        handleKeyUp = function (e) {
            if (e.keyCode === 27) { // Escape key code
                destroy();
            }
        },

        handleClick = function (e) {
            if (!els.popup.contains(e.target)) {
                destroy();
            }
        },

        reset = function () {
            els.body.innerHTML = '';
            els.sections = [];

            setPosition(null);
            setLoader(false);
            state = {};
        },

        handleSave = function () {
            var checked_terms = [];

            state.translation.forEach(function (term) {
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
                alert(chrome.i18n.getMessage('Make_your_choice'));
            }
        },

        addCustomTranslation = function () {
            var term = createTermLine('', true, true);

            getSection(chrome.i18n.getMessage('Custom').toLowerCase()).appendChild(term.el);
            term.focus();
            state.translation.push(term);
        };

    // privileged members
    return {

        translateSelection: function () {
            var text_range, rect, pos, selection, selected_text;

            if (navigator.onLine) {
                selection = document.getSelection();
                selected_text = selection.toString().trim();

                if (!is_created) {
                    create();
                }

                if (is_shown) {
                    destroy();
                }

                if (selected_text.length) {
                    state.orig = selected_text;

                    text_range = selection.getRangeAt(0);
                    rect = text_range.getBoundingClientRect();

                    pos = {
                        x: window.scrollX + rect.left,
                        y: window.scrollY + rect.bottom
                    };

                    show(pos);
                    setLoader(true);

                    if (selected_text.length < 3) {
                        selected_text += '..';
                    }

                    (function (id) {
                        //setTimeout(function () {
                        bgAPI.translate(selected_text, page_config.source_lang, page_config.target_lang)
                            .then(function () {
                                if (id === tr_id) {
                                    handleResponse.apply(null, arguments);
                                }
                            }, function () {
                                if (id === tr_id) {
                                    destroy.apply(null, arguments);
                                }
                            });
                        //}, 2000);
                    }(++tr_id));
                }
            } else {
                alert(chrome.i18n.getMessage('You_are_offline'));
            }
        }
    };
}());