@echo off
rem Double-cliquer pour lancer la veille de @lebonchiffre dans Claude Code.
rem Laisser la fenetre ouverte et le PC allume (sans mise en veille) tant que la veille doit tourner.
cd /d "%~dp0"
claude "Lance la veille de @lebonchiffre selon SYSTEME.md : execute node gabarit/veille.js toutes les 30 minutes avec un Monitor (relance-le a chaque expiration). Si un sujet est brulant (code 10), verifie-le a 2 sources, prepare le post selon CHARTE.md, fabrique-le et publie-le avec npm run publier. Respecte les economies de tokens et le credit Gemini. Tiens-moi au courant en une ligne a chaque publication."
