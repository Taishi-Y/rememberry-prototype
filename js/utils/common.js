// common library, used by all extension script
// contain syntax sugar staff
var rb = (function () {
    var visible = function (is_visible, els) {
        if (!Array.isArray(els)) {
            els = [ els ];
        }

        els.forEach(function (el) {
            if (is_visible) {
                el.removeAttribute('hidden');
            } else {
                el.setAttribute('hidden', '');
            }
        });
    };

    return {
        /**
         * Creates array with unique values of input one
         * @param {Array} array
         * @returns {Array}
         */
        unique: function (array) {
            return array.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            })
        },

        onDomReady: new Promise(function (resolve) {
            if (document.readyState !== 'loading') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        }),

        extend: function (source, target) {
            var prop, t, s, res;

            for (prop in target) {
                if (target.hasOwnProperty(prop)) {
                    s = source[prop];
                    t = target[prop];

                    if (typeof t === 'object' && typeof s === 'object') {
                        if (Array.isArray(s) && Array.isArray(t)) {
                            s = s.concat(t);
                        } else {
                            s = rb.extend(s, t);
                        }
                    } else {
                        s = t;
                    }

                    source[prop] = s;
                }
            }

            return source;
        },

        show: visible.bind(null, true),
        hide: visible.bind(null, false),

        node: function (html_value) {
            var container_el = document.createElement('div');

            container_el.innerHTML = html_value;

            return container_el.children[0];
        },

        selectByValue: function (select_el, value) {
            var values = Array.prototype.map.call(select_el.children, function (option_el) {
                return option_el.value;
            });

            select_el.selectedIndex = values.indexOf(value);
        }
    };
}());

Promise.prototype.spread = Promise.prototype.spread || function (fn) {
    return this.then(function (args) {
        return fn.apply(this, args);
    });
};