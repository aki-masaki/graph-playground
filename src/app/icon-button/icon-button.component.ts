import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [],
  templateUrl: './icon-button.component.html',
  styleUrl: './icon-button.component.sass',
})
export class IconButtonComponent {
  @Input()
  public icon!: string

  @Output()
  public onClick: EventEmitter<void> = new EventEmitter<void>()
}
