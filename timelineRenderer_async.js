const copyEvent = (e) => JSON.parse(JSON.stringify(e));

const formatDataArray = (baseArr, targetArr) => {
    const baseLen = baseArr.length;
    const targetLen = targetArr.length;
    if (targetLen > baseLen) {
        throw new Error(`Error mismatch: ${targetLen} > ${baseLen} :: ${baseArr} ${targetArr}`);
    }

    // if (targetLen === baseLen) {
    //     return targetArr;
    // }

    const targetArrCopy = [];
    let i, j;
    for ( i = 1, j = 0 ; i < baseLen && j < targetLen ; ) {
        if ( baseArr[i].r >= targetArr[j].r ) {
            targetArrCopy.push(copyEvent(targetArr[j]));
            i++;
            j++;
        } else {
            targetArrCopy.push({ r: baseArr[i-1].r + baseArr[i-1].t, t: 0});
            i++;
        }
    }

    for (; j < targetLen ; j ++) {
        targetArrCopy.push(copyEvent(targetArr[j]));
    }

    for (; i < baseLen ; i ++ ) {
        targetArrCopy.push({ r: baseArr[i-1].r + baseArr[i-1].t, t: 0});
    }

    for (j = targetArrCopy.length ; j < baseLen ; j ++) {
        targetArrCopy.push({ r: baseArr[i-1].r + baseArr[i-1].t, t: 0});
    }
    
    return targetArrCopy;
};

const formatData = () => {
    const formattedPerfData = JSON.parse(JSON.stringify(performanceArena));
    const {
        InkPipelineStartPointerDown: { recentCycles: inkPipelineStartPointerDownRecentCycles },
        InkPipelinePointerDown: { recentCycles: inkPipelinePointerDownRecentCycles },
        InkPipelineStartPointerUp: { recentCycles: inkPipelineStartPointerUpRecentCycles },
        InkPipelinePointerUp: { recentCycles: inkPipelinePointerUpRecentCycles },
        InkDrierNormalOrBeautifiedInkDrying: { recentCycles: inkDrierNormalOrBeautifiedInkDryingRecentCycles },
        ScheduledNotifierSink: { recentCycles: scheduledNotifierSinkRecentCycles },
        CanvasConnectedReRenderCycle: { recentCycles: canvasConnectedReRenderCycleRecentCycles },
    } = formattedPerfData;
    const InkPipelineStartPointerDown = inkPipelineStartPointerDownRecentCycles;
    const InkPipelinePointerDown = inkPipelinePointerDownRecentCycles;
    const InkPipelineStartPointerUp = formatDataArray(InkPipelinePointerDown, inkPipelineStartPointerUpRecentCycles);
    const InkPipelinePointerUp = formatDataArray(InkPipelinePointerDown, inkPipelinePointerUpRecentCycles);
    const InkDrierNormalOrBeautifiedInkDrying = formatDataArray(InkPipelinePointerUp, inkDrierNormalOrBeautifiedInkDryingRecentCycles);
    const ScheduledNotifierSink = formatDataArray(InkDrierNormalOrBeautifiedInkDrying, scheduledNotifierSinkRecentCycles);
    const CanvasConnectedReRenderCycle = formatDataArray(ScheduledNotifierSink, canvasConnectedReRenderCycleRecentCycles);
    return {
        InkPipelineStartPointerDown,
        InkPipelinePointerDown,
        InkPipelineStartPointerUp,
        InkPipelinePointerUp,
        InkDrierNormalOrBeautifiedInkDrying,
        ScheduledNotifierSink,
        CanvasConnectedReRenderCycle,
    };
};

const initializeGoogleTimelineGraph = () => {
    const chart = new google.visualization.Timeline(timelineContainer);
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn({ type: 'string', id: 'Stroke' });
    dataTable.addColumn({ type: 'string', id: 'Event' });
    dataTable.addColumn({ type: 'number', id: 'Start' });
    dataTable.addColumn({ type: 'number', id: 'End' });
    const rows = [];
    let startMoment, endMoment;
    const {
        InkPipelineStartPointerDown,
        InkPipelinePointerDown,
        InkPipelineStartPointerUp,
        InkPipelinePointerUp,
        InkDrierNormalOrBeautifiedInkDrying,
        ScheduledNotifierSink,
        CanvasConnectedReRenderCycle,
    } = formatData();

    let j = 0;

    for (let i = 0 ; i < performanceArena.InkPipelineStartPointerDown.recentCycles.length ; i ++) {
        const pointerDownEventRegistered = InkPipelineStartPointerDown[i];
        const pointerDownEventProcessing = InkPipelinePointerDown[i];
        const pointerUpEventRegistered = InkPipelineStartPointerUp[i];
        const pointerUpEventProcessing = InkPipelinePointerUp[i];
        const inkDryingEvent = InkDrierNormalOrBeautifiedInkDrying[i];
        const scheduledCleaningEvent = ScheduledNotifierSink[i];
        const componentReRenderCycleEvent = CanvasConnectedReRenderCycle[i];
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
        ], [
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
    };

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
