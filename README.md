# Le Bon Chiffre (@lebonchiffre)

Compte Instagram d'actualité : un chiffre par post, vérifié et expliqué.
La D.A. et les règles sont dans `CHARTE.md`.

## Fabriquer un post

1. Créer un dossier `posts/<date>-<sujet>/` contenant un fichier `post.json` (modèle : `posts/exemple-8-milliards/post.json`).
2. Lancer :

   ```
   npm run fabriquer -- posts/<date>-<sujet>
   ```

3. Résultat dans le même dossier : `images/1.png`, `2.png`… (1080 × 1350) et `legende.txt`.

Le programme vérifie d'abord le post (règles de la charte) et s'arrête en cas d'erreur.
Il signale aussi les textes trop longs : il les réduit d'abord de 25 % au plus, puis demande de raccourcir.
Il a seulement besoin de Node et de Google Chrome (rien à installer). Les polices sont dans `gabarit/polices/`.

## Le fichier post.json

```
{
  "accent": "jaune" | "rouge" | "vert" | "bleu" | "violet" | "rose" | "turquoise" | "orange",
  "rubrique": "Monde",                      // étiquette de la couverture
  "pages": [ ... 3 à 6 pages ... ],
  "legende": { "contexte": "2 ou 3 phrases", "hashtags": ["monde", "actu"] }
}
```

Chaque page a un `type` et une `source` (sauf la page `fin`).
`etiquette` remplace l'étiquette par défaut d'une page. Un `\n` dans un texte force un retour à la ligne.

| Type | Champs | Étiquette par défaut |
|---|---|---|
| `couverture` (toujours en 1re) | `chiffre` (8 caractères au plus), `phrase` (10 mots au plus), `contexte` | la rubrique |
| `liste` | `titre`, `lignes` : `[{ "gauche": "1804", "droite": "1 milliard", "fort": true }]` (`fort` = en couleur d'accent) | LE CONTEXTE |
| `chiffres` | `titre`, `chiffres` : `[{ "valeur": "10,3 Mds", "texte": "…" }]` (2 ou 3) | ET APRÈS ? |
| `graphique` | `titre`, `unite`, `sens` (`"horizontal"` sinon vertical), `barres` : `[{ "label": "2022", "valeur": 8, "affiche": "8", "jour": true, "projection": false }]` (8 au plus) | EN GRAPHIQUE |
| `image` | `image` (chemin du fichier, depuis le dossier du post), `credit` ou `"ia": true`, `titre`, `texte`, `cadrage` (facultatif, ex. `"50% 20%"` pour garder le haut d'une photo en hauteur) | EN IMAGE |
| `fin` (toujours en dernière) | `sources` (liste), `question` | SOURCES |

Dans un graphique : `jour` met la barre en couleur d'accent, `projection` la dessine en pointillés (la légende s'ajoute seule).
Une image est toujours passée en noir et blanc par le gabarit ; avec `"ia": true`, le crédit et la légende portent « Illustration générée par IA ».
