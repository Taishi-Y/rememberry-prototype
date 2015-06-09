// common library, used by all extension script
// contain syntax sugar staff
var rb = {
    /**
     * Passes results of each input promise into callback as separate arguments each
     * @param {Array.<Promise>}     promises
     * @param {Function}            cb          Callback function, that will be called afterwards
     */
    when: function (promises, cb) {
        return Promise.all(promises).then(function (results) {
             return cb.apply(null, results);
        });
    },
    /**
     * Creates array with unique values of input one
     * @param {Array} array
     * @returns {Array}
     */
    unique: function (array) {
        return array.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        })
    }
};