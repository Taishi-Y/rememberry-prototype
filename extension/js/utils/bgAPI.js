var bgAPI = (function () {
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
                        bgAPI.receive(curr_type).then(resolve);
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
            var parseResult = function (result) { return new Promise(function (resolve) {
                parts_of_speech_enum.then(function (pos_enum) {
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

                    resolve(parsed_result);
                });
            })};
    
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
    
    return {
        send        : send,
        receive     : receive,
        add         : add,
        remove      : remove,
        translate   : translate
    };
}());