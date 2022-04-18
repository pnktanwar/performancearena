console.log('<----- Extension script started running ----->');

/**
    DRACULE FIXED LAYOUT
*/ 
Dracula.Layout.Fixed = function(graph) {
    this.graph = graph;
    this.layout();
};

Dracula.Layout.Fixed.prototype = {
    layout: function() {
        this.layoutPrepare();
        this.layoutCalcBounds();
    },
    
    layoutPrepare: function() {
        for (i in this.graph.nodes) {
            var node = this.graph.nodes[i];
            if (node.x) {
                node.layoutPosX = node.x;
            } else {
                node.layoutPosX = 0;
            }
            if (node.y) {
                node.layoutPosY = node.y;
            } else {
                node.layoutPosY = 0;
            }
        }
    },
    
    layoutCalcBounds: function() {
        var minx = Infinity, maxx = -Infinity, miny = Infinity, maxy = -Infinity;
        
        for (i in this.graph.nodes) {
            var x = this.graph.nodes[i].layoutPosX;
            var y = this.graph.nodes[i].layoutPosY;
            
            if(x > maxx) maxx = x;
            if(x < minx) minx = x;
            if(y > maxy) maxy = y;
            if(y < miny) miny = y;
        }
        
        this.graph.layoutMinX = minx;
        this.graph.layoutMaxX = maxx;
        
        this.graph.layoutMinY = miny;
        this.graph.layoutMaxY = maxy;
    }
};
// DRACULA FIXED LAYOUT :: END


// Custom Node renderer.
var render = (r, n) => {
    var set = r.set()
                .push(r.ellipse(0, 0, 30, 15, 0, 0, 2*Math.PI)
                .attr({ stroke: '#fa8', fill: '#fa8', 'stroke-width': 2, r: '9px', 'fill-opacity': 0.25}))
                .push(
                    r.text(0, 30, n.label || n.id)
                    .attr({ 'font-size': '10px' })
                );
      return set;
    };

// Nodes definition for the WB Inking Workflow
const Nodes = {
    EventRegistered: 'EventRegistered',
    NUIPipelinePointerDown: 'NUIPipelinePointerDown',
    NUIPipelinePointerMove: 'NUIPipelinePointerMove',
    NUIPipelinePointerUp: 'NUIPipelinePointerUp',
    CanvasPointerListenerPointerDown: 'CanvasPointerListenerPointerDown',
    CanvasPointerListenerPointerUp: 'CanvasPointerListenerPointerUp',
    WinkPipelinePointerDown: 'WinkPipelinePointerDown',
    WinkPipelinePointerMove: 'WinkPipelinePointerMove',
    WinkPipelinePointerUp: 'WinkPipelinePointerUp',
    InkSink: 'InkSink',
    WetInkSharingChannel: 'WetInkSharingChannel',
    RenderLoop: 'RenderLoop',
    WetInkCollect: 'WetInkCollect',
    WetInkRender: 'WetInkRender',
    DryInk: 'DryInk',
    SinkFlush: 'SinkFlush',
    NewStrokeSvgUpdate: 'NewStrokeSvgUpdate',
    End: 'End'
};

