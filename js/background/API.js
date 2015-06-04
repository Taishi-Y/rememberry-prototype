var bgAPI = {

    send: function (type, data) {
        chrome.runtime.sendMessage({ type: 'set-' + type, data: data });
    },

    receive: function (type, cb) {
        var promises;

        if (!Array.isArray(type)) {
            chrome.runtime.sendMessage({ type: 'get-' + type }, cb);
        } else {
            promises = type.map(function (curr_type) {
                return new Promise(function (resolve) {
                    bgAPI.receive(curr_type, resolve);
                });
            });

            Promise.all(promises).then(function (results) {
                cb.apply(null, results);
            });
        }
    }
};