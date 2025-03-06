import { Rect } from '../interfaces/rect'
import { VisualGraph } from './visual-graph.model'
import { VisualModal } from './visual-modal.model'

export class InfoModal extends VisualModal {
  public visualGraph: VisualGraph

  public constructor(
    visualGraph: VisualGraph,
    rect: Rect = { x: 0, y: 0, w: 300, h: 350 },
    id: number,
  ) {
    super(rect, 'Info', id)

    this.visualGraph = visualGraph
  }

  public override draw(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false,
    title: string | undefined,
  ) {
    super.draw(ctx, isSelected, isHighlighted, title)

    ctx.fillRect(this.rect.x, this.rect.y, 100, 100)
  }
}
