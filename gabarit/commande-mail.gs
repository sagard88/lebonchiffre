// Commande de posts par e-mail pour @lebonchiffre (Google Apps Script, compte lebonchiffre.actu@gmail.com).
// Olivier écrit à lebonchiffre.actu@gmail.com (« Publie un post sur Call of Duty ») : le script lance le
// workflow « Commande » sur GitHub, accuse réception, puis renvoie la réponse de Claude dans le même fil.
// Une réponse d'Olivier dans le fil (avec le CODE) relance une commande qui tient compte de l'échange.
// Il sert aussi d'horloge au système : préparation, publication et récap sont lancés d'ici, à l'heure de Paris
// (les horaires de GitHub Actions arrivent avec des heures de retard).
// Installation : voir COMMANDE-MAIL.md. Déclencheur : verifierCommandes, toutes les minutes.

const EXPEDITEUR = 'olivier.vasson@gmail.com';
const DEPOT = 'sagard88/lebonchiffre';
const ETIQUETTE = 'commande-lbc';
const DELAI_MAX = 2 * 3600 * 1000;
const FUSEAU = 'Europe/Paris';
const DEBUT_AUTO = '2026-11-02'; // Jusque-là, les 3 créneaux sont déjà programmés dans Meta Business Suite.
const FENETRE = 30; // minutes de rattrapage si Google saute un passage

function github(chemin, options) {
  const jeton = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  return UrlFetchApp.fetch('https://api.github.com/repos/' + DEPOT + chemin, Object.assign({
    headers: { Authorization: 'Bearer ' + jeton, Accept: 'application/vnd.github+json' },
    muteHttpExceptions: true,
  }, options || {}));
}

// Le texte écrit dans un message, sans signature ni message cité.
function texteSeul(msg) {
  return msg.getPlainBody().split(/\n-- ?\n|\nLe .+ a écrit ?:|\nOn .+ wrote:|\nEnvoyé de |\n>/)[0].trim();
}

// Ce que l'horloge doit faire dans la journée, heure de Paris : lancer un workflow ou vérifier un créneau.
function tachesDuJour(jour) {
  const taches = [{ a: '21:30', workflow: 'recap.yml' }];
  for (let h = 7; h <= 23; h++) taches.push({ a: ('0' + h).slice(-2) + ':00', workflow: 'publication.yml' });
  if (jour.slice(-2) === '01') taches.push({ a: '04:00', workflow: 'jeton.yml' });
  if (jour >= DEBUT_AUTO) {
    taches.push({ a: '07:00', workflow: 'preparation.yml', inputs: { mode: 'matin' } });
    taches.push({ a: '18:00', workflow: 'preparation.yml', inputs: { mode: 'soir' } });
    ['08', '14', '19'].forEach(function (h) { taches.push({ a: h + ':30', creneau: h }); });
  }
  return taches;
}

// E-mail à Olivier si rien n'a été publié dans l'heure du créneau (sauf fichier PAUSE).
function verifierCreneau(jour, h) {
  if (github('/contents/PAUSE').getResponseCode() === 200) return;
  const rep = github('/contents/journal/publications.log', {
    headers: {
      Authorization: 'Bearer ' + PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN'),
      Accept: 'application/vnd.github.raw',
    },
  });
  const publie = rep.getResponseCode() === 200 && rep.getContentText().split('\n').some(function (l) {
    const m = l.match(/^(\S+) PUBLIÉ /);
    return m && Utilities.formatDate(new Date(m[1]), FUSEAU, 'yyyy-MM-dd HH') === jour + ' ' + h;
  });
  if (!publie) {
    GmailApp.sendEmail(EXPEDITEUR, 'Le Bon Chiffre : rien de publié à ' + Number(h) + ' h',
      "Aucune publication confirmée pour le créneau de " + Number(h) + " h. Regarde journal/claude.log et l'onglet Actions du dépôt GitHub.");
  }
}

// À chaque passage, fait ce qui est dû depuis moins de FENETRE minutes et pas encore fait aujourd'hui.
function donnerLHeure() {
  const props = PropertiesService.getScriptProperties();
  const maintenant = new Date();
  const jour = Utilities.formatDate(maintenant, FUSEAU, 'yyyy-MM-dd');
  const heure = Utilities.formatDate(maintenant, FUSEAU, 'HH:mm');
  const enMinutes = function (hm) { return Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3)); };
  let horloge = JSON.parse(props.getProperty('horloge') || '{}');
  if (horloge.jour !== jour) horloge = { jour: jour, faits: [] };

  tachesDuJour(jour).forEach(function (t) {
    const retard = enMinutes(heure) - enMinutes(t.a);
    const cle = t.a + ' ' + (t.workflow || 'creneau');
    if (retard < 0 || retard >= FENETRE || horloge.faits.indexOf(cle) !== -1) return;
    if (t.creneau) {
      verifierCreneau(jour, t.creneau);
    } else {
      const rep = github('/actions/workflows/' + t.workflow + '/dispatches', {
        method: 'post',
        contentType: 'application/json',
        payload: JSON.stringify({ ref: 'main', inputs: t.inputs || {} }),
      });
      if (rep.getResponseCode() !== 204) return; // réessayé au passage suivant
    }
    horloge.faits.push(cle);
    props.setProperty('horloge', JSON.stringify(horloge));
  });
}

