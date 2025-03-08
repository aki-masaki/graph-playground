import { Rect } from '../interfaces/rect'
import { AdjacencyMatrixComponent } from './info-components/adjacency-matrix.model'
import { IncidenceMatrixComponent } from './info-components/incidence-matrix.model'
import { InfoComponent } from './info-components/info-component.model'
import { VisualGraph } from './visual-graph.model'
import { VisualModal } from './visual-modal.model'

export class InfoModal extends VisualModal {
  private visualGraph: VisualGraph

  private components: Map<number, InfoComponent>

  public highlightedComponent?: InfoComponent

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

  public addComponent(type: string) {
    const id = this.components.size
    let component: InfoComponent | undefined = undefined

    switch (type) {
      case 'adjacency-matrix':
        component = new AdjacencyMatrixComponent(
          id,
          'adjacency',
          this.visualGraph.graph,
        )
        break
      case 'incidence-matrix':
        component = new IncidenceMatrixComponent(
          id,
          'incidence',
          this.visualGraph.graph,
        )
        break
    }

    component && this.components.set(id, component)
    this.update()
  }

  public removeComponent(id: number) {
    this.components.delete(id)
  }

  public arrangeComponents() {
    let occupiedWidth = 0

    this.components.forEach((component) => {
      component.rect.x = occupiedWidth

      occupiedWidth += component.rect.w + 30
    })
  }

  public update() {
    this.components.forEach((component) => component.update())

    this.arrangeComponents()
  }

  public override draw(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false,
    title: string | undefined,
  ) {
    super.draw(ctx, isSelected, isHighlighted, title)

    this.components.forEach((component) =>
      component.draw(
        ctx,
        [this.rect.x, this.rect.y],
        this.highlightedComponent?.id === component.id,
      ),
    )
  }

  public serialize() {
    return {
      id: this.id,
      visualGraphId: this.visualGraph.id,
      rect: this.rect,
    }
  }

  private isOverComponent(component: InfoComponent, coords: [number, number]) {
    return (
      coords[0] > component.rect.x &&
      coords[0] < component.rect.x + component.rect.w &&
      coords[1] > component.rect.y &&
      coords[1] < component.rect.y + component.rect.h
    )
  }

  public override onMouseMove(
    relCoords: [number, number],
    delta: [number, number],
  ) {
    this.highlightedComponent = undefined

    this.components.forEach((component) => {
      if (
        !this.highlightedComponent &&
        this.isOverComponent(component, relCoords)
      )
        this.highlightedComponent = component
    })
  }
}
export { InfoComponent }
