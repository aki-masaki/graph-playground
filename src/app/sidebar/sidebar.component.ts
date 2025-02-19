import { Component, EventEmitter, Input, Output } from '@angular/core'
import { VisualGraph } from '../models/visual-graph.model'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.sass',
})
export class SidebarComponent {
  @Input()
  public selectedGraph?: VisualGraph

  @Input()
  public visualGraphs!: Map<number, VisualGraph>

  @Output()
  public onSelect: EventEmitter<number> = new EventEmitter<number>()
}
