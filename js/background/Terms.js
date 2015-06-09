var Terms = (function () {
    var setTerms = function (terms) {
            Storage.set({ terms: terms });
        },

        getTerms = function () {
            return new Promise(function (resolve) {
                Storage.get('terms', function (data) {
                    resolve(data.terms || {});
                })
            });
        };

    return {
        addTerm: function (info) {
            var term = info.orig,
                translation = info.translation;

            getTerms().then(function (terms) {
                var existed_translation;

                if (terms.hasOwnProperty(term)) {
                    existed_translation = terms[term];
                    translation = existed_translation.concat(translation);

                    translation = translation.filter(function (value, index, self) {
                        return self.indexOf(value) === index;
                    });
                }

                terms[term] = translation;

                setTerms(terms);
            });
        }
    };
}());