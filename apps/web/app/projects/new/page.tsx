'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewProjectPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [nom, setNom] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Seules les images sont acceptées (JPG, PNG, WEBP)')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('Image trop lourde (max 20 Mo)')
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setError('')
    if (!nom) setNom(f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '))
  }, [nom])

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !nom.trim()) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('user-photos')
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError('Erreur upload : ' + uploadError.message)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('user-photos')
      .getPublicUrl(path)

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({ user_id: user.id, nom: nom.trim(), photo_originale_url: publicUrl, statut: 'draft' })
      .select()
      .single()

    if (insertError || !project) {
      setError('Erreur création projet : ' + (insertError?.message ?? ''))
      setLoading(false)
      return
    }

    router.push(`/projects/${project.id}`)
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Retour aux projets
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">Nouveau projet</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du projet
          </label>
          <input
            type="text"
            value={nom}
            onChange={e => setNom(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Ma cuisine"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo de la cuisine
          </label>
          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => document.getElementById('file-input')?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-300'
            }`}
          >
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Aperçu"
                  className="max-h-56 mx-auto rounded-lg object-contain"
                />
                <p className="text-xs text-gray-400 mt-2">Cliquez pour changer</p>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📷</div>
                <p className="text-sm text-gray-600 font-medium">
                  Glissez une photo ou cliquez pour choisir
                </p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — max 20 Mo</p>
              </>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={!file || !nom.trim() || loading}
          className="w-full py-3 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-600 disabled:opacity-40 transition-colors"
        >
          {loading ? 'Création en cours...' : 'Créer le projet →'}
        </button>
      </form>
    </main>
  )
}
