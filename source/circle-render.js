export class CircleRender {
    constructor(data, container, countryConfig) {
        this.container = d3.select(container);
        this.data = { name: "root", children: data };
        this.countryConfig = countryConfig;

        // Dimensions
        this.width = 700;
        this.height = 700;

        this.color = d3.scaleOrdinal(d3.schemeCategory10); // Updated for clearer colors

        // Create a pack layout with appropriate padding
        this.pack = d3.pack()
            .size([this.width, this.height])
            .padding(15); // Adjust padding to prevent overlap

        this.root = d3.hierarchy(this.data)
            .sum(d => d.value || 0)
            .sort((a, b) => b.value - a.value);

        this.focus = this.root;
        this.nodes = this.pack(this.root).descendants();

        this.render();
    }

    render() {
        const svg = this.container
            .append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("cursor", "pointer");

        const zoomTo = (v) => {
            const k = this.width / v[2];
            this.view = v;

            node.attr("transform", d => 
                `translate(${(d.x - v[0]) * k}, ${(d.y - v[1]) * k})`);
            circle.attr("r", d => d.r * k);
        };

        const zoom = (d) => {
            this.focus = d;

            const transition = svg.transition()
                .duration(750)
                .tween("zoom", () => {
                    const i = d3.interpolateZoom(this.view, [d.x, d.y, d.r * 2]);
                    return t => zoomTo(i(t));
                });
            
                transition.selectAll("text")
                .filter(function(nodeData) {
                    // Show text only for the clicked circle and its children
                    return nodeData.parent === d || nodeData === d;
                })
                .style("display", "inline") // Make text elements visible
                .style("fill-opacity", 1) // Fade in the text
                .on("start", function() { this.style.display = "inline"; }) // Ensure display is updated
                .on("end", function() { this.style.fillOpacity = 1; });
        
            transition.selectAll("text")
                .filter(function(nodeData) {
                    // Hide text for other circles
                    return nodeData.parent !== d && nodeData !== d;
                })
                .style("fill-opacity", 0) // Fade out the text
                .on("end", function() { this.style.display = "none"; }); // Hide text completely
        };

        //     transition.selectAll("text")
        //         .filter(function(d) { return d.parent === this.focus || this.style.display === "inline"; })
        //         .style("fill-opacity", d => d.parent === this.focus ? 1 : 0)
        //         .on("start", function(d) { if (d.parent === this.focus) this.style.display = "inline"; })
        //         .on("end", function(d) { if (d.parent !== this.focus) this.style.display = "none"; });
        // };

        const g = svg.append("g")
            .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

        const node = g.selectAll("g")
            .data(this.nodes)
            .enter().append("g")
            .attr("transform", d => `translate(${d.x},${d.y})`)
            .on("click", d => this.focus !== d && zoom(d));

        const circle = node.append("circle")
            .attr("r", d => d.r)
            .attr("fill", d => d.children ? this.color(d.depth) : "#fff")

        const text = node.append("text")
            .attr("dy", "-0.5em")
            .style("text-anchor", "middle")
            .style("font-size", "10px")
            .style("fill-opacity", 0) // Initially hide the text
            .style("display", "none") // Hide text completely at first
            .text(d => d.depth > 0 ? d.data.name : "");

            const valueText = node.append("text")
    .attr("dy", "1.2em") // Adjust to place the value slightly below the center
    .style("text-anchor", "middle")
    .style("font-size", "10px")
    .style("fill-opacity", 0) // Initially hide the text
    .style("display", "none") // Hide text completely at first
    .text(d => d.depth > 0 && d.data.value != null ? d.data.value : "");

        this.view = [this.root.x, this.root.y, this.root.r * 2];
        zoomTo(this.view);
    }
}
