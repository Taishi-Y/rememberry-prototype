import React from 'react';

let LanguagesMenu = React.createClass({

    render() {
        let { languages } = this.props,

            createLangOptions = () => Object.keys(languages).map((code, index) =>
                <option key={index} value={code}>{languages[code]}</option>);

        return (
            <div className={this.props.className}>
                <h3>{chrome.i18n.getMessage('Languages')}</h3>
                <label>{chrome.i18n.getMessage('Source_language')}</label>
                <select value={this.props.source_lang}>
                    <option value="auto">{chrome.i18n.getMessage('Detect')}</option>
                    {createLangOptions()}
                </select>
                <label>{chrome.i18n.getMessage('Target_language')}</label>
                <select value={this.props.target_lang}>
                    {createLangOptions()}
                </select>
            </div>
        );
    }
});

export default LanguagesMenu;