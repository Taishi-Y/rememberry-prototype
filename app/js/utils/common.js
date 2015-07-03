let rb,

    visible = (is_visible, els) => {
        if (!Array.isArray(els)) {
            els = [ els ];
        }

        for (let el of els) {
            if (is_visible) {
                el.removeAttribute('hidden');
            } else {
                el.setAttribute('hidden', '');
            }
        }
    };

Promise.prototype.spread = Promise.prototype.spread || function (fn) {
    return this.then(function (args) {
        return fn.apply(this, args);
    });
};

rb = {
    /**
     * Creates array with unique values of input one
     * @param {Array} array
     * @returns {Array}
     */
    unique: array => array.filter((value, index, self) => self.indexOf(value) === index),
    /**
     * Extracts data from target to source object in configurable way
     * @param {Object}  source                  Object to be modified
     * @param {Object}  target                  Object, that possess data used for source modification
     * @param {Object}  [config]                Configuration. All options are false by default
     * @param {Boolean} [config.new_only]       Extend source object with only new properties from target object
     * @param {Boolean} [config.concat_arrays]  Concatenate array properties (possible if new_only is false)
     * @returns {Object}
     */
    override(source, target, config = {}) {
        for (let prop in target) {
            let s = source[prop],
                t = target[prop];

            if (config.new_only) {
                if (!source.hasOwnProperty(prop)) {
                    s = t;
                } else if (typeof s === 'object' && typeof t === 'object') {
                    s = rb.override(s, t, config);
                }
            } else {
                if (typeof s === 'object' && typeof t === 'object') {
                    if (Array.isArray(s) && Array.isArray(t)) {
                        if (config.concat_arrays) {
                            s = s.concat(t);
                        } else {
                            s = t;
                        }
                    } else {
                        s = rb.override(s, t, config);
                    }
                } else {
                    s = t;
                }
            }

            if (source[prop] !== s) {
                source[prop] = s;
            }
        }

        return source;
    },

    DOM: {
        onReady: new Promise(resolve => {
            if (document.readyState !== 'loading') {
                resolve();
            } else {
                document.addEventListener('DOMContentLoaded', resolve);
            }
        }),


        node(html_value) {
            let container_el = document.createElement('div');

            container_el.innerHTML = html_value;

            return container_el.children[0];
        },

        selectByValue(select_el, value) {
            let values = Array.prototype.map.call(select_el.children, option_el => option_el.value);

            select_el.selectedIndex = values.indexOf(value);
        },

        show: visible.bind(null, true),
        hide: visible.bind(null, false)
    }
};

export default rb;