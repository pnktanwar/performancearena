const initializeGoogleTimelineGraph = () => {
    const chart = new google.visualization.Timeline(timelineContainer);
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Stroke' });
    dataTable.addColumn({ type: 'string', id: 'Event' });
    dataTable.addColumn({ type: 'number', id: 'Start' });
    dataTable.addColumn({ type: 'number', id: 'End' });
    const rows = [];
    let startMoment, endMoment;
    for (let i = 0 ; i < performanceArena.InkPipelineStartPointerDown.recentCycles.length ; i ++ ) {
        const pointerDownEventRegistered = performanceArena.InkPipelineStartPointerDown.recentCycles[i];
        const pointerDownEventProcessing = performanceArena.InkPipelinePointerDown.recentCycles[i];
        const pointerUpEventRegistered = performanceArena.InkPipelineStartPointerUp.recentCycles[i];
        const pointerUpEventProcessing = performanceArena.InkPipelinePointerUp.recentCycles[i];
        const inkDryingEvent = performanceArena.InkDrierNormalOrBeautifiedInkDrying.recentCycles[i];
        const scheduledCleaningEvent = performanceArena.BlueboardScheduledCleaning.recentCycles[i*2];
        if (!startMoment) {
            startMoment = pointerDownEventRegistered.r;
        }
        endMoment = scheduledCleaningEvent.r + scheduledCleaningEvent.t;
        rows.push([
            `${i}`,
            'PointerDownTriggered',
            pointerDownEventRegistered.r - startMoment,
            pointerDownEventRegistered.r + pointerDownEventRegistered.t - startMoment,
        ], [
            `${i}`,
            'pointerDownEventProcessing',
            pointerDownEventProcessing.r - startMoment,
            pointerDownEventProcessing.r + pointerDownEventProcessing.t - startMoment,
        ], [
            `${i}`,
            'pointerUpEventRegistered',
            pointerUpEventRegistered.r - startMoment,
            pointerUpEventRegistered.r + pointerUpEventRegistered.t - startMoment,
        ], [
            `${i}`,
            'pointerUpEventProcessing',
            pointerUpEventProcessing.r - startMoment,
            pointerUpEventProcessing.r + pointerUpEventProcessing.t - inkDryingEvent.t - startMoment,
        ], [
            `${i}`,
            'inkDryingEvent',
            inkDryingEvent.r + 0.5 - startMoment,
            inkDryingEvent.r + inkDryingEvent.t - startMoment,
        ], [
            `S${i}`,
            'scheduledCleaningEvent',
            scheduledCleaningEvent.r - startMoment,
            scheduledCleaningEvent.r + scheduledCleaningEvent.t - startMoment,
        ]);
    };
    dataTable.addRows(rows);
    chart.draw(dataTable, {
        colors: ['#db4437', '#4285f4', '#f7cb4d', '#57ba8a', '#00acc1', '#ab47bc'],
        timeline: {
            showBarLabels: false,
            rowLabelStyle: { fontName: 'Helvetica', fontSize: 24, color: '#603913' }
        },
        width: (endMoment - startMoment)*5,
    });
};
