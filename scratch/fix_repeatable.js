const fs = require('fs')
const path = require('path')

const stepsDir = path.join(__dirname, '../app/aplicar/turismo-australia/_components')

let step6 = fs.readFileSync(path.join(stepsDir, 'Step6.tsx'), 'utf8')
step6 = step6.replace(/<div className="p-4 bg-white border border-\[#E5E5E5\] rounded-xl mt-4">[\s\S]*?<\/div>/, `
          <div className="mt-4">
            <RepeatableTable
              name="step6.non_accompanying_family"
              title="Familiares que no viajan"
              description="Ingresa los datos de los familiares (padres, cónyuge, hijos, hermanos) que NO viajarán contigo."
              defaultItem={{ relationship: '', family_name: '', given_names: '', sex: '', dob: '', country_of_birth: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FormField label="Parentesco" name={\`step6.non_accompanying_family.\${index}.relationship\`} error={errs.non_accompanying_family?.[index]?.relationship?.message}>
                    <input type="text" {...register(\`step6.non_accompanying_family.\${index}.relationship\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" placeholder="Ej: Padre, Hermano, etc." />
                  </FormField>
                  <FormField label="Apellidos" name={\`step6.non_accompanying_family.\${index}.family_name\`} error={errs.non_accompanying_family?.[index]?.family_name?.message}>
                    <input type="text" {...register(\`step6.non_accompanying_family.\${index}.family_name\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Nombres" name={\`step6.non_accompanying_family.\${index}.given_names\`} error={errs.non_accompanying_family?.[index]?.given_names?.message}>
                    <input type="text" {...register(\`step6.non_accompanying_family.\${index}.given_names\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Sexo" name={\`step6.non_accompanying_family.\${index}.sex\`} error={errs.non_accompanying_family?.[index]?.sex?.message}>
                    <select {...register(\`step6.non_accompanying_family.\${index}.sex\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]">
                      <option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option>
                    </select>
                  </FormField>
                  <FormField label="Fecha de Nacimiento" name={\`step6.non_accompanying_family.\${index}.dob\`} error={errs.non_accompanying_family?.[index]?.dob?.message}>
                    <input type="date" {...register(\`step6.non_accompanying_family.\${index}.dob\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="País de Nacimiento" name={\`step6.non_accompanying_family.\${index}.country_of_birth\`} error={errs.non_accompanying_family?.[index]?.country_of_birth?.message}>
                    <input type="text" {...register(\`step6.non_accompanying_family.\${index}.country_of_birth\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                </div>
              )}
            />
          </div>
`)

step6 = `import { RepeatableTable } from './RepeatableTable'\n` + step6
fs.writeFileSync(path.join(stepsDir, 'Step6.tsx'), step6)


let step3 = fs.readFileSync(path.join(stepsDir, 'Step3.tsx'), 'utf8')
step3 = `import { RepeatableTable } from './RepeatableTable'\n` + step3

step3 = step3.replace(/<div className="p-4 bg-white border border-\[#E5E5E5\] rounded-xl mt-4">\s*<FormField label="Países de los que eres ciudadano"[\s\S]*?<\/div>/, `
          <div className="mt-4">
            <RepeatableTable
              name="step3.other_citizenships"
              title="Otras ciudadanías"
              defaultItem={{ country: '', passport_number: '' }}
              minItems={1}
              renderItem={(index) => (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <FormField label="País" name={\`step3.other_citizenships.\${index}.country\`} error={errs.other_citizenships?.[index]?.country?.message}>
                    <input type="text" {...register(\`step3.other_citizenships.\${index}.country\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                  <FormField label="Número de pasaporte (Opcional)" name={\`step3.other_citizenships.\${index}.passport_number\`} error={errs.other_citizenships?.[index]?.passport_number?.message}>
                    <input type="text" {...register(\`step3.other_citizenships.\${index}.passport_number\`)} className="w-full border p-3 rounded-lg focus:ring-[#C8FF00]" />
                  </FormField>
                </div>
              )}
            />
          </div>
`)

fs.writeFileSync(path.join(stepsDir, 'Step3.tsx'), step3)

console.log('Fixed repeatable tables in Step 3 and Step 6.')
