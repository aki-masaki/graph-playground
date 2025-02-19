import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
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

  public ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext(
      '2d',
    ) as CanvasRenderingContext2D

    this.draw()
  }

  public draw() {
    if (!this.ctx) return

    this.ctx.clearRect(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height,
    )

    this.visualGraphs.forEach((graph) => graph.draw(this.ctx!!))
  }
}
