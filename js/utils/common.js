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
         * Passes results of each input promise into callback as separate arguments each
         * @param {Array.<Promise>}     promises
         * @param {Function}            cb          Callback function, that will be called afterwards
         */
        when: function (promises, cb) {
            return Promise.all(promises).then(function (results) {
                return cb.apply(null, results);
            });
        }, /**
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

        assign: function (source, target) {
            var prop;

            for (prop in target) {
                if (target.hasOwnProperty(prop)) {
                    source[prop] = target[prop];
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
        }
    };
}());