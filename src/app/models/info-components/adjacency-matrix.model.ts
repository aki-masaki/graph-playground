import { InfoComponent } from './info-component.model'

export class AdjacencyMatrixComponent extends InfoComponent {
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
