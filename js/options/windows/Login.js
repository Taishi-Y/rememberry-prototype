rb.onDomReady.then(function () {
    var window_el   = document.getElementById('login-window'),
        login_el    = document.getElementById('login'),
        password_el = document.getElementById('password'),
        login_btn   = document.getElementById('anki-login'),
        back_btn    = window_el.getElementsByClassName('back')[0],

        retrieveInfoFromAnki = function () { return new Promise(function (resolve) {
            AJAX.request('get', 'https://ankiweb.net/edit/').then(function (response) {
                var deck_id,
                    decks_array = [],
                    models = JSON.parse(/editor\.models = (.*}]);/.exec(response)[1]),
                    decks = JSON.parse(/editor\.decks = (.*}});/.exec(response)[1]);

                models = models.map(function (model) {
                    return {
                        id: model.id,
                        name: model.name
                    };
                });

                for (deck_id in decks) {
                    if (decks.hasOwnProperty(deck_id)) {
                        decks_array.push(decks[deck_id].name);
                    }
                }

                resolve({
                    models: models,
                    decks: decks_array
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
                }).then(
                    function (anki_html) {
                        if (anki_html.indexOf('Logout') === -1) {
                            reject();
                        } else {
                            resolve();
                        }
                    },
                    function (error_string) {
                        var auth_limit_error = error_string.indexOf('Auth limit reached') !== -1;

                        if (auth_limit_error) {
                            Message.show(chrome.i18n.getMessage(
                                'Log_in_limit_reached_Please_try_again_later_or_your_another_credentials'));
                        }
                    });
            });
        })};

    (function provideLocalization() {
        window_el.querySelector('h3').innerHTML                     = chrome.i18n.getMessage('Enter_your_Anki_credentials');
        window_el.querySelector('label[for="login"]').innerHTML     = chrome.i18n.getMessage('Login');
        window_el.querySelector('label[for="password"]').innerHTML  = chrome.i18n.getMessage('Password');
        window_el.querySelector('#anki-login').innerHTML            = chrome.i18n.getMessage('Log_in');
        window_el.querySelector('.back').innerHTML                  = chrome.i18n.getMessage('Back');
    }());

    login_btn.addEventListener('click', function () {
        var login_val = login_el.value.trim(),
            password_val = password_el.value.trim();

        if (login_val && password_val) {
            Message.show(chrome.i18n.getMessage('Trying_to_log_in'), false);

            loginIntoAnki(login_val, password_val).then(
                function () {
                    retrieveInfoFromAnki().then(function (data) {
                        Message.hide();
                        Windows.show('export', data);
                    });
                },
                function () {
                    Message.show(chrome.i18n.getMessage('Incorrect_credentials'));
                });
        } else {
            Message.show(chrome.i18n.getMessage('Enter_login_and_password'));
        }
    });

    back_btn.addEventListener('click', function () {
        Windows.show('options');
    });

    Windows.add('login', {
        show: function () {
            rb.show(window_el);
            login_el.focus();
        },

        hide: function () {
            rb.hide(window_el);
        }
    });
});