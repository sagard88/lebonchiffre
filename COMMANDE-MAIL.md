# Commander un post par e-mail

Écris à **lebonchiffre.actu@gmail.com** depuis **olivier.vasson@gmail.com**, par exemple :

> Objet : Publie un post sur Call of Duty

Le script répond « Bien reçu », puis renvoie dans le même fil, 10 à 20 minutes plus tard, le lien du post publié (ou la raison de l'abandon).
Pour préciser ou corriger, réponds dans le même fil avec le code : la commande repart en tenant compte de l'échange.

## Installation (une seule fois, 10 minutes)

1. **Jeton GitHub dédié** : github.com → Settings → Developer settings → Fine-grained tokens → Generate new token.
   - Repository access : seulement `sagard88/lebonchiffre`.
   - Permissions : **Actions : Read and write**, **Contents : Read-only**.
   - Expiration : 1 an. Copie le jeton.
2. **Script** : connecté à **lebonchiffre.actu@gmail.com**, ouvre https://script.google.com → Nouveau projet.
   - Nomme-le « Commandes Le Bon Chiffre ».
   - Remplace tout le code par le contenu de `gabarit/commande-mail.gs`.
3. **Réglages** (roue dentée « Paramètres du projet » → Propriétés du script) :
   - `GITHUB_TOKEN` = le jeton de l'étape 1 ;
   - `CODE` (conseillé) = un mot secret court, par exemple `#lbc`, à mettre dans chaque e-mail. Sans lui, n'importe qui capable d'usurper ton adresse pourrait publier.
4. **Autoriser** : sélectionne la fonction `verifierCommandes` → Exécuter → accepte les autorisations Gmail et « services externes ».
5. **Déclencheur** : icône horloge → Ajouter un déclencheur → `verifierCommandes`, « Déclencheur temporel », « Minutes », **toutes les minutes**.

## Garde-fous

- Seuls les e-mails de `olivier.vasson@gmail.com` (et contenant le `CODE` s'il est réglé) sont lus.
- Fichier `PAUSE` à la racine du dépôt : plus aucune publication.
- Les règles sont celles de `CONSIGNES-AUTO.md` (mode commande) et de `CHARTE.md`.
