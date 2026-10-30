# Le Bon Chiffre (@lebonchiffre)

Compte Instagram d'actualité « L'actu en 1 chiffre », entièrement en français. Répondre toujours en français.

- Charte graphique et éditoriale : `CHARTE.md` (une image en couverture à chaque post : vraie image sourcée en priorité, illustration IA seulement si aucune ne convient ; date en couverture pour un événement daté ; chiffres vérifiés à 2 sources).
- Fabriquer un post : `npm run fabriquer -- posts/<dossier>` (format de `post.json` dans `README.md`).
- Publier par l'API Instagram : `npm run publier -- posts/<dossier>` (`--essai` pour tout préparer sans publier ; fichier `PAUSE` à la racine = plus aucune publication).
- Illustration Gemini : `npm run illustrer -- posts/<dossier> "sujet"` ; crédit de 5 € seulement, une génération par illustration.
- Veille des tendances (sans tokens) : `node gabarit/veille.js` ; code de sortie 10 = sujet brûlant.
- Fonctionnement du système automatique et économie du quota Claude Pro : `SYSTEME.md`.
- Planning de la semaine et posts programmés dans Meta Business Suite : `PLANNING.md`.
- Clés dans `.env` (INSTAGRAM_TOKEN, GEMINI_KEY, GITHUB_TOKEN) : ne jamais les afficher. Token Instagram à prolonger chaque mois : `npm run jeton`.
- Journaux : `journal/` (publications, illustrations, veille).
