import { Rect } from '../interfaces/rect'
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

  public rect: Rect = { x: 0, y: 0, w: 300, h: 150 }

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

  private drawContainer(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#3a332f'
    ctx.beginPath()
    ctx.roundRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 20)
    ctx.stroke()
    ctx.fill()
  }

  private drawTitle(ctx: CanvasRenderingContext2D) {
    const textWidth = ctx.measureText(this.graph.name).width

    ctx.fillStyle = 'white'
    ctx.font = 'bold 20px Arial'

    ctx.fillText(
      this.graph.name,
      this.rect.x + this.rect.w / 2 - textWidth,
      this.rect.y + 30,
    )
  }

  private drawGraph(ctx: CanvasRenderingContext2D) {
    // TODO: Implement drawing the graph
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    this.drawContainer(ctx)
    this.drawTitle(ctx)
    this.drawGraph(ctx)

    ctx.restore()
  }
}
