'use client'

import { useState } from 'react'
import Link from 'next/link'

type Element = {
  id: string
  type_element: string
  surface_m2: number | null
  references: { nom_commercial: string | null; code: string } | null
}

type Project = {
  id: string
  nom: string
  photo_originale_url: string | null
  statut: string
  project_elements: Element[]
}

const ELEMENT_LABELS: Record<string, string> = {
  upper_cabinet: 'Meuble haut',
  lower_cabinet: 'Meuble bas',
  drawer: 'Tiroir',
  worktop: 'Plan de travail',
  backsplash: 'Crédence',
  island: 'Îlot',
  side_panel: 'Panneau latéral',
  hood_casing: 'Habillage hotte',
}

export default function ProjectActions({ project }: { project: Project }) {
  const [simulating, setSimulating] = useState(false)
  const [elements, setElements] = useState<Element[]>(project.project_elements ?? [])

  const simulateSegmentation = async () => {
    setSimulating(true)
    await new Promise(r => setTimeout(r, 1500))
    setElements([
      { id: '1', type_element: 'upper_cabinet', surface_m2: 2.4, references: null },
      { id: '2', type_element: 'lower_cabinet', surface_m2: 3.1, references: null },
      { id: '3', type_element: 'backsplash', surface_m2: 1.2, references: null },
    ])
    setSimulating(false)
  }

  const totalSurface = elements.reduce((acc, el) => acc + (el.surface_m2 ?? 0), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Éléments détectés
        </p>
        {elements.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-400 mb-4">
              Lancez la segmentation pour détecter les éléments de votre cuisine.
            </p>
            <button
              onClick={simulateSegmentation}
              disabled={simulating || !project.photo_originale_url}
              className="w-full py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors"
            >
              {simulating ? 'Analyse en cours...' : '✨ Segmenter la photo'}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {elements.map(el => (
              <div
                key={el.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {ELEMENT_LABELS[el.type_element] ?? el.type_element}
                  </p>
                  {el.surface_m2 && (
                    <p className="text-xs text-gray-400">{el.surface_m2.toFixed(1)} m²</p>
                  )}
                </div>
                {el.references ? (
                  <span className="text-xs text-brand-600 font-medium">
                    {el.references.nom_commercial ?? el.references.code}
                  </span>
                ) : (
                  <Link
                    href="/catalogue"
                    className="text-xs text-gray-400 hover:text-brand-500 transition-colors"
                  >
                    Choisir →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {elements.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Surface totale estimée</span>
            <span className="font-semibold text-gray-800">{totalSurface.toFixed(1)} m²</span>
          </div>
        </div>
      )}

      <div className="p-4 mt-auto">
        <button
          disabled={elements.length === 0}
          className="w-full py-2.5 border border-brand-500 text-brand-500 rounded-lg text-sm font-medium hover:bg-brand-50 disabled:opacity-30 transition-colors"
        >
          Générer un devis
        </button>
      </div>
    </div>
  )
}
