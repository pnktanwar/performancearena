console.log('<----- Extension script popup started running ----->');

window.addEventListener('DOMContentLoaded', () => {
    canvasContainer = document.getElementById('canvasContainer');
    timelineContainer = document.getElementById('timelineContainer');
    
    let bg = chrome.extension.getBackgroundPage();
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentTab = tabs[0];
        let currentPerf = bg.performanceArena[currentTab.id];

        // safety check: when page is still loading
        if (!currentPerf) {
            return;
        }

        // Get tab performance metrics.
        performanceArena = currentPerf.performanceArena;
        initializeExtension();
    });
});