const drawGraphNodes = (g) => {
    g.addNode(Nodes.EventRegistered, {x: 0, y: 50, render, fill: '#f00'});
    g.addNode(Nodes.NUIPipelinePointerDown, {x: 25, y: 25, render});
    g.addNode(Nodes.NUIPipelinePointerMove, {x: 25, y: 50, render});
    g.addNode(Nodes.NUIPipelinePointerUp, {x: 25, y: 75, render});
    g.addNode(Nodes.CanvasPointerListenerPointerDown, {x: 25, y: 100, render});
    g.addNode(Nodes.CanvasPointerListenerPointerUp, {x: 25, y: 125, render});
    g.addNode(Nodes.WinkPipelinePointerDown, {x: 50, y: 25, render});
    g.addNode(Nodes.WinkPipelinePointerMove, {x: 50, y: 50, render});
    g.addNode(Nodes.WinkPipelinePointerUp, {x: 50, y: 75, render});
    g.addNode(Nodes.InkSink, {x: 75, y: 50, render});
    g.addNode(Nodes.WetInkSharingChannel, {x: 75, y: 25, render});
    g.addNode(Nodes.RenderLoop, {x: 75, y: 75, render});
    g.addNode(Nodes.WetInkCollect, {x: 62, y: 100, render});
    g.addNode(Nodes.WetInkRender, {x: 87, y: 100, render});
    g.addNode(Nodes.DryInk, {x: 100, y: 50, render});
    g.addNode(Nodes.SinkFlush, {x: 125, y: 50, render});
    g.addNode(Nodes.NewStrokeSvgUpdate, {x: 150, y: 50, render});
    g.addNode(Nodes.End, {x: 175, y: 50, render});
};

const getEdgeLabelFill = (num) => (num > 100.0) ? '#f00' : (num > 50 ? '#f0f' : '#00f');

const getEdgeLabel = (num, cycles) => {
    const totalTime = `${parseFloat('' + num).toFixed(2)}ms`;
    const totalCycles = cycles ? `${cycles} cycles` : '';
    return `${totalTime}\n${totalCycles}`;
};

const addEdge = (g, src, dest, val, cycles) => {
    g.addEdge(src, dest, 
        {
            directed : true,
            stroke: '#aaa',
            label: getEdgeLabel(val, cycles),
            "label-style": {
                "font-size": 10,
                "fill-opacity": 1,
                "font-weight": "bold",
                "fill": getEdgeLabelFill(val)
            }
        }
    );
};

