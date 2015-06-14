var Message;

rb.onDomReady.then(function () {
    var closable_state = true,
        message_el = document.getElementById('message'),
        /**
         * @param message
         * @param [closable]
         */
        show = function (message, closable) {
            closable_state = closable !== false;

            if (closable_state) {
                message_el.setAttribute('closable', '');
            }

            message_el.innerHTML = message;
            rb.show(message_el);
        },

        hide = function (by_user) {
            if (!by_user || (by_user && closable_state)) {
                message_el.removeAttribute('closable');
                closable_state = true;
                message_el.innerHTML = '';
                rb.hide(message_el);
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