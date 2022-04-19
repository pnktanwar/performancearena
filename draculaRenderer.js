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


const initializeDraculaGraph = () => {
    for (const stage in performanceArena) {
        const stagePerfData = performanceArena[stage];
        stagePerfData.totalTime = quantile([...stagePerfData.recentCycles.map(({r, t}) => t)], PERCENTILE_ACCURACY);
    }

    clearDiv(canvasContainer);
    drawGraph(canvasContainer, performanceArena);
};
