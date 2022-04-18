window.performanceArena = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.essential) {
        window.performanceArena[sender.tab.id] = message.essential || null;
    } else if (message.pageLoaded) {
        window.performanceArena[sender.tab.id] = null;
    }
});
