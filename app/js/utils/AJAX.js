var request = function (type, url, data, headers) { return new Promise(function (resolve, reject) {
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
            },

            setHeaders = function () {
                if (headers) {
                    Object.keys(headers).forEach(function (name) {
                        xhr.setRequestHeader(name, headers[name]);
                    });
                }
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
            setHeaders();
            xhr.send();
        } else if (type === 'post') {
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', '*/*');
            setHeaders();
            xhr.send(toURI(data));
        }
    })},

    getJSON = function (path, data, headers) {
        return request('get', path, data, headers).then(JSON.parse);
    },

    translate = function (text, source_lang, target_lang) {
        var params = 'client=mt&' +
                        'text=' + text + '&' +
                        (source_lang === 'auto' ? '' : ('sl=' + source_lang + '&')) +
                        'tl=' + target_lang,
            url = 'http://translate.google.ru/translate_a/t?' + params;

        return getJSON(url, null, { 'Accept': 'application/json, text/javascript, */*; q=0.01' });
    };

module.exports = {
    request     : request,
    getJSON     : getJSON,
    translate   : translate
};