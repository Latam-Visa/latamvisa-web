const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../app/aplicar/turismo-australia/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Replace imports for Steps
content = content.replace(/import \{ step1Schema.*?\} from '\.\/_schemas'/s, `import { 
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, 
  step6Schema, step7Schema, step8Schema, step9Schema, step10Schema,
  step11Schema, step12Schema, step13Schema, step14Schema
} from './_schemas'`);

content = content.replace(/import \{ Step1 \} from '\.\/_components\/Step1'[\s\S]*?import \{ Step10 \} from '\.\/_components\/Step10'/, `import { Step1 } from './_components/Step1'
import { Step2 } from './_components/Step2'
import { Step3 } from './_components/Step3'
import { Step4 } from './_components/Step4'
import { Step5 } from './_components/Step5'
import { Step6 } from './_components/Step6'
import { Step7 } from './_components/Step7'
import { Step8 } from './_components/Step8'
import { Step9 } from './_components/Step9'
import { Step10 } from './_components/Step10'
import { Step11 } from './_components/Step11'
import { Step12 } from './_components/Step12'
import { Step13 } from './_components/Step13'
import { Step14 } from './_components/Step14'`);

// Replace schemas in baseFormSchema
content = content.replace(/const baseFormSchema = z\.object\(\{[\s\S]*?\}\)/, `const baseFormSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema,
  step5: step5Schema,
  step6: step6Schema,
  step7: step7Schema,
  step8: step8Schema,
  step9: step9Schema,
  step10: step10Schema,
  step11: step11Schema,
  step12: step12Schema,
  step13: step13Schema,
  step14: step14Schema,
})`);

// Remove formSchema superRefine specific to Canada
content = content.replace(/const formSchema = baseFormSchema\.superRefine\([\s\S]*?\}\)/, 'const formSchema = baseFormSchema');

// Update TOTAL_STEPS to 14
content = content.replace(/const TOTAL_STEPS = 10/, 'const TOTAL_STEPS = 14');
content = content.replace(/const STORAGE_KEY = 'latamvisa-canada-draft'/, "const STORAGE_KEY = 'latamvisa-australia-draft'");
content = content.replace(/export default function TurismoCanadaApplication\(\) \{/, 'export default function TurismoAustraliaApplication() {');

// Update the onSubmit
content = content.replace(/submitCanadaApplication/g, 'submitAustraliaApplication');
content = content.replace(/_actions\/submit-application/g, './_actions/submit-application');
content = content.replace(/TurismoCanadaApplication/g, 'TurismoAustraliaApplication');

// Update PassportConfirmModal mappings
content = content.replace(/if \(confirmed\.surname\) setValue\('step2\.surname' as any, confirmed\.surname\)/, `if (confirmed.surname) setValue('step2.family_name' as any, confirmed.surname)`);
content = content.replace(/if \(confirmed\.given_names\) setValue\('step2\.given_name' as any, confirmed\.given_names\)/, `if (confirmed.given_names) setValue('step2.given_names' as any, confirmed.given_names)`);

// Replace other Step 2 mappings
content = content.replace(/setValue\('step2\.document_type' as any, confirmed\.document_type\)/g, `// No document_type in Australia step2 schema`);
content = content.replace(/setValue\('step2\.passport_number_confirm' as any, confirmed\.document_number\)/g, `// No confirm in Australia schema`);
content = content.replace(/setValue\('step3\.birth_city'/g, `setValue('step3.birth_town_city'`);
content = content.replace(/setValue\('step3\.birth_country'/g, `setValue('step3.country_of_birth'`);

// Render Step case logic
content = content.replace(/case 10: return <Step10 \/>/g, `case 10: return <Step10 />\n      case 11: return <Step11 />\n      case 12: return <Step12 />\n      case 13: return <Step13 />\n      case 14: return <Step14 />`);

// Titles
content = content.replace(/case 10: return 'Documentos'/g, `case 10: return 'Salud'
      case 11: return 'Carácter'
      case 12: return 'Historial de Visas'
      case 13: return 'Declaraciones'
      case 14: return 'Documentos'`);

// Subtitles
content = content.replace(/case 10: return 'Carga de archivos requeridos'/g, `case 10: return 'Declaraciones de salud'
      case 11: return 'Declaraciones de carácter'
      case 12: return 'Historial de visas previas'
      case 13: return 'Consentimientos oficiales'
      case 14: return 'Carga de archivos requeridos'`);

fs.writeFileSync(pagePath, content);
console.log('page.tsx updated');
