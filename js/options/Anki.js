var Anki = (function () {
    var exportCards = function (deck) {
        rb.hide(document.getElementById('menu-container'));
        rb.show(document.getElementById('anki-export-container'));
    };

    return {
        exportCards: exportCards
    };
}());