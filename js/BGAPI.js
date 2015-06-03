var BGAPI = {

    send: function (type, data) {
        chrome.runtime.sendMessage({ type: 'set-' + type, data: data });
    },

    receive: function (type, cb) {
        var results, checkIfComplete;

        if (!Array.isArray(type)) {
            chrome.runtime.sendMessage({ type: 'get-' + type }, cb);
        } else {
            results = {};

            checkIfComplete = function () {
                var args;

                if (Object.keys(results).length === type.length) {
                    args = type.map(function (curr_type) {
                        return results[curr_type];
                    });

                    cb.apply(null, args);
                }
            };

            type.forEach(function (curr_type) {
                BGAPI.receive(curr_type, function (result) {
                    results[curr_type] = result;
                    checkIfComplete();
                });
            });
        }
    }
};