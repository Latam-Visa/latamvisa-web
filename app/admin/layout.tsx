import { logoutAdmin } from './login/actions'
import { LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]">
      <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="font-[PPMonumentExtended] font-bold text-lg tracking-tight">
                LATAM VISA <span className="text-[#A3A3A3] font-normal">| Admin</span>
              </h1>
            </div>
            <div>
              <form action={logoutAdmin}>
                <button type="submit" className="flex items-center gap-2 text-[#525252] hover:text-[#0A0A0A] text-sm font-medium transition-colors">
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
