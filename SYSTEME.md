# Le système autonome de @lebonchiffre

Objectif : 3 posts par jour (8 h, 14 h, 19 h) et l'actu brûlante publiée vite, sans épuiser le quota de l'abonnement Claude Pro.

## Principe : Claude ne travaille que quand ça vaut le coup

| Rôle | Qui | Coût en tokens |
|---|---|---|
| Veille des tendances, toutes les 45 min | script `gabarit/veille.js` (Google Trends, Google Actualités, Reddit, YouTube) | 0 |
| Publication aux heures prévues | script `gabarit/file.js`, lancé chaque heure de 7 h à 23 h | 0 |
| Choix du sujet, vérification à 2 sources, rédaction, fabrication | Claude Code (`claude -p`, modèle Sonnet) | seulement là |

## L'horloge : le script Google

Les horaires de GitHub Actions arrivent avec des heures de retard, parfois pas du tout (constaté fin octobre 2026). Le script Google des commandes par e-mail (`gabarit/commande-mail.gs`, compte lebonchiffre.actu) lance donc lui-même la préparation, la publication, le récap de 21 h 30 et la prolongation du token, à l'heure de Paris. Seule la veille garde les horaires de GitHub. **Après toute modification de `commande-mail.gs`, recoller le code dans script.google.com.**

## Les passages de Claude (3 par jour au plus, 4 si l'actu flambe)

1. **7 h** : prépare le post de 8 h (actu du matin) et celui de 14 h.
2. **18 h** : prépare le post de 19 h (actu du jour).
3. **Alerte « brûlant »** : quand la veille repère un sujet très chaud (au moins 5 grands médias en 2 h et plus de 20 000 recherches, ou plus de 100 000 recherches sur Google Trends), Claude prépare un post publié aussitôt. **Une alerte par jour au plus**, et pas entre 23 h et 7 h.

Les deux passages planifiés sont espacés de plus de 5 heures : chacun tombe dans une fenêtre de quota différente de l'abonnement Pro.

## Économies

- **Réserve de sujets de fond** : des posts « intemporels » préparés à l'avance, par lots, pendant les sessions avec Olivier. Ils comblent un créneau quand l'actu du moment ne vaut pas un passage de Claude.
- **Abandon rapide** : sujet laissé de côté dès que les 2 sources ne concordent pas.
- **Images** : une image en couverture à chaque post ; vraie photo libre d'abord ; Gemini en dernier recours (crédit de 5 €).
- **Journal** : tokens consommés à chaque passage, dans `journal/claude.log`, pour mesurer le vrai coût.

## Garde-fous

- Fichier `PAUSE` à la racine : plus rien n'est publié.
- Un post déjà publié ne repart jamais (`publie.json`, et vérification de la légende parmi les 25 derniers posts du compte avant chaque publication).
- Instagram peut répondre « Application request limit reached » alors que le post est bien parti : `publier.js` vérifie en ligne avant de conclure à l'échec.
- Journal de chaque publication : `journal/publications.log`.
- E-mail récapitulatif chaque soir à lebonchiffre.actu@gmail.com.
- E-mail d'alerte à Olivier si rien n'est publié à 8 h 30, 14 h 30 ou 19 h 30 (à partir du 2 novembre).
- Le PC peut rester éteint : tout tourne chez GitHub et Google.
