import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-brand-900">Mes projets</h1>
        <Link
          href="/projects/new"
          className="px-4 py-2 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
        >
          + Nouveau projet
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {project.photo_originale_url ? (
                <img
                  src={project.photo_originale_url}
                  alt={project.nom}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-brand-50 flex items-center justify-center text-3xl">
                  🏠
                </div>
              )}
              <div className="p-4">
                <p className="font-medium text-gray-800 truncate">{project.nom}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.statut === 'completed' ? 'bg-green-100 text-green-700' :
                    project.statut === 'sent' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {project.statut === 'completed' ? 'Terminé' :
                     project.statut === 'sent' ? 'Envoyé' : 'Brouillon'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4">🏠</div>
          <p className="text-gray-500 mb-2">Aucun projet pour l&apos;instant</p>
          <p className="text-sm text-gray-400 mb-6">
            Commencez par uploader une photo de votre cuisine
          </p>
          <Link
            href="/projects/new"
            className="px-5 py-2.5 bg-brand-500 text-white rounded-lg text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            Créer mon premier projet
          </Link>
        </div>
      )}
    </main>
  )
}
