import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { Graph } from '../models/graph'
import { VisualGraph } from '../models/visual-graph.model'

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.sass',
})
export class CanvasComponent implements AfterViewInit {
  @ViewChild('canvas')
  public canvas!: ElementRef<HTMLCanvasElement>
  public ctx?: CanvasRenderingContext2D

  @Input()
  public graphs!: Map<number, Graph>

  @Input()
  public visualGraphs!: Map<number, VisualGraph>

  @Input()
  public selectedGraph?: VisualGraph

  public highlightedGraph?: VisualGraph

  @Output()
  public onSelect: EventEmitter<number> = new EventEmitter<number>()

  public pan: { x: number; y: number } = { x: 50, y: 0 }
  public zoom: number = 2

  public ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this.setup()
    this.draw()
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < ctx.canvas.width / 50; i++) {
      for (let j = 0; j < ctx.canvas.height / 50; j++) {
        ctx.beginPath()
        ctx.fillStyle = '#2b2a2a'

        ctx.arc(
          i * 50 + (this.pan.x % 50),
          j * 50 + (this.pan.y % 50),
          5,
          0,
          Math.PI * 2
        )

        ctx.fill()
      }
    }
  }

  private setup() {
    this.canvas.nativeElement.width = this.canvas.nativeElement.clientWidth
    this.canvas.nativeElement.height = this.canvas.nativeElement.clientHeight
  }

  public draw() {
    if (!this.ctx) return

    this.ctx.save()

    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    )

    this.drawBackground(this.ctx)
    this.drawGrid(this.ctx)

    this.ctx.translate(this.pan.x, this.pan.y)
    this.ctx.scale(this.zoom, this.zoom)
    this.visualGraphs.forEach((graph) =>
      graph.draw(
        this.ctx!!,
        this.selectedGraph?.graph.id === graph.graph.id,
        this.highlightedGraph?.graph.id === graph.graph.id
      )
    )

    this.ctx.restore()

    requestAnimationFrame(() => this.draw())
  }

  public onMouseMove(e: MouseEvent) {
    if (e.buttons == 4) {
      this.pan.x += e.movementX
      this.pan.y += e.movementY

      return
    }

    this.highlightedGraph = undefined

    this.visualGraphs.forEach((graph) => {
      if (
        e.clientX > this.pan.x + graph.rect.x * this.zoom &&
        e.clientX < this.pan.x + (graph.rect.x + graph.rect.w) * this.zoom &&
        e.clientY > this.pan.y + graph.rect.y * this.zoom &&
        e.clientY < this.pan.y + (graph.rect.y + graph.rect.h) * this.zoom
      )
        this.highlightedGraph = graph
    })
  }

  public onScroll(e: WheelEvent) {
    this.zoom -= e.deltaY * 0.001
  }

  public onDoubleClick() {
    console.log(this.highlightedGraph)

    if (!this.highlightedGraph) return

    this.onSelect.emit(this.highlightedGraph.graph.id)
  }
}
