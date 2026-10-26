// Lecture et écriture du fichier .env (jetons et clés, jamais versionnés ni affichés).
const fs = require('fs');
const path = require('path');

const FICHIER = path.join(__dirname, '..', '.env');

// Sur GitHub Actions, les clés arrivent par les variables d'environnement (secrets du dépôt).
const CLES = ['INSTAGRAM_TOKEN', 'GEMINI_KEY', 'GITHUB_TOKEN'];

function lireEnv() {
  const depuisSecrets = Object.fromEntries(CLES.filter((k) => process.env[k]).map((k) => [k, process.env[k]]));
  return { ...lireFichier(), ...depuisSecrets };
}

function lireFichier() {
  if (!fs.existsSync(FICHIER)) return {};
  return Object.fromEntries(
    fs.readFileSync(FICHIER, 'utf8').replace(/^﻿/, '').split(/\r?\n/)
      .filter((l) => l.includes('='))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  );
}

function ecrireEnv(valeurs) {
  const env = { ...lireFichier(), ...valeurs };
  fs.writeFileSync(FICHIER, Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n');
}

module.exports = { lireEnv, ecrireEnv };
