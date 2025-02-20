import { Rect } from '../interfaces/rect'
import { Graph } from './graph'

export class VisualNode {
  public id: number

  public x: number
  public y: number

  private radius = 25

  public constructor(id: number, x: number, y: number) {
    this.id = id
    this.x = x
    this.y = y
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    offset: [number, number] = [0, 0]
  ) {
    ctx.save()

    ctx.fillStyle = '#211711'
    ctx.strokeStyle = 'white'
    ctx.lineWidth = 5

    ctx.beginPath()
    ctx.arc(this.x + offset[0], this.y + offset[1], this.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fill()

    const textSize = ctx.measureText(this.id.toString())

    const textWidth = textSize.width
    const textHeight =
      textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent

    ctx.font = 'bold 20px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText(
      this.id.toString(),
      this.x + offset[0] - textWidth / 2,
      this.y + offset[1] + textHeight / 2
    )

    ctx.restore()
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

    visualGraph.autoArrangeNodes()

    return visualGraph
  }

  public addNode(id: number) {
    if (this.nodes.has(id)) return

    this.nodes.set(id, new VisualNode(id, 0, 0))
  }

  private drawContainer(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false
  ) {
    ctx.fillStyle = '#3a332f'
    ctx.strokeStyle = isSelected
      ? '#56abd8'
      : isHighlighted
      ? '#565656'
      : '#3a332f'
    ctx.lineWidth = 5
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
      this.rect.y + 30
    )
  }

  private drawGraph(ctx: CanvasRenderingContext2D) {
    this.nodes.forEach((node) =>
      node.draw(ctx, [this.rect.x, this.rect.y + 50])
    )
  }

  private autoArrangeNodes() {
    // TODO: Implement *smart* auto arrangement

    this.nodes.forEach((node) => {
      node.x = node.id * 70
      node.y = 30
    })
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false
  ) {
    ctx.save()

    this.drawContainer(ctx, isSelected, isHighlighted)
    this.drawTitle(ctx)
    this.drawGraph(ctx)

    ctx.restore()
  }
}
