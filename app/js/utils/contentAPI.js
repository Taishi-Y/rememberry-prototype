export default {

    send(type, data) {
        chrome.tabs.query({}, tabs => {
            for (let curr_tab of tabs) {
                chrome.tabs.sendMessage(curr_tab.id, { method: 'set', type, data });
            }
        });
    }
};