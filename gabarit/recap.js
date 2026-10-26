// Récapitulatif de la journée (sans Claude) : publications, passages de Claude, illustrations, veille, abonnés.
// Usage : node gabarit/recap.js  → écrit le texte (Markdown) sur la sortie standard.
// Envoyé chaque soir par GitHub Actions sous forme d'issue, que GitHub transmet par e-mail.
const fs = require('fs');
const path = require('path');
const { lireEnv } = require('./env');

process.stdout.on('error', () => {});

const RACINE = path.join(__dirname, '..');
const JOURNAL = path.join(RACINE, 'journal');
const CREDIT_GEMINI = 5; // euros prépayés
const PRIX_IMAGE = 0.04;

const jourParis = (d = new Date()) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Paris' }).format(d);
const aujourdhui = jourParis();
const demain = jourParis(new Date(Date.now() + 86400000));

function lignes(fichier) {
  const p = path.join(JOURNAL, fichier);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split('\n').filter(Boolean) : [];
}
const duJour = (ls) => ls.filter((l) => jourParis(new Date(l.slice(0, 24))) === aujourdhui).map((l) => l.slice(25));

async function statsInstagram(jeton) {
  if (!jeton) return null;
  try {
    const api = (chemin, champs) => fetch(`https://graph.instagram.com/v23.0/${chemin}?fields=${champs}&access_token=${jeton}`).then((r) => r.json());
    const moi = await api('me', 'username,followers_count,media_count');
    const medias = await api('me/media', 'caption,timestamp,like_count,comments_count,permalink');
    const recents = (medias.data ?? []).filter((m) => jourParis(new Date(m.timestamp)) === aujourdhui);
    return { moi, recents };
  } catch { return null; }
}

async function main() {
  const out = [];
  const publications = duJour(lignes('publications.log'));
  const claude = duJour(lignes('claude.log'));
  const illustrations = lignes('illustrations.log');
  const illusJour = duJour(illustrations);
  const insta = await statsInstagram(lireEnv().INSTAGRAM_TOKEN);

  // Entre accents graves : sur GitHub, « @lebonchiffre » notifierait l'utilisateur de ce nom.
  out.push('Bonsoir ! Voici la journée de `@lebonchiffre`.');

  out.push('\n## Instagram');
  if (insta?.moi?.username) {
    out.push(`- **${insta.moi.followers_count ?? '?'} abonnés**, ${insta.moi.media_count} publications au total.`);
    if (insta.recents.length) {
      out.push(`- Publiés aujourd'hui (${insta.recents.length}) :`);
      for (const m of insta.recents) {
        const titre = (m.caption ?? '').split('\n')[0].slice(0, 80);
        out.push(`  - [${titre}](${m.permalink}) : ${m.like_count ?? 0} j'aime, ${m.comments_count ?? 0} commentaires`);
      }
    } else out.push("- Aucune publication aujourd'hui.");
  } else out.push('- ⚠ Statistiques indisponibles (token Instagram à vérifier).');

  out.push('\n## Publications automatiques');
  const echecs = publications.filter((l) => l.startsWith('ÉCHEC'));
  if (publications.length) publications.forEach((l) => out.push(`- ${l.startsWith('ÉCHEC') ? '❌' : l.startsWith('PUBLIÉ') ? '✅' : '•'} ${l}`));
  else out.push("- Aucune par l'API aujourd'hui (les posts programmés dans Business Suite n'apparaissent pas ici).");

  out.push('\n## Passages de Claude');
  if (claude.length) claude.forEach((l) => out.push(`- ${l}`));
  else out.push("- Aucun aujourd'hui.");

  out.push('\n## Illustrations Gemini');
  const reste = Math.max(0, CREDIT_GEMINI - illustrations.length * PRIX_IMAGE);
  out.push(`- ${illusJour.length} aujourd'hui, ${illustrations.length} au total : il reste environ **${reste.toFixed(2).replace('.', ',')} €** sur ${CREDIT_GEMINI} €.`);
  if (reste < 1) out.push('- ⚠ Crédit presque épuisé : recharger sur Google AI Studio (Facturation).');

  out.push('\n## Demain');
  const prevus = fs.readdirSync(path.join(RACINE, 'posts'))
    .map((d) => path.join(RACINE, 'posts', d, 'post.json'))
    .filter((f) => fs.existsSync(f))
    .map((f) => ({ dossier: path.basename(path.dirname(f)), a: JSON.parse(fs.readFileSync(f, 'utf8')).publier_a }))
    .filter((p) => p.a?.startsWith(demain));
  if (prevus.length) prevus.forEach((p) => out.push(`- ${p.a.slice(11)} : ${p.dossier}`));
  else out.push('- Rien de préparé par le système (normal avant le 2 novembre : la semaine est programmée dans Business Suite).');

  try {
    const veille = JSON.parse(fs.readFileSync(path.join(JOURNAL, 'veille.json'), 'utf8'));
    out.push('\n## Tendances du moment');
    veille.candidats.slice(0, 5).forEach((c) => out.push(`- ${c.sujet} (${c.trafic}+ recherches, ${c.grandsMedias.length} grands médias)`));
  } catch {}

  out.push('\n---\nPour tout arrêter : créer un fichier `PAUSE` à la racine du dépôt.');
  if (echecs.length) out.unshift(`⚠ **${echecs.length} échec(s) de publication aujourd'hui**, voir plus bas.\n`);
  console.log(out.join('\n'));
}

main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
