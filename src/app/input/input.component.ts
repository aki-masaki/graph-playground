import { Component, EventEmitter, Input, Output } from '@angular/core'

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [],
  templateUrl: './input.component.html',
  styleUrl: './input.component.sass',
})
export class InputComponent {
  @Input()
  public value?: string | number

  @Input()
  public label?: string

  @Output()
  public onValueChange: EventEmitter<string> = new EventEmitter()

  public onInputChange(event: Event) {
    const value = (event.currentTarget as HTMLInputElement).value

    this.onValueChange.emit(value)
  }
}
