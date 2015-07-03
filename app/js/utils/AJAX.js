const METHODS = Object.freeze({
    GET : Symbol(),
    POST: Symbol()
});

let request = (method, url, data, headers) => new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest(),

            toURI = obj => {
                let URI_data = [];

                for (let key in obj) {
                    URI_data.push(key + '=' + encodeURIComponent(obj[key]));
                }

                return URI_data.join('&');
            },

            setHeaders = () => {
                if (headers) {
                    for (let name of Object.keys(headers)) {
                        xhr.setRequestHeader(name, headers[name]);
                    }
                }
            };

        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    resolve(xhr.response);
                } else if (xhr.status === 403) {
                    reject(xhr.response);
                }
            }
        };

        if (method === METHODS.GET) {
            if (data) {
                data = toURI(data);
                url += '?' + data;
            }

            xhr.open('GET', url);
            setHeaders();
            xhr.send();
        } else if (method === METHODS.POST) {
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader('Accept', '*/*');
            setHeaders();
            xhr.send(toURI(data));
        }
    }),

    getJSON = (path, data, headers) => request(METHODS.GET, path, data, headers).then(JSON.parse),

    translate = (text, source_lang, target_lang) => {
        let params = `client=mt&` +
                        `text=${text}&` +
                        `${(source_lang === 'auto' ? '' : `sl=${source_lang}&`)}` +
                        `tl=${target_lang}`,
            url = 'http://translate.google.ru/translate_a/t?' + params;

        return getJSON(url, null, { 'Accept': 'application/json, text/javascript, */*; q=0.01' });
    };

export default {
    METHODS,
    request,
    getJSON,
    translate
};