var clone = function (data) {
    return function () {
        return JSON.parse(JSON.stringify(data));
    };
};

module.exports = {
    getLanguages        : clone(require('../../data/languages.json')),
    getActions          : clone(require('../../data/actions.json')),
    getPartsOfSpeech    : clone(require('../../data/PoS_enum.json')),
    getDefaultConfig    : clone(require('../../data/default_config.json'))
};