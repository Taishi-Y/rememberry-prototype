import React from 'react';
import classnames from 'classnames';

let LanguagesMenu = React.createClass({

    createOption() {

    },

    createSourceLangList() {
        let list = [],
            active_source_lang = this.props.config.source_lang;

        list.push(createOption('auto', chrome.i18n.getMessage('Detect'), ))
    },

    render() {
        return (
            <div className={classnames(this.props.className, 'languages-menu')}>
                <h3>{chrome.i18n.getMessage('Languages')}</h3>
                <label>{chrome.i18n.getMessage('Source_language')}</label>
                <select>
                {
                    Object.keys(this.props.languages).map((lang, index) => {
                        let name = this.props.languages[lang];

                        return <option key={index} value={lang}>{name}</option>;
                    })
                }
                </select>
                <label>{chrome.i18n.getMessage('Target_language')}</label>
                <select></select>
            </div>
        );
    }
});

export default LanguagesMenu;