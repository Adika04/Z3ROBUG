import React from 'react'
import { useNavigate } from 'react-router'
import { Radio } from 'lucide-react'
import { RoadMap } from '../components/map/RoadMap'
import { CaseFilters } from '../components/cases/CaseFilters'
import { Panel, Heading } from '../components/common/Panel'
import { useCases } from '../context/CaseContext'
import { useLanguage } from '../context/LanguageContext'

export function MapViewPage() {
  const navigate = useNavigate()
  const { filteredCases } = useCases()
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <Panel>
        <CaseFilters />
      </Panel>

      <Panel>
        <Heading
          title={t('Interactive District Road Hazard Map', 'Peta Interaktif Kerosakan Jalan Daerah')}
          subtitle={t(
            'Top-down 2D OpenStreetMap geospatial view with color-coded severity markers',
            'Paparan geospatial 2D OpenStreetMap dengan penanda keterukan mengikut warna'
          )}
          action={
            <div className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-teal-ink">
              <Radio size={13} className="animate-pulse" />
              <span>LIVE GIS</span>
            </div>
          }
        />
        <RoadMap
          cases={filteredCases}
          onCase={(item) => navigate(`/cases/${item.id}`)}
          large
        />
      </Panel>
    </div>
  )
}

