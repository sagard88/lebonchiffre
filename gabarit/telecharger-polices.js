// Télécharge Anton et Inter depuis Google Fonts dans gabarit/polices/ (à lancer une seule fois).
const fs = require('fs');
const path = require('path');

const DOSSIER = path.join(__dirname, 'polices');
const URL_CSS = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;600;800&display=block';
// Un navigateur récent reçoit des fichiers woff2.
const NAVIGATEUR = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

async function main() {
  fs.mkdirSync(DOSSIER, { recursive: true });
  let css = await (await fetch(URL_CSS, { headers: { 'User-Agent': NAVIGATEUR } })).text();
  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g))];
  for (const [i, url] of urls.entries()) {
    const nom = `police-${i}.woff2`;
    const octets = Buffer.from(await (await fetch(url)).arrayBuffer());
    fs.writeFileSync(path.join(DOSSIER, nom), octets);
    css = css.split(url).join(nom);
  }
  fs.writeFileSync(path.join(DOSSIER, 'polices.css'), css);
  console.log(`${urls.length} fichiers de police enregistrés dans ${DOSSIER}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
