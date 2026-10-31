// Génère une illustration de couverture par l'API Gemini, avec le prompt type de CHARTE.md.
// Usage : node gabarit/illustrer.js posts/<dossier> "sujet en une phrase" [nom.jpg]
// Réservé aux idées et phénomènes : jamais pour un objet, une personne ou un lieu réels (CHARTE.md).
// Toujours réaliste et en couleur, jamais de noir et blanc (demande d'Olivier, 31/10/2026).
const fs = require('fs');
const path = require('path');
const { lireEnv } = require('./env');

const MODELE = 'gemini-3.1-flash-image';

function prompt(sujet) {
  return [
    `Image éditoriale pour un média d'information. Sujet : ${sujet}`,
    'Rendu photographique très réaliste, en couleur, couleurs naturelles et vives, lumière naturelle, belle profondeur de champ.',
    'Une image spectaculaire qui raconte le sujet d\'un coup d\'œil, avec de l\'émotion et des détails parlants, comme une photo de magazine.',
    'Le personnage ou l\'élément principal, grand et net, dans le haut de l\'image ; composition percutante, lisible en petit.',
    'Aucun texte, aucune lettre, aucun chiffre, aucun logo.',
    'Personnages entièrement fictifs : aucune personne réelle identifiable, aucun produit ou marque réels.',
    'Format portrait 4:5.',
  ].join('\n');
}

async function main() {
  const [dossierArg, sujet, nomArg] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!dossierArg || !sujet) {
    console.error('Usage : node gabarit/illustrer.js posts/<dossier> "sujet en une phrase" [nom.jpg]');
    process.exit(1);
  }
  const { GEMINI_KEY } = lireEnv();
  if (!GEMINI_KEY) throw new Error('GEMINI_KEY manquant dans .env');

  const rep = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODELE}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt(sujet) }] }],
      generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } },
    }),
  });
  const json = await rep.json();
  if (json.error) throw new Error(`Gemini : ${json.error.message}`);
  const image = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
  if (!image) throw new Error(`Gemini n'a pas renvoyé d'image (${json.candidates?.[0]?.finishReason ?? 'raison inconnue'})`);

  const ext = image.inlineData.mimeType === 'image/png' ? '.png' : '.jpg';
  const nom = nomArg ?? `illustration${ext}`;
  const sortie = path.resolve(dossierArg, nom);
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, Buffer.from(image.inlineData.data, 'base64'));
  // Crédit Gemini limité : chaque génération est notée pour suivre la dépense.
  const journal = path.join(__dirname, '..', 'journal', 'illustrations.log');
  fs.mkdirSync(path.dirname(journal), { recursive: true });
  fs.appendFileSync(journal, `${new Date().toISOString()} ${path.relative(path.join(__dirname, '..'), sortie)} : ${sujet}\n`);
  console.log(`✔ ${sortie}`);
}

main().catch((e) => { console.error(`✖ ${e.message}`); process.exit(1); });
