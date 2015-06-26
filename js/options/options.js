var rb = require('../utils/common.js'),
    Windows = require('./Windows');

require('../../less/options.less');

rb.DOM.onReady.then(function () {
    Windows.init();
    Windows.show('options');
});