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

	var ConfigStorage = __webpack_require__(3),
	    DeckStorage = __webpack_require__(9),
	    CardStorage = __webpack_require__(10),
	    JSON_Storage = __webpack_require__(6);

	ConfigStorage.init().then(function () {
	    DeckStorage.init();
	});

	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	    var data = message.data;

	    switch (message.method) {
	        case 'get':
	            switch (message.type) {
	                case 'config':
	                    ConfigStorage.getIt().then(sendResponse);
	                    break;
	                case 'languages':
	                    JSON_Storage.getLanguages().then(sendResponse);
	                    break;
	                case 'actions':
	                    JSON_Storage.getActions().then(sendResponse);
	                    break;
	                case 'PoS':
	                    JSON_Storage.getPartsOfSpeech().then(sendResponse);
	                    break;
	                case 'cards':
	                    CardStorage.getCards().then(sendResponse);
	                    break;
	                case 'deck':
	                    DeckStorage.getDeck(data).then(sendResponse);
	                    break;
	                case 'decks':
	                    DeckStorage.getDecks().then(sendResponse);
	                    break;
	                default:
	            }

	            break;
	        case 'set':
	            switch (message.type) {
	                case 'config':
	                    ConfigStorage.extendIt(data);
	                    break;
	                case 'cards':
	                    CardStorage.setCards(data);
	                    break;
	                case 'active-deck':
	                    DeckStorage.selectDeck(data);
	                    break;
	                case 'deck':
	                    DeckStorage.updateDeck(data);
	                    break;
	                default:
	            }

	            break;
	        case 'add':
	            switch (message.type) {
	                case 'card':
	                    CardStorage.addCard(data);
	                    break;
	                case 'deck':
	                    DeckStorage.createDeck(data.name, data.desc).then(sendResponse);
	                    break;
	                default:
	            }

	            break;
	        case 'remove':
	            switch (message.type) {
	                case 'deck':
	                    DeckStorage.removeDeck(data).then(sendResponse);
	                    break;
	                default:
	            }

	            break;
	        case 'translate':
	            AJAX.translate(data.text, data.source, data.target).then(sendResponse);
	            break;
	        default:
	    }

	    return true;
	});

	chrome.contextMenus.create({
	    title: chrome.i18n.getMessage('Translate_with', [ chrome.i18n.getMessage('ext_name') ]),
	    contexts: [ 'selection' ],

	    onclick: function (info, tab) {
	        chrome.tabs.sendMessage(tab.id, { method: 'translate', type: 'selection' });
	    }
	});

/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(4),
	    Storage = __webpack_require__(5),
	    JSON_Storage = __webpack_require__(6),
	    contentAPI = __webpack_require__(8);

	var init = function () {
	        return getIt().then(function (config) {
	            if (!config) {
	                return setIt('default');
	            } else {
	                return JSON_Storage.getDefaultConfig().then(function (default_config) {
	                    return setIt(rb.override(config, default_config, { new_only: true }));
	                });
	            }
	        });
	    },

	    extendIt = function (ext_config) {
	        return getIt().then(function (old_config) {
	            return setIt(rb.override(old_config, ext_config, { concat_arrays: true }));
	        });
	    },

	    setIt = function (new_config) { return new Promise(function (resolve) {
	        var setIt_local = function (config) {
	            Storage.setItem({ config: config }).then(function () {
	                resolve();
	                contentAPI.send('config', config);
	            });
	        };

	        if (new_config === 'default') {
	            JSON_Storage.getDefaultConfig().then(function (default_config) {
	                setIt_local(default_config);
	            });
	        } else {
	            setIt_local(new_config);
	        }
	    })},

	    getIt = function () {
	        return Storage.getItem('config').then(function (data) {
	            return data.config;
	        });
	    };

	module.exports = {
	    init    : init,
	    setIt   : setIt,
	    getIt   : getIt,
	    extendIt: extendIt
	};

