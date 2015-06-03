console.log('Options page loaded');

document.addEventListener('DOMContentLoaded', function () {
    var initLanguageMenu, initActionMenu;

    initLanguageMenu = function () {
        BGAPI.receive([ 'preferences', 'languages' ], function (prefs, languages) {
            var fillMenusWithLanguages, listenOnChange,
                source_lang_el = document.getElementById('source_lang'),
                target_lang_el = document.getElementById('target_lang');

            fillMenusWithLanguages = function () {
                var code, language, appendOption,
                    source_lang = prefs.source_lang,
                    target_lang = prefs.target_lang;

                appendOption = function (parent, value, text, active_value) {
                    var option_el = document.createElement('option');

                    option_el.value = value;
                    option_el.innerHTML = text;

                    parent.appendChild(option_el);

                    if (value === active_value) {
                        parent.selectedIndex = parent.children.length - 1;
                    }
                };

                appendOption(source_lang_el, 'auto', 'Detect', source_lang);

                for (code in languages) {
                    language = languages[code];
                    appendOption(source_lang_el, code, language, source_lang);
                    appendOption(target_lang_el, code, language, target_lang);
                }
            };

            listenOnChange = function () {
                source_lang_el.addEventListener('change', function () {
                    BGAPI.send('preferences', {
                        source_lang: source_lang_el.children[source_lang_el.selectedIndex].value
                    });
                });

                target_lang_el.addEventListener('change', function () {
                    BGAPI.send('preferences', {
                        target_lang: target_lang_el.children[target_lang_el.selectedIndex].value
                    });
                });
            };

            fillMenusWithLanguages();
            listenOnChange();
        });
    };

    initActionMenu = function () {
        BGAPI.receive([ 'preferences', 'actions' ], function (prefs, actions) {
            var i, l, el, current,
                names_container = document.getElementById('action'),
                modifiers_container = document.getElementById('modifier'),
                event_names = actions.names,
                modifiers = actions.modifiers,
                selected_action = prefs.action.name,
                selected_modifier = prefs.action.modifier;

            for (i = 0, l = event_names.length; i < l; i++) {
                current = event_names[i];

                el = document.createElement('option');
                el.value = current;
                el.innerHTML = current;

                names_container.appendChild(el);

                if (current === selected_action) {
                    names_container.selectedIndex = i;
                }
            }

            for (i = 0, l = modifiers.length; i < l; i++) {
                current = modifiers[i];

                el = document.createElement('option');
                el.value = current;
                el.innerHTML = current;

                modifiers_container.appendChild(el);

                if (current === selected_modifier) {
                    modifiers_container.selectedIndex = i;
                }
            }

            names_container.addEventListener('change', function () {
                var new_name_value = names_container.children[names_container.selectedIndex].value;

                BGAPI.send('preferences', {
                    action: {
                        name: new_name_value
                    }
                });
            });

            modifiers_container.addEventListener('change', function () {
                var new_modifier_value = modifiers_container.children[modifiers_container.selectedIndex].value;

                BGAPI.send('preferences', {
                    action: {
                        modifier: new_modifier_value
                    }
                });
            });
        });
    };

    initLanguageMenu();
    initActionMenu();
});