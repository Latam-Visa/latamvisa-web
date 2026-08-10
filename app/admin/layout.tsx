import { logoutAdmin } from './login/actions'
import { LogOut, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#0A0A0A]">
      <nav className="bg-white border-b border-[#E5E5E5] sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <Image 
                src="/logo.png" 
                alt="LATAM VISA" 
                width={160} 
                height={36} 
                className="h-[32px] sm:h-[36px] w-auto object-contain" 
                priority
              />
              <span className="font-[PPMonumentExtended] font-normal text-[#A3A3A3] text-lg tracking-tight">
                | Admin
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href="/admin/ideas"
                className="flex items-center gap-2 text-[#525252] hover:text-[#0A0A0A] text-sm font-medium transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                <span className="hidden sm:inline">Ideas &amp; Tareas</span>
              </Link>
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
