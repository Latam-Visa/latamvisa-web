import { salir } from '../actions'
import { btnSecundario, tarjeta, titulo } from './ui'

export function Piloto({ email }: { email: string }) {
  return (
    <div className={`${tarjeta} p-6 space-y-4 text-center`}>
      <h1 className={`${titulo} text-xl`}>Estamos en piloto</h1>
      <p className="text-[15px]">
        Por ahora esto lo está probando un grupo pequeño del equipo. Tu correo ({email}) todavía no está en la lista; te avisamos apenas se abra.
      </p>
      <form action={salir}>
        <button type="submit" className={btnSecundario}>Salir</button>
      </form>
    </div>
  )
}
