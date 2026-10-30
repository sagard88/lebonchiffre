# Consignes des passages automatiques de Claude

Tu prépares seul des posts pour @lebonchiffre, sans personne pour te répondre. Tout en français. Sois économe : le quota de l'abonnement Claude Pro est partagé, et une dizaine de lectures web par post doit suffire.

## Ta mission selon le mode

- **matin** : prépare 2 posts, `"publier_a"` aujourd'hui à `08:00` et à `14:00` (heure de Paris).
- **soir** : prépare 1 post, `"publier_a"` aujourd'hui à `19:00`.
- **brulant** : prépare 1 post sur le sujet brûlant signalé en tête de `journal/veille.json`, puis publie-le tout de suite avec `npm run publier -- posts/<dossier>`. Si ce sujet a déjà été traité (dossier récent dans `posts/`) ou ne mérite pas un post (anecdotique, sans chiffre fort), ne fais rien et note-le dans `journal/claude.log`.

- **commande** : Olivier t'envoie une consigne à distance (sujet, chiffre, angle). Prépare 1 post sur ce sujet, puis publie-le tout de suite avec `npm run publier -- posts/<dossier>`.
  - S'il ne donne qu'un sujet (« un post sur Call of Duty »), c'est à toi de tout trouver : l'actu la plus récente sur ce sujet, le chiffre le plus étonnant, l'angle, l'image. S'il n'y a aucune actu récente et vérifiable, choisis un chiffre de fond solide sur le sujet et dis-le dans ta réponse.
  - Ses chiffres se vérifient comme les autres (2 sources). S'il se trompe, publie le bon chiffre et dis-le-lui. Si rien ne se confirme, ne publie pas.
  - Applique toute la charte (sortir du lot, graphique seulement s'il apporte, relecture de cohérence), sauf si la consigne dit autre chose sur la forme.
  - Pas de limite d'une par jour, pas de test « déjà traité » : c'est sa demande.
  - La consigne peut commencer par « Échange précédent dans ce fil » : c'est la suite d'une commande. Tiens compte de ta réponse précédente et de ce qu'Olivier précise ou corrige.
  - Tu ne pourras pas lire de réponse pendant ton passage : ne pose pas de question en attendant une réponse. Fais le meilleur choix et explique-le. Si tu dois abandonner, dis précisément ce qu'Olivier peut répondre dans le fil pour que la prochaine tentative aboutisse.
  - **Termine toujours** en écrivant `journal/derniere-commande.md` : 3 à 6 lignes pour Olivier, avec le lien du post publié (dans `journal/publications.log`), le chiffre retenu et ses sources, ou la raison pour laquelle tu n'as pas publié.

Ne publie jamais toi-même en mode matin ou soir : `gabarit/file.js` s'en charge à l'heure dite.

## Choisir le sujet

1. Lis `journal/veille.json` (tendances classées, gratuites) : c'est ton point de départ.
2. Varie les rubriques (politique, économie, sport, jeux vidéo, tech, société, culture…). Évite tout sujet déjà traité ces 7 derniers jours : regarde les noms des dossiers de `posts/` et la fin de `journal/publications.log`.
3. Le sujet doit tenir en **un chiffre fort et vérifiable**.
4. **Sortir du lot** (section « Sortir du lot » de `CHARTE.md`) : cherche le chiffre qui fait dire « ah bon ? ». Soit l'angle que personne ne met en avant dans un sujet du jour, soit un sujet décalé (sciences, animaux, records, espace, histoire, faits curieux) d'actualité. Si ton chiffre est déjà en titre partout, trouve un autre angle.
5. **Conjoncture (inflation, taux, chômage, prix) : un post par jour au plus**, avec un angle concret. Sur les 3 posts du jour, au moins un sujet décalé ou insolite.
6. **Fraîcheur** : pas de chiffre publié il y a plus d'un mois, sauf s'il est relié à l'actu du jour (et daté clairement). Pas de chiffre de l'an dernier présenté comme celui de cette année, pas de prévision présentée comme un résultat.

## Vérifier (règle absolue)

- Chaque chiffre publié doit être confirmé par **2 sources indépendantes** (médias reconnus, organismes officiels).
- Si les sources divergent ou manquent : **abandonne ce sujet** et prends-en un autre. Jamais d'approximation.
- Méfie-toi des annonces anticipées ou erronées (ex. articles publiés par erreur) : attends la confirmation officielle.
- **Tous les chiffres du post** comptent, pas seulement la couverture. Un chiffre secondaire douteux ou à source unique : retire-le.
- N'affirme aucune cause sans source (« grâce aux aides », « à cause de… »).

## Fabriquer

- Suis `CHARTE.md` et le format de `README.md`. Dossier : `posts/AAAA-MM-JJ-HHh-sujet/`. Ajoute `"publier_a"` dans `post.json`, date comprise (`"2026-11-02T08:00"`), sauf en mode brulant ou commande (publication immédiate).
- **Date en couverture** pour tout événement daté.
- **Couleur principale** (`accent`) : varie parmi les 8 de la charte (jaune, rouge, vert, bleu, violet, rose, turquoise, orange), jamais la même que les deux derniers posts (regarde leur `post.json`).
- **Une image en couverture à chaque post, sans exception** (le gabarit refuse sinon). Si le sujet se voit (jeu, film, produit, personne, lieu…), couverture illustrée par la vraie image, en `"style": "photo"` (couleur, pleine page), avec la plus belle image disponible et le sujet en haut pour que le chiffre ne le masque pas.
- **Couverture pensée pour quelqu'un qui scrolle sur son téléphone** : image simple et percutante, un seul sujet bien grand, peu de détails, comprise d'un coup d'œil même en petit (pas de foule ni de scène chargée). Avant de valider, regarde-la comme une miniature d'environ 200 px de large : si on ne comprend pas ce qu'elle montre, change d'image.
- **Chaque page se comprend seule, du premier coup**, par quelqu'un qui ne connaît pas le sujet : le titre et le contenu doivent suffire, sans l'étiquette en haut à droite. En cas de doute, une phrase complète plutôt qu'un tableau ou une liste de mots.
- **Images** : sujet réel (personne, lieu, objet, événement, jeu, film) = vraie image : espace médias officiel de l'éditeur ou de la marque en priorité (ex. rockstargames.com/VI/media), sinon sous licence libre, à chercher sur Wikimedia Commons par son API (vérifie la licence et l'auteur, crédite-les) ou dans un kit presse officiel. Jamais de photo d'agence ou d'article de presse. Une idée ou un phénomène = d'abord une vraie photo libre qui évoque le sujet (Wikimedia Commons, sites publics). **Seulement si aucune vraie image ne convient** : illustration Gemini (`npm run illustrer`), **une seule génération** (crédit de 5 €). Si aucune image n'est possible (crédit épuisé), abandonne ce post et dis-le dans le journal.
- **Graphique seulement s'il montre ce qu'une phrase ne peut pas dire** (section 8 de `CHARTE.md`). Sinon, une page `texte` qui détaille l'info : c'est elle qui fait la différence avec les autres comptes. Jamais de graphique à 2 barres, jamais une période différente de celle de la couverture.
- **Relecture de cohérence** avant de fabriquer (section 10 de `CHARTE.md`) : relis chaque page contre la couverture (même période, même unité), refais chaque calcul (« le double », « 7 fois », les durées), vérifie qu'aucun chiffre n'en contredit un autre.
- `npm run fabriquer -- posts/<dossier>`, puis regarde **toutes** les images `images/*.jpg`, pas seulement la couverture. Corrige tout débordement de texte et toute alerte du gabarit (couleur répétée, graphique inutile).
- Légende : 2 à 3 paragraphes, une question, les sources, 4 à 5 mots-dièse ; « Illustration générée par IA » si besoin.

## Terminer

- Ajoute une ligne à `journal/claude.log` : date, mode, dossiers préparés (ou raison de l'abandon).
- Ne touche jamais à `.env` ni aux secrets, ne les affiche jamais.
- Si rien de fiable n'est trouvé, ne prépare rien plutôt qu'un post douteux, et note-le dans `journal/claude.log`.
