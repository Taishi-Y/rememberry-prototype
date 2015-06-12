var TranslationWindow = (function () {
    // private members
    var BASE_ID     = 'rb-tr-popup',
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
            translation : null,
            type        : null  // possible values: 'word', 'sentence'
        },

        create = function () {
            var popup_el    = rb.node('<div id="' + BASE_ID + '" hidden></div>'),
                header_el   = createHeader(),
                body_el     = rb.node('<div id="' + BASE_ID + '-body"></div>'),
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
            var header_el = rb.node('<div id="' + BASE_ID + '-header"></div>'),
                close_btn = rb.node('<div id="' + BASE_ID + '-close-btn">x</div>');

            close_btn.addEventListener('click', destroy);
            header_el.appendChild(close_btn);

            return header_el;
        },

        createFooter = function () {
            var footer_el = rb.node('<div id="' + BASE_ID + '-footer"></div>'),
                save_btn = rb.node(
                        '<button id="' + BASE_ID +'-save-btn">' + chrome.i18n.getMessage('Save') + '</button>'),
                add_custom_btn = rb.node(
                        '<button id="' + BASE_ID + '-custom-btn">' + chrome.i18n.getMessage('Custom') + '</button>');

            els.save_btn = save_btn;
            save_btn.addEventListener('click', handleSave);
            add_custom_btn.addEventListener('click', addCustomTranslation);
            footer_el.appendChild(save_btn);
            footer_el.appendChild(add_custom_btn);

            return footer_el;
        },

        createTermLine = function (term, is_checked, editable) {
            var line_el     = rb.node('<div class="term-line"></div>'),
                checkbox_el = rb.node('<input type="checkbox" class="term-line-checkbox"/>'),
                text_el     = rb.node('<span class="term">' + term + '</span>');

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
                rb.show(els.popup);
                setPosition(pos);
                document.body.addEventListener('keyup', handleKeyUp, true);
                is_shown = true;
            }
        },

        destroy = function () {
            if (is_shown) {
                rb.hide(els.popup);
                setPosition(null);
                document.body.removeEventListener('keyup', handleKeyUp, true);
                reset();
                is_shown = false;
            }
        },

        getSection = function (type) {
            if (!els.sections[type]) {
                els.sections[type] = rb.node('<div class="pos-container">' +
                                                '<div class="header">' + type + '</div>' +
                                             '</div>');

                els.body.appendChild(els.sections[type]);
            }

            return els.sections[type];
        },

        setTranslatedVersion = function (translation) {
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

        reset = function () {
            els.body.innerHTML = '';
            els.sections = [];

            setLoader(false);
            state = {};
        },

        handleSave = function () {
            var data = {
                orig: state.orig,
                translation: []
            };

            state.translation.forEach(function (term) {
                if (term.isChecked() && term.getText().trim().length) {
                    data.translation.push(term.getText());
                }
            });

            bgAPI.add('card', data);;
            destroy();
        },
        /**
         * @param {Object}          response
         * @param {Array<Object>}   response.sentences
         * @param {String}          response.sentences.trans
         * @param {Array<Object>}   response.dict
         * @param {Array}           response.dict.terms
         */
        handleResponse = function (response) {
            var term, translation, all_terms, sentences;

            if (state.type === 'word') {
                translation = {};
                all_terms = [];

                if (response.dict) {
                    response.dict.sort(function (a, b) {
                        return a.pos_enum > b.pos_enum;
                    });

                    response.dict.forEach(function (entry) {
                        var pos_name,

                            terms = entry.terms.map(function (term) {
                                return term.toLowerCase();
                            });

                        terms.filter(function (term) {
                            return all_terms.indexOf(term) === -1;
                        });

                        if (terms.length) {
                            pos_name = parts_of_speech_enum[entry.pos_enum - 1];

                            translation[pos_name] = {
                                name: pos_name.trim().length ?
                                        chrome.i18n.getMessage(pos_name.replace(/\s/g, '_')) : '',
                                terms: terms
                            };

                            all_terms = all_terms.concat(terms);
                        }
                    });
                }

                if (response.sentences) {
                    sentences = [];

                    response.sentences.forEach(function (sentence) {
                        term = sentence.trans.toLowerCase().replace(/\s|\./g, '');

                        if (term.length && all_terms.indexOf(term) === -1) {
                            sentences.push(term);
                        }
                    });

                    if (sentences.length) {
                        translation.sentence = {
                            name: chrome.i18n.getMessage('sentence'),
                            terms: sentences
                        };
                    }
                }
            } else {
                if (response.sentences) {
                    translation = {
                        sentence: {
                            name: chrome.i18n.getMessage('sentence'),
                            terms: [ response.sentences.map(function (item) {
                                return item.trans;
                            }).join('') ]
                        }
                    };
                }
            }

            setTranslatedVersion(translation);
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
            var text_range, rect, pos,
                selection = document.getSelection(),
                selected_text = selection.toString().trim();

            if (!is_created) {
                create();
            }

            if (is_shown) {
                destroy();
            }

            if (selected_text.length) {
                state.orig = selected_text;
                state.type = selected_text.indexOf(' ') === -1 ? 'word' : 'sentence';

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

                bgAPI.translate(selected_text, page_config.source_lang, page_config.target_lang)
                        .then(handleResponse, destroy);
            }
        }
    };
}());