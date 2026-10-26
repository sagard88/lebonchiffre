// Prépare les 3 versions du post Ballon d'Or 2026 (une par finaliste).
const fs = require('fs');
const path = require('path');
const credit = 'Photo : Bryan Berlin, CC BY-SA 4.0, Wikimedia Commons';
const base = (nom, accent, photo, couv, chiffres, liste, contexte, question, tags) => ({
  accent, style: 'photo', rubrique: "Ballon d'Or",
  pages: [
    { type: 'couverture', ...couv, image: photo, credit: 'Photo : Bryan Berlin', source: 'France Football' },
    { type: 'chiffres', etiquette: 'Sa saison', titre: chiffres.titre, chiffres: chiffres.lignes, source: 'Sky Sports, France 24' },
    { type: 'liste', etiquette: 'Le podium', titre: 'Les trois finalistes.', lignes: liste, source: 'France Football' },
    { type: 'fin', sources: ['France Football, cérémonie du 26 octobre 2026', 'Sky Sports, statistiques 2025-2026', 'France 24, 26 octobre 2026', credit], question },
  ],
  legende: { contexte, hashtags: tags },
});
const podium = (premier) => [
  { gauche: '1er', droite: premier, fort: true },
  { gauche: '2e', droite: 'à compléter' },
  { gauche: '3e', droite: 'à compléter' },
];
const posts = {
  kane: base('kane', 'rouge', 'kane.jpg',
    { chiffre: '73 buts', phrase: 'en une saison pour Harry Kane, Ballon d\'Or 2026.', contexte: 'Lundi 26 octobre, à Londres : premier Anglais sacré depuis 2001.' },
    { titre: 'Une saison record.', lignes: [
      { valeur: '73', texte: 'Buts en club et en sélection, dont 61 avec le Bayern Munich.' },
      { valeur: '3', texte: 'Titres avec le Bayern : Bundesliga, Coupe d\'Allemagne et Supercoupe.' },
      { valeur: '3e', texte: 'Place de l\'Angleterre au Mondial 2026, après une victoire contre la France.' } ] },
    podium('Harry Kane (Bayern, Angleterre)'),
    "Harry Kane remporte le Ballon d'Or 2026, lundi 26 octobre au London Palladium. L'attaquant du Bayern Munich devient le premier Anglais sacré depuis Michael Owen en 2001, au terme d'une saison à 73 buts en club et en sélection.\n\nAvec le Bayern, il a remporté la Bundesliga, la Coupe et la Supercoupe d'Allemagne. Au Mondial 2026, il a marqué six buts et mené l'Angleterre jusqu'à la troisième place.\n\nUne 70e cérémonie organisée pour la première fois hors de France, à Londres.",
    'Kane méritait-il le Ballon d\'Or ?\nDites-le en commentaire.', ['ballondor', 'harrykane', 'football', 'bayern', 'actu']),
  mbappe: base('mbappe', 'bleu', 'mbappe.jpg',
    { chiffre: '22 buts', phrase: 'en Coupe du monde pour Kylian Mbappé, Ballon d\'Or 2026.', contexte: 'Lundi 26 octobre, à Londres : le record absolu de la compétition.' },
    { titre: 'Une saison record.', lignes: [
      { valeur: '58', texte: 'Buts en club et en sélection sur la saison 2025-2026.' },
      { valeur: '10', texte: 'Buts au Mondial 2026 : il termine meilleur buteur du tournoi.' },
      { valeur: '0', texte: 'Trophée collectif cette saison, avec le Real Madrid comme avec les Bleus.' } ] },
    podium('Kylian Mbappé (Real Madrid, France)'),
    "Kylian Mbappé remporte le Ballon d'Or 2026, lundi 26 octobre au London Palladium. L'attaquant du Real Madrid succède à Ousmane Dembélé : un deuxième sacre français de suite.\n\nSa saison : 58 buts en club et en sélection, le titre de meilleur buteur de Liga et celui du Mondial 2026 (10 buts). Avec 22 buts, il détient désormais le record absolu en Coupe du monde, même sans trophée collectif cette saison.\n\nUne 70e cérémonie organisée pour la première fois hors de France, à Londres.",
    'Mbappé méritait-il le Ballon d\'Or ?\nDites-le en commentaire.', ['ballondor', 'mbappe', 'football', 'realmadrid', 'actu']),
  yamal: base('yamal', 'jaune', 'yamal.jpg',
    { chiffre: '19 ans', phrase: 'pour Lamine Yamal, plus jeune Ballon d\'Or de l\'histoire.', contexte: 'Lundi 26 octobre, à Londres : champion du monde en juillet.' },
    { titre: 'Une saison en or.', lignes: [
      { valeur: '45', texte: 'Buts et passes décisives en club et en sélection (25 buts, 20 passes).' },
      { valeur: '3', texte: 'Titres : Liga et Supercoupe avec le Barça, Coupe du monde avec l\'Espagne.' },
      { valeur: '265', texte: 'Dribbles réussis, le record des cinq grands championnats européens.' } ] },
    podium('Lamine Yamal (FC Barcelone, Espagne)'),
    "Lamine Yamal remporte le Ballon d'Or 2026, lundi 26 octobre au London Palladium. À 19 ans, l'ailier du FC Barcelone devient le plus jeune lauréat de l'histoire, un record détenu jusqu'ici par le Brésilien Ronaldo, sacré à 21 ans en 1997.\n\nSa saison : champion du monde avec l'Espagne en juillet, champion d'Espagne avec le Barça, 25 buts et 20 passes décisives, malgré une blessure à la cuisse au printemps.\n\nUne 70e cérémonie organisée pour la première fois hors de France, à Londres.",
    'Yamal méritait-il le Ballon d\'Or ?\nDites-le en commentaire.', ['ballondor', 'lamineyamal', 'football', 'barca', 'actu']),
};
// Deux pages photo par version (3 vraies photos au total avec la couverture).
const photos = {
  kane: [
    { image: 'kane-a.jpg', titre: "Le capitaine de l'Angleterre.", texte: 'Six buts au Mondial 2026 et une troisième place.' },
    { image: 'kane-c.jpg', cadrage: '50% 15%', titre: 'Meilleur buteur de la saison.', texte: 'Il a aussi reçu ce soir le trophée Gerd Müller.' },
  ],
  mbappe: [
    { image: 'mbappe-b.jpg', titre: 'Le capitaine des Bleus.', texte: '10 buts au Mondial 2026 : meilleur buteur du tournoi.' },
    { image: 'mbappe-c.jpg', cadrage: '50% 20%', titre: '22 buts en Coupe du monde.', texte: 'Le record absolu de la compétition.' },
  ],
  yamal: [
    { image: 'yamal-c.jpg', titre: 'Champion du monde à 19 ans.', texte: "Avec l'Espagne, victorieuse de l'Argentine en finale le 19 juillet." },
    { image: 'yamal-a.jpg', titre: 'Déjà trois trophées Kopa.', texte: 'Meilleur jeune joueur du monde en 2024, 2025 et 2026.' },
  ],
};
for (const [nom, post] of Object.entries(posts)) {
  const [p1, p2] = photos[nom].map((p) => ({ type: 'image', ...p, credit: 'Photo : Bryan Berlin', source: 'Wikimedia Commons' }));
  post.pages.splice(1, 0, p1);
  post.pages.splice(3, 0, p2);
  const dir = path.join(__dirname, nom);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(path.join(__dirname, `${nom}-${nom === 'kane' ? 'b' : nom === 'mbappe' ? 'a' : 'b'}.jpg`), path.join(dir, `${nom}.jpg`));
  photos[nom].forEach((p) => fs.copyFileSync(path.join(__dirname, p.image), path.join(dir, p.image)));
  fs.writeFileSync(path.join(dir, 'post.json'), JSON.stringify(post, null, 2) + '\n');
}
