"use client"

import { useState } from 'react'
import { loginAdmin } from './actions'
import { Loader2, Lock } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    
    try {
      const result = await loginAdmin(password)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('Ocurrió un error.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF7] flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl border border-[#E5E5E5] shadow-sm max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-[#F5F5F0] p-4 rounded-full">
            <Lock className="w-8 h-8 text-[#0A0A0A]" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center text-[#0A0A0A] mb-2 font-[PPMonumentExtended]">
          Panel de Admin
        </h1>
        <p className="text-[#525252] text-sm text-center mb-8">
          Ingresa la contraseña para acceder a las solicitudes
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full bg-[#F5F5F0] border border-[#E5E5E5] text-[#0A0A0A] px-4 py-3 rounded-lg focus:outline-none focus:border-[#C8FF00] focus:ring-2 focus:ring-[#C8FF00] focus:bg-white transition-colors"
            />
            {error && <p className="text-[#DC2626] text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-[#C8FF00] text-[#0A0A0A] font-bold py-3 rounded-lg hover:bg-[#B5E600] transition-colors shadow-[0_4px_0_0_rgba(0,0,0,0.05)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
