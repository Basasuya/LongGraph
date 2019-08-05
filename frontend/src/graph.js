import React, { Component } from "react"
import * as d3 from "d3"
import d3Tip from './d3Tip'
import { number } from "prop-types";

class Graph extends Component {

    handleHighLight (chooseId = undefined) {
        if (chooseId !== undefined && this.props.onHighLight) {
            let container = d3.select("#snapshot").selectAll("g.container")
            container.selectAll(".new").remove()
            let circles = container.selectAll(".snapdot")
            
            
            // console.log(circles)
            let cx = 0, cy = 0, color = 'red'
            // console.log(circles.select('.new'))
            // circles.select('.new').remove()
            circles.each(function() {
                var circle = d3.select(this)
                // let color = circle.attr('originFill')
                if(circle.datum()['key'] == chooseId) {
                    cx = circle.attr('cx')
                    cy = circle.attr('cy')
                    color = circle.style('fill')
                }
            })
            container.append("circle")
            .classed('snapdot', true)
            .classed('new', true)
            .attr("cx", cx)
            .attr("cy", cy)
            .attr("r", 7)
            .style("fill", 'black')
        }
    }

    componentWillReceiveProps(props) {
        const self = this
        console.log('graph will receive props')
        // const tooltip = d3Tip()
        // d3.tip = d3Tip;
        const graph = props.graph
        d3.select("#graph").select("g").remove();
        const svg = d3.select("#graph")

        let graphSize = graph.nodes.length
        let chooseNodeSize = (x) => {
            if(x < 100) return 10
            else if(x < 1000) return 5 
            else return 1
        }
        let nodeSize = chooseNodeSize(graphSize)

        let chooseLengthSize = (x) => {
            if(x < 100) return 2
            else if(x < 1000) return 1
            else return 0.2
        }

        let lengthSize = chooseLengthSize(graphSize)

        let chooseNodeColor = (x) => {
            if(x == 1) return '#ff0000';
            else if(x == 2) return '#3290EF';
            else return '#bfbfbf';
        }


        // svg.remove()
        const padding = 20
        const width = svg.node().parentNode.clientWidth
        svg.attr("width", width).attr("height", width)
        let container = svg.append("g");
        const height = width
        // console.log('receive!');
        svg.call(
            d3.zoom()
                .scaleExtent([.1, 16])
                .on("zoom", function() {  container.attr("transform", d3.event.transform);})
        );
        

        svg.append("svg:defs").selectAll("marker")
        .data(["end"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        // .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 3)
        .attr("markerWidth", 10)
        .attr("markerHeight", 10)
        .attr("orient", "auto")
        .append("svg:path")
        // .attr("fill","#f00")
        .attr("d", "M0,0 L0,6 L9,3 z");

        
        
        var nodeTip = d3Tip().attr('class','d3-tipNode')
        .html(function(d){
            let change = (number) => { if(number === null) return '不详'; else return number.toString(); }
            // let adress = d.address.toString()
            // let job = d.job.toString()
            // let born = d.born.toString()
                return "<span>姓名: " + change(d.name)
                +  "</span><br><span>出生: " + change(d.born) + "</span>"
                +  "</span><br><span>地址: " + change(d.address) + "</span>"
                +  "</span><br><span>职业: " + change(d.job) + "</span>";
        });

        var linkTip = d3Tip().attr('class','d3-tipLink')
        .html(function(d){
            let change = (number) => { if(number === null) return '不详'; else return number.toString(); }
            // let keyword = d.keyword.toString()
            return "<span>案件介绍: " + change(d.keyword) 
            +  "</span><br><span>原告: " + change(d.from) + "</span>"
            +  "</span><br><span>被告: " + change(d.to) + "</span>"
            +  "</span><br><span>详细过程: " + change(d.content) + "</span>"
            +  "</span><br><span>审判结果: " + change(d.result) + "</span>"
            +  "</span><br><span>案件日期: " + change(d.year) + "</span>";
        });
        svg.call(nodeTip);
        svg.call(linkTip);


        // const simulation = d3.forceSimulation(graph.nodes)
        // .force("charge", d3.forceManyBody().strength(-3000))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        // .force("x", d3.forceX(width / 2).strength(1))
        // .force("y", d3.forceY(height / 2).strength(1))
        // .force("link", d3.forceLink(graph.links).distance(10).strength(0.5))
        // .stop()
        

        const link = container
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("stroke", "#2a2400")
            .attr("stroke-width", lengthSize)
            .attr("marker-end", "url(#end)")
            .on("mouseover", linkTip.show)
            .on("mouseout", linkTip.hide)
            // .on("click", (d, i) => {
            //     console.log(d, i)
            // })


        const node = container
            .append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("circle")
            .attr("r", nodeSize)
            .attr("fill", d => chooseNodeColor(d.du))
            .on("mouseover", nodeTip.show)
            .on("mouseout", nodeTip.hide)
            .on("click", (d, i) => {
                console.log(d, i)
                self.handleHighLight(d.id)
            })
        
        

        function ticked() {
            let max = {}
            let min = {}
            max.x = d3.max(graph.nodes, n => n.x)
            max.y = d3.max(graph.nodes, n => n.y)
            min.x = d3.min(graph.nodes, n => n.x)
            min.y = d3.min(graph.nodes, n => n.y)
            const xScale = d3
                .scaleLinear()
                .domain([min.x, max.x])
                .range([padding, width - padding])
            const yScale = d3
                .scaleLinear()
                .domain([min.y, max.y])
                .range([padding, width - padding])

            link.attr("x1", function(d) {
                return xScale(d.source.x)
            })
            .attr("y1", function(d) {
                return yScale(d.source.y)
            })
            .attr("x2", function(d) {
                return xScale(d.target.x)
            })
            .attr("y2", function(d) {
                return yScale(d.target.y)
            })

            node.attr("cx", function(d) {
                return xScale(d.x)
            }).attr("cy", function(d) {
                return yScale(d.y)
            })
        }
        
        // d3.timeout(function() {
            // loading.remove();
            // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
            // for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
            //     simulation.tick();
            // }
            ticked()
        // })
    }
    render() {
        return <svg id="graph" />
    }
}

export default Graph
