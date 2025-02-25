import { Rect } from '../interfaces/rect'
import { Graph } from './graph'

const NODE_RADIUS = 25
export const HEADER_HEIGHT = 50

const SIZE_HANDLER_RADIUS = 10
const SIZE_HANDLER_MARGIN = 18
const SIZE_HANDLER_THRESHOLD = SIZE_HANDLER_MARGIN + SIZE_HANDLER_RADIUS * 2

const SIZE_LIMITS = [
  [150, 300],
  [700, 700],
]

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

  public serialize() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
    }
  }
}

export class VisualGraph {
  public nodes: Map<number, VisualNode>

  public graph: Graph

  public rect!: Rect

  public highlightedNode?: VisualNode
  private draggedNode?: VisualNode

  private inConnectMode: boolean = false
  private inDisconnectMode: boolean = false
  private connectNode?: VisualNode

  private mouseX: number = 0
  private mouseY: number = 0

  private highlightedSizeDirection: [number, number] = [0, 0]

  private activeInteraction: 'move' | 'resize' | 'none' = 'none'

  public constructor(
    graph: Graph,
    nodes: Map<number, VisualNode> = new Map(),
    rect: Rect = { x: 0, y: 0, w: 300, h: 150 }
  ) {
    this.graph = graph
    this.nodes = nodes
    this.rect = rect
  }

  public static fromGraph(graph: Graph): VisualGraph {
    let visualGraph = new VisualGraph(graph)
    graph.nodes.forEach((node) => visualGraph.addNode(node))

    visualGraph.autoArrangeNodes()

    return visualGraph
  }

  public addNode(id: number | undefined, coords: [number, number] = [0, 0]) {
    for (let i = 1; i < this.nodes.size + 2; i++) {
      if (!this.nodes.has(i)) {
        id = i

        break
      }
    }

    if (id === undefined || this.nodes.has(id)) return

    this.nodes.set(id, new VisualNode(id, coords[0], coords[1]))
    this.graph.nodes.add(id)
  }

  public removeNode(id: number) {
    if (!this.nodes.has(id)) return

    this.nodes.delete(id)
    this.graph.removeNode(id)
  }

  public removeAllNodes() {
    this.nodes = new Map()
    this.graph.nodes = new Set()
    this.graph.edges = new Map()
  }

  public enableConnectMode(nodeId: number, inDisconnectMode: boolean = false) {
    this.inConnectMode = true
    this.inDisconnectMode = inDisconnectMode
    this.connectNode = this.nodes.get(nodeId)
  }

  public disableConnectMode() {
    this.inConnectMode = false
    this.inDisconnectMode = false
    this.connectNode = undefined
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

    ctx.lineWidth = 3

    this.drawSizeHandlers(ctx)
  }

  private drawSizeHandlers(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === 1 &&
      this.highlightedSizeDirection[1] === 1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + this.rect.w - SIZE_HANDLER_MARGIN,
      this.rect.y + this.rect.h - SIZE_HANDLER_MARGIN,
      SIZE_HANDLER_RADIUS,
      0,
      Math.PI / 2
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === -1 &&
      this.highlightedSizeDirection[1] === 1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + SIZE_HANDLER_MARGIN,
      this.rect.y + this.rect.h - SIZE_HANDLER_MARGIN,
      10,
      Math.PI / 2,
      Math.PI
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === -1 &&
      this.highlightedSizeDirection[1] === -1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + SIZE_HANDLER_MARGIN,
      this.rect.y + SIZE_HANDLER_MARGIN,
      10,
      Math.PI,
      (3 * Math.PI) / 2
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === 1 &&
      this.highlightedSizeDirection[1] === -1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + this.rect.w - SIZE_HANDLER_MARGIN,
      this.rect.y + SIZE_HANDLER_MARGIN,
      10,
      (3 * Math.PI) / 2,
      Math.PI * 2
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'
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
    offset: [number, number],
    useCenter: [boolean, boolean] = [false, false]
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

    if (useCenter[0]) ctx.moveTo(a[0] + offset[0], a[1] + offset[1])
    else ctx.moveTo(ax, ay)

    if (useCenter[1]) ctx.lineTo(b[0] + offset[0], b[1] + offset[1])
    else ctx.lineTo(bx, by)

    ctx.stroke()
  }

