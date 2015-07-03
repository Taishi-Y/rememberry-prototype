import rb from 'js/utils/common';
import Message from '../Message';
import AJAX from 'js/utils/AJAX';

let window_el, login_el, password_el, login_btn, back_btn, props,

    retrieveInfoFromAnki = () =>
        AJAX.request(AJAX.METHODS.GET, 'https://ankiweb.net/edit/').then(response => {
            let decks_array = [],
                models = JSON.parse(/editor\.models = (.*}]);/.exec(response)[1]),
                decks = JSON.parse(/editor\.decks = (.*}});/.exec(response)[1]);

            models = models.map(model => ({
                id: model.id,
                name: model.name
            }));

            for (let deck_id in decks) {
                decks_array.push(decks[deck_id].name);
            }

            return {
                models,
                decks: decks_array
            };
        }),

    logoutFromAnki = () => AJAX.request(AJAX.METHODS.GET, 'https://ankiweb.net/account/logout'),

    loginIntoAnki = (login, password) => new Promise((resolve, reject) => {
        logoutFromAnki().then(() => {
            AJAX.request(AJAX.METHODS.POST, 'https://ankiweb.net/account/login', {
                submitted: 1,
                username: login,
                password
            }).then(
                anki_html => {
                    if (!anki_html.includes('Logout')) {
                        reject();
                    } else {
                        resolve();
                    }
                },
                error_string => {
                    let auth_limit_error = error_string.includes('Auth limit reached');

                    if (auth_limit_error) {
                        Message.show(chrome.i18n.getMessage(
                            'Log_in_limit_reached_Please_try_again_later_or_your_another_credentials'));
                    }
                });
        });
    }),

    initDOM = () => {
        window_el   = document.getElementById('login-window');
        login_el    = document.getElementById('login');
        password_el = document.getElementById('password');
        login_btn   = document.getElementById('anki-login');
        back_btn    = window_el.getElementsByClassName('back')[0];

        (function provideLocalization() {
            window_el.querySelector('h3').innerHTML                     = chrome.i18n.getMessage('Enter_your_Anki_credentials');
            window_el.querySelector('label[for="login"]').innerHTML     = chrome.i18n.getMessage('Login');
            window_el.querySelector('label[for="password"]').innerHTML  = chrome.i18n.getMessage('Password');
            window_el.querySelector('#anki-login').innerHTML            = chrome.i18n.getMessage('Log_in');
            window_el.querySelector('.back').innerHTML                  = chrome.i18n.getMessage('Back');
        }());

        login_btn.addEventListener('click', () => {
            let login_val = login_el.value.trim(),
                password_val = password_el.value.trim();

            if (login_val && password_val) {
                Message.show(chrome.i18n.getMessage('Trying_to_log_in'), false);

                loginIntoAnki(login_val, password_val).then(
                        () => {
                            retrieveInfoFromAnki().then(data => {
                                Message.hide();
                                props.onLogin(data);
                            });
                        },
                        () => {
                            Message.show(chrome.i18n.getMessage('Incorrect_credentials'));
                        });
            } else {
                Message.show(chrome.i18n.getMessage('Enter_login_and_password'));
            }
        });

        back_btn.addEventListener('click', () => {
            props.onBack();
        });
    };

export default {
    init(initial_props) {
        props = initial_props;
        initDOM();
    },

    show() {
        rb.DOM.show(window_el);
        login_el.focus();
    },

    hide() {
        rb.DOM.hide(window_el);
    }
};