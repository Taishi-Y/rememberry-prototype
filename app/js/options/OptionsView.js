import React from 'react';
import Settings from './modules/settings/Settings';

let OptionsWindow = React.createClass({

    getInitialState() {
        return {
            page: 'settings'
        };
    },

    render() {
        let Page;

        switch (this.state.page) {
            case 'settings':
                Page = Settings;
                break;
            default:
        }

        return (
            <Page className="window" />
        );
    }
});

export default OptionsWindow;