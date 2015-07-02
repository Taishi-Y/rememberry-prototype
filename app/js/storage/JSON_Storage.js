import languages from 'data/languages.json';
import actions from 'data/actions.json';
import PoS_enum from 'data/PoS_enum.json';
import default_config from 'data/default_config.json';

let clone = data => () => JSON.parse(JSON.stringify(data));

export default {
    getLanguages        : clone(languages),
    getActions          : clone(actions),
    getPartsOfSpeech    : clone(PoS_enum),
    getDefaultConfig    : clone(default_config)
};