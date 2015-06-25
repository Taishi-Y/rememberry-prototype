var TranslationWindow = (function () {
    // private members
    var BASE_ID     = 'rememberry-popup',
        tr_id       = 0,    // used to provide translation-response validation (use only latest response)
        is_created  = false,
        is_shown    = false,
        CSS = AJAX.request('get',
            'chrome-extension://' + chrome.i18n.getMessage('@@extension_id') + '/css/content.css'),

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

        create = function () {
            var host_el     = rb.DOM.node('<div id="' + BASE_ID + '" hidden></div>'),
                root_el     = host_el.createShadowRoot(),
                body_el     = rb.DOM.node('<div class="body"></div>'),
                header_el   = rb.DOM.node('<div class="header"></div>'),
                belly_el    = rb.DOM.node('<div class="belly"></div>'),
                footer_el   = createFooter(),
                style_el    = document.createElement('style');

            body_el.appendChild(style_el);
            body_el.appendChild(style_el);
            body_el.appendChild(header_el);
            body_el.appendChild(belly_el);
            body_el.appendChild(footer_el);

            root_el.appendChild(body_el);

            CSS.then(function (css_text) {
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

        createFooter = function () {
            var footer_el = rb.DOM.node('<div class="footer" hidden></div>'),
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
                rb.DOM.show(els.host);
                setPosition(pos);
                document.body.addEventListener('click', handleClick, true);
                document.body.addEventListener('keyup', handleKeyUp, true);
                is_shown = true;
            }
        },

        destroy = function () {
            if (is_shown) {
                rb.DOM.hide([ els.host, els.footer ]);
                document.body.removeEventListener('click', handleClick, true);
                document.body.removeEventListener('keyup', handleKeyUp, true);
                reset();
                is_shown = false;
            }
        },

        getSection = function (type) {
            if (!els.sections[type]) {
                els.sections[type] = rb.DOM.node(
                    '<div class="pos-container">' +
                        '<div class="pos-header">' + type + '</div>' +
                    '</div>');

                els.belly.appendChild(els.sections[type]);
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
                els.belly.setAttribute(LOADING_ATTR_NAME, '');
            } else {
                els.belly.removeAttribute(LOADING_ATTR_NAME);
            }
        },

        setPosition = function (pos) {
            pos = pos || {};
            pos.x = pos.x !== undefined ? pos.x + 'px' : '';
            pos.y = pos.y !== undefined ? pos.y + 'px' : '';

            els.host.style.left = pos.x;
            els.host.style.top  = pos.y;
        },

        handleKeyUp = function (e) {
            if (e.keyCode === 27) { // Escape key code
                destroy();
            }
        },

        handleClick = function (e) {
            if (els.host !== e.target) {
                destroy();
            }
        },

        reset = function () {
            els.belly.innerHTML = '';
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