import { Component, ElementRef, Input, ViewChild } from '@angular/core'
import { Graph } from '../models/graph'
import { VisualGraph } from '../models/visual-graph.model'

@Component({
  selector: 'app-canvas',
  standalone: true,
  imports: [],
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.sass',
})
export class CanvasComponent {
  @ViewChild('canvas')
  public canvas!: ElementRef<HTMLCanvasElement>
  public ctx?: CanvasRenderingContext2D

  @Input()
  public graphs!: Map<number, Graph>

  @Input()
  public visualGraphs!: Map<number, VisualGraph>

  public ngOnAfterInit() {
    this.ctx = this.canvas.nativeElement.getContext(
      '2d',
    ) as CanvasRenderingContext2D
  }
}
