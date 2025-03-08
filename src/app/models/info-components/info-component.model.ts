import { Rect } from '../../interfaces/rect'
import { Graph } from '../graph'
import { HEADER_HEIGHT } from '../visual-graph.model'

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
    isHighlighted: boolean = false,
  ) {
    ctx.fillStyle = isHighlighted ? '#3d3c3a' : '#33312e'

    ctx.beginPath()
    ctx.roundRect(offset[0], offset[1], this.rect.w, this.rect.h, 10)
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

  public draw(
    ctx: CanvasRenderingContext2D,
    offset: [number, number],
    isHighlighted: boolean = false,
  ) {
    ctx.save()

    if (!this.ctx) this.ctx = ctx

    offset[0] += this.rect.x
    offset[1] += this.rect.y

    offset[1] += HEADER_HEIGHT
    offset[0] += 10

    this.drawContainer(ctx, offset, isHighlighted)
    this.drawTitle(ctx, offset)

    offset[1] += INFO_COMPONENT_HEADER_HEIGHT
    this.drawContent(ctx, offset)

    ctx.restore()
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
