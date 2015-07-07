import React from 'react';

let ActionsMenu = React.createClass({

    render() {
        let { actions: { names, modifiers }, active_action } = this.props;

        return (
            <div className={this.props.className}>
                <h3>{chrome.i18n.getMessage('Modifiers')}</h3>
                <label>{chrome.i18n.getMessage('Trigger_action')}</label>
                <select value={active_action.name}>
                    <option value="auto">{chrome.i18n.getMessage('Detect')}</option>
                    {
                        names.map((action, index) =>
                            <option key={index} value={action}>{action}</option>)
                    }
                </select>
                <label>{chrome.i18n.getMessage('Key_modifier')}</label>
                <select value={active_action.modifier}>
                {
                    modifiers.map((modifier, index) =>
                        <option key={index} value={modifier}>{modifier}</option>)
                }
                </select>
            </div>
        );
    }
});

export default ActionsMenu;