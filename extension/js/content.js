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

	var rb = __webpack_require__(4),
	    bgAPI = __webpack_require__(11),
	    TranslationWindow = __webpack_require__(12);

	__webpack_require__(13);

	var init, page_config, showError,
	    props = {},
	    ERROR_MESSAGE = chrome.i18n.getMessage('no_connection_to_extension', [ chrome.i18n.getMessage('ext_name') ]);

	showError = function (e) {
	    if (e.message.indexOf('Error connecting to extension') !== -1) {
	        setTimeout(function () {
	            alert(ERROR_MESSAGE);
	        });
	    }
	};

	init = function () {
	    var handleEvent = function (e) {
	            var modifier = page_config.action.modifier;

	            if (modifier === 'none' || e[modifier]) {
	                TranslationWindow.translateSelection();
	            }
	        },

	        initConfig = function (new_config) {
	            if (page_config && page_config.action.name !== new_config.action.name) {
	                document.removeEventListener(page_config.action.name, handleEvent);
	            }

	            document.addEventListener(new_config.action.name, handleEvent);

	            page_config = new_config;
	            props.source_lang = page_config.source_lang;
	            props.target_lang = page_config.target_lang;
	        };

	    bgAPI.receive([ 'config', 'PoS' ]).spread(function (new_config) {
	        initConfig(new_config);
	    });

	    chrome.runtime.onMessage.addListener(function (message) {
	        switch (message.method) {
	            case 'set':
	                switch (message.type) {
	                    case 'config':
	                        initConfig(message.data);
	                        break;
	                    default:
	                }

	                break;
	            case 'translate':
	                switch (message.type) {
	                    case 'selection':
	                        TranslationWindow.translateSelection();
	                        break;
	                    default:
	                }

	                break;
	            default:
	        }
	    });
	};

	TranslationWindow.init(props);

	window.addEventListener('error', showError);
	rb.DOM.onReady.then(init);

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
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
/* 5 */,
/* 6 */,
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
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var rb = __webpack_require__(4),
	    bgAPI = __webpack_require__(11),
	    AJAX = __webpack_require__(7);

	// private members
	var props,
	    BASE_ID     = 'rememberry-popup',
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

	module.exports = {
	    init: function (initial_props) {
	        props = initial_props;
	    },

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
	                    bgAPI.translate(selected_text, props.source_lang, props.target_lang)
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

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(14);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(15)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../node_modules/css-loader/index.js!./../node_modules/less-loader/index.js!./fonts.less", function() {
				var newContent = require("!!./../node_modules/css-loader/index.js!./../node_modules/less-loader/index.js!./fonts.less");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(23)();
	// imports


	// module
	exports.push([module.id, "/* fallback */\n@font-face {\n  font-family: 'Kurale';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Kurale'), local('Kurale-Regular'), url(" + __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./chrome-extension://__MSG_@@extension_id__/fonts/Kurale-regular.woff2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) + ") format('woff2');\n}\n/* cyrillic */\n@font-face {\n  font-family: 'Kurale';\n  font-style: normal;\n  font-weight: 400;\n  ursrc: local('Kurale'), local('Kurale-Regular'), url(" + __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./chrome-extension://__MSG_@@extension_id__/fonts/Kurale-cyrillic.woff2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) + ") format('woff2');\n  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;\n}\n/* devanagari */\n@font-face {\n  font-family: 'Kurale';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Kurale'), local('Kurale-Regular'), url(" + __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./chrome-extension://__MSG_@@extension_id__/fonts/Kurale-devanagari.woff2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) + ") format('woff2');\n  unicode-range: U+02BC, U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200B-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB;\n}\n/* latin-ext */\n@font-face {\n  font-family: 'Kurale';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Kurale'), local('Kurale-Regular'), url(" + __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./chrome-extension://__MSG_@@extension_id__/fonts/Kurale-latin-ext.woff2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) + ") format('woff2');\n  unicode-range: U+0100-024F, U+1E00-1EFF, U+20A0-20AB, U+20AD-20CF, U+2C60-2C7F, U+A720-A7FF;\n}\n/* latin */\n@font-face {\n  font-family: 'Kurale';\n  font-style: normal;\n  font-weight: 400;\n  src: local('Kurale'), local('Kurale-Regular'), url(" + __webpack_require__(!(function webpackMissingModule() { var e = new Error("Cannot find module \"./chrome-extension://__MSG_@@extension_id__/fonts/Kurale-latin.woff2\""); e.code = 'MODULE_NOT_FOUND'; throw e; }())) + ") format('woff2');\n  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2212, U+2215, U+E0FF, U+EFFD, U+F000;\n}\n", ""]);

	// exports


/***/ },
/* 15 */
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


/***/ },
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */
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


/***/ }
/******/ ]);