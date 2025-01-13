export class ForceRender {
    constructor(data, container) {
      this.container = container;
      this.data = data;
      this.width = 1000; // Default width
      this.height = 750; // Default height
  
      this.init();
      this.render(this.data);
    }

    distanceRecursion(node, level = 1, baseLength = 70, factor = 0.67) {
        // Calculate the current link distance
        const currentDistance = baseLength * Math.pow(factor, level);
      
        // Stop recursion if the current distance is less than baseLength threshold
        if (currentDistance < 10) {
          return [];
        }
      
        // Base case: if the node has no children, return an empty array
        if (!node.children || node.children.length === 0) {
          return [];
        }
      
        const distances = [];
        
        // Process each child
        node.children.forEach((child) => {
          distances.push({
            source: node.id,
            target: child.id,
            distance: currentDistance, // Use the calculated distance
          });
      
          // Recursively compute distances for the child's links
          distances.push(...this.distanceRecursion(child, level + 1, baseLength, factor));
        });
      
        return distances;
      }      
      
    init() {
      // Create the SVG canvas
      this.svg = d3.select(this.container)
        .append("svg")
        .attr("width", this.width)
        .attr("height", this.height);
  
      // Create a simulation for force-directed layout
      this.simulation = d3.forceSimulation()
     .force("link", d3.forceLink()
  .id(d => d.id)
  .distance(d => d.distance)) // Use precomputed distance;
        // .force("link", d3.forceLink().id(d => d.id).distance(0.1))
        .force("charge", d3.forceManyBody().strength(-7))
        .force("center", d3.forceCenter(this.width / 2, this.height / 2))
    }
  
    render(data) {
        const root = d3.hierarchy(data);
      
        // Flatten nodes and links
        const nodes = [];
        const links = [];
        this.recursiveFlatten(root, nodes, links);
      
        // Calculate distances using distanceRecursion
        const distanceMap = {};
        this.distanceRecursion(root.data).forEach((link) => {
          distanceMap[`${link.source}-${link.target}`] = link.distance;
        });
      
        links.forEach((link) => {
          link.distance = distanceMap[`${link.source}-${link.target}`] ; // Default distance
        });
      
        // Create links
        const link = this.svg.selectAll(".link")
          .data(links)
          .enter()
          .append("line")
          .attr("class", "link")
          .style("stroke", "#000");
  
      // Create nodes
      const node = this.svg.selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", 7)
        .style("fill", "steelblue")
        .call(d3.drag()
          .on("start", (d) => this.dragStarted(d))
          .on("drag", (d) => this.dragged(d))
          .on("end", (d) => this.dragEnded(d))
        )
        .on("mouseover", (event, d) => this.showTooltip(event, d))
        .on("mouseout", () => this.hideTooltip());
  
      // Start simulation
      this.simulation
        .nodes(nodes)
        .on("tick", () => this.ticked(node, link));
  
      this.simulation.force("link")
        .links(links);
  
      // Tooltip
      this.tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background", "#fff")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "4px");
    }
  
    recursiveFlatten(node, nodes, links) {
        nodes.push(node.data);
      
        if (node.children) {
          node.children.forEach((child) => {
            links.push({
              source: node.data.id,
              target: child.data.id,
            });
            this.recursiveFlatten(child, nodes, links);
          });
        }
      }
      
      
  
    ticked(node, link) {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
  
      node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
    }
  
    dragStarted(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
  
    dragged(d) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
  
    dragEnded(d) {
      if (!d3.event.active) this.simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  
    showTooltip(d) {
      this.tooltip.style("visibility", "visible")
        .text(`${d.name}`)
        .style("top", `190px`)
        .style("left", `100px`);
    }
  
    hideTooltip() {
      this.tooltip.style("visibility", "hidden");
    }
  }
  