rb.onDomReady.then(function () {
    (function provideLocalization() {
        document.querySelector('#languages-menu h3').innerHTML = chrome.i18n.getMessage('languages');
        document.querySelector('#source-lang-desc').innerHTML = chrome.i18n.getMessage('Source_language');
        document.querySelector('#target-lang-desc').innerHTML = chrome.i18n.getMessage('Target_language');

        document.querySelector('#action-menu h3').innerHTML = chrome.i18n.getMessage('Modifiers');
        document.querySelector('#trigger-action-desc').innerHTML = chrome.i18n.getMessage('Trigger_action');
        document.querySelector('#modifier-desc').innerHTML = chrome.i18n.getMessage('Key_modifier');
    }());

    (function initLanguageMenu() {
        bgAPI.receive([ 'config', 'languages' ]).spread(function (config, languages) {
            var source_lang_el = document.getElementById('source_lang'),
                target_lang_el = document.getElementById('target_lang');

            (function fillMenusWithLanguages() {
                var code, language, appendOption,
                    source_lang = config.source_lang,
                    target_lang = config.target_lang;

                appendOption = function (parent, value, text, active_value) {
                    var option_el = rb.node('<option value="' + value + '">' + text + '</option>');

                    parent.appendChild(option_el);

                    if (value === active_value) {
                        parent.selectedIndex = parent.children.length - 1;
                    }
                };

                appendOption(source_lang_el, 'auto', chrome.i18n.getMessage('Detect'), source_lang);

                for (code in languages) {
                    language = languages[code];
                    appendOption(source_lang_el, code, language, source_lang);
                    appendOption(target_lang_el, code, language, target_lang);
                }
            }());

            (function listenOnChange() {
                source_lang_el.addEventListener('change', function () {
                    bgAPI.send('config', {
                        source_lang: source_lang_el.children[source_lang_el.selectedIndex].value
                    });
                });

                target_lang_el.addEventListener('change', function () {
                    bgAPI.send('config', {
                        target_lang: target_lang_el.children[target_lang_el.selectedIndex].value
                    });
                });
            }());
        });
    }());

    (function initActionMenu() {
        bgAPI.receive([ 'config', 'actions' ]).spread(function (config, actions) {
            var names_el = document.getElementById('action'),
                modifiers_el = document.getElementById('modifier');

            (function fillMenusWithActions() {
                var i, l, appendOption,
                    event_names = actions.names,
                    modifiers = actions.modifiers,
                    selected_event_name = config.action.name,
                    selected_modifier = config.action.modifier;

                appendOption = function (parent, value, active_value) {
                    var el = rb.node('<option value="' + value + '">' + value + '</option>');

                    parent.appendChild(el);

                    if (value === active_value) {
                        parent.selectedIndex = i;
                    }
                };

                for (i = 0, l = event_names.length; i < l; i++) {
                    appendOption(names_el, event_names[i], selected_event_name);
                }

                for (i = 0, l = modifiers.length; i < l; i++) {
                    appendOption(modifiers_el, modifiers[i], selected_modifier);
                }
            }());

            (function listenOnChange() {
                names_el.addEventListener('change', function () {
                    bgAPI.send('config', {
                        action: {
                            name: names_el.children[names_el.selectedIndex].value
                        }
                    });
                });

                modifiers_el.addEventListener('change', function () {
                    bgAPI.send('config', {
                        action: {
                            modifier: modifiers_el.children[modifiers_el.selectedIndex].value
                        }
                    });
                });
            }());
        });
    }())
});