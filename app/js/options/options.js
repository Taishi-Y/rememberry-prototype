import React from 'react';
import rb from 'js/utils/common';
import OptionsView from './OptionsView';

import 'less/options.less';

rb.DOM.onReady.then(function () {
    React.render(<OptionsView />, document.getElementById('wrap'));
});

//import Windows from './Windows';
//
//import 'less/options.less';
//
//rb.DOM.onReady.then(() => {
//    Windows.init();
//    Windows.show('options');
//});