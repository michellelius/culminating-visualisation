export class TreemapRender {
    constructor(data, container, baseLink) {
        this.width = 1200;
        this.height = 700;
        this.baseLink = baseLink
        
        this.svg = d3.select(container)
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("font-family", "sans-serif");

        this.g = this.svg.append("g");

        this.color = d3.scaleOrdinal(d3.schemeCategory20);

        this.data = d3.hierarchy(data)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        this.initTreemap();
    }

    fetchDefinition(term) {
        return new Promise((resolve, reject) => {
            d3.json(`${this.baseLink}/name/${term}`, (error, data) => {

            // d3.json(`${this.baseLink}/words?ml=${term}&max=1`, (error, data) => {
                if (error) {
                    reject("Error finding definition");
                } else if (data && data.length > 0) {
                    const country = data[0]
                    resolve(country.area);
                } else {
                    resolve("Definition not found");
                }
            });
        });
    }
    
    initTreemap() {
        d3.treemap()
            .size([this.width, this.height]) // Use the full height, no breadcrumb
            .paddingInner(0)
            .paddingOuter(0)(this.data);

            const colourScale = d3.scaleOrdinal()
    .domain(["High Income", "Upper Middle Income", "Lower Middle Income", "Low Income"]) // Replace with your actual income groups
    .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728"]); // Colors for each group

        let currentNode = this.data;

        const tooltip = d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background", "#fff")
            .style("border", "1px solid #ccc")
            .style("padding", "8px")
            .style("border-radius", "4px")
            .style("font-size", "12px")
            .style("pointer-events", "none")
            .style("display", "none")
            .style("z-index", "10");

        const cells = this.g.selectAll("g")
            .data(this.data.descendants())
            .enter().append("g")
            .attr("transform", d => `translate(${d.x0}, ${d.y0})`);

            cells.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", d => d.x1 - d.x0)
            .attr("height", d => d.y1 - d.y0)
            .attr("fill", d => colourScale(d.data.income))
            // .attr("fill", d => this.color(d.depth))
            .attr("stroke", "#fff")
            .on("mouseover", (d) => {
                this.fetchDefinition(d.data.name || "")
                    .then(area => {
                        tooltip.style("display", "block")
                            .html(`
                                <strong>${d.data.name || "N/A"}</strong><br>
                                ${area} km²<br>
                    Accessibility: ${d.data.value || ""}%<br>
                    Cases Detected: ${d.data.description || ""}%
                `);
        })
        .catch(() => {
            tooltip.style("display", "block")
                .html(`
                    <strong>${d.data.name || "N/A"}</strong><br>
                    Definition: Error fetching definition<br>
                    Accessibility: ${d.data.value || ""}%<br>
                    Cases Detected: ${d.data.description || ""}%
                `);
                    });
            })            
            .on("mousemove", () => {
                tooltip.style("left", `${d3.event.pageX + 10}px`)
                    .style("top", `${d3.event.pageY + 10}px`);
            })           
            .on("mouseout", () => {
                tooltip.style("display", "none");
            });

        // cells.append("rect")
        //     .attr("x", 0)
        //     .attr("y", 0)
        //     .attr("width", d => d.x1 - d.x0)
        //     .attr("height", d => d.y1 - d.y0)
        //     .attr("fill", d => colourScale(d.data.income))
        //     // .attr("fill", d => this.color(d.depth))
        //     .attr("stroke", "#fff")
        //     .on("mouseover", (d) => {
        //         tooltip.style("display", "block")
        //             .html(`
        //                 ${d.data.income|| "N/A"}<br>
        //                 Accessibility: ${d.data.value || "N/A"}%<br>
        //                 Cases Detected: ${d.data.description || "N/A"}%
        //             `);
        //     })
        //     .on("mousemove", () => {
        //         tooltip.style("left", `${d3.event.pageX + 10}px`)
        //             .style("top", `${d3.event.pageY + 10}px`);
        //     })           
        //     .on("mouseout", () => {
        //         tooltip.style("display", "none");
        //     });
         
            cells.filter(d => !d.children) // Leaf nodes only
            .append("text")
            .attr("x", 5)
            .attr("y", 20)
            .style("font-size", "12px")
            .style("fill", "#000")
            .selectAll("tspan")
            .data(d => [d.data.name]) // Add name and value as two separate lines
            .enter()
            .append("tspan")
            .attr("x", 5) // Align left
            .attr("dy", (d, i) => i * 15) // Offset each line
            .text(d => d); // Display name or value
    }
}
