document.addEventListener('DOMContentLoaded', function () {
    console.log('Loaded within', document.location.href);

    var Popup, translateSelection;

    Popup = (function () {
        // shortcuts
        var body = document.body;

        // private members
        var Module,
            BASE_ID     = 'rb-tr-popup',
            is_created  = false,
            is_shown    = false,

            els = { // DOM elements
                popup       : null,
                source      : null,
                translation : null
            },

            setPosition = function (pos) {
                pos = pos || {};
                pos.x = pos.x !== undefined ? pos.x + 'px' : '';
                pos.y = pos.y !== undefined ? pos.y + 'px' : '';

                els.popup.style.left = pos.x;
                els.popup.style.top  = pos.y;
            },

            handleMouseDown = function (e) {
                if (!els.popup.contains(e.target)) {
                    Module.hide();
                }
            },

            reset = function () {
                els.source.innerHTML = '';
                els.translation.innerHTML = '';
            },

            createTermLine = function (term) {
                var line_el     = document.createElement('div'),
                    checkbox_el = document.createElement('input'),
                    text_el     = document.createTextNode(term);

                line_el.className       = 'term-line';
                checkbox_el.className   = 'term-line-checkbox';
                checkbox_el.type        = 'checkbox';

                line_el.appendChild(checkbox_el);
                line_el.appendChild(text_el);

                return line_el;
            };

        // privileged members
        Module = {

            create: function () {
                var popup_el, source_phrase_el, translation_el;

                if (!is_created) {
                    popup_el            = document.createElement('div');
                    source_phrase_el    = document.createElement('div');
                    translation_el      = document.createElement('div');

                    popup_el.id         = BASE_ID;
                    source_phrase_el.id = BASE_ID + '-source';
                    translation_el.id   = BASE_ID + '-translation';

                    popup_el.appendChild(source_phrase_el);
                    popup_el.appendChild(translation_el);

                    body.appendChild(popup_el);

                    els.popup       = popup_el;
                    els.source      = source_phrase_el;
                    els.translation = translation_el;

                    is_created = true;
                } else {
                    console.log('Popup was already created');
                }
            },

            show: function (pos) {
                if (is_created && !is_shown) {
                    els.popup.style.display = 'block';
                    setPosition(pos);
                    body.addEventListener('mousedown', handleMouseDown, true);
                    is_shown = true;
                }
            },

            hide: function () {
                if (is_created && is_shown) {
                    els.popup.style.display = '';    // 'none' by default in content.css
                    setPosition(null);
                    body.removeEventListener('mousedown', handleMouseDown, true);
                    reset();
                    is_shown = false;
                }
            },

            setSourceText: function (phrase) {
                els.source.innerHTML = phrase;
            },

            setTranslatedVersion: function (translate_data) {
                var terms = translate_data.dict[0].terms;

                terms.forEach(function (term) {
                    var term_line_el = createTermLine(term);

                    els.translation.appendChild(term_line_el);
                });


                Module.setLoader(false);
            },

            setLoader: function (set_active) {
                var LOADING_ATTR_NAME = 'loading',
                    translation = els.translation;

                if (set_active) {
                    translation.setAttribute(LOADING_ATTR_NAME, '');
                } else {
                    translation.removeAttribute(LOADING_ATTR_NAME);
                }
            }
        };

        return Module;
    }());

    translateSelection = function () {
        var text_range, rect, pos, translate,
            selection = document.getSelection(),
            selected_text = selection.toString();

        if (selected_text.length) {
            text_range = selection.getRangeAt(0);
            rect = text_range.getBoundingClientRect();

            pos = {
                x: window.scrollX + rect.left + rect.width / 2,
                y: window.scrollY + rect.top + rect.height / 2
            };

            translate = function (text, callback) {
                var xhr = new XMLHttpRequest(),
                    url = 'http://translate.google.ru/translate_a/t?client=mt&text=' +
                            text + '&sl=en&tl=uk'

                xhr.open('GET', url);
                xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');

                xhr.onreadystatechange = function () {
                    if (xhr.readyState === 4 && xhr.status === 200) {
                        callback(JSON.parse(xhr.responseText));
                    }
                };

                xhr.send();
            };

            Popup.show(pos);
            Popup.setSourceText(selected_text);
            Popup.setLoader(true);

            translate(selected_text, function (response) {
                Popup.setTranslatedVersion(response);
            });
        }
    };

    Popup.create();

    document.addEventListener('dblclick', function (e) {
        if (e.altKey) {
            translateSelection();
        }

        //chrome.runtime.sendMessage('Hello from CS!');
    });
});