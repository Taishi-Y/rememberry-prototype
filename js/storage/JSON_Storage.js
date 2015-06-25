var JSON_Storage = (function () {
    var closure = function (file_name) {
        var data = AJAX.getJSON('/data/' + file_name + '.json');

        return function () {
            return data;
        };
    };

    return {
        getLanguages    : closure('languages'),
        getActions      : closure('actions'),
        getDefaultConfig: closure('default_config'),
        getPartsOfSpeech: closure('PoS_enum')
    };
}());