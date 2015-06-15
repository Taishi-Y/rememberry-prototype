var Windows = (function () {
    var active,
        windows = {};

    return {

        add: function (name, data) {
            windows[name] = data;
        },

        show: function (name) {
            var data_args = Array.prototype.slice.call(arguments, 1);

            if (active) {
                active.hide();
            }

            active = windows[name];
            active.show.apply(active, data_args);
        }
    };
}());