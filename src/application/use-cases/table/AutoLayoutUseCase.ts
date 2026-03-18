import dagre from "dagre";
import { Project } from "../../../domain/entities/Project";

export class AutoLayoutUseCase {
  public execute(project: Project): void {
    const g = new dagre.graphlib.Graph();

    // Set an object for the graph label
    g.setGraph({
      rankdir: 'TB', // Top to Bottom layout
      nodesep: 100,  // Horizontal distance between nodes in same rank
      ranksep: 120,  // Vertical distance between ranks
      marginx: 50,
      marginy: 50
    });

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    project.tables.forEach(table => {
      // Approximate size for better spacing
      const nodeWidth = 190;
      const nodeHeight = 60 + (table.columns.length * 35);

      g.setNode(table.id, { width: nodeWidth, height: nodeHeight });
    });

    // Add edges to the graph
    project.relations.forEach(rel => {
      g.setEdge(rel.sourceTableId, rel.targetTableId);
    });

    // Apply layout
    dagre.layout(g);

    // Update table positions in the project
    project.tables.forEach(table => {
      const node = g.node(table.id);
      if (node) {
        // Dagre uses center coordinates, we need top-left for React Flow
        const x = node.x - node.width / 2;
        const y = node.y - node.height / 2;
        table.updatePosition(Math.round(x), Math.round(y));
      }
    });
  }
}
