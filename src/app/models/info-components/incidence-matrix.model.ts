import {GraphType} from '../graph'
import {InfoComponent} from './info-component.model'

export class IncidenceMatrixComponent extends InfoComponent {
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
      (this.ctx.measureText('0').width + 20) * this.graph.edgeCount
    this.colHeight =
      (this.ctx.measureText('0').actualBoundingBoxAscent +
        this.ctx.measureText('0').actualBoundingBoxDescent +
        20) *
      this.graph.edgeCount

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
        offset[0] + 20 * (id - 1) + 50,
        offset[1] + 20,
      )

      ctx.fillStyle = 'white'

      this.graph.edges.forEach((neighbours, key) => {
        const neighboursArr = Array.from(neighbours)

        for (let i = 0; i < neighbours.size; i++)
          ctx.fillText(
            this.graph.type === GraphType.Undirected ? ((neighboursArr[i] === id || key === id) ? String(1) : String(0)) : (neighboursArr[i] === id ? String(1) : key === id ? String(-1) : String(0)),
            offset[0] + 20 * (id - 1) + 50,
            offset[1] + 20 * (key + i - 1) + 40,
          )
      })

      ctx.fillStyle = 'grey'
    })

    this.graph.edges.forEach((neighbours, key) => {
      const neighboursArr = Array.from(neighbours)

      for (let i = 0; i < neighbours.size; i++)
        ctx.fillText(
          `(${key}, ${neighboursArr[i]})`,
          offset[0] + 10,
          offset[1] + 20 * (key + i - 1) + 40,
        )
    })
  }
}
