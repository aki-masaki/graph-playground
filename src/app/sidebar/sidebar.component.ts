import { Component, EventEmitter, Input, Output } from '@angular/core'
import { VisualGraph } from '../models/visual-graph.model'
import { InputComponent } from '../input/input.component'
import {IconButtonComponent} from '../icon-button/icon-button.component'

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [InputComponent, IconButtonComponent],
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

  @Output()
  public onCreateGraph: EventEmitter<void> = new EventEmitter<void>()
  @Output()
  public onDeleteGraph: EventEmitter<number> = new EventEmitter<number>()

  public parseInt(value: string) {
    return parseInt(value)
  }
}
