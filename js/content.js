document.addEventListener('DOMContentLoaded', function () {
    console.log('Content Script (CS) is loaded');

    document.addEventListener('click', function () {
        console.log('CS: click was triggered');

        chrome.runtime.sendMessage('Hello from CS!');
    });
});