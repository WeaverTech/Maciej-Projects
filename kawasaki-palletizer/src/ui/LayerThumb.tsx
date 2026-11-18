import { placementRect } from '../core/geometry'
import type { Pallet, Placement, Product } from '../core/types'

interface LayerThumbProps {
  pallet: Pallet
  product: Product
  items: Placement[]
  width: number
  height: number
  layer?: 'A' | 'B'
  showOrders?: boolean
  /** Kolor wypełnienia dla wybranych numerów produktów (np. sekcje chwytaka). */
  colorByOrder?: (order: number) => string | undefined
  labelByOrder?: (order: number) => string | undefined
  className?: string
}

/** Statyczna miniatura warstwy (generator, edytor cykli, raport). */
export function LayerThumb({ pallet, product, items, width, height, layer = 'A', showOrders = true, colorByOrder, labelByOrder, className }: LayerThumbProps) {
  const rects = items.map((i) => ({ item: i, rect: placementRect(i, product) }))
  let minX = 0
  let minY = 0
  let maxX = pallet.length
  let maxY = pallet.width
  for (const { rect } of rects) {
    minX = Math.min(minX, rect.x1)
    minY = Math.min(minY, rect.y1)
    maxX = Math.max(maxX, rect.x2)
    maxY = Math.max(maxY, rect.y2)
  }
  const pad = 6
  const scale = Math.min((width - 2 * pad) / (maxX - minX), (height - 2 * pad) / (maxY - minY))
  const ox = (width - (maxX - minX) * scale) / 2 - minX * scale
  const oy = (height - (maxY - minY) * scale) / 2 - minY * scale
  const fill = layer === 'A' ? 'var(--item-a)' : 'var(--item-b)'
  const edge = layer === 'A' ? 'var(--item-a-edge)' : 'var(--item-b-edge)'
  const text = layer === 'A' ? 'var(--item-a-text)' : 'var(--item-b-text)'

  return (
    <svg width={width} height={height} className={className} role="img" aria-label={`Podgląd układu: ${items.length} szt.`}>
      <rect x={ox} y={oy} width={pallet.length * scale} height={pallet.width * scale} rx={3} fill="var(--pallet)" stroke="var(--pallet-edge)" strokeWidth={1} />
      {rects.map(({ item, rect }) => {
        const w = (rect.x2 - rect.x1) * scale
        const h = (rect.y2 - rect.y1) * scale
        const custom = colorByOrder?.(item.order)
        const label = labelByOrder?.(item.order) ?? String(item.order)
        return (
          <g key={item.id}>
            <rect
              x={ox + rect.x1 * scale + 0.75}
              y={oy + rect.y1 * scale + 0.75}
              width={Math.max(1, w - 1.5)}
              height={Math.max(1, h - 1.5)}
              rx={product.kind === 'worek' ? Math.min(5, h * 0.2) : 1.5}
              fill={custom ?? fill}
              stroke={custom ? 'rgba(0,0,0,0.25)' : edge}
              strokeWidth={1}
            />
            {showOrders && Math.min(w, h) >= 13 && (
              <text
                x={ox + ((rect.x1 + rect.x2) / 2) * scale}
                y={oy + ((rect.y1 + rect.y2) / 2) * scale}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={Math.max(8, Math.min(13, Math.min(w, h) * 0.42))}
                fontWeight={700}
                fill={custom ? '#fff' : text}
              >
                {label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
