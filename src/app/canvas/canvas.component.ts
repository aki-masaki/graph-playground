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
import { VisualGraph, VisualNode } from '../models/visual-graph.model'
import { ContextMenu } from '../models/context-menu.model'

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

  @Input()
  public selectedNode?: VisualNode

  public highlightedGraph?: VisualGraph

  @Output()
  public onSelect: EventEmitter<number> = new EventEmitter<number>()

  @Output()
  public onCreateGraph: EventEmitter<void> = new EventEmitter<void>()

  public pan: { x: number; y: number } = { x: 50, y: 0 }
  public zoom: number = 2

  public contextMenu!: ContextMenu

  public ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this.setup()
    this.draw()

    this.setupContextMenu()
  }

  private setupContextMenu() {
    this.contextMenu = new ContextMenu()

    const createGraph = () => this.onCreateGraph.emit()
    createGraph.apply(this)

    const createNode = () => {}
    createNode.apply(this)

    this.contextMenu.addOption(
      'global',
      'create-graph',
      'Create graph',
      createGraph
    )

    this.contextMenu.addOption(
      'graph',
      'create-node',
      'Create node',
      createNode
    )
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

    if (this.contextMenu?.isShown) this.contextMenu.draw(this.ctx)

    this.ctx.restore()

    requestAnimationFrame(() => this.draw())
  }

  public isInBounds(value: number, min: number, max: number, pan: number) {
    return value > pan + min * this.zoom && value < pan + max * this.zoom
  }

  public onMouseMove(e: MouseEvent) {
    if (e.buttons == 4) {
      this.pan.x += e.movementX
      this.pan.y += e.movementY

      return
    }

    if (
      this.isInBounds(
        e.clientX,
        this.contextMenu.rect.x,
        this.contextMenu.rect.x + this.contextMenu.rect.w,
        this.pan.x
      ) &&
      this.isInBounds(
        e.clientY,
        this.contextMenu.rect.y,
        this.contextMenu.rect.y + this.contextMenu.rect.h,
        this.pan.y
      )
    )
      this.contextMenu.onMouseMove([
        Math.floor(
          (e.clientX - (this.pan.x + this.contextMenu.rect.x * this.zoom)) /
            this.zoom
        ),
        Math.floor(
          (e.clientY - (this.pan.y + this.contextMenu.rect.y * this.zoom)) /
            this.zoom
        ),
      ])
    else this.contextMenu.highlightedOption = undefined

    this.highlightedGraph = undefined

    this.visualGraphs.forEach((graph) => {
      if (
        this.isInBounds(
          e.clientX,
          graph.rect.x,
          graph.rect.x + graph.rect.w,
          this.pan.x
        ) &&
        this.isInBounds(
          e.clientY,
          graph.rect.y,
          graph.rect.y + graph.rect.h,
          this.pan.y
        )
      ) {
        this.highlightedGraph = graph

        if (this.selectedGraph?.graph.id === graph.graph.id)
          graph.onMouseMove(
            [
              Math.floor(
                (e.clientX - (this.pan.x + graph.rect.x * this.zoom)) /
                  this.zoom
              ),
              Math.floor(
                (e.clientY - (this.pan.y + graph.rect.y * this.zoom)) /
                  this.zoom
              ),
            ],
            [e.movementX / this.zoom, e.movementY / this.zoom],
            e
          )
      }
    })
  }

  public onScroll(e: WheelEvent) {
    this.zoom -= e.deltaY * 0.001
  }

  public onDoubleClick() {
    if (!this.highlightedGraph) return

    this.onSelect.emit(this.highlightedGraph.graph.id)
  }

  public onContextMenu(e: MouseEvent) {
    e.preventDefault()

    if (this.highlightedGraph) this.contextMenu.changeCollection('graph')
    else this.contextMenu.changeCollection('global')

    this.contextMenu.show([
      (e.clientX - this.pan.x) / this.zoom,
      (e.clientY - this.pan.y) / this.zoom,
    ])
  }

  public onMouseDown(e: MouseEvent) {
    e.preventDefault()

    if (
      this.isInBounds(
        e.clientX,
        this.contextMenu.rect.x,
        this.contextMenu.rect.x + this.contextMenu.rect.w,
        this.pan.x
      ) &&
      this.isInBounds(
        e.clientY,
        this.contextMenu.rect.y,
        this.contextMenu.rect.y + this.contextMenu.rect.h,
        this.pan.y
      )
    )
      this.contextMenu.onMouseDown()
    else this.contextMenu.hide()
  }
}
