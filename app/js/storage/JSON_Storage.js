let clone = data => () => JSON.parse(JSON.stringify(data));

export default {
    getLanguages        : clone(require('data/languages.json')),
    getActions          : clone(require('data/actions.json')),
    getPartsOfSpeech    : clone(require('data/PoS_enum.json')),
    getDefaultConfig    : clone(require('data/default_config.json'))
};