function verifierCommandes() {
  // Google ne propose pas de déclencheur « toutes les 2 minutes » : celui-ci tourne chaque minute
  // et s'arrête aussitôt une minute sur deux, pour économiser le temps de calcul quotidien.
  if (new Date().getMinutes() % 2 === 1) return;
  // Une panne de l'horloge ne doit pas bloquer les commandes par e-mail.
  try { donnerLHeure(); } catch (e) { console.error(e); }
  const props = PropertiesService.getScriptProperties();
  const code = (props.getProperty('CODE') || '').trim();
  const etiquette = GmailApp.getUserLabelByName(ETIQUETTE) || GmailApp.createLabel(ETIQUETTE);

  // 1. Commandes : le dernier message non lu d'Olivier, dans un nouveau fil ou en réponse dans un fil existant.
  const fils = GmailApp.search('from:' + EXPEDITEUR + ' is:unread in:inbox newer_than:2d');
  fils.forEach(function (fil) {
    const messages = fil.getMessages();
    const nonLus = messages.filter(function (m) { return m.isUnread() && m.getFrom().indexOf(EXPEDITEUR) !== -1; });
    if (!nonLus.length) return;
    const msg = nonLus[nonLus.length - 1];
    let demande = (msg.getSubject().replace(/^(re|tr|fwd?) ?: ?/i, '') + '\n' + texteSeul(msg)).trim();
    if (code) {
      if (demande.toLowerCase().indexOf(code.toLowerCase()) === -1) return;
      demande = demande.split(code).join('').trim();
    }
    // Les échanges précédents du fil, pour une réponse à une question ou une précision.
    const avant = messages.slice(0, messages.indexOf(msg)).map(function (m) {
      const qui = m.getFrom().indexOf(EXPEDITEUR) !== -1 ? 'Olivier' : 'Réponse précédente du robot';
      return qui + ' : ' + texteSeul(m).split(code || '\u0000').join('');
    }).join('\n\n');
    const consigne = avant
      ? 'Échange précédent dans ce fil :\n' + avant.slice(-2500) + '\n\nNouvelle demande d\'Olivier : ' + demande
      : demande;

    const id = msg.getId();
    const rep = github('/actions/workflows/commande.yml/dispatches', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ ref: 'main', inputs: { consigne: consigne.slice(0, 4000), id: id } }),
    });
    if (rep.getResponseCode() === 204) {
      fil.reply("Bien reçu, je m'en occupe. Réponse dans ce fil d'ici 10 à 20 minutes.");
      props.setProperty('attente_' + id, fil.getId() + '|' + Date.now());
    } else {
      fil.reply("La commande n'a pas pu être lancée (GitHub a répondu " + rep.getResponseCode() + ').');
    }
    nonLus.forEach(function (m) { m.markRead(); });
    fil.addLabel(etiquette);
  });

  // 2. Réponses : dès que Claude a rangé sa réponse dans journal/commandes/<id>.md, on la renvoie dans le fil.
  const toutes = props.getProperties();
  Object.keys(toutes).forEach(function (cle) {
    if (cle.indexOf('attente_') !== 0) return;
    const id = cle.slice('attente_'.length);
    const parts = String(toutes[cle]).split('|');
    // Ancien format (avant les réponses dans le fil) : la valeur ne contenait que l'heure, l'id était celui du fil.
    const filId = parts.length > 1 ? parts[0] : id;
    const depuis = Number(parts.length > 1 ? parts[1] : parts[0]);
    const rep = github('/contents/journal/commandes/' + id + '.md', {
      headers: {
        Authorization: 'Bearer ' + props.getProperty('GITHUB_TOKEN'),
        Accept: 'application/vnd.github.raw',
      },
    });
    const fil = GmailApp.getThreadById(filId);
    if (rep.getResponseCode() === 200) {
      if (fil) fil.reply(rep.getContentText() + (code ? '\n\nPour préciser ou corriger, réponds dans ce fil avec ' + code + '.' : ''));
      props.deleteProperty(cle);
    } else if (Date.now() - depuis > DELAI_MAX) {
      if (fil) fil.reply("Pas de réponse au bout de 2 heures : regarde l'onglet Actions du dépôt GitHub.");
      props.deleteProperty(cle);
    }
  });
}
