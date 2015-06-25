var rb = require('../utils/common.js'),
    Windows = require('./Windows');

rb.DOM.onReady.then(function () {
    Windows.init();
    Windows.show('options');
});