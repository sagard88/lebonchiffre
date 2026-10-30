// Publie un post fabriqué sur @lebonchiffre par l'API officielle d'Instagram.
// Usage : node gabarit/publier.js posts/<dossier-du-post> [--essai]
//   --essai : prépare tout chez Instagram (images, carrousel, légende) sans publier.
// Étapes : images JPEG mises en ligne sur GitHub Pages, conteneurs Instagram, carrousel, publication, journal.
const fs = require('fs');
const path = require('path');
const { lireEnv } = require('./env');

process.stdout.on('error', () => {});

const RACINE = path.join(__dirname, '..');
const API = 'https://graph.instagram.com/v23.0';
const DEPOT = 'sagard88/lebonchiffre-images';
const SITE_URL = 'https://sagard88.github.io/lebonchiffre-images';
const JOURNAL = path.join(RACINE, 'journal', 'publications.log');

const attendre = (ms) => new Promise((r) => setTimeout(r, ms));

async function github(methode, chemin, corps, jeton) {
  const rep = await fetch(`https://api.github.com/repos/${DEPOT}${chemin}`, {
    method: methode,
    headers: { Authorization: `Bearer ${jeton}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: corps && JSON.stringify(corps),
  });
  const json = await rep.json();
  if (!rep.ok) throw new Error(`GitHub (${chemin}) : ${json.message}`);
  return json;
}

// Toutes les images d'un post en un seul commit, pour une seule reconstruction de GitHub Pages.
async function deposerSurGithub(nom, fichiers, jeton) {
  const { object: { sha: parent } } = await github('GET', '/git/ref/heads/main', null, jeton);
  const { tree: { sha: base } } = await github('GET', `/git/commits/${parent}`, null, jeton);
  const tree = [];
  for (const f of fichiers) {
    const { sha } = await github('POST', '/git/blobs', { content: fs.readFileSync(f).toString('base64'), encoding: 'base64' }, jeton);
    tree.push({ path: `${nom}/${path.basename(f)}`, mode: '100644', type: 'blob', sha });
  }
  const { sha: arbre } = await github('POST', '/git/trees', { base_tree: base, tree }, jeton);
  const { sha: commit } = await github('POST', '/git/commits', { message: `Images : ${nom}`, tree: arbre, parents: [parent] }, jeton);
  await github('PATCH', '/git/refs/heads/main', { sha: commit }, jeton);
}

// GitHub Pages met une à deux minutes à servir les nouveaux fichiers.
async function attendreEnLigne(urls) {
  for (let i = 0; i < 40; i++) {
    const statuts = await Promise.all(urls.map((u) => fetch(u, { method: 'HEAD' }).then((r) => r.ok, () => false)));
    if (statuts.every(Boolean)) return;
    await attendre(6000);
  }
  throw new Error('images toujours inaccessibles en ligne après 4 minutes');
}

async function graph(methode, chemin, params, jeton) {
  const url = new URL(API + chemin);
  const corps = new URLSearchParams({ ...params, access_token: jeton });
  const rep = methode === 'GET'
    ? await fetch(url + '?' + corps)
    : await fetch(url, { method: 'POST', body: corps });
  const json = await rep.json();
  if (json.error) throw new Error(`Instagram (${chemin}) : ${json.error.message}`);
  return json;
}

// Instagram traite chaque conteneur en arrière-plan : on attend qu'il soit prêt.
async function attendrePret(id, jeton) {
  for (let i = 0; i < 30; i++) {
    const { status_code: statut, status } = await graph('GET', `/${id}`, { fields: 'status_code,status' }, jeton);
    if (statut === 'FINISHED') return;
    if (statut === 'ERROR' || statut === 'EXPIRED') throw new Error(`conteneur ${id} : ${status}`);
    await attendre(3000);
  }
  throw new Error(`conteneur ${id} : toujours pas prêt après 90 s`);
}

// Cherche le post en ligne d'après sa légende, parmi les 25 derniers du compte.
async function retrouverEnLigne(legende, jeton) {
  const propre = (t) => t.replace(/\s+/g, ' ').trim();
  const { data } = await graph('GET', '/me/media', { fields: 'caption,permalink,timestamp', limit: '25' }, jeton);
  return data.find((m) => m.caption && propre(m.caption) === propre(legende));
}

function marquerPublie(dossier, { id, permalink }) {
  fs.writeFileSync(path.join(dossier, 'publie.json'),
    JSON.stringify({ media: id, permalink, date: new Date().toISOString() }, null, 2) + '\n');
  journal(`PUBLIÉ ${path.basename(dossier)} : ${permalink}`);
  console.log(`✔ publié : ${permalink}`);
}

function journal(ligne) {
  fs.mkdirSync(path.dirname(JOURNAL), { recursive: true });
  fs.appendFileSync(JOURNAL, `${new Date().toISOString()} ${ligne}\n`);
}

async function main() {
  const dossier = path.resolve(process.argv[2] ?? '');
  const essai = process.argv.includes('--essai');
  const nom = path.basename(dossier);
  const images = path.join(dossier, 'images');

  if (!process.argv[2] || !fs.existsSync(path.join(dossier, 'legende.txt'))) {
    console.error('Usage : node gabarit/publier.js posts/<dossier-du-post> [--essai]  (post fabriqué au préalable)');
    process.exit(1);
  }
  if (fs.existsSync(path.join(RACINE, 'PAUSE'))) {
    console.error('✖ Fichier PAUSE présent : publication automatique suspendue.');
    process.exit(3);
  }
  if (!essai && fs.existsSync(path.join(dossier, 'publie.json'))) {
    console.error('✖ Ce post a déjà été publié (publie.json).');
    process.exit(1);
  }

  const { INSTAGRAM_TOKEN: jeton, GITHUB_TOKEN } = lireEnv();
  if (!jeton) throw new Error('INSTAGRAM_TOKEN manquant dans .env');
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN manquant dans .env');

  const jpegs = fs.readdirSync(images).filter((f) => /^\d+\.jpg$/.test(f)).sort((a, b) => parseInt(a) - parseInt(b));
  if (!jpegs.length) throw new Error('aucune image JPEG : refabriquer le post (npm run fabriquer)');
  if (jpegs.length > 10) throw new Error(`${jpegs.length} images : 10 au plus dans un carrousel`);

  const legende = fs.readFileSync(path.join(dossier, 'legende.txt'), 'utf8').trim();
  if (legende.length > 2200) throw new Error(`légende de ${legende.length} caractères (2 200 au plus)`);
  if ((legende.match(/#/g) ?? []).length > 30) throw new Error('plus de 30 mots-dièse');

  // Déjà en ligne sans publie.json (passage interrompu) : ne jamais publier en double.
  if (!essai) {
    const enLigne = await retrouverEnLigne(legende, jeton);
    if (enLigne) {
      console.log('⚠ même légende déjà en ligne : pas de nouvelle publication');
      marquerPublie(dossier, enLigne);
      return;
    }
  }

  // 1. Mise en ligne des images (Instagram va les chercher à une adresse publique).
  console.log(`… mise en ligne de ${jpegs.length} images`);
  await deposerSurGithub(nom, jpegs.map((f) => path.join(images, f)), GITHUB_TOKEN);
  const urls = jpegs.map((f) => `${SITE_URL}/${encodeURIComponent(nom)}/${f}?v=${Date.now()}`);
  await attendreEnLigne(urls);
  console.log('✔ images en ligne');

  // 2. Conteneurs Instagram.
  const { user_id: compte, username } = await graph('GET', '/me', { fields: 'user_id,username' }, jeton);
  let conteneur;
  if (urls.length === 1) {
    ({ id: conteneur } = await graph('POST', `/${compte}/media`, { image_url: urls[0], caption: legende }, jeton));
  } else {
    const enfants = [];
    for (const url of urls) {
      const { id } = await graph('POST', `/${compte}/media`, { image_url: url, is_carousel_item: 'true' }, jeton);
      enfants.push(id);
    }
    for (const id of enfants) await attendrePret(id, jeton);
    ({ id: conteneur } = await graph('POST', `/${compte}/media`,
      { media_type: 'CAROUSEL', children: enfants.join(','), caption: legende }, jeton));
  }
  await attendrePret(conteneur, jeton);
  console.log(`✔ carrousel prêt chez Instagram pour @${username} (${urls.length} images)`);

  if (essai) {
    console.log('Essai terminé : rien n\'a été publié.');
    journal(`ESSAI ${nom} : conteneur ${conteneur} prêt, non publié`);
    return;
  }

  // 3. Publication.
  // Instagram peut répondre par une erreur alors que le post est bien parti : on vérifie avant de conclure à l'échec.
  let publie;
  try {
    const { id: media } = await graph('POST', `/${compte}/media_publish`, { creation_id: conteneur }, jeton);
    publie = await graph('GET', `/${media}`, { fields: 'permalink' }, jeton);
  } catch (e) {
    await attendre(5000);
    publie = await retrouverEnLigne(legende, jeton);
    if (!publie) throw e;
    console.log(`⚠ ${e.message}, mais le post est bien en ligne`);
  }
  marquerPublie(dossier, publie);
}

main().catch((e) => {
  journal(`ÉCHEC ${path.basename(process.argv[2] ?? '?')} : ${e.message}`);
  console.error(`✖ ${e.message}`);
  process.exit(1);
});
