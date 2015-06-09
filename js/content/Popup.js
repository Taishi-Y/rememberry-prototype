var Popup = (function () {
    // private members
    var BASE_ID     = 'rb-tr-popup',
        is_created  = false,
        is_shown    = false,

        els = { // DOM elements
            popup   : null,
            header  : null,
            body    : null,
            footer  : null
        },

        state = {
            orig        : null,
            translation : null,
            type        : null  // possible values: 'word', 'sentence'
        },

        create = function () {
            var popup_el    = document.createElement('div'),
                header_el   = createHeader(),
                body_el     = document.createElement('div'),
                footer_el   = createFooter();

            popup_el.id = BASE_ID;
            body_el.id  = BASE_ID + '-body';

            popup_el.appendChild(header_el);
            popup_el.appendChild(body_el);
            popup_el.appendChild(footer_el);

            document.body.appendChild(popup_el);

            els.popup   = popup_el;
            els.header  = header_el;
            els.body    = body_el;
            els.footer  = footer_el;

            is_created = true;
        },

        createHeader = function () {
            var header_el = document.createElement('div'),
                close_btn = document.createElement('div');

            header_el.id = BASE_ID + '-header';
            close_btn.id = BASE_ID + '-close-btn';
            close_btn.innerHTML = 'x';

            close_btn.addEventListener('click', function () {
                destroy();
            });

            header_el.appendChild(close_btn);

            return header_el;
        },

        createFooter = function () {
            var footer_el = document.createElement('div'),
                save_btn = document.createElement('button');

            footer_el.id = BASE_ID + '-footer';
            save_btn.id = BASE_ID + '-save-btn';
            save_btn.innerHTML = 'Save';

            save_btn.addEventListener('click', handleSave);

            footer_el.appendChild(save_btn);

            return footer_el;
        },

        createTermLine = function (term, is_checked) {
            var line_el     = document.createElement('div'),
                checkbox_el = document.createElement('input'),
                text_el     = document.createTextNode(term);

            line_el.className       = 'term-line';
            checkbox_el.className   = 'term-line-checkbox';
            checkbox_el.type        = 'checkbox';
            checkbox_el.checked     = !!is_checked;

            checkbox_el.addEventListener('click', function (e) {
                e.stopPropagation();
            });

            line_el.appendChild(checkbox_el);
            line_el.appendChild(text_el);

            line_el.addEventListener('click', function () {
                checkbox_el.checked = !checkbox_el.checked;
            });

            return {
                el: line_el,
                text: term,

                isChecked: function () {
                    return checkbox_el.checked;
                }
            };
        },

        show = function (pos) {
            if (!is_shown) {
                els.popup.style.display = 'block';
                setPosition(pos);
                document.body.addEventListener('keyup', handleKeyUp, true);
                is_shown = true;
            }
        },

        destroy = function () {
            if (is_shown) {
                els.popup.style.display = '';    // 'none' by default in content.css
                setPosition(null);
                document.body.removeEventListener('keyup', handleKeyUp, true);
                reset();
                is_shown = false;
            }
        },

        setTranslatedVersion = function (terms) {
            state.translation = [];

            terms.forEach(function (term, index) {
                var term_line = createTermLine(term, index === 0);

                state.translation.push(term_line);
                els.body.appendChild(term_line.el);
            });

            setLoader(false);
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

            state = {};
        },

        handleSave = function () {
            var i, l,
                data = {
                    orig: state.orig,
                    translation: []
                };

            for (i = 0, l = state.translation.length; i < l; i++) {
                if (state.translation[i].isChecked()) {
                    data.translation.push(state.translation[i].text);
                }
            }

            bgAPI.send('term', data);;
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
            var i, l, term,
                terms = [];

            if (state.type === 'word') {
                if (response.dict) {
                    for (i = 0, l = response.dict.length; i < l; i++) {
                        terms = terms.concat(response.dict[i].terms);
                    }
                }

                if (response.sentences) {
                    for (i = 0, l = response.sentences.length; i < l; i++) {
                        term = response.sentences[i].trans.replace(/\s|\./g, '');

                        if (term.length) {
                            terms.push(term);
                        }
                    }
                }

                terms = terms.map(function (value) {
                    return value.toLowerCase();
                });

                // ensure uniqueness
                terms = rb.unique(terms);
            } else {
                if (response.sentences) {
                    terms = [ response.sentences.map(function (item) {
                        return item.trans;
                    }).join('') ];
                }
            }

            setTranslatedVersion(terms);
        };

    // privileged members
    return {

        show: function () {
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

                bgAPI.translate(selected_text, page_prefs.source_lang, page_prefs.target_lang)
                        .then(handleResponse);
            }
        }
    };
}());