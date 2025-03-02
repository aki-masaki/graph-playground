import {VisualGraph} from "./visual-graph.model";

export class InfoModal {
  public visualGraph: VisualGraph;

  public constructor(visualGraph: VisualGraph) {
    this.visualGraph = visualGraph;

    console.log(visualGraph.graph.generateAdjacencyMatrix())
  }
}
