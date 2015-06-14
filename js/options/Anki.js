var Anki;

rb.onDomReady.then(function () {
    var menu_container_el = document.getElementById('menu-container'),
        anki_container_el = document.getElementById('anki-export-container'),

        exportDecks = function (decks) {

        },

        showWindow = function (deck) {
            rb.hide(menu_container_el);
            rb.show(anki_container_el);

            LoginWindow.show();
        };

    (function provideLocalization() {}());

    var LoginWindow = (function () {
        var window_el   = document.getElementById('login-window'),
            login_el    = document.getElementById('login'),
            password_el = document.getElementById('password'),
            login_btn   = document.getElementById('anki-login'),

            retrieveInfoFromAnki = function () { return new Promise(function (resolve) {
                AJAX.request('get', 'https://ankiweb.net/edit/').then(function (response) {
                    var models = JSON.parse(/editor\.models = (.*}]);/.exec(response)[1]),
                        decks = JSON.parse(/editor\.decks = (.*}});/.exec(response)[1]);

                    resolve({
                        models: models,
                        decks: decks
                    });
                });
            })},

            logoutFromAnki = function () { return new Promise(function (resolve) {
                AJAX.request('get', 'https://ankiweb.net/account/logout').then(resolve);
            })},

            loginIntoAnki = function (login, password) { return new Promise(function (resolve, reject) {
                logoutFromAnki().then(function () {
                    AJAX.request('post', 'https://ankiweb.net/account/login', {
                        submitted: 1,
                        username: login,
                        password: password
                    }).then(function (anki_html) {
                        if (anki_html.indexOf('Logout') === -1) {
                            reject();
                        } else {
                            resolve();
                        }
                    });
                });
            })};

        login_btn.addEventListener('click', function () {
            var login_val = login_el.value.trim(),
                password_val = password_el.value.trim();

            if (login_val && password_val) {
                loginIntoAnki(login_val, password_val).then(
                    function () {
                        retrieveInfoFromAnki().then(function (data) {
                            LoginWindow.hide();
                            ExportWindow.show(data);
                        });
                    },
                    function () {
                        Message.show('Incorrect credentials');
                    });
            }
        });

        return {
            show: function () {
                rb.show(window_el);
                login_el.focus();
            },

            hide: function () {
                rb.hide(window_el);
            }
        };
    }());

    var ExportWindow = (function () {
        var window_el = document.getElementById('export-window'),
            model_el = document.getElementById('model'),
            deck_el = document.getElementById('deck'),

            initWithData = function (data) {
                debugger;
            };

        return {
            show: function (data) {
                rb.show(window_el);
                model_el.focus();

                initWithData(data);
            },

            hide: function () {
                rb.hide(window_el);
            }
        };
    }());

    Anki = {
        showWindow: showWindow
    };
});