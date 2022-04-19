console.log('<----- Extension script popup started running ----->');

window.addEventListener('DOMContentLoaded', () => {
    canvasContainer = document.getElementById('canvasContainer');
    timelineContainer = document.getElementById('timelineContainer');

    initializeTabListeners();
    initializeMetricListeners();

    // Initialize tabs header and tab links.
    document.querySelector(".tablinks").click();
    if (performanceArena?.InkPipelineStartPointerDown) {
        document.querySelector(".tab").classList.remove("hideMe");
    }

    google.charts.load("current", {packages:["timeline"]});
    google.charts.setOnLoadCallback(initializeExtension);
});
