import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Navbar() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <nav className="h-14 border-b border-gray-100 bg-white flex items-center px-6 gap-6 shrink-0">
      <Link href={user ? '/dashboard' : '/'} className="font-semibold text-brand-900 text-sm">
        Prestige Home
      </Link>
      {user && (
        <>
          <Link href="/dashboard" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">
            Mes projets
          </Link>
          <Link href="/catalogue" className="text-sm text-gray-600 hover:text-brand-600 transition-colors">
            Catalogue
          </Link>
        </>
      )}
      <div className="ml-auto flex items-center gap-4">
        {user ? (
          <>
            <span className="text-xs text-gray-400 hidden sm:block">{user.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                Déconnexion
              </button>
            </form>
          </>
        ) : (
          <Link href="/login" className="text-sm text-brand-500 font-medium hover:text-brand-600 transition-colors">
            Se connecter
          </Link>
        )}
      </div>
    </nav>
  )
}
