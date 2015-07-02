export default {

    getInitData() {
        return {
            n: 0,
            i: 0,
            d: Date.now(),
            ef: 2.5
        };
    },

    isCardRipened(card) {
        const TIME_STEP = 1000 * 60 * 60 * 24;

        let ms_diff, step_diff,
            is_ripened = false;

        if (card.n === 0) {
            is_ripened = true;
        } else {
            ms_diff     = Date.now() - card.d;
            step_diff    = ms_diff / (TIME_STEP);
            is_ripened  = card.i <= step_diff;
        }

        return is_ripened;
    },

    /**
     *
     * @param {Object} card
     * @param {Number} quality
     */
    evoluteCard(card, quality) {
        if (quality !== 4) {
            card.ef = Math.max(1.3, card.ef - .8 + .28 * quality - .02 * Math.pow(quality, 2));
            card.ef = Number(card.ef.toFixed(2));
        }

        card.n++;

        switch (card.n) {
            case 1:
                card.i = 1;
                break;
            case 2:
                card.i = 6;
                break;
            default:
                card.i *= card.ef;
                card.i = Number(card.i.toFixed(2));
        }

        card.d = Date.now();
    }
};