/***/ },
/* 4 */
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
/* 5 */
/***/ function(module, exports) {

	var type = 'sync',
	    db = chrome.storage[type];

	module.exports = {
	    setItem: function (data) { return new Promise(function (resolve) {
	        db.set(data, resolve);
	    })},

	    getItem: function (names) { return new Promise(function (resolve) {
	        db.get(names, resolve);
	    })},

	    removeItem: function (name) { return new Promise(function (resolve) {
	        db.remove(name, resolve);
	    })}
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var AJAX = __webpack_require__(7);

	var closure = function (file_name) {
	    var data = AJAX.getJSON('/data/' + file_name + '.json');

	    return function () {
	        return data;
	    };
	};

	module.exports = {
	    getLanguages    : closure('languages'),
	    getActions      : closure('actions'),
	    getDefaultConfig: closure('default_config'),
	    getPartsOfSpeech: closure('PoS_enum')
	};

/***/ },
/* 7 */
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
/* 8 */
/***/ function(module, exports) {

	module.exports = {

	    send: function (type, data) {
	        chrome.tabs.query({}, function (tabs) {
	            tabs.forEach(function (curr_tab) {
	                chrome.tabs.sendMessage(curr_tab.id, {
	                    method: 'set',
	                    type: type,
	                    data: data
	                });
	            });
	        });
	    }
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Storage = __webpack_require__(5),
	    ConfigStorage = __webpack_require__(3);

	var init = function () {
	        return ConfigStorage.getIt().then(function (config) {
	            if (config.decks.names.length === 0) {
	                return createDeck('basic', 'Basic deck').then(function (basic_deck) {
	                    return selectDeck(basic_deck.name);
	                });
	            }
	        });
	    },

	    getKey = function (name) {
	        return 'deck_' + name;
	    },

	    createDeck = function (name, description) {
	        var new_deck = {
	            name: name,
	            desc: description,
	            cards: {}
	        };

	        return addDeck(new_deck).then(function () {
	            return new_deck;
	        });
	    },

	    updateDeck = function (deck) {
	        var old_key, old_name, key,
	            data = {};

	        if (deck.new_name) {
	            old_name = deck.name;
	            old_key = getKey(old_name);

	            deck.name = deck.new_name;

	            delete deck.new_name;
	            Storage.removeItem(old_key);
	        }

	        key = getKey(deck.name);
	        data[key] = deck;

	        return Storage.setItem(data).then(function () {
	            return ConfigStorage.getIt().then(function (config) {
	                var names = config.decks.names;

	                names.splice(names.indexOf(old_name), 1);
	                names.push(deck.name);

	                config.decks.names = names;

	                if (old_name && old_name === config.decks.active_name) {
	                    config.decks.active_name = deck.name;
	                }

	                return ConfigStorage.setIt(config);
	            });
	        });
	    },

	    addDeck = function (deck) {
	        var data = {},
	            key = getKey(deck.name);

	        data[key] = deck;

	        return Storage.setItem(data).then(function () {
	            return ConfigStorage.extendIt({
	                decks: {
	                    names: [ deck.name ]
	                }
	            });
	        });
	    },

	    selectDeck = function (name) {
	        return ConfigStorage.extendIt({ decks: { active_name: name } });
	    },

	    getDeck = function (name) {
	        var key = getKey(name);

	        return Storage.getItem(key).then(function (result) {
	            return result[key];
	        });
	    },

	    getDecks = function () {
	        return ConfigStorage.getIt().then(function (config) {
	            var deck_promises = config.decks.names.map(function (deck_name) {
	                return getDeck(deck_name);
	            });

	            return Promise.all(deck_promises).then(function (result) {
	                var obj = {};

	                result.forEach(function (deck) {
	                    obj[deck.name] = deck;
	                });

	                return obj;
	            });
	        });
	    },

	    removeDeck = function (deck) {
	        var name = deck.name;

	        return Promise.all([ Storage.removeItem(getKey(name)), ConfigStorage.getIt().then(function (config) {
	            var index = config.decks.names.indexOf(name);

	            config.decks.names.splice(index, 1);
	            config.decks.active_name = null;

	            return ConfigStorage.setIt(config);
	        })]);
	    },

	    getActiveDeck = function () {
	        return ConfigStorage.getIt().then(function (config) {
	            return getDeck(config.decks.active_name);
	        });
	    };

	module.exports = {
	    init            : init,
	    createDeck      : createDeck,
	    getDeck         : getDeck,
	    getActiveDeck   : getActiveDeck,
	    getDecks        : getDecks,
	    selectDeck      : selectDeck,
	    updateDeck      : updateDeck,
	    removeDeck      : removeDeck
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var DeckStorage = __webpack_require__(9);

	var setCards = function (cards) {
	        DeckStorage.getActiveDeck().then(function (active_deck) {
	            active_deck.cards = cards;
	            DeckStorage.updateDeck(active_deck);
	        });
	    },

	    getCards = function () {
	        return DeckStorage.getActiveDeck().then(function (active_deck) {
	            return active_deck.cards;
	        });
	    },

	    addCard = function (info) {
	        getCards().then(function (cards) {
	            var card,
	                source = info.orig,
	                translation = info.translation;

	            if (!cards.hasOwnProperty(source)) {
	                cards[source] = rb.override({ t: translation }, SM2.getInitData());
	            } else {
	                card = cards[source];
	                card.t = rb.unique(card.t.concat(translation));
	            }

	            setCards(cards);
	        });
	    };

	module.exports = {
	    addCard: addCard,
	    setCards: setCards,
	    getCards: getCards
	};

/***/ }
/******/ ]);