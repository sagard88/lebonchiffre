// Commande de posts par e-mail pour @lebonchiffre (Google Apps Script, compte lebonchiffre.actu@gmail.com).
// Olivier écrit à lebonchiffre.actu@gmail.com (« Publie un post sur Call of Duty ») : le script lance le
// workflow « Commande » sur GitHub, accuse réception, puis renvoie la réponse de Claude dans le même fil.
// Installation : voir COMMANDE-MAIL.md. Déclencheur : verifierCommandes, toutes les minutes.

const EXPEDITEUR = 'olivier.vasson@gmail.com';
const DEPOT = 'sagard88/lebonchiffre';
const ETIQUETTE = 'commande-lbc';
const DELAI_MAX = 2 * 3600 * 1000;

function github(chemin, options) {
  const jeton = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  return UrlFetchApp.fetch('https://api.github.com/repos/' + DEPOT + chemin, Object.assign({
    headers: { Authorization: 'Bearer ' + jeton, Accept: 'application/vnd.github+json' },
    muteHttpExceptions: true,
  }, options || {}));
}

function verifierCommandes() {
  const props = PropertiesService.getScriptProperties();
  const code = (props.getProperty('CODE') || '').trim();
  const etiquette = GmailApp.getUserLabelByName(ETIQUETTE) || GmailApp.createLabel(ETIQUETTE);

  // 1. Nouvelles commandes : un e-mail non lu d'Olivier, jamais traité.
  const fils = GmailApp.search('from:' + EXPEDITEUR + ' is:unread in:inbox newer_than:1d -label:' + ETIQUETTE);
  fils.forEach(function (fil) {
    const msg = fil.getMessages().pop();
    // Le texte d'Olivier seulement, sans signature ni message cité.
    const corps = msg.getPlainBody().split(/\n-- ?\n|\nLe .+ a écrit ?:|\nEnvoyé de /)[0];
    let consigne = (msg.getSubject() + '\n' + corps).trim();
    if (code) {
      if (consigne.toLowerCase().indexOf(code.toLowerCase()) === -1) return;
      consigne = consigne.split(code).join('').trim();
    }
    const id = fil.getId();
    const rep = github('/actions/workflows/commande.yml/dispatches', {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ ref: 'main', inputs: { consigne: consigne.slice(0, 3000), id: id } }),
    });
    if (rep.getResponseCode() === 204) {
      fil.reply("Bien reçu, je m'en occupe. Réponse dans ce fil d'ici 10 à 20 minutes.");
      props.setProperty('attente_' + id, String(Date.now()));
    } else {
      fil.reply("La commande n'a pas pu être lancée (GitHub a répondu " + rep.getResponseCode() + ').');
    }
    fil.markRead();
    fil.addLabel(etiquette);
  });

  // 2. Réponses : dès que Claude a rangé sa réponse dans journal/commandes/<id>.md, on la renvoie.
  const toutes = props.getProperties();
  Object.keys(toutes).forEach(function (cle) {
    if (cle.indexOf('attente_') !== 0) return;
    const id = cle.slice('attente_'.length);
    const rep = github('/contents/journal/commandes/' + id + '.md', {
      headers: {
        Authorization: 'Bearer ' + props.getProperty('GITHUB_TOKEN'),
        Accept: 'application/vnd.github.raw',
      },
    });
    const fil = GmailApp.getThreadById(id);
    if (rep.getResponseCode() === 200) {
      if (fil) fil.reply(rep.getContentText());
      props.deleteProperty(cle);
    } else if (Date.now() - Number(toutes[cle]) > DELAI_MAX) {
      if (fil) fil.reply("Pas de réponse au bout de 2 heures : regarde l'onglet Actions du dépôt GitHub.");
      props.deleteProperty(cle);
    }
  });
}
