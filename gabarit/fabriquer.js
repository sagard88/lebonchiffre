// Fabrique les images d'un post et sa légende à partir de post.json.
// Usage : node gabarit/fabriquer.js posts/<dossier-du-post>
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { pathToFileURL } = require('url');
const { htmlPage, ACCENTS, MODELES } = require('./pages');

// Une sortie coupée (ex. `| head`) ne doit pas interrompre la fabrication.
process.stdout.on('error', () => {});

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  // Serveurs de GitHub Actions (Linux).
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium-browser',
].find((p) => fs.existsSync(p));

// ---------- Contrôle du post (règles de CHARTE.md) ----------

function controler(post, dossier) {
  const erreurs = [];
  const alertes = [];
  const pages = post.pages ?? [];

  if (!ACCENTS[post.accent]) erreurs.push(`accent « ${post.accent} » inconnu (jaune, rouge, vert ou bleu)`);
  if (!post.rubrique) erreurs.push('rubrique manquante');
  if (pages.length < 3 || pages.length > 6) erreurs.push(`${pages.length} pages : il en faut entre 3 et 6`);
  if (pages[0]?.type !== 'couverture') erreurs.push('la première page doit être la couverture');
  if (pages.at(-1)?.type !== 'fin') erreurs.push('la dernière page doit être la page « fin »');

  pages.forEach((p, i) => {
    const n = `page ${i + 1}`;
    if (!MODELES[p.type]) return erreurs.push(`${n} : type « ${p.type} » inconnu`);
    if (p.type !== 'fin' && !p.source) erreurs.push(`${n} : source manquante`);
    if (p.type === 'couverture') {
      if (i !== 0) erreurs.push(`${n} : la couverture ne peut être qu'en page 1`);
      if (String(p.chiffre).length > 8) alertes.push(`${n} : le chiffre « ${p.chiffre} » dépasse 8 caractères`);
      const mots = String(p.phrase ?? '').trim().split(/\s+/).length;
      if (mots > 10) alertes.push(`${n} : la phrase fait ${mots} mots (10 au plus)`);
    }
    if (p.type === 'image' || (p.type === 'couverture' && p.image)) {
      if (!p.image || !fs.existsSync(path.resolve(dossier, p.image))) erreurs.push(`${n} : image introuvable (${p.image})`);
      if (!p.ia && !p.credit) erreurs.push(`${n} : crédit de l'image manquant`);
    }
    if (p.type === 'graphique') {
      if (!p.barres?.length || p.barres.length > 8) erreurs.push(`${n} : il faut entre 1 et 8 barres`);
      if (p.barres?.some((b) => typeof b.valeur !== 'number' || b.valeur < 0)) erreurs.push(`${n} : chaque barre veut une valeur numérique positive`);
    }
    if (p.type === 'fin') {
      if (!p.sources?.length) erreurs.push(`${n} : aucune source listée`);
      if (!p.question) erreurs.push(`${n} : question manquante`);
    }
  });

  const tags = post.legende?.hashtags ?? [];
  if (tags.length > 5) alertes.push(`${tags.length} mots-dièse (5 au plus)`);
  return { erreurs, alertes };
}

// ---------- Légende Instagram ----------