const drawGraphEdges = (g, data) => {
    const inkPipelineStartPointerDownDelay = data.InkPipelineStartPointerDown.totalTime;
    const inkPipelineStartPointerMoveDelay = data.InkPipelineStartPointerMove.totalTime;
    const inkPipelineStartPointerUpDelay = data.InkPipelineStartPointerUp.totalTime;
    addEdge(g, Nodes.EventRegistered, Nodes.NUIPipelinePointerDown, inkPipelineStartPointerDownDelay, data.InkPipelineStartPointerDown.totalCycles);
    addEdge(g, Nodes.EventRegistered, Nodes.NUIPipelinePointerMove, inkPipelineStartPointerMoveDelay, data.InkPipelineStartPointerMove.totalCycles);
    addEdge(g, Nodes.EventRegistered, Nodes.NUIPipelinePointerUp, inkPipelineStartPointerUpDelay, data.InkPipelineStartPointerUp.totalCycles);

    const canvasPointerListenerPointerDownDelay = data.CanvasPointerListenerPointerDown.totalTime;
    const canvasPointerListenerPointerUpDelay = data.CanvasPointerListenerPointerUp.totalTime;
    addEdge(g, Nodes.EventRegistered, Nodes.CanvasPointerListenerPointerDown, canvasPointerListenerPointerDownDelay, data.CanvasPointerListenerPointerDown.totalCycles);
    addEdge(g, Nodes.EventRegistered, Nodes.CanvasPointerListenerPointerUp, canvasPointerListenerPointerUpDelay, data.CanvasPointerListenerPointerUp.totalCycles);

    const timeTakenNUIPipelinePointerDown = data.InkPipelinePointerDown.totalTime - data.WinkPipelinePointerDown.totalTime;
    const timeTakenNUIPipelinePointerMove = data.InkPipelinePointerMove.totalTime - data.WinkPipelinePointerMove.totalTime;
    const timeTakenNUIPipelinePointerUp = data.InkPipelinePointerUp.totalTime - data.WinkPipelinePointerUp.totalTime;
    addEdge(g, Nodes.NUIPipelinePointerDown, Nodes.WinkPipelinePointerDown, timeTakenNUIPipelinePointerDown, data.InkPipelinePointerDown.totalCycles);
    addEdge(g, Nodes.NUIPipelinePointerMove, Nodes.WinkPipelinePointerMove, timeTakenNUIPipelinePointerMove, data.InkPipelinePointerMove.totalCycles);
    addEdge(g, Nodes.NUIPipelinePointerUp, Nodes.WinkPipelinePointerUp, timeTakenNUIPipelinePointerUp, data.InkPipelinePointerUp.totalCycles);

    const timeTakenWinkPipelinePointerDown = data.WinkPipelinePointerDown.totalTime - data.InkSinkStrokeBegin.totalTime;
    const timeTakenWinkPipelinePointerMove = data.WinkPipelinePointerMove.totalTime;
    const timeTakenWinkPipelinePointerUp = data.WinkPipelinePointerUp.totalTime - data.InkSinkStrokeEnd.totalTime;
    addEdge(g, Nodes.WinkPipelinePointerDown, Nodes.InkSink, timeTakenWinkPipelinePointerDown, data.WinkPipelinePointerDown.totalCycles);
    addEdge(g, Nodes.WinkPipelinePointerMove, Nodes.InkSink, timeTakenWinkPipelinePointerMove, data.WinkPipelinePointerMove.totalCycles);
    addEdge(g, Nodes.WinkPipelinePointerUp, Nodes.InkSink, timeTakenWinkPipelinePointerUp, data.WinkPipelinePointerUp.totalCycles);

    const timeTakenInWetInkSharingChannel = 
        data.WetInkSharingChannelBroadcastStrokeEnd.totalTime +
        data.WetInkSharingChannelClearStroke.totalTime + 
        data.WetInkSharingChannelOnBeginStrokeEvent.totalTime + 
        data.WetInkSharingChannelOnCurrentStrokeStreamEvent.totalTime + 
        data.WetInkSharingChannelOnEndStrokeEvent.totalTime + 
        data.WetInkSharingChannelOnReplaceRemoteStrokeEvent.totalTime + 
        data.WetInkSharingChannelOnReplaceLastPointEvent.totalTime + 
        data.WetInkSharingChannelOnWetInkBeautifiedEvent.totalTime + 
        data.WetInkSharingChannelOnAdjustmentUpdatedEvent.totalTime;
        //data.BroadcastManagerFlush.totalTime;

    addEdge(g, Nodes.InkSink, Nodes.WetInkSharingChannel, timeTakenInWetInkSharingChannel);

    const timeTakenInInkSinkStrokeBegin = data.InkSinkStrokeBegin.totalTime;
    addEdge(g, Nodes.InkSink, Nodes.RenderLoop, timeTakenInInkSinkStrokeBegin, data.InkSinkStrokeBegin.totalCycles);

    const timeTakenInInkSinkStrokeEnd = data.InkSinkStrokeEnd.totalTime - data.InkDrierNormalOrBeautifiedInkDrying.totalTime;
    addEdge(g, Nodes.InkSink, Nodes.DryInk, timeTakenInInkSinkStrokeEnd, data.InkSinkStrokeEnd.totalCycles);

    const timeTakenInInkDrierNormalOrBeautifiedInkDrying = data.InkDrierNormalOrBeautifiedInkDrying.totalTime;
    addEdge(g, Nodes.DryInk, Nodes.SinkFlush, timeTakenInInkDrierNormalOrBeautifiedInkDrying, data.InkDrierNormalOrBeautifiedInkDrying.totalCycles);

    const timeTakenInBlueboardSchedledCycle = data.BlueboardScheduledCleaning.totalTime + data.BlueboardScheduledCleaningCleanup.totalTime;
    addEdge(g, Nodes.SinkFlush, Nodes.NewStrokeSvgUpdate, timeTakenInBlueboardSchedledCycle, data.BlueboardScheduledCleaning.totalCycles);

    const timeTakenInNewStrokeSvgUpdate = data.InkStrokeHookUpdate.totalTime;
    addEdge(g, Nodes.NewStrokeSvgUpdate, Nodes.End, timeTakenInNewStrokeSvgUpdate, data.InkStrokeHookUpdate.totalCycles);

    const timeTakenInStrokeCollectionInRenderLoop = data.WetInkStrokeCollectionInRenderLoop.totalTime;
    const timeTakenInWetInkEndPartialStrokeAnimationFrameAvailability = data.WetInkEndPartialStrokeAnimationFrameAvailability.totalTime;
    addEdge(g, Nodes.RenderLoop, Nodes.WetInkCollect, timeTakenInStrokeCollectionInRenderLoop, data.WetInkStrokeCollectionInRenderLoop.totalCycles);
    addEdge(g, Nodes.RenderLoop, Nodes.WetInkRender, timeTakenInWetInkEndPartialStrokeAnimationFrameAvailability, data.WetInkEndPartialStrokeAnimationFrameAvailability.totalCycles);
};


