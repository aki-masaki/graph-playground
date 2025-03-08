import { Rect } from '../interfaces/rect'
import { InfoComponent } from './info-components/info-component.model'
import { VisualGraph } from './visual-graph.model'
import { VisualModal } from './visual-modal.model'

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
export { InfoComponent }
