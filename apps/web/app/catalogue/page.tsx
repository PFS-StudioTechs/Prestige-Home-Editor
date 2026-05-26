import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function CataloguePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: references } = await supabase
    .from('references')
    .select('*')
    .order('collection')

  const collections = [...new Set(references?.map(r => r.collection).filter(Boolean) ?? [])]

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-brand-900 mb-2">Catalogue Cover Styl&apos;</h1>
      <p className="text-sm text-gray-500 mb-8">
        {references?.length ?? 0} référence{(references?.length ?? 0) > 1 ? 's' : ''}
      </p>

      {!references || references.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-gray-500 mb-2">Catalogue vide</p>
          <p className="text-sm text-gray-400 max-w-sm mx-auto">
            Lancez le scraper pour importer les 470 références Cover Styl&apos; :
          </p>
          <code className="block mt-4 text-xs bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 inline-block text-gray-600">
            npm run scrape --workspace=@prestige-home/catalog-ingestion
          </code>
        </div>
      ) : (
        <div className="space-y-10">
          {collections.map(collection => (
            <div key={collection}>
              <h2 className="text-base font-semibold text-gray-700 mb-4">{collection}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {references
                  .filter(r => r.collection === collection)
                  .map(ref => (
                    <div
                      key={ref.id}
                      className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {ref.texture_url ? (
                        <img
                          src={ref.texture_url}
                          alt={ref.nom_commercial ?? ref.code}
                          className="w-full h-24 object-cover"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-50 flex items-center justify-center text-gray-300 text-xs">
                          {ref.code}
                        </div>
                      )}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-700 truncate">
                          {ref.nom_commercial ?? ref.code}
                        </p>
                        {ref.finition && (
                          <p className="text-xs text-gray-400 truncate">{ref.finition}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
