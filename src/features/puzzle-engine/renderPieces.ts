import type { TierId } from '../../core/constants/tiers'
import {
  getGridDimensions,
  getPieceEdges,
  type PieceEdges,
} from './engineMath'

export const LOGICAL_BOARD_SIZE = 600

export interface RenderedPuzzlePiece {
  id: string
  index: number
  row: number
  column: number
  imageUrl: string
  correctLeft: number
  correctTop: number
  logicalWidth: number
  logicalHeight: number
  targetCenterX: number
  targetCenterY: number
}

function loadImage(sourceUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Puzzle image could not be loaded'))
    image.src = sourceUrl
  })
}

function traceEdge(
  context: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  normalX: number,
  normalY: number,
  edge: -1 | 0 | 1,
  tabSize: number,
): void {
  if (edge === 0) {
    context.lineTo(endX, endY)
    return
  }

  const deltaX = endX - startX
  const deltaY = endY - startY
  const point = (progress: number) => ({
    x: startX + deltaX * progress,
    y: startY + deltaY * progress,
  })
  const first = point(0.34)
  const second = point(0.66)
  const controlOne = point(0.39)
  const controlTwo = point(0.61)
  const peakX = normalX * tabSize * edge
  const peakY = normalY * tabSize * edge

  context.lineTo(first.x, first.y)
  context.bezierCurveTo(
    controlOne.x + peakX,
    controlOne.y + peakY,
    controlTwo.x + peakX,
    controlTwo.y + peakY,
    second.x,
    second.y,
  )
  context.lineTo(endX, endY)
}

function traceJigsawPath(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  edges: PieceEdges,
  tabSize: number,
): void {
  context.beginPath()
  context.moveTo(x, y)
  traceEdge(context, x, y, x + width, y, 0, -1, edges.top, tabSize)
  traceEdge(
    context,
    x + width,
    y,
    x + width,
    y + height,
    1,
    0,
    edges.right,
    tabSize,
  )
  traceEdge(
    context,
    x + width,
    y + height,
    x,
    y + height,
    0,
    1,
    edges.bottom,
    tabSize,
  )
  traceEdge(context, x, y + height, x, y, -1, 0, edges.left, tabSize)
  context.closePath()
}

function renderPiece(
  image: HTMLImageElement,
  tierId: TierId,
  row: number,
  column: number,
  rows: number,
  columns: number,
  pixelRatio: number,
): RenderedPuzzlePiece {
  const cellWidth = LOGICAL_BOARD_SIZE / columns
  const cellHeight = LOGICAL_BOARD_SIZE / rows
  const isSimplePiece = tierId === 'tiny_tots'
  const tabSize = Math.min(cellWidth, cellHeight) * 0.2
  const margin = isSimplePiece ? 2 : tabSize * 1.15
  const logicalWidth = cellWidth + margin * 2
  const logicalHeight = cellHeight + margin * 2
  const canvas = document.createElement('canvas')
  canvas.width = Math.ceil(logicalWidth * pixelRatio)
  canvas.height = Math.ceil(logicalHeight * pixelRatio)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable')
  context.scale(pixelRatio, pixelRatio)

  if (isSimplePiece) {
    context.beginPath()
    context.roundRect(
      margin,
      margin,
      cellWidth,
      cellHeight,
      Math.min(cellWidth, cellHeight) * 0.08,
    )
  } else {
    traceJigsawPath(
      context,
      margin,
      margin,
      cellWidth,
      cellHeight,
      getPieceEdges(row, column, { rows, columns }),
      tabSize,
    )
  }

  context.save()
  context.clip()
  context.drawImage(
    image,
    margin - column * cellWidth,
    margin - row * cellHeight,
    LOGICAL_BOARD_SIZE,
    LOGICAL_BOARD_SIZE,
  )
  context.restore()
  context.strokeStyle = 'rgba(44, 35, 48, 0.42)'
  context.lineWidth = Math.max(1.2, Math.min(cellWidth, cellHeight) * 0.012)
  context.stroke()

  const index = row * columns + column
  return {
    id: `piece-${index}`,
    index,
    row,
    column,
    imageUrl: canvas.toDataURL('image/webp', 0.9),
    correctLeft: column * cellWidth - margin,
    correctTop: row * cellHeight - margin,
    logicalWidth,
    logicalHeight,
    targetCenterX: column * cellWidth + cellWidth / 2,
    targetCenterY: row * cellHeight + cellHeight / 2,
  }
}

export async function renderPuzzlePieces(
  sourceUrl: string,
  pieceCount: number,
  tierId: TierId,
): Promise<RenderedPuzzlePiece[]> {
  const image = await loadImage(sourceUrl)
  const { rows, columns } = getGridDimensions(
    pieceCount,
    image.naturalWidth / image.naturalHeight,
  )
  const pixelRatio = Math.min(
    window.devicePixelRatio || 1,
    pieceCount >= 40 ? 1 : 2,
  )
  return Array.from({ length: pieceCount }, (_, index) =>
    renderPiece(
      image,
      tierId,
      Math.floor(index / columns),
      index % columns,
      rows,
      columns,
      pixelRatio,
    ),
  )
}
