const fs = require('fs');

const file = fs.readFileSync('lib/constants/countries.ts', 'utf8');
const match = file.match(/export const ALL_COUNTRIES: Country\[\] = \[([\s\S]*?)\];/);
if (!match) throw new Error("Could not find ALL_COUNTRIES");

const entriesStr = match[1];
const entryRegex = /\{\s*code:\s*'([^']+)',\s*name:\s*'([^']+)',\s*flag:\s*'([^']*)',\s*phoneCode:\s*'([^']*)'\s*\}/g;

const countries = [];
let m;
while ((m = entryRegex.exec(entriesStr)) !== null) {
  countries.push({ code: m[1], name: m[2], flag: m[3], phoneCode: m[4] });
}

const priorityCodes = [
  'CO', 'MX', 'VE', 'PE', 'EC', 'BO', 'CL', 'AR', 'BR', 'UY', 'PY', 'PA', 
  'CR', 'GT', 'HN', 'SV', 'NI', 'CU', 'DO', 'PR', 'ES', 'US', 'CA', 'AU', 'NZ', 'GB'
];

const priorityCountries = [];
const otherCountries = [];

for (const c of countries) {
  if (priorityCodes.includes(c.code)) {
    // we'll place them in exactly the right order later
  } else {
    otherCountries.push(c);
  }
}

for (const code of priorityCodes) {
  const c = countries.find(x => x.code === code);
  if (c) priorityCountries.push(c);
  else console.log("Missing priority country:", code);
}

// sort other countries alphabetically by name
otherCountries.sort((a, b) => a.name.localeCompare(b.name, 'es'));

const finalCountries = [
  ...priorityCountries,
  { code: 'DIVIDER', name: '─────────', flag: '', phoneCode: '' },
  ...otherCountries
];

let newArrayStr = 'export const ALL_COUNTRIES: Country[] = [\n';
for (const c of finalCountries) {
  newArrayStr += `  { code: '${c.code}', name: '${c.name}', flag: '${c.flag}', phoneCode: '${c.phoneCode}' },\n`;
}
newArrayStr += '];';

const newFile = file.replace(/export const ALL_COUNTRIES: Country\[\] = \[([\s\S]*?)\];/, newArrayStr);
fs.writeFileSync('lib/constants/countries.ts', newFile);
console.log("Updated lib/constants/countries.ts");
