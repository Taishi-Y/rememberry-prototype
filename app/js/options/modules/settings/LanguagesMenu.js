import React from 'react';
import bgAPI from 'js/utils/bgAPI';

let LanguagesMenu = React.createClass({

    handleSourceChange(e) {
        const code = e.target.value;

        bgAPI.send('config', {
            source_lang: code
        });
    },

    handleTargetChange(e) {
        const code = e.target.value;

        bgAPI.send('config', {
            target_lang: code
        });
    },

    render() {
        const { languages } = this.props;

        const createLangOptions = () => Object.keys(languages).map((code, index) =>
                <option key={index} value={code}>{languages[code]}</option>);

        return (
            <div className={this.props.className}>
                <h3>{chrome.i18n.getMessage('Languages')}</h3>
                <label>{chrome.i18n.getMessage('Source_language')}</label>
                <select
                        value={this.props.source_lang}
                        onChange={this.handleSourceChange}>
                    <option value="auto">{chrome.i18n.getMessage('Detect')}</option>
                    {createLangOptions()}
                </select>
                <label>{chrome.i18n.getMessage('Target_language')}</label>
                <select
                        value={this.props.target_lang}
                        onChange={this.handleTargetChange}>
                    {createLangOptions()}
                </select>
            </div>
        );
    }
});

export default LanguagesMenu;