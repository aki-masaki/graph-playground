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
import {
  HEADER_HEIGHT,
  VisualGraph,
  VisualNode,
} from '../models/visual-graph.model'
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

  public interactingGraph?: VisualGraph

  @Output()
  public onSelect: EventEmitter<number> = new EventEmitter<number>()

  @Output()
  public onCreateGraph: EventEmitter<[number, number]> = new EventEmitter<
    [number, number]
  >()
  @Output()
  public onDeleteGraph: EventEmitter<number> = new EventEmitter<number>()

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

    this.contextMenu.addOption(
      'global',
      'create-graph',
      'Create graph',
      ([mouseX, mouseY]) =>
        this.onCreateGraph.emit([
          (mouseX - this.pan.x) / this.zoom,
          (mouseY - this.pan.y) / this.zoom,
        ])
    )

    this.contextMenu.addOption(
      'graph',
      'create-node',
      'Create node',
      ([graphId, [mouseX, mouseY]]) => {
        const relCoords: [number, number] = [
          Math.floor(
            (mouseX -
              (this.pan.x +
                this.visualGraphs.get(graphId)!.rect.x * this.zoom)) /
              this.zoom
          ),
          Math.floor(
            (mouseY -
              (this.pan.y +
                this.visualGraphs.get(graphId)!.rect.y * this.zoom)) /
              this.zoom
          ) - HEADER_HEIGHT,
        ]

        this.visualGraphs.get(graphId)!.addNode(undefined, relCoords)
      }
    )

    this.contextMenu.addOption(
      'graph',
      'delete-graph',
      'Delete graph',
      ([graphId]) => this.onDeleteGraph.emit(graphId)
    )

    this.contextMenu.addOption(
      'graph',
      'delete-all-nodes',
      'Delete all nodes',
      ([graphId]) => this.visualGraphs.get(graphId)!.removeAllNodes()
    )

    this.contextMenu.addOption(
      'node',
      'delete-node',
      'Delete node',
      ([graphId, nodeId]) => this.visualGraphs.get(graphId)!.removeNode(nodeId)
    )

    this.contextMenu.addOption(
      'node',
      'connect',
      'Connect',
      ([graphId, nodeId]) =>
        this.visualGraphs.get(graphId)!.enableConnectMode(nodeId)
    )

    this.contextMenu.addOption(
      'node',
      'disconnect',
      'Disconnect',
      ([graphId, nodeId]) =>
        this.visualGraphs.get(graphId)!.enableConnectMode(nodeId, true)
    )
  }

  private drawBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  }

  private drawGrid(ctx: CanvasRenderingContext2D) {
    const dotDistance = Math.max(30, 50 * this.zoom)

    for (let i = 0; i < ctx.canvas.width / dotDistance; i++) {
      for (let j = 0; j < ctx.canvas.height / dotDistance; j++) {
        ctx.beginPath()
        ctx.fillStyle = '#2b2a2a'

        ctx.arc(
          i * dotDistance + (this.pan.x % dotDistance),
          j * dotDistance + (this.pan.y % dotDistance),
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

    this.interactingGraph?.onMouseMove(
      [
        Math.floor(
          (e.clientX - (this.pan.x + this.interactingGraph.rect.x * this.zoom)) / this.zoom
        ),
        Math.floor(
          (e.clientY - (this.pan.y + this.interactingGraph.rect.y * this.zoom)) / this.zoom
        ),
      ],
      [e.movementX / this.zoom, e.movementY / this.zoom],
      e
    )

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
      }
    })
  }

  public onScroll(e: WheelEvent) {
    this.zoom -= e.deltaY * 0.001

    this.pan.x -= e.deltaY * 0.01 + e.clientX / this.canvas.nativeElement.width
    this.pan.y -= e.deltaY * 0.01 - e.clientY / this.canvas.nativeElement.height
  }

  public onDoubleClick() {
    if (!this.highlightedGraph) {
      this.onSelect.emit(-1)

      return
    }

    this.onSelect.emit(this.highlightedGraph.graph.id)
  }

  public onContextMenu(e: MouseEvent) {
    e.preventDefault()

    if (this.selectedGraph?.highlightedNode) {
      this.contextMenu.setData([
        this.selectedGraph.graph.id,
        this.selectedGraph.highlightedNode.id,
      ])
      this.contextMenu.changeCollection('node')
    } else if (this.highlightedGraph) {
      this.contextMenu.setData([
        this.highlightedGraph.graph.id,
        [e.clientX, e.clientY],
      ])
      this.contextMenu.changeCollection('graph')
    } else {
      this.contextMenu.setData([e.clientX, e.clientY])
      this.contextMenu.changeCollection('global')
    }

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

    this.highlightedGraph?.onMouseDown(e)
    this.interactingGraph = this.highlightedGraph
  }

  public onMouseUp(e: MouseEvent) {
    e.preventDefault()

    this.interactingGraph?.onMouseUp()
  }

  public serialize() {
    return {
      pan: this.pan,
      zoom: this.zoom,
    }
  }

  public import(data: { pan: { x: number; y: number }; zoom: number }) {
    this.reset()

    this.pan = data.pan
    this.zoom = data.zoom
  }

  public reset() {
    this.highlightedGraph = undefined
    this.selectedNode = undefined
    this.selectedGraph = undefined

    this.pan = { x: 0, y: 0 }
    this.zoom = 1
  }
}
