var rb = require('../utils/common'),
    Windows = require('./Windows');

require('../../less/options.less');

rb.DOM.onReady.then(function () {
    Windows.init();
    Windows.show('options');
});