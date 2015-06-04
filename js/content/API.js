var contentAPI = {

    send: function (type, data) {
        chrome.tabs.query({}, function (tabs) {
            tabs.forEach(function (curr_tab) {
                chrome.tabs.sendMessage(curr_tab.id, {
                    method: 'set',
                    type: type,
                    data: data
                });
            });
        });
    }
};