const initializeGoogleTimelineGraph = () => {
    const isScheduledCleanupAsync = document.getElementById('isScheduledCleanupAsync').checked;
    const chart = new google.visualization.Timeline(timelineContainer);
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Stroke' });
    dataTable.addColumn({ type: 'string', id: 'Event' });
    dataTable.addColumn({ type: 'number', id: 'Start' });
    dataTable.addColumn({ type: 'number', id: 'End' });
    const rows = [];
    let startMoment, endMoment;
    const pointerDownStartRecentCycles = performanceArena.InkPipelineStartPointerDown.recentCycles;
    const scheduledNotifierSinkRecentCycles = performanceArena.ScheduledNotifierSink.recentCycles;
    const componentReRenderCycle = performanceArena.CanvasConnectedReRenderCycle.recentCycles;
    let j = 0;

    for (let i = 0 ; i < performanceArena.InkPipelineStartPointerDown.recentCycles.length ; i ++) {
        const pointerDownEventRegistered = pointerDownStartRecentCycles[i];
        const pointerDownEventProcessing = performanceArena.InkPipelinePointerDown.recentCycles[i];
        const pointerUpEventRegistered = performanceArena.InkPipelineStartPointerUp.recentCycles[i];
        const pointerUpEventProcessing = performanceArena.InkPipelinePointerUp.recentCycles[i];
        const inkDryingEvent = performanceArena.InkDrierNormalOrBeautifiedInkDrying.recentCycles[i];
        let scheduledCleaningEvent;
        if (!startMoment) {
            startMoment = pointerDownEventRegistered.r;
        }
        rows.push([
            `S${i}`,
            'PointerDownTriggered',
            pointerDownEventRegistered.r - startMoment,
            pointerDownEventRegistered.r + pointerDownEventRegistered.t - startMoment,
        ], [
            `S${i}`,
            'pointerDownEventProcessing',
            pointerDownEventProcessing.r - startMoment,
            pointerDownEventProcessing.r + pointerDownEventProcessing.t - startMoment,
        ], [
            `S${i}`,
            'pointerUpEventRegistered',
            pointerUpEventRegistered.r - startMoment,
            pointerUpEventRegistered.r + pointerUpEventRegistered.t - startMoment,
        ], [
            `S${i}`,
            'pointerUpEventProcessing',
            pointerUpEventProcessing.r - startMoment,
            pointerUpEventProcessing.r + pointerUpEventProcessing.t - inkDryingEvent.t - startMoment,
        ], [
            `S${i}`,
            'inkDryingEvent',
            inkDryingEvent.r + 0.5 - startMoment,
            inkDryingEvent.r + inkDryingEvent.t - startMoment,
        ]);

        
        if (isScheduledCleanupAsync) {
            if (
                i < pointerDownStartRecentCycles.length - 1 && 
                        pointerDownStartRecentCycles[i+1].r >= scheduledNotifierSinkRecentCycles[j].r
            ) {
                scheduledCleaningEvent = scheduledNotifierSinkRecentCycles[j];
                componentReRenderCycleEvent = componentReRenderCycle[j];
                rows.push([
                    `C${j}`,
                    'scheduledCleaningEvent',
                    scheduledCleaningEvent.r - startMoment,
                    scheduledCleaningEvent.r + scheduledCleaningEvent.t - startMoment,
                ], [
                    `C${j}`,
                    'componentReRenderCycle',
                    componentReRenderCycleEvent.r - startMoment,
                    componentReRenderCycleEvent.r + componentReRenderCycleEvent.t - startMoment,
                ]);
                endMoment = componentReRenderCycleEvent.r + componentReRenderCycleEvent.t;
                j++;
            }
        } else {
            scheduledCleaningEvent = scheduledNotifierSinkRecentCycles[i];
            componentReRenderCycleEvent = componentReRenderCycle[i];
            rows.push([
                `S${i}`,
                'scheduledCleaningEvent',
                scheduledCleaningEvent.r - startMoment,
                scheduledCleaningEvent.r + scheduledCleaningEvent.t - startMoment,
            ], [
                `S${i}`,
                'componentReRenderCycle',
                componentReRenderCycleEvent.r - startMoment,
                componentReRenderCycleEvent.r + componentReRenderCycleEvent.t - startMoment,
            ]);
            endMoment = componentReRenderCycleEvent.r + componentReRenderCycleEvent.t;
        }
    };

    while( isScheduledCleanupAsync && j <scheduledNotifierSinkRecentCycles.length ) {
        scheduledCleaningEvent = scheduledNotifierSinkRecentCycles[j];
        componentReRenderCycleEvent = componentReRenderCycle[j];
        rows.push([
            `C${j}`,
            'scheduledCleaningEvent',
            scheduledCleaningEvent.r - startMoment,
            scheduledCleaningEvent.r + scheduledCleaningEvent.t - startMoment,
        ], [
            `C${i}`,
            'componentReRenderCycle',
            componentReRenderCycleEvent.r - startMoment,
            componentReRenderCycleEvent.r + componentReRenderCycleEvent.t - startMoment,
        ]);
        endMoment = scheduledCleaningEvent.r + scheduledCleaningEvent.t;
        j++;
    }

    dataTable.addRows(rows);
    chart.draw(dataTable, {
        colors: ['#db4437', '#4285f4', '#f7cb4d', '#57ba8a', '#00acc1', '#ab47bc', '#cbb69d'],
        timeline: {
            showBarLabels: false,
            rowLabelStyle: { fontName: 'Helvetica', fontSize: 24, color: '#603913' }
        },
        width: (endMoment - startMoment)*2,
        height: window.innerHeight - 260,
    });
};
