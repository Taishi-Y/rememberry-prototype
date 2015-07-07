import React from 'react';

let DecksMenu = React.createClass({

    render() {
        return (
            <div className={this.props.className}>
                <h3>{chrome.i18n.getMessage('Decks')}</h3>
                <label>{chrome.i18n.getMessage('Deck')}</label>
                <select>
                </select>
            </div>

            //<div className="menu deck-menu">
            //    <h3></h3>
            //    <label for="selected-deck"></label><select id="selected-deck"></select>
            //    <div className="deck-info">
            //        <label for="deck-name"></label><input type="text" id="deck-name"/>
            //        <br/><br/>
            //        <div className="desc-container">
            //            <label for="deck-desc"></label><textarea id="deck-desc"></textarea>
            //        </div>
            //        <label for="cards-count"></label><span className="cards-count"></span>
            //    </div>
            //    <div className="btn-area">
            //        <button data-action="add"></button>
            //        <button data-action="remove"></button>
            //        <button data-action="clear"></button>
            //        <button data-action="activate"></button>
            //        <button data-action="export"></button>
            //        <button data-action="update"></button>
            //    </div>
            //</div>
        );
    }
});

export default DecksMenu;