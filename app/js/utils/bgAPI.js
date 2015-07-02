let parts_of_speech_enum,

    send = (type, data) => {
        chrome.runtime.sendMessage({ method: 'set', type, data });
    },

    receive = (type, data) => {
        let promise;

        if (!Array.isArray(type)) {
            promise = new Promise(resolve => {
                chrome.runtime.sendMessage({ method: 'get', type, data }, resolve);
            });
        } else {
            let promises = type.map(curr_type => receive(curr_type));

            promise = Promise.all(promises);
        }

        return promise;
    },

    add = (type, data) => new Promise(resolve => {
        chrome.runtime.sendMessage({ method: 'add', type, data }, resolve);
    }),

    remove = (type, data) => new Promise(resolve => {
        chrome.runtime.sendMessage({ method: 'remove', type, data }, resolve);
    }),

    translate = (text, source, target) => new Promise(resolve => {
        let parseResult = result =>
            parts_of_speech_enum.then(pos_enum => {
                let parsed_result,
                    type = text.includes(' ') ? 'sentence' : 'word';

                if (type === 'word') {
                    let sentences,
                        all_terms = [];

                    parsed_result = {};

                    if (result.dict) {
                        result.dict.sort((a, b) => a.pos_enum > b.pos_enum);

                        result.dict.forEach(entry => {
                            let terms = entry.terms
                                            .map(term => term.toLowerCase())
                                            .filter(term => all_terms.indexOf(term) === -1);

                            if (terms.length) {
                                let pos_name = pos_enum[entry.pos_enum - 1];

                                parsed_result[pos_name] = {
                                    name: pos_name.trim().length ?
                                            chrome.i18n.getMessage(pos_name.replace(/\s/g, '_')) : '',
                                    terms
                                };

                                all_terms = all_terms.concat(terms);
                            }
                        });
                    }

                    if (result.sentences) {
                        sentences = [];

                        result.sentences.forEach(sentence => {
                            let term = sentence.trans.toLowerCase().replace(/\./g, '');

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
                                terms: [ result.sentences.map(item => item.trans).join('') ]
                            }
                        };
                    }
                }

                return parsed_result;
            });

        chrome.runtime.sendMessage({
                method: 'translate',
                data: {
                    text,
                    source,
                    target
                }
            }, result => {
                parseResult(result).then(resolve);
            });
    });

parts_of_speech_enum = receive('PoS').then(PoS => PoS.enum);

export default {
    send,
    receive,
    add,
    remove,
    translate
};