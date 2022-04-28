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

    document.getElementById("openInNewWindow")?.addEventListener("click", () => {
        chrome.storage.local.set({'tabPerfMetrics': performanceArena}, function() {
            var error = chrome.runtime.lastError;  
            if (error) {  
                alert('ERROR :: ' + JSON.stringify(error));
                return;
            } 
            chrome.tabs.create({
                url: "fullscreen/fullscreen.html"
            }, function(tab) {
            });
        });
    }, false);
};


const initializeMetricListeners = () => {
    // Add listeners for metric communication with the browser tab.
    document.getElementById("startSyncBtn")?.addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: false } }));";
        chrome.tabs.executeScript({code: code});
        setTimeout(initializeExtension, 2000);
    }, false);

    document.getElementById("stopSyncBtn")?.addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: true } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("startCollectingBtn")?.addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: false } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("stopCollectingBtn")?.addEventListener('click', () => {
        var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: true } }));";
        chrome.tabs.executeScript({code: code});
    }, false);

    document.getElementById("resetBtn")?.addEventListener('click', () => {
        var code = "window.dispatchEvent(new Event('reset-performance-data'));";
        chrome.tabs.executeScript({code: code});
        setTimeout(initializeExtension, 2000);
    }, false);
};

const collectMetrics = (callback) => {
    if (bg) {
        let currentPerf = bg.performanceArena[currentTab.id];

        // safety check: when page is still loading
        if (!currentPerf) {
            return;
        }

        // Get tab performance metrics.
        // performanceArena = currentPerf.performanceArena;
        callback(currentPerf.performanceArena);
    } else {        
        chrome.storage.local.get('tabPerfMetrics', function(items) {
            callback(items.tabPerfMetrics)
        });        
    }
};

const initializeExtension = () => {
    collectMetrics((perfMetricsData) => {
        performanceArena = perfMetricsData;
        initializeVisualizations();
    });
};
