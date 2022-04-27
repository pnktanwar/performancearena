let currentTab;
let performanceArena;
let canvasContainer;
let timelineContainer;
let bg;

const initializeVisualizations = () => {
    // Initialize Dracula graph.
    initializeDraculaGraph();

    // Initialize Google timeline graph.
    // google.charts.load("current", {packages:["timeline"]});
    // google.charts.setOnLoadCallback(initializeGoogleTimelineGraph);
    initializeGoogleTimelineGraph();
};

const initializeTabListeners = () => {
    // Add listeners for tab change
    addListener(".tablinks", "click", (evt)=> {
        removeClass(".tablinks", "active");
        addClass(".tabcontent", "hideMe");        
        evt.target.classList.add("active");
        const elem = document.getElementById(evt.target.getAttribute("data-target-tab"));
        elem.classList.remove("hideMe");
    });

    document.getElementById("isScheduledCleanupAsync").addEventListener("click", (evt) => {
        initializeExtension();
    }, false);
};


const initializeMetricListeners = () => {
    // Add listeners for metric communication with the browser tab.
    document.getElementById("startSyncBtn").addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: false } }));";
        chrome.tabs.executeScript({code: code});
        setTimeout(initializeExtension, 2000);
    }, false);

    document.getElementById("stopSyncBtn").addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: true } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("startCollectingBtn").addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: false } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("stopCollectingBtn").addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: true } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("resetBtn").addEventListener('click', () => {
        var code = "window.dispatchEvent(new Event('reset-performance-data'));";
        chrome.tabs.executeScript({code: code});
        setTimeout(initializeExtension, 2000);
    }, false);
};

const collectMetrics = () => {
    if (bg) {
        let currentPerf = bg.performanceArena[currentTab.id];

        // safety check: when page is still loading
        if (!currentPerf) {
            return;
        }

        // Get tab performance metrics.
        performanceArena = currentPerf.performanceArena;
    } else {
        performanceArena = tabPerfMetrics;
    }
};

const initializeExtension = () => {
    collectMetrics();
    if (performanceArena) {
        initializeVisualizations();
    }
};
