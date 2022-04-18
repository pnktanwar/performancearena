console.log('<----- Injected script started running ----->');

let intervalTimer;

const parseEssentialDetails = () => {
    let main = {};
    main.performanceArena = JSON.parse(JSON.stringify(window.performanceArena)) || null;
    return main;
}

const clearTimer = () => {
    if (intervalTimer) {
        clearInterval(intervalTimer);
    }
};

const setupTimer = (doResetTimer) => {
    clearTimer();
    if (!doResetTimer) {
        intervalTimer = setInterval(() => {
            if (window.performanceArena) {
                let essential = parseEssentialDetails();
                window.postMessage({ type: "FROM_PAGE", essential });
            }
        }, 1000);
    }
};

window.addEventListener('sync-performance-data', (e) => {
    setupTimer(e.detail.doStop);
});

window.postMessage({ type: "FROM_PAGE", pageLoaded: true });
