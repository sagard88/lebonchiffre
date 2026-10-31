#!/usr/bin/env bash
# Lance un passage de Claude Code (modèle Sonnet, abonnement Pro) et note sa consommation.
# Usage : bash gabarit/ci-claude.sh matin|soir|brulant|commande  (commande : consigne d'Olivier dans /tmp/consigne.txt)
set -e
MODE="$1"
CONSIGNE=""
[ "$MODE" = "commande" ] && CONSIGNE=" Consigne d'Olivier : $(cat /tmp/consigne.txt)"
npm install -g -s @anthropic-ai/claude-code
claude -p "Mode : $MODE. Nous sommes le $(TZ=Europe/Paris date '+%A %d %B %Y, %H:%M') (heure de Paris). Suis CONSIGNES-AUTO.md à la lettre.$CONSIGNE" \
  --model sonnet --max-turns 80 --output-format json \
  --allowedTools "Read,Write,Edit,Glob,Grep,WebSearch,WebFetch,Bash(npm run:*),Bash(node:*),Bash(curl:*),Bash(ls:*),Bash(mkdir:*),Bash(cp:*),Bash(mv:*),Bash(file:*)" \
  > /tmp/claude.json || true
node -e '
const fs = require("fs");
let r = {}; try { r = JSON.parse(fs.readFileSync("/tmp/claude.json", "utf8")); } catch {}
const u = r.usage || {};
// La dernière réponse de Claude : sans elle, un passage qui ne prépare rien ne dit pas pourquoi.
const reponse = String(r.result || "").replace(/\s+/g, " ").slice(0, 1500);
const refus = (r.permission_denials || []).map((d) => `${d.tool_name} ${JSON.stringify(d.tool_input).slice(0, 80)}`).join(" ; ");
const ligne = `${new Date().toISOString()} ${process.argv[1]} : ${r.subtype || "échec"}, ${r.num_turns ?? "?"} tours, tokens entrée ${u.input_tokens ?? "?"} + cache ${(u.cache_read_input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0)}, sortie ${u.output_tokens ?? "?"} | ${reponse}${refus ? " | refus : " + refus : ""}\n`;
fs.mkdirSync("journal", { recursive: true });
fs.appendFileSync("journal/claude.log", ligne);
console.log(ligne.trim());
' "$MODE"
