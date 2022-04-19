console.log('<----- Extension script popup started running ----->');

window.addEventListener('DOMContentLoaded', () => {
    canvasContainer = document.getElementById('canvasContainer');
    timelineContainer = document.getElementById('timelineContainer');
    
    bg = chrome.extension.getBackgroundPage();
    initializeTabListeners();
    initializeMetricListeners();
    google.charts.load("current", {packages:["timeline"]});

    // Initialize tabs header and tab links.
    document.querySelector(".tablinks").click();
    if (performanceArena?.InkPipelineStartPointerDown) {
        document.querySelector(".tab").classList.remove("hideMe");
    }
    
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        currentTab = tabs[0];
        google.charts.setOnLoadCallback(initializeExtension);
        //initializeExtension();
    });
});
