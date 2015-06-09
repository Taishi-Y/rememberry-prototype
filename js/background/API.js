var bgAPI = {

    send: function (type, data) {
        chrome.runtime.sendMessage({ method: 'set', type: type, data: data });
    },

    receive: function (type, cb) {
        var promises;

        if (!Array.isArray(type)) {
            chrome.runtime.sendMessage({ method: 'get', type: type }, cb);
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