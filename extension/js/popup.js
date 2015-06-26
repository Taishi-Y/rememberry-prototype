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
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(4),
	    bgAPI = __webpack_require__(11),
	    SM2 = __webpack_require__(24);

	__webpack_require__(25);

	rb.DOM.onReady.then(function () {
	    var message_el      = document.getElementById('message'),
	        test_el         = document.getElementById('test'),
	        source_el       = document.getElementById('source'),
	        translation_el  = document.getElementById('translation'),
	        show_answer_btn = document.getElementById('show-answer-btn'),
	        mark_area       = document.getElementById('mark-area');

	    (function provideLocalization() {
	        message_el.innerHTML = chrome.i18n.getMessage('Loading');
	        show_answer_btn.innerHTML = chrome.i18n.getMessage('Show_answer');
	        document.querySelector('#mark-area [data-quality="5"]').innerHTML = chrome.i18n.getMessage('Easy');
	        document.querySelector('#mark-area [data-quality="4"]').innerHTML = chrome.i18n.getMessage('Good');
	        document.querySelector('#mark-area [data-quality="3"]').innerHTML = chrome.i18n.getMessage('Hard');
	    }());

	    bgAPI.receive('cards').then(function (cards) {
	        var showNextCard, init, handleResponse, saveChanges, setState, current,

	            repeat_cards = [],
	            ripened_cards = Object.keys(cards).map(function (card_name) {
	                    return {
	                        name: card_name,
	                        card: cards[card_name]
	                    };
	                }).filter(function (card_data) {
	                    return SM2.isCardRipened(card_data.card);
	                });

	        init = function () {
	            rb.DOM.hide(message_el);
	            rb.DOM.show(test_el);

	            show_answer_btn.addEventListener('click', setState.bind(null, 'assess'));

	            mark_area.addEventListener('click', function (e) {
	                var quality = e.target.dataset.quality;

	                if (quality) {
	                    handleResponse(Number(quality));
	                }
	            });
	        };

	        setState = function (state) {
	            switch (state) {
	                case 'answer':
	                    rb.DOM.show(show_answer_btn);
	                    rb.DOM.hide([ mark_area, translation_el ]);
	                    break;
	                case 'assess':
	                    rb.DOM.hide(show_answer_btn);
	                    rb.DOM.show([ mark_area, translation_el ]);
	                    break;
	                case 'complete':
	                    source_el.innerHTML = '';
	                    translation_el.innerHTML = '';
	                    message_el.innerHTML = chrome.i18n.getMessage('Nothing_to_learn');
	                    rb.DOM.hide(test_el);
	                    rb.DOM.show(message_el);
	                    break;
	                default:
	            }
	        };

	        handleResponse = function (quality) {
	            if (!current.is_repeated) {
	                SM2.evoluteCard(current.card, quality);
	                saveChanges();
	            }

	            if (quality === 3) {
	                current.is_repeated = true;
	                repeat_cards.push(current);
	            }

	            showNextCard();
	        };

	        showNextCard = function () {
	            var card_info = ripened_cards.shift() || repeat_cards.shift();

	            if (card_info) {
	                setState('answer');
	                source_el.innerHTML = card_info.name;
	                translation_el.innerHTML = card_info.card.t.join(', ');

	                current = card_info;
	            } else {
	                setState('complete');
	            }
	        };

	        saveChanges = function () {
	            bgAPI.send('cards', cards);
	        };

	        init();
	        showNextCard();
	    });
	});

/***/ },

/***/ 4:
/***/ function(module, exports) {

	// common library, used by all extension script
	// contain syntax sugar staff
	var rb,

	    visible = function (is_visible, els) {
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

	rb = {
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

	module.exports = rb;

/***/ },

/***/ 11:
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

/***/ 24:
/***/ function(module, exports) {

	module.exports = {

	    getInitData: function () {
	        return {
	            n: 0,
	            i: 0,
	            d: Date.now(),
	            ef: 2.5
	        }
	    },

	    isCardRipened: function (card) {
	        var ms_diff, step_diff,
	            TIME_STEP = 1000 * 60 * 60 * 24,
	            is_ripened = false;

	        if (card.n === 0) {
	            is_ripened = true;
	        } else {
	            ms_diff     = Date.now() - card.d;
	            step_diff    = ms_diff / (TIME_STEP);
	            is_ripened  = card.i <= step_diff;
	        }

	        return is_ripened;
	    },

	    /**
	     *
	     * @param {Object} card
	     * @param {Number} quality
	     */
	    evoluteCard: function (card, quality) {
	        if (quality !== 4) {
	            card.ef = Math.max(1.3, card.ef - .8 + .28 * quality - .02 * Math.pow(quality, 2));
	            card.ef = Number(card.ef.toFixed(2));
	        }

	        card.n++;

	        switch (card.n) {
	            case 1:
	                card.i = 1;
	                break;
	            case 2:
	                card.i = 6;
	                break;
	            default:
	                card.i *= card.ef;
	                card.i = Number(card.i.toFixed(2));
	        }

	        card.d = Date.now();
	    }
	};

/***/ },

/***/ 25:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }

/******/ });