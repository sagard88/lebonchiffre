// Veille des tendances, sans Claude (aucun token) : Google Trends, Google Actualités, Reddit.
// Usage : node gabarit/veille.js
// Écrit journal/veille.json (sujets classés). Sort avec le code 10 quand un sujet « brûlant »
// mérite un passage immédiat de Claude (une alerte par jour au plus, entre 7 h et 23 h).
const fs = require('fs');
const path = require('path');

process.stdout.on('error', () => {});

const RACINE = path.join(__dirname, '..');
const SORTIE = path.join(RACINE, 'journal', 'veille.json');
const ALERTES = path.join(RACINE, 'journal', 'alertes.json');
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0) lebonchiffre-veille' };

// Médias reconnus : seuls eux comptent pour juger qu'un sujet est réellement chaud.
const GRANDS_MEDIAS = [
  'Le Monde', "L'Équipe", "L'Equipe", 'RMC Sport', 'Le Parisien', 'Franceinfo', 'francetv info', 'Le Figaro',
  'Ouest-France', '20 Minutes', 'BFMTV', 'Libération', 'TF1 Info', 'RFI', 'France 24', 'Les Echos',
  'La Tribune', "L'Express", 'Le Point', 'Mediapart', 'Europe 1', 'RTL.fr', 'France Inter', 'Numerama',
  'Les Numériques', 'Jeuxvideo.com', 'Gamekult', 'Challenges', 'Capital.fr', 'Courrier international',
  'Goal.com', 'SO FOOT.com', 'Foot Mercato', 'Eurosport', 'Sports.fr', 'Le Soir', 'Ouest-France',
];

// Seuils de l'alerte « brûlant » (SYSTEME.md).
const SEUIL_MEDIAS = 5;
const SEUIL_TRAFIC_AVEC_MEDIAS = 20000;
const SEUIL_TRAFIC_SEUL = 100000;

const decoder = (s) => s.replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
const balises = (xml, nom) => [...xml.matchAll(new RegExp(`<${nom}(?:\\s[^>]*)?>([\\s\\S]*?)</${nom}>`, 'g'))].map((m) => decoder(m[1]));
const items = (xml) => [...xml.matchAll(/<(item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/\1>/g)].map((m) => m[2]);

async function lire(url) {
  try {
    const rep = await fetch(url, { headers: UA, signal: AbortSignal.timeout(15000) });
    return rep.ok ? await rep.text() : '';
  } catch { return ''; }
}

async function tendancesGoogle() {
  const xml = await lire('https://trends.google.com/trending/rss?geo=FR');
  return items(xml).map((it) => ({
    sujet: balises(it, 'title')[0],
    trafic: parseInt((balises(it, 'ht:approx_traffic')[0] ?? '0').replace(/\D/g, ''), 10) || 0,
  }));
}

// Titres de Google Actualités sur un sujet, dans les 2 dernières heures.
async function articles(sujet) {
  const xml = await lire(`https://news.google.com/rss/search?q=${encodeURIComponent(sujet + ' when:2h')}&hl=fr&gl=FR&ceid=FR:fr`);
  return items(xml).map((it) => {
    const titre = balises(it, 'title')[0] ?? '';
    const media = balises(it, 'source')[0] ?? titre.split(' - ').at(-1);
    return { titre: titre.replace(/ - [^-]+$/, ''), media, lien: balises(it, 'link')[0] };
  });
}

async function redditFrance() {
  const xml = await lire('https://www.reddit.com/r/france/hot/.rss?limit=25');
  return items(xml).map((it) => balises(it, 'title')[0])
    .filter((t) => t && !/^(Forum Libre|Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche) /.test(t));
}

function alertesDuJour() {
  const jour = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris" }).format(new Date());
  try {
    const a = JSON.parse(fs.readFileSync(ALERTES, 'utf8'));
    return a.jour === jour ? a : { jour, sujets: [] };
  } catch { return { jour, sujets: [] }; }
}

async function main() {
  const [tendances, reddit] = await Promise.all([tendancesGoogle(), redditFrance()]);

  // On n'interroge Google Actualités que pour les tendances qui pèsent.
  const retenues = tendances.filter((t) => t.trafic >= 500).slice(0, 12);
  const candidats = [];
  for (const t of retenues) {
    const arts = await articles(t.sujet);
    const medias = [...new Set(arts.map((a) => a.media).filter((m) => GRANDS_MEDIAS.includes(m)))];
    candidats.push({
      ...t,
      grandsMedias: medias,
      score: Math.round(Math.log10(t.trafic + 1) * 10 + medias.length * 8),
      titres: arts.slice(0, 5),
    });
  }
  candidats.sort((a, b) => b.score - a.score);

  const brulant = candidats.find((c) =>
    (c.grandsMedias.length >= SEUIL_MEDIAS && c.trafic >= SEUIL_TRAFIC_AVEC_MEDIAS) || c.trafic >= SEUIL_TRAFIC_SEUL);

  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, JSON.stringify({ date: new Date().toISOString(), candidats, reddit: reddit.slice(0, 15) }, null, 2) + '\n');

  candidats.slice(0, 8).forEach((c) =>
    console.log(`${String(c.score).padStart(3)}  ${c.sujet} (${c.trafic}+ recherches, ${c.grandsMedias.length} grands médias)`));

  const heure = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Paris", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
  const alertes = alertesDuJour();
  // VEILLE_SANS_ALERTE : simple mise à jour des tendances (récap, préparation), sans déclencher l'alerte du jour.
  if (brulant && heure >= 7 && heure < 23 && alertes.sujets.length === 0 && !process.env.VEILLE_SANS_ALERTE) {
    alertes.sujets.push(brulant.sujet);
    fs.writeFileSync(ALERTES, JSON.stringify(alertes, null, 2) + '\n');
    console.log(`\nBRÛLANT : ${brulant.sujet}`);
    process.exit(10);
  }
}

main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
