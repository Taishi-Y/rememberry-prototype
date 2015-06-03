document.addEventListener('DOMContentLoaded', function () {
    var storage_name,

        initDropDownMenus = function () {
            chrome.storage[storage_name].get([ 'valid_actions', 'valid_modifiers', 'prefs' ], function (data) {
                var i, l, el, current,
                    actions_container = document.getElementById('trigger_action'),
                    modifiers_container = document.getElementById('modifier'),
                    actions = data.valid_actions,
                    modifiers = data.valid_modifiers,
                    prefs = data.prefs,
                    selected_action = prefs.trigger_action.event,
                    selected_modifier = prefs.trigger_action.modifier;

                for (i = 0, l = actions.length; i < l; i++) {
                    current = actions[i];

                    el = document.createElement('option');
                    el.value = current;
                    el.innerHTML = current;

                    actions_container.appendChild(el);

                    if (current === selected_action) {
                        actions_container.selectedIndex = i;
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

                actions_container.addEventListener('change', function () {
                    var new_action_value = actions_container.children[actions_container.selectedIndex].value;

                    chrome.runtime.sendMessage({
                        type: 'update-preferences',
                        prefs: {
                            trigger_action: {
                                event: new_action_value
                            }
                        }
                    });
                });

                modifiers_container.addEventListener('change', function () {
                    var new_modifier_value = modifiers_container.children[modifiers_container.selectedIndex].value;

                    chrome.runtime.sendMessage({
                        type: 'update-preferences',
                        prefs: {
                            trigger_action: {
                                modifier: new_modifier_value
                            }
                        }
                    });
                });
            });
        };

    chrome.runtime.sendMessage({ type: 'get-storage-name' }, function (response) {
        storage_name = response;
        initDropDownMenus();
    });
});