const drawGraph = (canvasContainer, data) => {
    var g = new Dracula.Graph();
    drawGraphNodes(g);
    drawGraphEdges(g, data);
    var layouter = new Dracula.Layout.Fixed(g);
    //var layouter = new Dracula.Layout.Spring(g);
    layouter.layout();
    var renderer = new Dracula.Renderer.Raphael(canvasContainer, g, 1200, 600);
    renderer.draw();
};

const clearDiv = (div) => {
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
};

const PERCENTILE_ACCURACY = 0.95;

const asc = (arr) => arr.sort((a, b) => a - b);

const sum = (arr) => arr.reduce((a, b) => a + b, 0);

const mean = (arr) => sum(arr) / arr.length;

// sample standard deviation
const std = (arr) => {
	const mu = mean(arr);
	const diffArr = arr.map((a) => (a - mu) ** 2);
	return Math.sqrt(sum(diffArr) / (arr.length - 1));
};

const quantile = (arr, q) => {
	const sorted = asc(arr);
	const pos = (sorted.length - 1) * q;
	const base = Math.floor(pos);
	const rest = pos - base;
	if (sorted[base + 1] !== undefined) {
		return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
	} else {
		return sorted[base] || 0;
	}
};

window.addEventListener('DOMContentLoaded', () => {
    const canvasContainer = document.getElementById('canvasContainer');
    let bg = chrome.extension.getBackgroundPage();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        window.initializeGraph = () => {
            let currentTabId = tabs[0].id;
            let currentPerf = bg.performanceArena[currentTabId];

            // safety check: when page is still loading
            if (!currentPerf) {
                return;
            }

            // map essential perf metrics
            const { performanceArena } = currentPerf;

            for (const stage in performanceArena) {
                const stagePerfData = performanceArena[stage];
                stagePerfData.totalTime = quantile([...stagePerfData.recentCycles], PERCENTILE_ACCURACY);
            }

            clearDiv(canvasContainer);
            drawGraph(canvasContainer, performanceArena);
        };

        window.initializeGraph();
    });

    document.getElementById("startSyncBtn").addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: false } }));";
            chrome.tabs.executeScript({code: code});
            setTimeout(window.initializeGraph, 2000);
        });
    }, false);

    document.getElementById("stopSyncBtn").addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var code = "window.dispatchEvent(new CustomEvent('sync-performance-data', { detail: { doStop: true } }));";
            chrome.tabs.executeScript({code: code});
        });
    }, false);

    document.getElementById("startCollectingBtn").addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: false } }));";
            chrome.tabs.executeScript({code: code});
        });
    }, false);

    document.getElementById("stopCollectingBtn").addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var code = "window.dispatchEvent(new CustomEvent('init-performance-data', { detail: { skipRecording: true } }));";
            chrome.tabs.executeScript({code: code});
        });
    }, false);

    document.getElementById("resetBtn").addEventListener('click', () => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var code = "window.dispatchEvent(new Event('reset-performance-data'));";
            chrome.tabs.executeScript({code: code});
            setTimeout(window.initializeGraph, 2000);
        });
    }, false);
});
