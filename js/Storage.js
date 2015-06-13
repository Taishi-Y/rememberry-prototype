var Storage = (function () {
    var type = 'sync',
        db = chrome.storage[type];

    return {
        setItem: function (data) { return new Promise(function (resolve) {
            db.set(data, resolve);
        })},

        getItem: function (names) { return new Promise(function (resolve) {
            db.get(names, resolve);
        })},

        removeItem: function (name) { return new Promise(function (resolve) {
            db.remove(name, resolve);
        })}
    };
}());