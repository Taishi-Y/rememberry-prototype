var AJAX = {

    request: function (type, url, data) { return new Promise(function (resolve) {
        var URI_data,key,
            xhr = new XMLHttpRequest();

        xhr.open(type.toUpperCase(), url);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.response);
            }
        };

        if (type === 'get') {
            xhr.send();
        } else if (type === 'post') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', '*/*');

            URI_data = [];

            for (key in data) {
                if (data.hasOwnProperty(key)) {
                    URI_data.push(key + '=' + decodeURIComponent(data[key]));
                }
            }

            data = URI_data.join('&');
            xhr.send(data);
        }
    })},

    getJSON: function (path) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else if (xhr.status === 404) {
                    reject(404);
                }
            };

            xhr.open('GET', path);
            xhr.send();
        });
    },

    translate: function (text, source_lang, target_lang) {
        return new Promise(function (resolve) {
            var xhr = new XMLHttpRequest(),
                params = 'client=mt&' +
                        'text=' + text + '&' +
                        (source_lang === 'auto' ? '' : ('sl=' + source_lang + '&')) +
                        'tl=' + target_lang,
                url = 'http://translate.google.ru/translate_a/t?' + params;

            xhr.open('GET', url);
            xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');

            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    resolve(JSON.parse(xhr.responseText));
                }
            };

            xhr.send();
        });
    }
};