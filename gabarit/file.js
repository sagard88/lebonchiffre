// Publie les posts dont l'heure est venue : champ "publier_a" de post.json (heure de Paris, ex. "2026-11-02T08:00").
// Usage : node gabarit/file.js
// Lancé chaque heure par GitHub Actions. Un post en retard de plus de 3 h est laissé de côté (signalé).
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const RACINE = path.join(__dirname, '..');
const POSTS = path.join(RACINE, 'posts');
const RETARD_MAX = 3 * 3600 * 1000;

// Heure de Paris sous la forme "AAAA-MM-JJTHH:MM", comparable à "publier_a".
function maintenantParis() {
  const p = Object.fromEntries(new Intl.DateTimeFormat('fr-FR', {
    timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

const enMs = (h) => Date.parse(h + ':00Z');

const maintenant = maintenantParis();
const dus = fs.readdirSync(POSTS)
  .map((d) => path.join(POSTS, d))
  .filter((d) => fs.existsSync(path.join(d, 'post.json')) && !fs.existsSync(path.join(d, 'publie.json')))
  .map((d) => ({ dossier: d, a: JSON.parse(fs.readFileSync(path.join(d, 'post.json'), 'utf8')).publier_a }))
  .filter((p) => p.a && p.a <= maintenant)
  .sort((x, y) => x.a.localeCompare(y.a));

let echecs = 0;
for (const p of dus) {
  const nom = path.basename(p.dossier);
  if (enMs(maintenant) - enMs(p.a) > RETARD_MAX) {
    console.log(`⚠ ${nom} : prévu à ${p.a}, trop en retard, non publié`);
    continue;
  }
  console.log(`→ ${nom} (prévu à ${p.a})`);
  const r = spawnSync(process.execPath, [path.join(__dirname, 'publier.js'), p.dossier], { stdio: 'inherit' });
  if (r.status !== 0) echecs++;
}
if (!dus.length) console.log(`Rien à publier (${maintenant}, heure de Paris).`);
process.exit(echecs ? 1 : 0);
