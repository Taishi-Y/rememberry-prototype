var Message;

rb.onDomReady.then(function () {
    var message_el = document.getElementById('message'),
        show = function (message) {
            message_el.innerHTML = message;
            rb.show(message_el);
        },

        hide = function () {
            message_el.innerHTML = '';
            rb.hide(message_el);
        };

    message_el.addEventListener('click', hide);
    message_el.addEventListener('keypress', function (e) {
        if (e.keyCode === 27) {
            hide();
        }
    });

    Message = {
        show: show,
        hide: hide
    };
});