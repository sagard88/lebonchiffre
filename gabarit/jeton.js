// Prolonge de 60 jours le token Instagram de .env (à lancer au moins une fois par mois).
// Usage : node gabarit/jeton.js
const { lireEnv, ecrireEnv } = require('./env');

async function main() {
  const { INSTAGRAM_TOKEN } = lireEnv();
  if (!INSTAGRAM_TOKEN) throw new Error('INSTAGRAM_TOKEN manquant dans .env');
  const rep = await fetch('https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=' + INSTAGRAM_TOKEN);
  const json = await rep.json();
  if (json.error) throw new Error(`Instagram : ${json.error.message}`);
  ecrireEnv({ INSTAGRAM_TOKEN: json.access_token });
  console.log(`✔ token prolongé de ${Math.round(json.expires_in / 86400)} jours`);
}

main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
