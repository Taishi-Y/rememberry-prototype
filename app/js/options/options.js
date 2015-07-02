import rb from 'js/utils/common';
import Windows from './Windows';

import 'less/options.less';

rb.DOM.onReady.then(() => {
    Windows.init();
    Windows.show('options');
});