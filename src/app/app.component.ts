import { AfterViewInit, Component, OnInit } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Graph } from './models/graph'
import { VisualGraph } from './models/visual-graph.model'
import { CanvasComponent } from './canvas/canvas.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent implements OnInit {
  title = 'Graph Playground'

  public graphs: Map<number, Graph> = new Map()
  public visualGraphs: Map<number, VisualGraph> = new Map()

  ngOnInit() {
    let graph = new Graph(0)

    graph.addEdge(1, 2)
    graph.addEdge(1, 3)

    this.graphs.set(0, graph)
    this.visualGraphs.set(0, VisualGraph.fromGraph(graph))
  }
}
