import { Rect } from '../interfaces/rect'

const OPTION_HEIGHT = 25

export interface ContextMenuOption {
  id: string
  label: string
  onClick: (data: any) => void
}

export class ContextMenu {
  public isShown: boolean = true

  public collections: Map<string, ContextMenuOption[]>
  public activeCollection?: string

  public rect: Rect = { x: 0, y: 0, w: 100, h: 0 }

  public highlightedOption?: number

  public data?: any

  public constructor() {
    this.collections = new Map()
  }

  public addOption(
    collectionId: string,
    id: string,
    label: string,
    onClick: (data: any) => void,
  ) {
    const collection = this.collections.get(collectionId)

    if (!collection) this.collections.set(collectionId, [])

    this.collections.get(collectionId)!.push({
      id,
      label,
      onClick,
    })
  }

  public show(coords: [number, number]) {
    this.rect.x = coords[0]
    this.rect.y = coords[1]

    this.isShown = true
  }

  public changeCollection(collection: string) {
    this.rect.h = this.collections.get(collection)!.length * OPTION_HEIGHT

    this.activeCollection = collection
  }

  public setData(data: any) {
    this.data = data
  }

  public hide() {
    this.isShown = false
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save()

    ctx.fillStyle = '#1e1d21'

    ctx.beginPath()
    ctx.roundRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 5)
    ctx.fill()

    this.collections
      .get(this.activeCollection || '')
      ?.forEach((option, index) => {
        if (this.highlightedOption === index) {
          ctx.fillStyle = 'white'

          ctx.beginPath()
          ctx.roundRect(
            this.rect.x + 3,
            this.rect.y + index * OPTION_HEIGHT + 3,
            this.rect.w - 6,
            OPTION_HEIGHT - 6,
            5,
          )
          ctx.fill()
        }

        ctx.fillStyle = this.highlightedOption === index ? 'black' : 'white'
        ctx.textBaseline = 'middle'

        ctx.fillText(
          option.label,
          this.rect.x + 5,
          this.rect.y + index * OPTION_HEIGHT + OPTION_HEIGHT / 2,
        )
      })

    ctx.restore()
  }

  public onMouseMove(relCoords: [number, number]) {
    this.highlightedOption = Math.floor(relCoords[1] / OPTION_HEIGHT)
  }

  public onMouseDown() {
    if (!this.isShown || this.highlightedOption === undefined) return

    this.collections
      .get(this.activeCollection ?? '')
      ?.[this.highlightedOption].onClick(this.data)

    this.hide()
  }
}
