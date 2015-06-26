var AJAX = require('../utils/AJAX');

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