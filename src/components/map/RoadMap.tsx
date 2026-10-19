import React, { useEffect, useRef } from 'react'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { Radio } from 'lucide-react'
import type { Case } from '../../types'
import { priorityColors, priorityNames } from '../../data/initialCases'

// Fix Leaflet default icon paths broken by bundlers (Vite/Webpack)
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

export function RoadMap({
  cases,
  onCase,
  large = false,
}: {
  cases: Case[]
  onCase: (item: Case) => void
  large?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const pins = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (!ref.current) return
    map.current = L.map(ref.current, { zoomControl: false }).setView([3.151, 101.684], 12)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map.current)

    L.control.zoom({ position: 'topright' }).addTo(map.current)
    pins.current = L.layerGroup().addTo(map.current)

    const observer = new ResizeObserver(() => map.current?.invalidateSize())
    observer.observe(ref.current)

    return () => {
      observer.disconnect()
      map.current?.remove()
      map.current = null
    }
  }, [])

  useEffect(() => {
    pins.current?.clearLayers()
    cases.forEach((item) => {
      const color = priorityColors[item.priority - 1] || '#E53935'
      const marker = L.marker([item.lat, item.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="width:27px;height:27px;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${color};box-shadow:0 2px 7px #17253e35;display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:10px;font-weight:700;color:white">${item.priority}</span></div>`,
          iconSize: [27, 32],
          iconAnchor: [14, 30],
        }),
      })

      const popup = document.createElement('div')
      popup.innerHTML = `<b>${item.id} · ${item.issue}</b><p style="margin:7px 0;color:#6b778b">${item.road}, ${item.area}</p><p>P${item.priority} ${priorityNames[item.priority - 1]} · ${item.status}</p>`

      const button = document.createElement('button')
      button.textContent = 'View Case →'
      button.style.cssText =
        'background:#1769E0;color:white;padding:7px 12px;border-radius:6px;margin-top:10px;width:100%;cursor:pointer;'
      button.onclick = () => onCase(item)
      popup.append(button)

      marker.bindPopup(popup)
      pins.current?.addLayer(marker)
    })
  }, [cases, onCase])

  return (
    <div
      className={`relative ${
        large ? 'h-[calc(100vh-255px)] min-h-[500px]' : 'h-[370px]'
      } overflow-hidden rounded-b-lg`}
    >
      <div ref={ref} className="absolute inset-0 z-0" />
      <div className="absolute bottom-6 left-4 z-[400] flex flex-wrap gap-3 rounded-lg border border-white bg-white/95 px-3 py-2.5 shadow-sm">
        {[5, 4, 3, 2, 1].map((value) => (
          <span key={value} className="flex items-center gap-1.5 text-[10px] font-medium text-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: priorityColors[value - 1] }}
            />
            P{value} {priorityNames[value - 1]}
          </span>
        ))}
      </div>
      <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 rounded-md bg-white px-3 py-2 text-[11px] shadow-sm font-medium text-foreground">
        <Radio size={13} className="text-primary" /> {cases.length} mapped cases
      </div>
    </div>
  )
}

