// The one runnable check: es.json and en.json must have identical key shapes.
// A missing or empty key renders as a blank on the page and nothing else catches it.
// Run: npm run check:i18n
import { readFileSync } from 'node:fs';

const load = (l) =>
  JSON.parse(readFileSync(new URL(`../src/i18n/${l}.json`, import.meta.url), 'utf8'));

// Dotted paths. Arrays get indexed so list LENGTH is compared too, not just shape.
const paths = (v, prefix = '', out = []) => {
  if (Array.isArray(v)) v.forEach((x, i) => paths(x, `${prefix}[${i}]`, out));
  else if (v && typeof v === 'object')
    for (const k of Object.keys(v)) paths(v[k], prefix ? `${prefix}.${k}` : k, out);
  else out.push([prefix, v]);
  return out;
};

const es = paths(load('es'));
const en = paths(load('en'));
const esK = new Set(es.map(([k]) => k));
const enK = new Set(en.map(([k]) => k));

const problems = [
  ...[...esK].filter((k) => !enK.has(k)).map((k) => `missing in en.json: ${k}`),
  ...[...enK].filter((k) => !esK.has(k)).map((k) => `extra in en.json:   ${k}`),
  ...[...es, ...en]
    .filter(([, v]) => typeof v === 'string' && v.trim() === '')
    .map(([k]) => `empty string:       ${k}`),
];

if (problems.length) {
  console.error(`check:i18n FAILED (${problems.length})`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(`check:i18n ok — ${esK.size} keys match across es/en`);
