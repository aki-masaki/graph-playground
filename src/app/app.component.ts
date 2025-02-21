import { Component, OnInit, ViewChild } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { Graph } from './models/graph'
import { VisualGraph, VisualNode } from './models/visual-graph.model'
import { CanvasComponent } from './canvas/canvas.component'
import { SidebarComponent } from './sidebar/sidebar.component'
import { Rect } from './interfaces/rect'

export type FileData = {
  visualGraphs: {
    nodes: { id: number; x: number; y: number }[]
    rect: Rect
    id: number
    name: string
  }[]
  graphs: {
    nodes: number[]
    edges: [number, number[]][]
    id: number
    name: string
  }[]
  canvas: {
    pan: { x: number; y: number }
    zoom: number
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CanvasComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass',
})
export class AppComponent {
  title = 'Graph Playground'

  public graphs: Map<number, Graph> = new Map()
  public visualGraphs: Map<number, VisualGraph> = new Map()

  public selectedGraph?: VisualGraph
  public selectedNode?: VisualNode

  @ViewChild(CanvasComponent)
  private canvas!: CanvasComponent

  public createGraph(coords: [number, number] = [0, 0]) {
    const id = this.graphs.size
    const graph = new Graph(this.graphs.size)
    const visualGraph = VisualGraph.fromGraph(graph)

    visualGraph.rect.x = coords[0]
    visualGraph.rect.y = coords[1]

    this.graphs.set(id, graph)
    this.visualGraphs.set(id, visualGraph)

    this.selectedGraph = visualGraph
  }

  public deleteGraph(id: number) {
    this.graphs.delete(id)
    this.visualGraphs.delete(id)

    if (this.selectedGraph?.graph.id === id)
      this.selectedGraph =
        this.visualGraphs.size > 0 ? this.visualGraphs.get(id - 1) : undefined
  }

  public serialize() {
    return JSON.stringify({
      visualGraphs: Array.from(this.visualGraphs).map((value) =>
        value[1].serialize(),
      ),
      graphs: Array.from(this.graphs).map((value) => value[1].serialize()),
      canvas: this.canvas.serialize(),
      selectedGraph: this.selectedGraph?.serialize(),
    })
  }

  public download(fileName: string, data: string) {
    const blob = new Blob([data], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const anchor = document.createElement('a')

    document.body.appendChild(anchor)

    anchor.href = url
    anchor.download = fileName
    anchor.click()

    window.URL.revokeObjectURL(url)
    anchor.remove()
  }

  public onSaveFile(e: [string, string]) {
    if (e[0] === 'disk') {
      this.download(e[1], this.serialize())
    }
  }

  public onOpenFile(e: [string, string]) {
    if (e[0] === 'disk') {
      this.import(JSON.parse(e[1]))
    }
  }

  public import(data: FileData) {
    this.reset()

    const graphs = new Map<number, Graph>()
    const visualGraphs = new Map<number, VisualGraph>()

    data.graphs.forEach((graph) => {
      graphs.set(
        graph.id,
        new Graph(
          graph.id,
          graph.name,
          new Set(graph.nodes),
          new Map(graph.edges.map((value) => [value[0], new Set(value[1])])),
        ),
      )
    })

    data.visualGraphs.forEach((graph) => {
      visualGraphs.set(
        graph.id,
        new VisualGraph(
          graphs.get(graph.id)!,
          new Map(
            Array.from(graph.nodes).map((node) => [
              node.id,
              new VisualNode(node.id, node.x, node.y),
            ]),
          ),
          graph.rect,
        ),
      )
    })

    this.canvas.import(data.canvas)

    this.graphs = graphs
    this.visualGraphs = visualGraphs
  }

  public reset() {
    this.graphs = new Map()
    this.visualGraphs = new Map()

    this.selectedNode = undefined
    this.selectedGraph = undefined
  }
}
