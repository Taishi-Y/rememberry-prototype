import React from 'react';
import rb from 'js/utils/common';
//import Windows from './Windows';
//
//import 'less/options.less';
//
//rb.DOM.onReady.then(() => {
//    Windows.init();
//    Windows.show('options');
//});


let Options = React.createClass({

    render() {
        return (
            <div>OK</div>
        );
    }
});

rb.DOM.onReady.then(function () {
    React.render(<Options />, document.getElementById('wrap'));
});
