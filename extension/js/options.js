/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2),
	    Windows = __webpack_require__(3);

	rb.DOM.onReady.then(function () {
	    Windows.init();
	    Windows.show('options');
	});

/***/ },
/* 1 */,
/* 2 */
/***/ function(module, exports) {

	// common library, used by all extension script
	// contain syntax sugar staff
	var visible = function (is_visible, els) {
	    if (!Array.isArray(els)) {
	        els = [ els ];
	    }

	    els.forEach(function (el) {
	        if (is_visible) {
	            el.removeAttribute('hidden');
	        } else {
	            el.setAttribute('hidden', '');
	        }
	    });
	};

	Promise.prototype.spread = Promise.prototype.spread || function (fn) {
	    return this.then(function (args) {
	        return fn.apply(this, args);
	    });
	};

	module.exports = {
	    /**
	     * Creates array with unique values of input one
	     * @param {Array} array
	     * @returns {Array}
	     */
	    unique: function (array) {
	        return array.filter(function (value, index, self) {
	            return self.indexOf(value) === index;
	        })
	    },
	    /**
	     * Extracts data from target to source object in configurable way
	     * @param {Object}  source                  Object to be modified
	     * @param {Object}  target                  Object, that possess data used for source modification
	     * @param {Object}  [config]                Configuration. All options are false by default
	     * @param {Boolean} [config.new_only]       Extend source object with only new properties from target object
	     * @param {Boolean} [config.concat_arrays]  Concatenate array properties (possible if new_only is false)
	     * @returns {Object}
	     */
	    override: function (source, target, config) {
	        var prop, t, s;

	        config = config || {};

	        for (prop in target) {
	            if (target.hasOwnProperty(prop)) {
	                s = source[prop];
	                t = target[prop];

	                if (config.new_only) {
	                    if (!source.hasOwnProperty(prop)) {
	                        s = t;
	                    } else if (typeof s === 'object' && typeof t === 'object') {
	                        s = rb.override(s, t, config);
	                    }
	                } else {
	                    if (typeof s === 'object' && typeof t === 'object') {
	                        if (Array.isArray(s) && Array.isArray(t)) {
	                            if (config.concat_arrays) {
	                                s = s.concat(t);
	                            } else {
	                                s = t;
	                            }
	                        } else {
	                            s = rb.override(s, t, config);
	                        }
	                    } else {
	                        s = t;
	                    }
	                }

	                if (source[prop] !== s) {
	                    source[prop] = s;
	                }
	            }
	        }

	        return source;
	    },

	    DOM: {
	        onReady: new Promise(function (resolve) {
	            if (document.readyState !== 'loading') {
	                resolve();
	            } else {
	                document.addEventListener('DOMContentLoaded', resolve);
	            }
	        }),


	        node: function (html_value) {
	            var container_el = document.createElement('div');

	            container_el.innerHTML = html_value;

	            return container_el.children[0];
	        },

	        selectByValue: function (select_el, value) {
	            var values = Array.prototype.map.call(select_el.children, function (option_el) {
	                return option_el.value;
	            });

	            select_el.selectedIndex = values.indexOf(value);
	        },

	        show: visible.bind(null, true),
	        hide: visible.bind(null, false)
	    }
	};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2),
	    AJAX = __webpack_require__(5),
	    bgAPI = __webpack_require__(6),
	    Message = __webpack_require__(7),
	    OptionsWindow = __webpack_require__(4),
	    LoginWindow = __webpack_require__(8),
	    ExportWindow = __webpack_require__(9);

	__webpack_require__(10);

	var active, cards_to_export,

	    windows = {
	        options : OptionsWindow,
	        login   : LoginWindow,
	        'export': ExportWindow
	    };

	var Windows = {
	    init: function () {
	        Message.init();

	        windows.options.init({
	            onExportStart: function (cards) {
	                cards_to_export = cards;
	                Windows.show('login');
	            }
	        });

	        windows.login.init({
	            onBack: function () {
	                Windows.show('options');
	                cards_to_export = null;
	            },
	            onLogin: function (data) {
	                Windows.show('export', data, cards_to_export);
	            }
	        });

	        windows.export.init({
	            onBack: function () {
	                Windows.show('login');
	            },
	            onSuccess: function () {
	                Message.show(chrome.i18n.getMessage('Successfully_exported'), true, 2000);
	                Windows.show('options');
	            }
	        })
	    },

	    show: function (name) {
	        var data_args = Array.prototype.slice.call(arguments, 1);

	        if (active) {
	            active.hide();
	        }

	        active = windows[name];
	        active.show.apply(active, data_args);
	    }
	};

	module.exports = Windows;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2),
	    bgAPI = __webpack_require__(6);

	var window_el, props,

	    initDOM = function () {
	        window_el = document.getElementById('options-window');

	        (function provideLocalization() {
	            window_el.querySelector('#languages-menu h3').innerHTML         = chrome.i18n.getMessage('Languages');
	            window_el.querySelector('label[for="source-lang"]').innerHTML   = chrome.i18n.getMessage('Source_language');
	            window_el.querySelector('label[for="target-lang"]').innerHTML =
	                    window_el.querySelector('label[for="target-lang"]').title = chrome.i18n.getMessage('Target_language');

	            window_el.querySelector('#action-menu h3').innerHTML        = chrome.i18n.getMessage('Modifiers');
	            window_el.querySelector('label[for="action"]').innerHTML    = chrome.i18n.getMessage('Trigger_action');
	            window_el.querySelector('label[for="modifier"]').innerHTML  = chrome.i18n.getMessage('Key_modifier');

	            window_el.querySelector('#deck-menu h3').innerHTML                              = chrome.i18n.getMessage('Decks');
	            window_el.querySelector('#deck-menu label[for="selected-deck"]').innerHTML      = chrome.i18n.getMessage('Deck');
	            window_el.querySelector('.btn-area button[data-action="activate"]').innerHTML   = chrome.i18n.getMessage('Make_active');
	            window_el.querySelector('.btn-area button[data-action="add"]').innerHTML        = chrome.i18n.getMessage('Add');
	            window_el.querySelector('.btn-area button[data-action="remove"]').innerHTML     = chrome.i18n.getMessage('Remove');
	            window_el.querySelector('.btn-area button[data-action="clear"]').innerHTML      = chrome.i18n.getMessage('Clear');
	            window_el.querySelector('.btn-area button[data-action="export"]').innerHTML     = chrome.i18n.getMessage('Export_to_Anki');
	            window_el.querySelector('.btn-area button[data-action="update"]').innerHTML     = chrome.i18n.getMessage('Update');
	            window_el.querySelector('#deck-info label[for="cards-count"]').innerHTML        = chrome.i18n.getMessage('Cards_count');
	            window_el.querySelector('#deck-info label[for="deck-name"]').innerHTML          = chrome.i18n.getMessage('Deck_name');
	            window_el.querySelector('#deck-info label[for="deck-desc"]').innerHTML          = chrome.i18n.getMessage('Deck_description');
	        }());

	        (function initLanguageMenu() {
	            bgAPI.receive([ 'config', 'languages' ]).spread(function (config, languages) {
	                var source_lang_el = document.getElementById('source-lang'),
	                    target_lang_el = document.getElementById('target-lang');

	                (function fillMenusWithLanguages() {
	                    var code, language, appendOption,
	                        source_lang = config.source_lang,
	                        target_lang = config.target_lang;

	                    appendOption = function (parent, value, text, active_value) {
	                        var option_el = rb.DOM.node('<option value="' + value + '">' + text + '</option>');

	                        parent.appendChild(option_el);

	                        if (value === active_value) {
	                            parent.selectedIndex = parent.children.length - 1;
	                        }
	                    };

	                    appendOption(source_lang_el, 'auto', chrome.i18n.getMessage('Detect'), source_lang);

	                    for (code in languages) {
	                        language = languages[code];
	                        appendOption(source_lang_el, code, language, source_lang);
	                        appendOption(target_lang_el, code, language, target_lang);
	                    }
	                }());

	                (function listenOnChange() {
	                    source_lang_el.addEventListener('change', function () {
	                        bgAPI.send('config', {
	                            source_lang: source_lang_el.children[source_lang_el.selectedIndex].value
	                        });
	                    });

	                    target_lang_el.addEventListener('change', function () {
	                        bgAPI.send('config', {
	                            target_lang: target_lang_el.children[target_lang_el.selectedIndex].value
	                        });
	                    });
	                }());
	            });
	        }());

	        (function initActionMenu() {
	            bgAPI.receive([ 'config', 'actions' ]).spread(function (config, actions) {
	                var names_el = document.getElementById('action'),
	                    modifiers_el = document.getElementById('modifier');

	                (function fillMenusWithActions() {
	                    var i, l, appendOption,
	                        event_names = actions.names,
	                        modifiers = actions.modifiers,
	                        selected_event_name = config.action.name,
	                        selected_modifier = config.action.modifier;

	                    appendOption = function (parent, value, active_value) {
	                        var el = rb.DOM.node('<option value="' + value + '">' + value + '</option>');

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
	                    names_el.addEventListener('change', function () {
	                        bgAPI.send('config', {
	                            action: {
	                                name: names_el.selectedOptions[0].value
	                            }
	                        });
	                    });

	                    modifiers_el.addEventListener('change', function () {
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
	            bgAPI.receive([ 'config', 'decks' ]).spread(function (config, local_decks) {
	                var deck_name, selected_deck,
	                    startup_active_deck_name    = config.decks.active_name,
	                    deck_select_el              = document.getElementById('selected-deck'),
	                    info_el                     = document.getElementById('deck-info'),
	                    cards_count_el              = document.getElementById('cards-count'),
	                    name_el                     = document.getElementById('deck-name'),
	                    desc_el                     = document.getElementById('deck-desc'),
	                    btn_area_el                 = window_el.getElementsByClassName('btn-area')[0];

	                var changeDeck = function (name) {
	                        selected_deck = local_decks[name];
	                        rb.DOM.selectByValue(deck_select_el, name);

	                        cards_count_el.innerHTML = Object.keys(selected_deck.cards).length;
	                        name_el.value = selected_deck.name;
	                        desc_el.value = selected_deck.desc;
	                    },

	                    appendDeckOption = function (deck) {
	                        deck_select_el.appendChild(
	                                rb.DOM.node('<option value="' + deck.name + '">' + deck.name + '</option>'));
	                    },

	                    performAction = function (action) {
	                        switch (action) {
	                            case 'activate':
	                                bgAPI.send('active-deck', selected_deck.name);
	                                break;
	                            case 'add':
	                                (function () {
	                                    var listener = function (e) {
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

	                                        clearInput = function () {
	                                            if (name_el.value === '') {
	                                                changeDeck(deck_select_el.selectedOptions[0].value);
	                                            }

	                                            name_el.removeEventListener('keypress', listener);
	                                            name_el.removeEventListener('blur', clearInput);
	                                        },

	                                        create = function (name) {
	                                            bgAPI.add('deck', {
	                                                name: name,
	                                                desc: ''
	                                            }).then(function (new_deck) {
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
	                                }());
	                                break;
	                            case 'remove':
	                                if (Object.keys(local_decks).length > 1) {
	                                    (function (deck_to_remove) {
	                                        bgAPI.remove('deck', deck_to_remove).then(function () {
	                                            var first_deck_name;

	                                            delete local_decks[deck_to_remove.name];
	                                            deck_select_el.removeChild(
	                                                    deck_select_el.querySelector('option[value="' + deck_to_remove.name + '"]'));

	                                            first_deck_name = Object.keys(local_decks)[0];
	                                            changeDeck(first_deck_name);
	                                            performAction('activate');
	                                        });
	                                    }(selected_deck));
	                                }

	                                break;
	                            case 'clear':
	                                selected_deck.cards = [];
	                                cards_count_el.innerHTML = '0';
	                                bgAPI.send('deck', selected_deck);
	                                break;
	                            case 'export':
	                                if (navigator.onLine) {
	                                    if (Object.keys(selected_deck.cards).length) {
	                                        (function () {
	                                            var card_name, card,
	                                                cards = selected_deck.cards,
	                                                cards_to_export = [];

	                                            for (card_name in cards) {
	                                                if (cards.hasOwnProperty(card_name)) {
	                                                    card = cards[card_name];

	                                                    cards_to_export.push({
	                                                        orig: card_name,
	                                                        translation: card.t.join(', ')
	                                                    });
	                                                }
	                                            }

	                                            props.onExportStart(cards_to_export);
	                                        }());
	                                    } else {
	                                        Message.show(chrome.i18n.getMessage('No_cards_in_deck'));
	                                    }
	                                } else {
	                                    Message.show(chrome.i18n.getMessage('You_are_offline'));
	                                }

	                                break;
	                            case 'update':
	                                (function () {
	                                    var deck_to_update = JSON.parse(JSON.stringify(selected_deck)),
	                                        old_name = selected_deck.name,
	                                        option_el = deck_select_el.querySelector(
	                                                'option[value="' + selected_deck.name + '"]');

	                                    deck_to_update.new_name = selected_deck.name = option_el.value = option_el.innerHTML =
	                                            name_el.value;
	                                    deck_to_update.desc = selected_deck.desc = desc_el.value;
	                                    delete local_decks[old_name];
	                                    local_decks[name_el.value] = selected_deck;

	                                    bgAPI.send('deck', deck_to_update);
	                                }());

	                                break;
	                            default:
	                        }
	                    };

	                deck_select_el.addEventListener('change', function () {
	                    changeDeck(deck_select_el.selectedOptions[0].value);
	                });

	                btn_area_el.addEventListener('click', function (e) {
	                    if (e.target.tagName.toLowerCase() === 'button') {
	                        performAction(e.target.dataset.action);
	                    }
	                });

	                for (deck_name in local_decks) {
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

	module.exports = {
	    init: function (new_props) {
	        props = new_props;
	        initDOM();
	    },

	    show: function () {
	        rb.DOM.show(window_el);
	    },

	    hide: function () {
	        rb.DOM.hide(window_el);
	    }
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	var request = function (type, url, data, headers) { return new Promise(function (resolve, reject) {
	        var xhr = new XMLHttpRequest(),

	            toURI = function (obj) {
	                var key,
	                    URI_data = [];

	                for (key in obj) {
	                    if (obj.hasOwnProperty(key)) {
	                        URI_data.push(key + '=' + encodeURIComponent(obj[key]));
	                    }
	                }

	                return URI_data.join('&');
	            },

	            setHeaders = function () {
	                if (headers) {
	                    Object.keys(headers).forEach(function (name) {
	                        xhr.setRequestHeader(name, headers[name]);
	                    });
	                }
	            };

	        xhr.onreadystatechange = function () {
	            if (xhr.readyState === 4) {
	                if (xhr.status === 200) {
	                    resolve(xhr.response);
	                } else if (xhr.status === 403) {
	                    reject(xhr.response);
	                }
	            }
	        };

	        if (type === 'get') {
	            if (data) {
	                data = toURI(data);
	                url += '?' + data;
	            }

	            xhr.open('GET', url);
	            setHeaders();
	            xhr.send();
	        } else if (type === 'post') {
	            xhr.open('POST', url);
	            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	            xhr.setRequestHeader('Accept', '*/*');
	            setHeaders();
	            xhr.send(toURI(data));
	        }
	    })},

	    getJSON = function (path, data, headers) {
	        return request('get', path, data, headers).then(JSON.parse);
	    },

	    translate = function (text, source_lang, target_lang) {
	        var params = 'client=mt&' +
	                        'text=' + text + '&' +
	                        (source_lang === 'auto' ? '' : ('sl=' + source_lang + '&')) +
	                        'tl=' + target_lang,
	            url = 'http://translate.google.ru/translate_a/t?' + params;

	        return getJSON(url, null, { 'Accept': 'application/json, text/javascript, */*; q=0.01' });
	    };

	module.exports = {
	    request     : request,
	    getJSON     : getJSON,
	    translate   : translate
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	var parts_of_speech_enum,

	    send = function (type, data) {
	        chrome.runtime.sendMessage({ method: 'set', type: type, data: data });
	    },

	    receive = function (type, data) {
	        var promise, promises;

	        if (!Array.isArray(type)) {
	            promise = new Promise(function (resolve) {
	                chrome.runtime.sendMessage({ method: 'get', type: type, data: data }, resolve);
	            });
	        } else {
	            promises = type.map(function (curr_type) {
	                return new Promise(function (resolve) {
	                    receive(curr_type).then(resolve);
	                });
	            });

	            promise = Promise.all(promises);
	        }

	        return promise;
	    },

	    add = function (type, data) { return new Promise(function (resolve) {
	        chrome.runtime.sendMessage({ method: 'add', type: type, data: data }, resolve);
	    })},

	    remove = function (type, data) { return new Promise(function (resolve) {
	        chrome.runtime.sendMessage({ method: 'remove', type: type, data: data }, resolve);
	    })},

	    translate = function (text, source, target) { return new Promise(function (resolve, reject) {
	        var parseResult = function (result) {
	            return parts_of_speech_enum.then(function (pos_enum) {
	                var term, parsed_result, all_terms, sentences,
	                    type = text.indexOf(' ') === -1 ? 'word' : 'sentence';

	                if (type === 'word') {
	                    parsed_result = {};
	                    all_terms = [];

	                    if (result.dict) {
	                        result.dict.sort(function (a, b) {
	                            return a.pos_enum > b.pos_enum;
	                        });

	                        result.dict.forEach(function (entry) {
	                            var pos_name,

	                                terms = entry.terms.map(function (term) {
	                                    return term.toLowerCase();
	                                });

	                            terms.filter(function (term) {
	                                return all_terms.indexOf(term) === -1;
	                            });

	                            if (terms.length) {
	                                pos_name = pos_enum[entry.pos_enum - 1];

	                                parsed_result[pos_name] = {
	                                    name: pos_name.trim().length ?
	                                        chrome.i18n.getMessage(pos_name.replace(/\s/g, '_')) : '',
	                                    terms: terms
	                                };

	                                all_terms = all_terms.concat(terms);
	                            }
	                        });
	                    }

	                    if (result.sentences) {
	                        sentences = [];

	                        result.sentences.forEach(function (sentence) {
	                            term = sentence.trans.toLowerCase().replace(/\./g, '');

	                            if (term.length && all_terms.indexOf(term) === -1) {
	                                sentences.push(term);
	                            }
	                        });

	                        if (sentences.length) {
	                            parsed_result.sentence = {
	                                name: chrome.i18n.getMessage('sentence'),
	                                terms: sentences
	                            };
	                        }
	                    }
	                } else {
	                    if (result.sentences) {
	                        parsed_result = {
	                            sentence: {
	                                name: chrome.i18n.getMessage('sentence'),
	                                terms: [ result.sentences.map(function (item) {
	                                    return item.trans;
	                                }).join('') ]
	                            }
	                        };
	                    }
	                }

	                return parsed_result;
	            });
	        };

	        try {
	            chrome.runtime.sendMessage({
	                method: 'translate',
	                data: {
	                    text: text,
	                    source: source,
	                    target: target
	                }
	            }, function (result) {
	                parseResult(result).then(resolve);
	            });
	        } catch (e) {
	            reject();
	            showError(e);
	        }
	    })};

	parts_of_speech_enum = receive('PoS').then(function (PoS) {
	    return PoS.enum;
	});

	module.exports = {
	    send        : send,
	    receive     : receive,
	    add         : add,
	    remove      : remove,
	    translate   : translate
	};

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2);

	var message_el,
	    timeout_instance = null,
	    closable_state = true,

	    initDOM = function () {
	        message_el = document.getElementById('message');

	        message_el.addEventListener('click', hide.bind(null, true));
	        message_el.addEventListener('keypress', function (e) {
	            if (e.keyCode === 27) {
	                hide(true);
	            }
	        });
	    },
	    /**
	     * @param message
	     * @param [closable]
	     */
	    show = function (message, closable, timeout) {
	        closable_state = closable !== false;

	        if (closable_state) {
	            message_el.setAttribute('closable', '');
	        }

	        message_el.innerHTML = message;
	        rb.DOM.show(message_el);

	        if (timeout) {
	            timeout_instance = setTimeout(hide, timeout);
	        }
	    },

	    hide = function (by_user) {
	        if (!by_user || (by_user && closable_state)) {
	            message_el.removeAttribute('closable');
	            closable_state = true;
	            message_el.innerHTML = '';
	            rb.DOM.hide(message_el);

	            if (timeout_instance !== null) {
	                clearTimeout(timeout_instance);
	                timeout_instance = null;
	            }
	        }
	    };

	module.exports = {
	    init: initDOM,
	    show: show,

	    hide: function () {
	        hide();
	    }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2),
	    Message = __webpack_require__(7),
	    AJAX = __webpack_require__(5);

	var window_el, login_el, password_el, login_btn, back_btn, props,

	    initDOM = function () {
	        window_el   = document.getElementById('login-window');
	        login_el    = document.getElementById('login');
	        password_el = document.getElementById('password');
	        login_btn   = document.getElementById('anki-login');
	        back_btn    = window_el.getElementsByClassName('back')[0];

	        (function provideLocalization() {
	            window_el.querySelector('h3').innerHTML                     = chrome.i18n.getMessage('Enter_your_Anki_credentials');
	            window_el.querySelector('label[for="login"]').innerHTML     = chrome.i18n.getMessage('Login');
	            window_el.querySelector('label[for="password"]').innerHTML  = chrome.i18n.getMessage('Password');
	            window_el.querySelector('#anki-login').innerHTML            = chrome.i18n.getMessage('Log_in');
	            window_el.querySelector('.back').innerHTML                  = chrome.i18n.getMessage('Back');
	        }());

	        login_btn.addEventListener('click', function () {
	            var login_val = login_el.value.trim(),
	                password_val = password_el.value.trim();

	            if (login_val && password_val) {
	                Message.show(chrome.i18n.getMessage('Trying_to_log_in'), false);

	                loginIntoAnki(login_val, password_val).then(
	                        function () {
	                            retrieveInfoFromAnki().then(function (data) {
	                                Message.hide();
	                                props.onLogin(data);
	                            });
	                        },
	                        function () {
	                            Message.show(chrome.i18n.getMessage('Incorrect_credentials'));
	                        });
	            } else {
	                Message.show(chrome.i18n.getMessage('Enter_login_and_password'));
	            }
	        });

	        back_btn.addEventListener('click', function () {
	            props.onBack();
	        });
	    },

	    retrieveInfoFromAnki = function () {
	        return AJAX.request('get', 'https://ankiweb.net/edit/').then(function (response) {
	            var deck_id,
	                decks_array = [],
	                models = JSON.parse(/editor\.models = (.*}]);/.exec(response)[1]),
	                decks = JSON.parse(/editor\.decks = (.*}});/.exec(response)[1]);

	            models = models.map(function (model) {
	                return {
	                    id: model.id,
	                    name: model.name
	                };
	            });

	            for (deck_id in decks) {
	                if (decks.hasOwnProperty(deck_id)) {
	                    decks_array.push(decks[deck_id].name);
	                }
	            }

	            return {
	                models: models,
	                decks: decks_array
	            };
	        });
	    },

	    logoutFromAnki = function () {
	        return AJAX.request('get', 'https://ankiweb.net/account/logout');
	    },

	    loginIntoAnki = function (login, password) { return new Promise(function (resolve, reject) {
	        logoutFromAnki().then(function () {
	            AJAX.request('post', 'https://ankiweb.net/account/login', {
	                submitted: 1,
	                username: login,
	                password: password
	            }).then(
	                function (anki_html) {
	                    if (anki_html.indexOf('Logout') === -1) {
	                        reject();
	                    } else {
	                        resolve();
	                    }
	                },
	                function (error_string) {
	                    var auth_limit_error = error_string.indexOf('Auth limit reached') !== -1;

	                    if (auth_limit_error) {
	                        Message.show(chrome.i18n.getMessage(
	                            'Log_in_limit_reached_Please_try_again_later_or_your_another_credentials'));
	                    }
	                });
	        });
	    })};

	module.exports = {
	    init: function (new_props) {
	        props = new_props;
	        initDOM();
	    },

	    show: function () {
	        rb.DOM.show(window_el);
	        login_el.focus();
	    },

	    hide: function () {
	        rb.DOM.hide(window_el);
	    }
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(2),
	    Message = __webpack_require__(7),
	    AJAX = __webpack_require__(5);

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

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(11);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(13)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/less-loader/index.js!./options.less", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/less-loader/index.js!./options.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(12)();
	// imports


	// module
	exports.push([module.id, "[hidden] {\n  display: none !important;\n}\n#message {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  padding: 40px;\n  font-size: 16px;\n  background-color: rgba(255, 255, 255, 0.9);\n  cursor: pointer;\n}\n#message[closable]:before {\n  position: absolute;\n  top: 10px;\n  right: 20px;\n  font-size: 24px;\n  content: 'x';\n}\n.menu {\n  padding-top: 5px;\n}\n.menu:not(:last-child) {\n  padding-bottom: 15px;\n  border-bottom: 1px solid grey;\n}\nh3 {\n  margin: 0 0 20px;\n  font-weight: bold;\n}\nlabel {\n  display: inline-table;\n  width: 120px;\n  padding-right: 10px;\n  text-align: right;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n}\nselect {\n  width: 150px;\n}\ntextarea {\n  resize: none;\n}\n.btn-area {\n  text-align: center;\n}\nbutton {\n  width: 160px;\n  height: 24px;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  cursor: pointer;\n}\nbutton:nth-child(2n + 1) {\n  margin: 2px 5px 2px 0;\n}\n#deck-info {\n  margin: 10px 0;\n}\n#desc-container {\n  display: flex;\n  align-items: center;\n  margin-bottom: 5px;\n}\n#cards-count {\n  font-family: monospace;\n  font-size: 16px;\n}\n", ""]);

	// exports


/***/ },
/* 12 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0;

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function createStyleElement() {
		var styleElement = document.createElement("style");
		var head = getHeadElement();
		styleElement.type = "text/css";
		head.appendChild(styleElement);
		return styleElement;
	}

	function createLinkElement() {
		var linkElement = document.createElement("link");
		var head = getHeadElement();
		linkElement.rel = "stylesheet";
		head.appendChild(linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement());
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement();
			update = updateLink.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement();
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				styleElement.parentNode.removeChild(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var media = obj.media;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ }
/******/ ]);