function legende(post) {
  const couv = post.pages[0];
  const fin = post.pages.at(-1);
  const blocs = [`${couv.chiffre} ${couv.phrase}`.replace(/\s+/g, ' ').trim()];
  if (post.legende?.contexte) blocs.push(post.legende.contexte.trim());
  blocs.push(fin.question.replace(/\s+/g, ' ').trim());
  const sources = [`Sources : ${fin.sources.join(' ; ')}`];
  if (post.pages.some((p) => p.image && p.ia)) sources.push('Illustration générée par IA');
  blocs.push(sources.join('\n'));
  const tags = (post.legende?.hashtags ?? []).map((t) => '#' + t.replace(/^#/, ''));
  if (tags.length) blocs.push(tags.join(' '));
  return blocs.join('\n\n') + '\n';
}

// ---------- Chrome piloté par le protocole DevTools ----------

async function lancerChrome() {
  if (!CHROME) throw new Error('Chrome introuvable');
  const profil = fs.mkdtempSync(path.join(os.tmpdir(), 'lbc-chrome-'));
  const proc = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--remote-debugging-port=0', `--user-data-dir=${profil}`,
    ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
    'about:blank',
  ], { stdio: 'ignore' });

  const fichier = path.join(profil, 'DevToolsActivePort');
  for (let i = 0; i < 100 && !fs.existsSync(fichier); i++) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 100));
  const [port, chemin] = fs.readFileSync(fichier, 'utf8').trim().split('\n');

  const ws = new WebSocket(`ws://127.0.0.1:${port}${chemin}`);
  await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });
  let id = 0;
  const attentes = new Map();
  const ecouteurs = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && attentes.has(msg.id)) {
      const { ok, ko } = attentes.get(msg.id);
      attentes.delete(msg.id);
      msg.error ? ko(new Error(msg.error.message)) : ok(msg.result);
    } else if (msg.method) {
      ecouteurs.forEach((f) => f(msg));
    }
  };
  const envoyer = (method, params = {}, sessionId) => new Promise((ok, ko) => {
    const n = ++id;
    attentes.set(n, { ok, ko });
    ws.send(JSON.stringify({ id: n, method, params, sessionId }));
  });
  const evenement = (method, sessionId) => new Promise((ok) => {
    const f = (msg) => {
      if (msg.method === method && msg.sessionId === sessionId) {
        ecouteurs.splice(ecouteurs.indexOf(f), 1);
        ok(msg.params);
      }
    };
    ecouteurs.push(f);
  });

  const { targetId } = await envoyer('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await envoyer('Target.attachToTarget', { targetId, flatten: true });
  await envoyer('Page.enable', {}, sessionId);
  await envoyer('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1350, deviceScaleFactor: 1, mobile: false }, sessionId);

  return {
    async capturer(fichierHtml, sortie) {
      const charge = evenement('Page.loadEventFired', sessionId);
      await envoyer('Page.navigate', { url: pathToFileURL(fichierHtml).href }, sessionId);
      await charge;
      const { result } = await envoyer('Runtime.evaluate', {
        expression: 'document.fonts.ready.then(() => window.ajuster())',
        awaitPromise: true, returnByValue: true,
      }, sessionId);
      const { data } = await envoyer('Page.captureScreenshot', {
        format: 'png', clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 },
      }, sessionId);
      fs.writeFileSync(sortie, Buffer.from(data, 'base64'));
      // L'API d'Instagram n'accepte que le JPEG : une copie pour la publication automatique.
      const jpeg = await envoyer('Page.captureScreenshot', {
        format: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: 1080, height: 1350, scale: 1 },
      }, sessionId);
      fs.writeFileSync(sortie.replace(/\.png$/, '.jpg'), Buffer.from(jpeg.data, 'base64'));
      return result.value;
    },
    async fermer() {
      try { await envoyer('Browser.close'); } catch {}
      ws.close();
      proc.kill();
      // Chrome peut tenir ses fichiers quelques instants après sa fermeture.
      await new Promise((r) => proc.once('exit', r).once('error', r));
      try { fs.rmSync(profil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
    },
  };
}

// ---------- Programme principal ----------

async function main() {
  const dossier = path.resolve(process.argv[2] ?? '');
  const fichierPost = path.join(dossier, 'post.json');
  if (!process.argv[2] || !fs.existsSync(fichierPost)) {
    console.error('Usage : node gabarit/fabriquer.js posts/<dossier-du-post>  (le dossier doit contenir post.json)');
    process.exit(1);
  }
  const post = JSON.parse(fs.readFileSync(fichierPost, 'utf8'));

  const { erreurs, alertes } = controler(post, dossier);
  alertes.forEach((a) => console.log(`⚠ ${a}`));
  if (erreurs.length) {
    erreurs.forEach((e) => console.error(`✖ ${e}`));
    process.exit(1);
  }

  const sortie = path.join(dossier, 'images');
  fs.rmSync(sortie, { recursive: true, force: true });
  fs.mkdirSync(sortie, { recursive: true });
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'lbc-pages-'));

  const chrome = await lancerChrome();
  let debordements = 0;
  try {
    for (const [i, page] of post.pages.entries()) {
      const html = path.join(temp, `${i + 1}.html`);
      fs.writeFileSync(html, htmlPage(post, page, i + 1, post.pages.length, dossier));
      const png = path.join(sortie, `${i + 1}.png`);
      const r = await chrome.capturer(html, png);
      if (r.deborde) {
        debordements++;
        console.error(`✖ page ${i + 1} (${page.type}) : le texte déborde encore, à raccourcir`);
      } else {
        console.log(`✔ page ${i + 1} (${page.type})${r.echelle < 100 ? ` — texte réduit à ${r.echelle} %` : ''}`);
      }
    }
  } finally {
    await chrome.fermer();
    fs.rmSync(temp, { recursive: true, force: true });
  }

  fs.writeFileSync(path.join(dossier, 'legende.txt'), legende(post));
  console.log(`\nImages : ${sortie}\nLégende : ${path.join(dossier, 'legende.txt')}`);
  if (debordements) process.exit(2);
}

main().catch((e) => { console.error(e); process.exit(1); });
