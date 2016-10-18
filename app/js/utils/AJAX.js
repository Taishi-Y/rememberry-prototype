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
        const params = [
            'client=gtx',
            `sl=${source_lang}`,
            `tl=${target_lang}`,
            'hl=en-US',
            'dt=t',
            'dt=bd',
            'dj=1',
            'source=input',
            'tk=29979.29979',
            `q=${text}`
        ].join('&');

        return getJSON(`https://translate.googleapis.com/translate_a/single?${params}`);
    };

export default {
    METHODS,
    request,
    getJSON,
    translate
};