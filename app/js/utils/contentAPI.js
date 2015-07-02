export default {

    send(type, data) {
        chrome.tabs.query({}, tabs => {
            tabs.forEach(curr_tab => {
                chrome.tabs.sendMessage(curr_tab.id, {
                    method: 'set',
                    type,
                    data
                });
            });
        });
    }
};