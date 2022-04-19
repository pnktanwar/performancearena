console.log('<----- Extension script popup started running ----->');

window.addEventListener('DOMContentLoaded', () => {
    canvasContainer = document.getElementById('canvasContainer');
    timelineContainer = document.getElementById('timelineContainer');
    performanceArena = tabPerfMetrics;
    initializeExtension();
});
