import { Graph } from './graph'

export class VisualNode {
  public id: number

  public x: number
  public y: number

  public constructor(id: number, x: number, y: number) {
    this.id = id
    this.x = x
    this.y = y
  }
}

export class VisualGraph {
  public nodes: Map<number, VisualNode>

  public graph: Graph

  public constructor(graph: Graph, nodes: Map<number, VisualNode> = new Map()) {
    this.graph = graph
    this.nodes = nodes
  }

  public static fromGraph(graph: Graph): VisualGraph {
    let visualGraph = new VisualGraph(graph)
    graph.nodes.forEach((node) => visualGraph.addNode(node))

    return visualGraph
  }

  public addNode(id: number) {
    if (this.nodes.has(id)) return

    this.nodes.set(id, new VisualNode(id, 0, 0))
  }
}