  private drawGraph(ctx: CanvasRenderingContext2D) {
    this.nodes.forEach((node) =>
      node.draw(
        ctx,
        [this.rect.x, this.rect.y + HEADER_HEIGHT],
        this.highlightedNode?.id === node.id
      )
    )

    let drawn = new Set<string>()

    this.graph.edges.forEach((neighbours, nodeId) => {
      const node = this.nodes.get(nodeId)
      if (!node) return

      neighbours.forEach((neighbourId) => {
        const key = `${node.id}-${neighbourId}`
        if (drawn.has(key)) return

        const neighbour = this.nodes.get(neighbourId)
        if (!neighbour) return

        drawn.add(key)

        this.drawEdge(
          ctx,
          [node.x, node.y],
          [neighbour.x, neighbour.y],
          [this.rect.x, this.rect.y + HEADER_HEIGHT]
        )
      })
    })

    if (this.inConnectMode && this.connectNode) {
      this.drawEdge(
        ctx,
        [this.connectNode.x, this.connectNode.y],
        [this.mouseX, this.mouseY - HEADER_HEIGHT],
        [this.rect.x, this.rect.y + HEADER_HEIGHT],
        [false, true]
      )
    }
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

  public resize(direction: [number, number], delta: [number, number]) {
    if (
      (this.rect.w += delta[0]) > SIZE_LIMITS[0][0] &&
      (this.rect.w += delta[0]) < SIZE_LIMITS[1][0]
    ) {
      if (direction[0] === 1) this.rect.w += delta[0]
      else if (direction[0] === -1) {
        this.rect.x += delta[0]
        this.rect.w -= delta[0]
      }
    }

    if (
      (this.rect.h += delta[1]) > SIZE_LIMITS[0][1] &&
      (this.rect.h += delta[1]) < SIZE_LIMITS[1][1]
    ) {
      if (direction[1] === 1) this.rect.h += delta[1]
      else if (direction[1] === -1) {
        this.rect.y += delta[1]
        this.rect.h -= delta[1]
      }
    }

    this.rect.x = Math.round(this.rect.x)
    this.rect.y = Math.round(this.rect.y)
    this.rect.w = Math.round(this.rect.w)
    this.rect.h = Math.round(this.rect.h)
  }

  private getNodeLimits(): [[number, number], [number, number]] {
    return [
      [NODE_RADIUS, this.rect.w - NODE_RADIUS],
      [HEADER_HEIGHT - NODE_RADIUS, this.rect.h - HEADER_HEIGHT - NODE_RADIUS],
    ]
  }

  private performActiveInteraction(delta: [number, number]) {
    if (this.activeInteraction === 'resize')
      return this.resize(this.highlightedSizeDirection, delta)
    else if (this.activeInteraction === 'move')
      return this.move(delta[0], delta[1])
    else if (this.draggedNode)
      return this.draggedNode.move(delta[0], delta[1], this.getNodeLimits())
  }

  private isOverNode(
    relCoords: [number, number],
    nodeCoords: [number, number]
  ) {
    return (
      relCoords[0] > nodeCoords[0] - NODE_RADIUS &&
      relCoords[0] < nodeCoords[0] + NODE_RADIUS &&
      relCoords[1] > nodeCoords[1] - NODE_RADIUS + HEADER_HEIGHT &&
      relCoords[1] < nodeCoords[1] + NODE_RADIUS + HEADER_HEIGHT
    )
  }

  public onMouseMove(
    relCoords: [number, number],
    delta: [number, number],
    e: MouseEvent
  ) {
    if (this.inConnectMode) {
      this.mouseX = relCoords[0]
      this.mouseY = relCoords[1]
    }

    if (this.activeInteraction !== 'none')
      return this.performActiveInteraction(delta)
    else if (this.draggedNode)
      return this.draggedNode.move(delta[0], delta[1], this.getNodeLimits())

    const xDirection =
      relCoords[0] > 0 && relCoords[0] < SIZE_HANDLER_THRESHOLD
        ? -1
        : relCoords[0] > this.rect.w - SIZE_HANDLER_THRESHOLD &&
          relCoords[0] < this.rect.w
        ? 1
        : 0

    const yDirection =
      relCoords[1] > 0 && relCoords[1] < SIZE_HANDLER_THRESHOLD
        ? -1
        : relCoords[1] > this.rect.h - SIZE_HANDLER_THRESHOLD &&
          relCoords[1] < this.rect.h
        ? 1
        : 0

    this.highlightedSizeDirection = [xDirection, yDirection]

    this.highlightedNode = undefined

    this.nodes.forEach((node) => {
      if (!this.highlightedNode && this.isOverNode(relCoords, [node.x, node.y]))
        this.highlightedNode = node
    })
  }

  public onMouseDown(e: MouseEvent) {
    if (this.inConnectMode && this.connectNode) {
      if (this.highlightedNode) {
        if (this.inDisconnectMode)
          this.graph.removeEdge(this.connectNode.id, this.highlightedNode.id)
        else this.graph.addEdge(this.connectNode.id, this.highlightedNode.id)

        this.disableConnectMode()
      }
    }

    if (!this.highlightedSizeDirection.includes(0))
      this.activeInteraction = 'resize'
    else if (!this.highlightedNode) this.activeInteraction = 'move'
    else this.draggedNode = this.highlightedNode
  }

  public onMouseUp() {
    this.activeInteraction = 'none'
    this.draggedNode = undefined
  }

  public serialize() {
    return {
      nodes: Array.from(this.nodes).map((node) => node[1].serialize()),
      rect: this.rect,
      id: this.graph.id,
    }
  }
}
