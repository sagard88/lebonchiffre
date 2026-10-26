# Le système autonome de @lebonchiffre

Objectif : 3 posts par jour (8 h, 14 h, 19 h) et l'actu brûlante publiée vite, sans épuiser le quota de l'abonnement Claude Pro.

## Principe : Claude ne travaille que quand ça vaut le coup

| Rôle | Qui | Coût en tokens |
|---|---|---|
| Veille des tendances, toutes les 45 min | script `gabarit/veille.js` (Google Trends, Google Actualités, Reddit, YouTube) | 0 |
| Publication aux heures prévues | script `gabarit/publier.js`, lancé par le Planificateur de tâches | 0 |
| Choix du sujet, vérification à 2 sources, rédaction, fabrication | Claude Code (`claude -p`, modèle Sonnet) | seulement là |

## Les passages de Claude (3 par jour au plus, 4 si l'actu flambe)

1. **7 h** : prépare le post de 8 h (actu du matin) et celui de 14 h.
2. **18 h** : prépare le post de 19 h (actu du jour).
3. **Alerte « brûlant »** : quand la veille repère un sujet très chaud (au moins 5 grands médias en 1 h, ou plus de 100 000 recherches sur Google Trends), Claude prépare un post publié aussitôt. **Une alerte par jour au plus**, et pas entre 23 h et 7 h.

Les deux passages planifiés sont espacés de plus de 5 heures : chacun tombe dans une fenêtre de quota différente de l'abonnement Pro.

## Économies

- **Réserve de sujets de fond** : des posts « intemporels » préparés à l'avance, par lots, pendant les sessions avec Olivier. Ils comblent un créneau quand l'actu du moment ne vaut pas un passage de Claude.
- **Abandon rapide** : sujet laissé de côté dès que les 2 sources ne concordent pas.
- **Images** : vraie photo libre d'abord ; Gemini en dernier recours (crédit de 5 €).
- **Journal** : tokens consommés à chaque passage, dans `journal/claude.log`, pour mesurer le vrai coût.

## Garde-fous

- Fichier `PAUSE` à la racine : plus rien n'est publié.
- Un post déjà publié ne repart jamais (`publie.json`).
- Journal de chaque publication : `journal/publications.log`.
- E-mail récapitulatif chaque soir à lebonchiffre.actu@gmail.com.
- Le PC doit être allumé aux heures de passage : sinon le créneau saute.
