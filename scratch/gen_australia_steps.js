const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '../app/aplicar/turismo-australia/_components');

for (let i = 1; i <= 14; i++) {
  const content = `
import { useFormContext } from 'react-hook-form'

export function Step${i}() {
  const { register, formState: { errors }, watch } = useFormContext()

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-[#0A0A0A] text-2xl font-bold font-[PPMonumentExtended]">Paso ${i}</h2>
        <p className="text-[#525252] mt-2">Completa la información requerida.</p>
      </div>
      
      {/* TODO: Add fields for Step ${i} here based on the schema */}
      <div className="p-4 bg-yellow-50 text-yellow-800 border border-yellow-200 rounded">
        <strong>Nota:</strong> Los campos de este paso deben coincidir con la estructura oficial del formulario (Step ${i}).
      </div>
    </div>
  )
}
`;
  fs.writeFileSync(path.join(componentsDir, `Step${i}.tsx`), content);
}
console.log('Steps generated');
