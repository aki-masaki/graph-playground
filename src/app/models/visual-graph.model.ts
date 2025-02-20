import { Rect } from '../interfaces/rect'
import { Graph } from './graph'

const NODE_RADIUS = 25

export class VisualNode {
  public id: number

  public x: number
  public y: number

  public constructor(id: number, x: number, y: number) {
    this.id = id
    this.x = x
    this.y = y
  }

  public move(
    deltaX: number,
    deltaY: number,
    limits: [[number, number], [number, number]]
  ) {
    this.x += deltaX
    this.y += deltaY

    this.x = Math.max(limits[0][0], Math.min(limits[0][1], this.x))
    this.y = Math.max(limits[1][0], Math.min(limits[1][1], this.y))
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    offset: [number, number] = [0, 0],
    isHighlighted: boolean = false
  ) {
    ctx.save()

    ctx.fillStyle = '#211711'
    ctx.strokeStyle = isHighlighted ? '#565656' : 'white'
    ctx.lineWidth = 5

    ctx.beginPath()
    ctx.arc(this.x + offset[0], this.y + offset[1], NODE_RADIUS, 0, Math.PI * 2)
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

  private headerHeight = 50

  public highlightedNode?: VisualNode
  private draggedNode?: VisualNode

  private isDragged: boolean = false

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

  public addNode(id: number | undefined) {
    if (!id) id = this.nodes.size + 1

    if (this.nodes.has(id)) return

    this.nodes.set(id, new VisualNode(id, 0, 0))
    this.graph.nodes.add(id)
  }

  public removeNode(id: number) {
    if (!this.nodes.has(id)) return

    this.nodes.delete(id)
    this.graph.nodes.delete(id)
  }

  public removeAllNodes() {
    this.nodes = new Map()
    this.graph.nodes = new Set()
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

  private drawEdge(
    ctx: CanvasRenderingContext2D,
    a: [number, number],
    b: [number, number],
    offset: [number, number]
  ) {
    ctx.beginPath()

    ctx.strokeStyle = 'white'
    ctx.lineWidth = 3

    // Delta
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]

    // Distance
    const len = Math.sqrt(dx * dx + dy * dy)

    // Normalized
    const ux = dx / len
    const uy = dy / len

    const ax = a[0] + ux * NODE_RADIUS + offset[0]
    const ay = a[1] + uy * NODE_RADIUS + offset[1]

    const bx = b[0] - ux * NODE_RADIUS + offset[0]
    const by = b[1] - uy * NODE_RADIUS + offset[1]

    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)

    ctx.stroke()
  }

  private drawGraph(ctx: CanvasRenderingContext2D) {
    this.nodes.forEach((node) =>
      node.draw(
        ctx,
        [this.rect.x, this.rect.y + this.headerHeight],
        this.highlightedNode?.id === node.id
      )
    )

    let used = new Set<number>()

    this.graph.edges.forEach((neighbours, nodeId) => {
      const node = this.nodes.get(nodeId)
      if (!node || used.has(node.id)) return

      used.add(node.id)

      neighbours.forEach((neighbourId) => {
        const neighbour = this.nodes.get(neighbourId)
        if (!neighbour) return

        used.add(neighbour.id)

        this.drawEdge(
          ctx,
          [node.x, node.y],
          [neighbour.x, neighbour.y],
          [this.rect.x, this.rect.y + this.headerHeight]
        )
      })
    })
  }

  public autoArrangeNodes() {
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

  public move(deltaX: number, deltaY: number) {
    this.rect.x += deltaX
    this.rect.y += deltaY

    this.rect.x = Math.floor(this.rect.x)
    this.rect.y = Math.floor(this.rect.y)
  }

  public onMouseMove(
    relCoords: [number, number],
    delta: [number, number],
    e: MouseEvent
  ) {
    if (e.buttons === 1 && !this.highlightedNode) this.isDragged = true

    if (this.isDragged) this.move(delta[0], delta[1])

    if (this.draggedNode && !this.isDragged)
      this.draggedNode.move(delta[0], delta[1], [
        [NODE_RADIUS, this.rect.w - NODE_RADIUS],
        [
          this.headerHeight - NODE_RADIUS,
          this.rect.h - this.headerHeight - NODE_RADIUS,
        ],
      ])

    this.highlightedNode = undefined

    if (e.buttons === 0) {
      this.draggedNode = undefined
      this.isDragged = false
    }

    this.nodes.forEach((node) => {
      if (
        relCoords[0] > node.x - NODE_RADIUS &&
        relCoords[0] < node.x + NODE_RADIUS &&
        relCoords[1] > node.y - NODE_RADIUS + this.headerHeight &&
        relCoords[1] < node.y + NODE_RADIUS + this.headerHeight
      ) {
        this.highlightedNode = node

        if (e.buttons === 1 && !this.draggedNode)
          this.draggedNode = this.highlightedNode
      }
    })
  }
}
