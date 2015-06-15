var Message;

rb.DOM.onReady.then(function () {
    var timeout_instance = null,
        closable_state = true,
        message_el = document.getElementById('message'),
        /**
         * @param message
         * @param [closable]
         */
        show = function (message, closable, timeout) {
            closable_state = closable !== false;

            if (closable_state) {
                message_el.setAttribute('closable', '');
            }

            message_el.innerHTML = message;
            rb.DOM.show(message_el);

            if (timeout) {
                timeout_instance = setTimeout(hide, timeout);
            }
        },

        hide = function (by_user) {
            if (!by_user || (by_user && closable_state)) {
                message_el.removeAttribute('closable');
                closable_state = true;
                message_el.innerHTML = '';
                rb.DOM.hide(message_el);

                if (timeout_instance !== null) {
                    clearTimeout(timeout_instance);
                    timeout_instance = null;
                }
            }
        };

    message_el.addEventListener('click', hide.bind(null, true));
    message_el.addEventListener('keypress', function (e) {
        if (e.keyCode === 27) {
            hide(true);
        }
    });

    Message = {
        show: show,
        hide: function () {
            hide();
        }
    };
});