import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ProjectActions from '@/components/project-actions'

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: project } = await supabase
    .from('projects')
    .select('*, project_elements(*, references(*))')
    .eq('id', params.id)
    .single()

  if (!project) redirect('/dashboard')

  return (
    <main className="flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="flex items-center gap-4 px-6 py-3 bg-white border-b border-gray-100">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          ← Projets
        </Link>
        <h1 className="font-semibold text-gray-800 truncate">{project.nom}</h1>
        <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
          project.statut === 'completed' ? 'bg-green-100 text-green-700' :
          project.statut === 'sent' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {project.statut === 'completed' ? 'Terminé' :
           project.statut === 'sent' ? 'Envoyé' : 'Brouillon'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-gray-50 flex items-center justify-center p-6 overflow-auto">
          {project.photo_originale_url ? (
            <img
              src={project.photo_originale_url}
              alt={project.nom}
              className="max-w-full max-h-full rounded-xl shadow-md object-contain"
            />
          ) : (
            <div className="text-gray-400 text-center">
              <div className="text-5xl mb-2">🏠</div>
              <p className="text-sm">Aucune photo</p>
            </div>
          )}
        </div>

        <div className="w-80 bg-white border-l border-gray-100 flex flex-col overflow-hidden">
          <ProjectActions project={project} />
        </div>
      </div>
    </main>
  )
}
