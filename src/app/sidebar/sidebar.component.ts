import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core'
import { VisualGraph } from '../models/visual-graph.model'
import { InputComponent } from '../input/input.component'
import { IconButtonComponent } from '../icon-button/icon-button.component'

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

  @Output()
  public onSaveFile: EventEmitter<[string, string]> = new EventEmitter<
    [string, string]
  >()
  @Output()
  public onOpenFile: EventEmitter<[string, string]> = new EventEmitter<
    [string, string]
  >()
  @Output()
  public onResetFile: EventEmitter<void> = new EventEmitter<void>()

  public fileName: string = 'Graph'

  @ViewChild('fileInput')
  private fileInput!: ElementRef<HTMLInputElement>

  public openFilePicker() {
    this.fileInput.nativeElement.click()
  }

  public onFileChange() {
    this.fileName = this.fileInput.nativeElement.files?.[0].name.replace('.json', '') ?? 'Graph'

    this.fileInput.nativeElement.files?.[0]
      .text()
      .then((text) => this.onOpenFile.emit(['disk', text]))
  }

  public parseInt(value: string) {
    return parseInt(value)
  }
}
