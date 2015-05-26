console.log('Background Script (BS) started');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log('BS: message received:', message);
});