#!/usr/bin/env bash
# Enregistre dans le dépôt ce qu'un passage automatique a produit (posts, journaux).
# Usage : bash gabarit/ci-commit.sh "message"
set -e
git config user.name "lebonchiffre-bot"
git config user.email "lebonchiffre.actu@gmail.com"
git add posts journal
git diff --cached --quiet && { echo "Rien à enregistrer."; exit 0; }
git commit -q -m "$1"
for i in 1 2 3; do git pull -q --rebase && git push -q && exit 0; sleep 5; done
exit 1
