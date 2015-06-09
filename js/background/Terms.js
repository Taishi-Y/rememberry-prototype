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
        },

        addTerm = function (info) {
            var term = info.orig,
                translation = info.translation;

            getTerms().then(function (terms) {
                var existed_translation;

                if (terms.hasOwnProperty(term)) {
                    existed_translation = terms[term];
                    translation = existed_translation.concat(translation);

                    translation = rb.unique(translation);
                }

                terms[term] = translation;

                setTerms(terms);
            });
        };

    // public API
    return {
        addTerm: addTerm,
        getTerms: getTerms
    };
}());