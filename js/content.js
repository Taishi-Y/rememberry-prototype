document.addEventListener('DOMContentLoaded', function () {
    console.log('Loaded within', document.location.href);

    var Popup = (function () {
        // shortcuts
        var body = document.body;

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
                orig: null,
                translate: null
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

                body.appendChild(popup_el);

                els.popup   = popup_el;
                els.header  = header_el;
                els.body    = body_el;
                els.footer  = footer_el;

                is_created = true;
            },

            show = function (pos) {
                if (!is_shown) {
                    els.popup.style.display = 'block';
                    setPosition(pos);
                    body.addEventListener('keyup', handleKeyUp, true);
                    is_shown = true;
                }
            },

            hide = function () {
                if (is_shown) {
                    els.popup.style.display = '';    // 'none' by default in content.css
                    setPosition(null);
                    body.removeEventListener('keyup', handleKeyUp, true);
                    reset();
                    is_shown = false;
                }
            },

            setTranslatedVersion = function (data) {
                var i, l,
                    terms = [];

                if (data.dict) {
                    for (i = 0, l = data.dict.length; i < l; i++) {
                        terms = terms.concat(data.dict[i].terms);
                    }
                }

                if (data.sentences) {
                    for (i = 0, l = data.sentences.length; i < l; i++) {
                        terms.push(data.sentences[i].trans);
                    }
                }

                state.translate = [];

                terms.forEach(function (term, index) {
                    var term_line = createTermLine(term, index === 0);

                    state.translate.push(term_line);

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
                    hide();
                }
            },

            reset = function () {
                els.body.innerHTML = '';

                state = {
                    orig: null,
                    translate: null
                };
            },

            createHeader = function () {
                var header_el = document.createElement('div'),
                    close_btn = document.createElement('div');

                header_el.id = BASE_ID + '-header';
                close_btn.id = BASE_ID + '-close-btn';
                close_btn.innerHTML = 'x';

                close_btn.addEventListener('click', function () {
                    hide();
                });

                header_el.appendChild(close_btn);

                return header_el;
            },

            handleSave = function () {
                var i, l,
                    data = {
                        orig: state.orig,
                        translate: []
                    };

                for (i = 0, l = state.translate.length; i < l; i++) {
                    if (state.translate[i].isChecked()) {
                        data.translate.push(state.translate[i].text);
                    }
                }

                chrome.runtime.sendMessage(data);
                hide();
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

                line_el.appendChild(checkbox_el);
                line_el.appendChild(text_el);

                return {
                    el: line_el,
                    text: term,

                    isChecked: function () {
                        return checkbox_el.checked;
                    }
                };
            };

        // privileged members
        return {

            translateSelection: function () {
                var text_range, rect, pos, translate,
                    selection = document.getSelection(),
                    selected_text = selection.toString().trim();

                if (!is_created) {
                    create();
                }

                if (is_shown) {
                    hide();
                }

                if (selected_text.length) {
                    state.orig = selected_text;

                    text_range = selection.getRangeAt(0);
                    rect = text_range.getBoundingClientRect();

                    pos = {
                        x: window.scrollX + rect.left,
                        y: window.scrollY + rect.bottom
                    };

                    translate = function (text, callback) {
                        var xhr = new XMLHttpRequest(),
                            params = [
                                'client=mt',
                                'text=' + text,
                                'sl=en',
                                'tl=uk'
                            ].join('&'),
                            url = 'http://translate.google.ru/translate_a/t?' + params;

                        xhr.open('GET', url);
                        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4 && xhr.status === 200) {
                                callback(JSON.parse(xhr.responseText));
                            }
                        };

                        xhr.send();
                    };

                    show(pos);
                    setLoader(true);

                    translate(selected_text, function (response) {
                        setTranslatedVersion(response);
                    });
                }
            }
        };
    }());

    document.addEventListener('dblclick', function (e) {
        if (e.altKey) {
            Popup.translateSelection();
        }
    });
});