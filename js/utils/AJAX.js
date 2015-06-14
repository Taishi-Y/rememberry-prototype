var AJAX = {

    request: function (type, url, data) { return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest(),

            toURI = function (obj) {
                var key,
                    URI_data = [];

                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        URI_data.push(key + '=' + encodeURIComponent(obj[key]));
                    }
                }

                return URI_data.join('&');
            };

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else if (xhr.status === 403) {
                    reject(xhr.response);
                }
            }
        };

        if (type === 'get') {
            if (data) {
                data = toURI(data);
                url += '?' + data;
            }

            xhr.open('GET', url);
            xhr.send();
        } else if (type === 'post') {
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', '*/*');
            xhr.send(toURI(data));
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