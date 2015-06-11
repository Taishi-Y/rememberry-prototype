var bgAPI = {

    send: function (type, data) {
        chrome.runtime.sendMessage({ method: 'set', type: type, data: data });
    },

    receive: function (type) {
        var promise, promises;

        if (!Array.isArray(type)) {
            promise = new Promise(function (resolve) {
                chrome.runtime.sendMessage({ method: 'get', type: type }, resolve);
            });
        } else {
            promises = type.map(function (curr_type) {
                return new Promise(function (resolve) {
                    bgAPI.receive(curr_type).then(resolve);
                });
            });

            promise = Promise.all(promises);
        }

        return promise;
    },

    add: function (type, data) {
        chrome.runtime.sendMessage({ method: 'add', type: type, data: data });
    },

    translate: function (text, source, target) {
        return new Promise(function (resolve) {
            try {
                chrome.runtime.sendMessage({
                    method: 'translate',
                    data: {
                        text: text,
                        source: source,
                        target: target
                    }
                }, resolve);
            } catch (e) {
                resolve(e);
            }
        });
    }
};