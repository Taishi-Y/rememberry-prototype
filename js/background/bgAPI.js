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

            rb.when(promises, cb);
        }
    },

    add: function (type, data) {
        chrome.runtime.sendMessage({ method: 'add', type: type, data: data });
    },

    translate: function (text, source, target) {
        return new Promise(function (resolve) {
            chrome.runtime.sendMessage({
                    method: 'translate',
                    data: {
                        text: text,
                        source: source,
                        target: target
                    }
                }, resolve);
        });
    }
};