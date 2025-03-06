import { Rect } from '../interfaces/rect'

const SIZE_HANDLER_RADIUS = 10
const SIZE_HANDLER_MARGIN = 18
export const SIZE_HANDLER_THRESHOLD =
  SIZE_HANDLER_MARGIN + SIZE_HANDLER_RADIUS * 2

export const FONT = 'bold 20px Lato'

const SIZE_LIMITS = [
  [150, 300],
  [700, 700],
]

export class VisualModal {
  public id!: number
  public rect!: Rect

  public title!: string

  private highlightedSizeDirection: [number, number] = [0, 0]

  private activeInteraction: 'move' | 'resize' | 'none' = 'none'

  protected performActiveInteraction(delta: [number, number]): boolean {
    if (this.activeInteraction === 'resize')
      this.resize(this.highlightedSizeDirection, delta)
    else if (this.activeInteraction === 'move') this.move(delta[0], delta[1])

    return this.activeInteraction !== 'none'
  }

  public constructor(
    rect: Rect = { x: 0, y: 0, w: 300, h: 350 },
    title: string = 'Modal',
    id: number,
  ) {
    this.id = id
    this.rect = rect
    this.title = title
  }

  private drawContainer(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false,
  ) {
    ctx.fillStyle = '#3a332f'
    ctx.strokeStyle = isSelected
      ? '#56abd8'
      : isHighlighted
        ? '#565656'
        : '#3a332f'

    ctx.lineWidth = 5

    ctx.beginPath()

    ctx.roundRect(this.rect.x, this.rect.y, this.rect.w, this.rect.h, 20)

    ctx.stroke()
    ctx.fill()

    ctx.lineWidth = 3

    this.drawSizeHandlers(ctx)
  }

  private drawSizeHandlers(ctx: CanvasRenderingContext2D) {
    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === 1 &&
      this.highlightedSizeDirection[1] === 1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + this.rect.w - SIZE_HANDLER_MARGIN,
      this.rect.y + this.rect.h - SIZE_HANDLER_MARGIN,
      SIZE_HANDLER_RADIUS,
      0,
      Math.PI / 2,
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === -1 &&
      this.highlightedSizeDirection[1] === 1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + SIZE_HANDLER_MARGIN,
      this.rect.y + this.rect.h - SIZE_HANDLER_MARGIN,
      10,
      Math.PI / 2,
      Math.PI,
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === -1 &&
      this.highlightedSizeDirection[1] === -1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + SIZE_HANDLER_MARGIN,
      this.rect.y + SIZE_HANDLER_MARGIN,
      10,
      Math.PI,
      (3 * Math.PI) / 2,
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'

    if (
      this.highlightedSizeDirection[0] === 1 &&
      this.highlightedSizeDirection[1] === -1
    )
      ctx.strokeStyle = 'white'

    ctx.beginPath()
    ctx.arc(
      this.rect.x + this.rect.w - SIZE_HANDLER_MARGIN,
      this.rect.y + SIZE_HANDLER_MARGIN,
      10,
      (3 * Math.PI) / 2,
      Math.PI * 2,
    )
    ctx.stroke()

    ctx.strokeStyle = '#776f76'
  }

  private drawTitle(ctx: CanvasRenderingContext2D, title: string | undefined) {
    if (title) this.title = title

    const textWidth = ctx.measureText(this.title).width

    ctx.fillStyle = 'white'
    ctx.font = FONT

    ctx.fillText(
      this.title,
      this.rect.x + this.rect.w / 2 - textWidth,
      this.rect.y + 30,
    )
  }

  public draw(
    ctx: CanvasRenderingContext2D,
    isSelected: boolean = false,
    isHighlighted: boolean = false,
    title: string | undefined,
  ) {
    ctx.save()

    this.drawContainer(ctx, isSelected, isHighlighted)
    this.drawTitle(ctx, title)

    ctx.restore()
  }

  public onMouseMove(relCoords: [number, number], delta: [number, number]) {
    if (this.activeInteraction !== 'none') {
      this.performActiveInteraction(delta)

      return
    }

    const xDirection =
      relCoords[0] > 0 && relCoords[0] < SIZE_HANDLER_THRESHOLD
        ? -1
        : relCoords[0] > this.rect.w - SIZE_HANDLER_THRESHOLD &&
            relCoords[0] < this.rect.w
          ? 1
          : 0

    const yDirection =
      relCoords[1] > 0 && relCoords[1] < SIZE_HANDLER_THRESHOLD
        ? -1
        : relCoords[1] > this.rect.h - SIZE_HANDLER_THRESHOLD &&
            relCoords[1] < this.rect.h
          ? 1
          : 0

    this.highlightedSizeDirection = [xDirection, yDirection]
  }

  public onMouseUp() {
    this.activeInteraction = 'none'
  }

  public onMouseDown(isOverContent: boolean = false) {
    if (!this.highlightedSizeDirection.includes(0))
      this.activeInteraction = 'resize'
    else if (!isOverContent) this.activeInteraction = 'move'
  }

  public move(deltaX: number, deltaY: number) {
    this.rect.x += deltaX
    this.rect.y += deltaY

    this.rect.x = Math.floor(this.rect.x)
    this.rect.y = Math.floor(this.rect.y)
  }

  public resize(direction: [number, number], delta: [number, number]) {
    console.log(delta, this.rect.w + delta[0], SIZE_LIMITS[1][0])

    if (
      this.rect.w + delta[0] >= SIZE_LIMITS[0][0] &&
      this.rect.w + delta[0] <= SIZE_LIMITS[1][0]
    ) {
      if (direction[0] === 1) this.rect.w += delta[0]
      else if (direction[0] === -1) {
        this.rect.x += delta[0]
        this.rect.w -= delta[0]
      }
    }

    if (
      this.rect.h + delta[1] >= SIZE_LIMITS[0][1] &&
      this.rect.h + delta[1] <= SIZE_LIMITS[1][1]
    ) {
      if (direction[1] === 1) this.rect.h += delta[1]
      else if (direction[1] === -1) {
        this.rect.y += delta[1]
        this.rect.h -= delta[1]
      }
    }

    this.rect.x = Math.round(this.rect.x)
    this.rect.y = Math.round(this.rect.y)
    this.rect.w = Math.round(this.rect.w)
    this.rect.h = Math.round(this.rect.h)
  }
}
