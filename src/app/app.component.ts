import { AfterViewInit, Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Graph } from './models/graph'
import { VisualGraph, VisualNode } from './models/visual-graph.model'
import { CanvasComponent } from './canvas/canvas.component'
import { SidebarComponent } from './sidebar/sidebar.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
  title = 'Graph Playground'

  public graphs: Map<number, Graph> = new Map()
  public visualGraphs: Map<number, VisualGraph> = new Map()

  public selectedGraph?: VisualGraph
  public selectedNode?: VisualNode

  ngOnInit() {
    let graphA = new Graph(0)
    let graphB = new Graph(1)

    graphA.addEdge(1, 2)
    graphA.addEdge(2, 3)

    this.graphs.set(0, graphA)
    this.visualGraphs.set(0, VisualGraph.fromGraph(graphA))

    this.graphs.set(1, graphB)
    this.visualGraphs.set(1, VisualGraph.fromGraph(graphB))

    this.visualGraphs.get(1)!.rect.x = 500

    this.selectedGraph = this.visualGraphs.get(1)
  }
}
