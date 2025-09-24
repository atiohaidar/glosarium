import React, { useEffect, useRef, useMemo } from 'react';
import { Term, GraphData, Node as GraphNode } from '../types';

// Let TypeScript know that d3 is a global variable
declare const d3: any;

interface DependencyGraphProps {
    graphData: GraphData;
    terms: Term[];
    onNodeClick: (term: Term) => void;
    theme: 'dark' | 'light';
    searchTerm: string;
}

export const DependencyGraph: React.FC<DependencyGraphProps> = ({ graphData, terms, onNodeClick, theme, searchTerm }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const termMap = useMemo(() => new Map(terms.map(t => [t.id, t])), [terms]);

    // Helper functions for theme-aware colors
    const getBgSecondary = () => theme === 'dark' ? '#2d2d2d' : '#ffffff';
    const getTextSecondary = () => theme === 'dark' ? '#AAAAAA' : '#6b7280';
    const getBorderPrimary = () => theme === 'dark' ? '#656565' : '#d1d5db';
    const getAccent = () => theme === 'dark' ? '#0ea5e9' : '#3b82f6';

    useEffect(() => {
        if (!graphData || !svgRef.current || !containerRef.current) return;
        
        const { nodes: dataNodes, links: dataLinks } = graphData;
        
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove(); // Clear previous graph

        if (dataNodes.length === 0) {
            svg.append("text")
               .attr("x", "50%")
               .attr("y", "50%")
               .attr("text-anchor", "middle")
               .attr("fill", getTextSecondary())
               .text("Tidak ada dependensi untuk ditampilkan di kategori ini.");
            return;
        }

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        svg.attr('width', width)
           .attr('height', height)
           .attr('viewBox', [-width / 2, -height / 2, width, height]);

        // Add definitions for arrowheads (removed - using direct paths now)
        // svg.append('defs').append('marker')
        //     .attr('id', 'arrowhead')
        //     .attr('viewBox', '-0 -5 10 10')
        //     .attr('refX', 18)
        //     .attr('refY', 0)
        //     .attr('orient', 'auto')
        //     .attr('markerWidth', 6)
        //     .attr('markerHeight', 6)
        //     .append('path')
        //     .attr('d', 'M0,-5L10,0L0,5')
        //     .attr('fill', '#656565');

        const g = svg.append("g");

        const simulation = d3.forceSimulation(dataNodes)
            .force("link", d3.forceLink(dataLinks).id((d: any) => d.id).distance(120).strength(0.5))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(0, 0))
            .force("collide", d3.forceCollide().radius((d: any) => d.radius + 5).strength(0.8));

        const link = g.append("g")
            .attr("stroke-opacity", 0.6)
            .selectAll("line")
            .data(dataLinks)
            .join("line")
            .attr("stroke", getBorderPrimary())
            .attr("stroke-width", 1.5);
        
        // Add arrow markers in the middle of links
        const arrow = g.append("g")
            .selectAll("path")
            .data(dataLinks)
            .join("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", getBorderPrimary())
            .attr("stroke", "none")
            .attr("stroke-width", 0)
            .style("pointer-events", "none");
        
        const node = g.append("g")
            .selectAll("circle")
            .data(dataNodes)
            .join("circle")
            .attr("r", (d: any) => d.radius)
            .attr("fill", getBgSecondary())
            .attr("stroke", getBorderPrimary())
            .attr("stroke-width", 1.5)
            .style("cursor", "pointer")
            .on("click", (event: any, d: any) => {
                const term = termMap.get(d.id);
                if (term) onNodeClick(term);
            })
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .call(drag(simulation));

        const label = g.append("g")
            .selectAll("text")
            .data(dataNodes)
            .join("text")
            .attr("fill", getTextSecondary())
            .attr("font-size", "10px")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr("dy", (d: any) => d.radius + 12)
            .text((d: any) => d.title);

        const linkedByIndex = new Map<string, boolean>();
        dataLinks.forEach(l => {
            linkedByIndex.set(`${l.source},${l.target}`, true);
        });

        function isConnected(a: any, b: any) {
            return linkedByIndex.has(`${a.id},${b.id}`) || linkedByIndex.has(`${b.id},${a.id}`) || a.id === b.id;
        }

        // --- Search and Hover Logic ---
        const lowercasedFilter = searchTerm.toLowerCase().trim();
        const searchResults = lowercasedFilter
            ? new Set(dataNodes.filter(d => d.title.toLowerCase().includes(lowercasedFilter)).map(d => d.id))
            : new Set();

        const isSearching = searchResults.size > 0;

        node.style('transition', 'opacity 0.3s, fill 0.3s');
        link.style('transition', 'stroke-opacity 0.3s, stroke 0.3s');
        arrow.style('transition', 'fill 0.3s');
        label.style('transition', 'opacity 0.3s');

        if (isSearching) {
            node.attr('opacity', (d: any) => searchResults.has(d.id) ? 1.0 : 0.1);
            node.attr('fill', (d: any) => searchResults.has(d.id) ? getAccent() : getBgSecondary());
            label.attr('opacity', (d: any) => searchResults.has(d.id) ? 1.0 : 0.1);
            link.attr('stroke-opacity', (d: any) => searchResults.has(d.source.id) && searchResults.has(d.target.id) ? 0.8 : 0.05);
            arrow.attr('fill', (d: any) => searchResults.has(d.source.id) && searchResults.has(d.target.id) ? getAccent() : getBorderPrimary());
            arrow.attr('opacity', (d: any) => searchResults.has(d.source.id) && searchResults.has(d.target.id) ? 1.0 : 0.1);
        } else {
            handleMouseOut(); // Reset to default state if search is cleared
        }
        
        function handleMouseOver(event: MouseEvent, d: any) {
            if (isSearching) return; // Disable hover when searching
            node.transition().duration(100).attr("opacity", (n: any) => isConnected(d, n) ? 1.0 : 0.2);
            link.transition().duration(100)
                .attr("stroke", (l: any) => l.source.id === d.id || l.target.id === d.id ? getAccent() : getBorderPrimary())
                .attr("stroke-opacity", (l: any) => l.source.id === d.id || l.target.id === d.id ? 1.0 : 0.3);
            arrow.transition().duration(100)
                .attr("fill", (l: any) => l.source.id === d.id || l.target.id === d.id ? getAccent() : getBorderPrimary());
            label.transition().duration(100).attr("opacity", (n: any) => isConnected(d, n) ? 1.0 : 0.2);
        }

        function handleMouseOut() {
            if (isSearching) return; // Disable hover when searching
            node.transition().duration(200).attr("opacity", 1.0).attr('fill', getBgSecondary());
            link.transition().duration(200).attr("stroke", getBorderPrimary()).attr("stroke-opacity", 0.6);
            arrow.transition().duration(200).attr("fill", getBorderPrimary());
            label.transition().duration(200).attr("opacity", 1.0);
        }
        
        // --- Simulation and Zoom ---

        simulation.on("tick", () => {
            link
                .attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);
            
            // Update arrow positions to the middle of links
            arrow
                .attr("transform", (d: any) => {
                    const sourceX = d.source.x;
                    const sourceY = d.source.y;
                    const targetX = d.target.x;
                    const targetY = d.target.y;
                    const midX = (sourceX + targetX) / 2;
                    const midY = (sourceY + targetY) / 2;
                    
                    // Calculate angle for arrow rotation
                    const angle = Math.atan2(targetY - sourceY, targetX - sourceX) * 180 / Math.PI;
                    
                    return `translate(${midX}, ${midY}) rotate(${angle})`;
                });
            
            node
                .attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y);
            label
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y);
        });
        
        const zoom = d3.zoom().on("zoom", (event: any) => {
            g.attr("transform", event.transform);
        });
        svg.call(zoom);

        // Drag functions
        function drag(simulation: any) {
            function dragstarted(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(event: any, d: any) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event: any, d: any) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

        return () => {
            simulation.stop();
        };
    }, [graphData, termMap, onNodeClick, theme, searchTerm]);

    return (
        <div ref={containerRef} className="w-full h-full flex-1 relative bg-[var(--bg-primary)]">
            <svg ref={svgRef}></svg>
            <div className="absolute top-4 left-6 text-xs text-[var(--text-primary)] bg-[var(--bg-secondary)]/80 p-2 rounded-md border border-[var(--border-primary)]/30 pointer-events-none">
                Arahkan kursor ke istilah untuk melihat koneksi. Klik untuk detail.
            </div>
        </div>
    );
};