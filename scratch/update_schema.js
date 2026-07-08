const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../app/aplicar/turismo-australia/_schemas/index.ts');
let content = fs.readFileSync(file, 'utf8');

// We will replace z.boolean({ required_error: "Requerido" }) with booleanRadio.
content = content.replace(/import \* as z from 'zod'/g, 
`import * as z from 'zod'

const booleanRadio = z.preprocess(
  (val) => val === 'true' || val === true ? true : val === 'false' || val === false ? false : val,
  z.boolean({ required_error: "Requerido", invalid_type_error: "Requerido" })
);
`);

content = content.replace(/z\.boolean\(\{\s*required_error:\s*"Requerido"\s*\}\)/g, 'booleanRadio');
content = content.replace(/z\.boolean\(\)\.optional\(\)/g, 'z.preprocess((val) => val === "true" || val === true ? true : val === "false" || val === false ? false : val, z.boolean().optional())');
content = content.replace(/z\.boolean\(\)\.refine\(val => val === true/g, 'z.preprocess((val) => val === "true" || val === true ? true : val === "false" || val === false ? false : val, z.boolean()).refine(val => val === true');

fs.writeFileSync(file, content);
console.log('Schemas updated.');
