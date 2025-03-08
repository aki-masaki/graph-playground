import { Rect } from '../interfaces/rect'
import { Graph } from './graph'
import { HEADER_HEIGHT, VisualGraph } from './visual-graph.model'
import { VisualModal } from './visual-modal.model'

const INFO_COMPONENT_HEADER_HEIGHT = 20

export abstract class InfoComponent {
  public id: number
  public name: string

  public graph: Graph

  public rect: Rect

  public ctx?: CanvasRenderingContext2D

  public constructor(
    id: number,
    name: string,
    graph: Graph,
    rect: Rect = { x: 0, y: 0, w: 100, h: 100 },
  ) {
    this.id = id
    this.name = name
    this.graph = graph
    this.rect = rect
  }

  private drawContainer(
    ctx: CanvasRenderingContext2D,
    offset: [number, number],
  ) {
    ctx.beginPath()
    ctx.roundRect(
      this.rect.x + offset[0],
      this.rect.y + offset[1],
      this.rect.w,
      this.rect.h,
      10,
    )
    ctx.fill()
  }

  private drawTitle(ctx: CanvasRenderingContext2D, offset: [number, number]) {
    ctx.save()

    const width = ctx.measureText(this.name).width

    ctx.fillStyle = 'grey'
    ctx.font = '13px Arial'
    ctx.fillText(
      this.name,
      offset[0] + (this.rect.w - width) / 2,
      offset[1] + 15,
    )

    ctx.restore()
  }

  public draw(ctx: CanvasRenderingContext2D, offset: [number, number]) {
    if (!this.ctx) this.ctx = ctx

    offset[1] += HEADER_HEIGHT
    offset[0] += 10

    this.drawContainer(ctx, offset)
    this.drawTitle(ctx, offset)

    offset[1] += INFO_COMPONENT_HEADER_HEIGHT
    this.drawContent(ctx, offset)
  }

  public update() {
    const size = this.calculateSize()

    this.rect.w = size[0]
    this.rect.h = size[1]
  }

  protected abstract calculateSize(): [number, number]

  protected abstract drawContent(
    ctx: CanvasRenderingContext2D,
    offset: [number, number],
  ): void
}

export class AdjMatrixComponent extends InfoComponent {
  private rowWidth: number = 0
  private colHeight: number = 0

  protected override calculateSize(): [number, number] {
    return [this.rowWidth + 20, this.colHeight + 20]
  }

  public override update() {
    if (!this.ctx) {
      this.rowWidth = 100
      this.colHeight = 100

      super.update()
      return
    }

    this.rowWidth =
      (this.ctx.measureText('0').width + 20) * this.graph.nodes.size
    this.colHeight =
      (this.ctx.measureText('0').actualBoundingBoxAscent +
        this.ctx.measureText('0').actualBoundingBoxDescent +
        20) *
      this.graph.nodes.size

    super.update()
  }

  protected override drawContent(
    ctx: CanvasRenderingContext2D,
    offset: [number, number],
  ) {
    ctx.fillStyle = 'grey'
    ctx.font = '12px Arial'

    this.graph.nodes.forEach((_, id) => {
      ctx.fillText(
        id.toString(),
        offset[0] + 20 * (id - 1) + 30,
        offset[1] + 20,
      )

      ctx.fillStyle = 'white'

      this.graph.nodes.forEach((_, idB) => {
        ctx.fillText(
          this.graph.edges.get(id)?.has(idB) ? String(1) : String(0),
          offset[0] + 20 * (id - 1) + 30,
          offset[1] + 20 * (idB - 1) + 40,
        )
      })

      ctx.fillStyle = 'grey'
    })

    this.graph.nodes.forEach((_, id) => {
      ctx.fillText(
        id.toString(),
        offset[0] + 10,
        offset[1] + 20 * (id - 1) + 40,
      )
    })
  }
}

export class InfoModal extends VisualModal {
  private visualGraph: VisualGraph

  private components: Map<number, InfoComponent>

  public constructor(
    visualGraph: VisualGraph,
    rect: Rect = { x: 0, y: 0, w: 300, h: 350 },
    id: number,
    components: Map<number, InfoComponent> = new Map(),
  ) {
    super(rect, 'Info', id)

    this.visualGraph = visualGraph
    this.components = components

    this.components.set(
      0,
      new AdjMatrixComponent(0, 'adj.', this.visualGraph.graph),
    )

    setInterval(() => this.update(), 1000)
  }

  public update() {
    this.components.forEach((component) => component.update())
  }

  public override draw(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false,
    title: string | undefined,
  ) {
    super.draw(ctx, isSelected, isHighlighted, title)

    this.components.forEach((component) =>
      component.draw(ctx, [this.rect.x, this.rect.y]),
    )
  }

  public serialize() {
    return {
      id: this.id,
      visualGraphId: this.visualGraph.id,
      rect: this.rect,
    }
  }
}
