// Modèles HTML des pages d'un post, fidèles à CHARTE.md.
const { pathToFileURL } = require('url');
const path = require('path');

const COMPTE = 'Le Bon Chiffre';

const ACCENTS = {
  jaune: '#FFD60A',
  rouge: '#FF5A36',
  vert: '#3DDC97',
  bleu: '#5AA9FF',
  violet: '#B388FF',
  rose: '#FF6FB5',
  turquoise: '#2EE6D6',
  orange: '#FF9F1C',
};

const POLICES = pathToFileURL(path.join(__dirname, 'polices', 'polices.css')).href;

const STYLE = `
  html, body { margin: 0; background: #0B0B0C; }
  * { box-sizing: border-box; }
  .page { width: 1080px; height: 1350px; padding: 80px; display: flex; flex-direction: column;
    background: #0B0B0C; color: #F5F5F2; font-family: Inter, sans-serif; overflow: hidden; }
  .haut { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
  .compte { font-size: 30px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; }
  .etiquette { font-size: 26px; font-weight: 600; color: #0B0B0C; background: var(--accent);
    padding: 10px 20px; text-transform: uppercase; white-space: nowrap; }
  .contenu { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center;
    padding: 40px 0; }
  .bas { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px;
    font-size: 26px; color: #8E8E88; }
  .bas .num { font-weight: 600; color: #F5F5F2; white-space: nowrap; }
  .anton { font-family: Anton, sans-serif; font-weight: 400; }
  .lignes { white-space: pre-line; }
  .titre { font-size: 64px; font-weight: 800; line-height: 1.1; }
  .explication { font-size: 36px; line-height: 1.35; color: #B8B8B2; }
  .accent { color: var(--accent); }

  /* Couverture */
  .gros { font-size: 400px; line-height: 0.9; color: var(--accent); letter-spacing: -0.01em; white-space: nowrap; }
  .trait { width: 140px; height: 12px; background: #F5F5F2; }
  .page.illustree { position: relative; }
  .page.illustree > .haut, .page.illustree > .contenu, .page.illustree > .bas { position: relative; z-index: 1; }
  .page.illustree > .contenu { justify-content: flex-end; }
  .fond { position: absolute; top: 160px; left: 0; width: 1080px; height: 760px; }
  .fond img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.15) brightness(0.8); }
  .fond::after { content: ''; position: absolute; inset: 0;
    background: linear-gradient(to bottom, #0B0B0C 0, rgba(11,11,12,0) 100px, rgba(11,11,12,0) 35%, rgba(11,11,12,0.85) 62%, #0B0B0C 80%); }

  /* Style « photo » : images en couleur, couverture en pleine page */
  .photo .fond img, .photo .cadre img { filter: contrast(1.05) brightness(0.92); }
  .photo .fond { top: 0; height: 1350px; }
  .photo .fond::after {
    background: linear-gradient(to bottom, rgba(11,11,12,0.7) 0, rgba(11,11,12,0) 240px, rgba(11,11,12,0) 38%, rgba(11,11,12,0.88) 62%, #0B0B0C 80%); }

  /* Liste */
  .ligne { display: flex; align-items: baseline; gap: 32px; border-top: 2px solid #2A2A2C; padding-top: 14px; }
  .ligne .g { font-size: 64px; min-width: 200px; }
  .ligne .d { font-size: 38px; color: #B8B8B2; }
  .ligne.fort .g, .ligne.fort .d { color: var(--accent); }
  .ligne.fort .d { font-weight: 600; }

  /* Chiffres */
  .valeur { font-size: 120px; line-height: 1; color: var(--accent); }

  /* Graphique */
  .barres { display: flex; align-items: flex-end; justify-content: space-between; border-bottom: 2px solid #8E8E88; }
  .colonne { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .colonne .v { font-size: 44px; white-space: nowrap; }
  .barre { background: #5C5C58; border-radius: 4px 4px 0 0; }
  .barre.jour { background: var(--accent); }
  .barre.projection { background: transparent; border: 3px dashed #8E8E88; border-bottom: 0; }
  .etiquettes { display: flex; justify-content: space-between; font-size: 28px; color: #B8B8B2; }
  .etiquettes div { text-align: center; }
  .etiquettes .jour { font-weight: 600; color: #F5F5F2; }
  .legende-graph { display: flex; gap: 32px; font-size: 26px; color: #B8B8B2; }
  .legende-graph div { display: flex; align-items: center; gap: 12px; }
  .pastille { width: 28px; height: 28px; border-radius: 4px; background: #5C5C58; }
  .pastille.projection { background: transparent; border: 3px dashed #8E8E88; }
  .hligne { display: flex; align-items: center; gap: 24px; }
  .hligne .l { width: 260px; font-size: 30px; color: #B8B8B2; }
  .hligne.jour .l { color: #F5F5F2; font-weight: 600; }
  .hligne .piste { flex: 1; display: flex; align-items: center; gap: 20px; border-left: 2px solid #8E8E88; padding: 8px 0; }
  .hbarre { height: 56px; background: #5C5C58; border-radius: 0 4px 4px 0; }
  .hbarre.jour { background: var(--accent); }
  .hbarre.projection { background: transparent; border: 3px dashed #8E8E88; border-left: 0; }
  .hligne .v { font-size: 44px; white-space: nowrap; }

  /* Image */
  .cadre { height: 640px; border-bottom: 12px solid var(--accent); background: #2A2A2C; overflow: hidden; }
  .cadre img { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.1); }
  .credit { font-size: 24px; color: #8E8E88; }

  /* Fin */
  .encadre { display: flex; flex-direction: column; gap: 24px; border: 2px solid #2A2A2C; padding: 44px 48px; }
  .encadre .t { font-size: 28px; font-weight: 600; letter-spacing: 0.06em; color: #8E8E88; }
  .encadre .s { font-size: 34px; line-height: 1.4; }
  .rdv { font-size: 150px; line-height: 1.02; color: var(--accent); }
  .question { font-size: 40px; font-weight: 600; line-height: 1.35; }
`;

// Ajuste les tailles : le gros chiffre tient sur la largeur, et le contenu dans la page.
// Le résultat est lu par fabriquer.js.
const AJUSTEMENT = `
  window.ajuster = function () {
    for (const el of document.querySelectorAll('[data-largeur]')) {
      let taille = parseFloat(getComputedStyle(el).fontSize);
      while (el.scrollWidth > el.parentElement.clientWidth && taille > 120) {
        taille -= 4;
        el.style.fontSize = taille + 'px';
      }
    }
    const contenu = document.querySelector('.contenu');
    const textes = [...document.querySelectorAll('[data-reduire]')];
    const depart = textes.map((el) => parseFloat(getComputedStyle(el).fontSize));
    let echelle = 1;
    while (contenu.scrollHeight > contenu.clientHeight + 1 && echelle > 0.75) {
      echelle -= 0.03;
      textes.forEach((el, i) => { el.style.fontSize = depart[i] * echelle + 'px'; });
    }
    return {
      deborde: contenu.scrollHeight > contenu.clientHeight + 1,
      echelle: Math.round(echelle * 100),
    };
  };
`;

// Typographie française : apostrophe courbe, espaces insécables autour des guillemets et avant : ; ! ? % €.
function typographie(texte) {
  return String(texte ?? '')
    .replace(/'/g, '’')
    .replace(/«\s*/g, '« ')
    .replace(/\s*»/g, ' »')
    .replace(/\s+([:;!?%€])/g, ' $1')
    .replace(/(\d)[   ](\d{3})\b/g, '$1 $2');
}

function echapper(texte) {
  return typographie(texte)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function texteCredit(p) {
  return p.credit ?? (p.ia ? 'Illustration générée par IA' : '');
}

function document_(accent, corps, style) {
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="${POLICES}">
<style>${STYLE}</style>
<script>${AJUSTEMENT}</script>
</head>
<body class="${style === 'photo' ? 'photo' : ''}" style="--accent: ${accent}">
${corps}
</body>
</html>`;
}

function cadre(page, ctx, contenu, gap) {
  const gauche = page.type === 'fin' ? 'Abonnez-vous · Enregistrez ce post' : `Source : ${echapper(page.source)}`;
  const droite = page.type === 'couverture' ? 'Glissez pour comprendre →' : `${ctx.numero} / ${ctx.total}`;
  // Couverture illustrée : l'image en fond sur le haut de la page, le chiffre posé dessus.
  const fond = page.type === 'couverture' && page.image ? `
  <div class="fond"><img src="${pathToFileURL(path.resolve(ctx.dossier, page.image)).href}" alt=""></div>` : '';
  let credit = fond ? ` · ${echapper(texteCredit(page))}` : '';
  let gaucheFinale = gauche;
  if (fond && texteCredit(page) === `Photo : ${page.source}`) {
    gaucheFinale = `Source et photo : ${echapper(page.source)}`;
    credit = '';
  }
  return `<div class="page${fond ? ' illustree' : ''}">${fond}
  <div class="haut"><div class="compte">${COMPTE}</div><div class="etiquette">${echapper(ctx.etiquette)}</div></div>
  <div class="contenu" style="gap: ${gap}px">${contenu}</div>
  <div class="bas"><div>${gaucheFinale}${credit}</div><div class="num">${droite}</div></div>
</div>`;
}

const MODELES = {
  couverture(p) {
    return [`
    <div class="gros anton" data-largeur>${echapper(p.chiffre)}</div>
    <div class="trait"></div>
    <div class="titre lignes" data-reduire>${echapper(p.phrase)}</div>
    ${p.contexte ? `<div class="explication lignes" data-reduire>${echapper(p.contexte)}</div>` : ''}`, 32];
  },

  liste(p) {
    const lignes = p.lignes.map((l) => `
      <div class="ligne${l.fort ? ' fort' : ''}"><div class="g anton" data-reduire>${echapper(l.gauche)}</div><div class="d" data-reduire>${echapper(l.droite)}</div></div>`).join('');
    return [`
    <div class="titre lignes" data-reduire>${echapper(p.titre)}</div>
    <div style="display: flex; flex-direction: column; gap: 14px;">${lignes}</div>`, 48];
  },

  chiffres(p) {
    const items = p.chiffres.map((c) => `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div class="valeur anton" data-reduire>${echapper(c.valeur)}</div>
        <div class="explication lignes" data-reduire>${echapper(c.texte)}</div>
      </div>`).join('');
    return [`<div class="titre lignes" data-reduire>${echapper(p.titre)}</div>${items}`, 56];
  },

  graphique(p) {
    const max = Math.max(...p.barres.map((b) => b.valeur));
    const projection = p.barres.some((b) => b.projection);
    const classe = (b) => (b.jour ? ' jour' : b.projection ? ' projection' : '');
    let graph;
    if (p.sens === 'horizontal') {
      graph = `<div style="display: flex; flex-direction: column; gap: 22px;">${p.barres.map((b) => `
        <div class="hligne${b.jour ? ' jour' : ''}"><div class="l">${echapper(b.label)}</div>
          <div class="piste"><div class="hbarre${classe(b)}" style="width: ${Math.max(4, (b.valeur / max) * 440)}px"></div>
          <div class="v anton${b.projection ? '" style="color: #B8B8B2' : ''}">${echapper(b.affiche ?? b.valeur)}</div></div></div>`).join('')}</div>`;
    } else {
      const n = p.barres.length;
      const largeur = Math.min(140, Math.floor((920 - 40 * (n - 1)) / n));
      const col = (b) => `
        <div class="colonne" style="width: ${largeur}px">
          <div class="v anton" style="${b.jour ? 'font-size: 56px;' : ''}${b.projection ? 'color: #B8B8B2;' : ''}">${echapper(b.affiche ?? b.valeur)}</div>
          <div class="barre${classe(b)}" style="width: ${largeur}px; height: ${Math.max(4, Math.round((b.valeur / max) * 500))}px"></div>
        </div>`;
      graph = `
        <div class="barres" style="height: 590px">${p.barres.map(col).join('')}</div>
        <div class="etiquettes">${p.barres.map((b) => `<div class="${b.jour ? 'jour' : ''}" style="width: ${largeur}px">${echapper(b.label)}</div>`).join('')}</div>`;
    }
    const legende = projection ? `
      <div class="legende-graph"><div><div class="pastille"></div>Mesuré</div><div><div class="pastille projection"></div>Projection</div></div>` : '';
    return [`
    <div style="display: flex; flex-direction: column; gap: 16px;">
      <div class="titre lignes" data-reduire>${echapper(p.titre)}</div>
      ${p.unite ? `<div class="explication" style="font-size: 34px" data-reduire>${echapper(p.unite)}</div>` : ''}
    </div>
    <figure style="margin: 0; display: flex; flex-direction: column; gap: 16px;">${graph}${legende}</figure>`, 48];
  },

  image(p, ctx) {
    const src = pathToFileURL(path.resolve(ctx.dossier, p.image)).href;
    return [`
    <div style="display: flex; flex-direction: column; gap: 14px;">
      <div class="cadre"><img src="${src}" alt=""${p.cadrage ? ` style="object-position: ${echapper(p.cadrage)}"` : ''}></div>
      <div class="credit">${echapper(texteCredit(p))}</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div class="titre lignes" style="font-size: 60px" data-reduire>${echapper(p.titre)}</div>
      ${p.texte ? `<div class="explication lignes" style="font-size: 34px" data-reduire>${echapper(p.texte)}</div>` : ''}
    </div>`, 40];
  },

  fin(p, ctx) {
    const sources = p.sources.map((s) => `<div class="s" data-reduire>${echapper(s)}</div>`).join('');
    return [`
    <div class="encadre"><div class="t">VÉRIFIÉ AVEC</div>${sources}</div>
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div class="rdv anton lignes" data-reduire>${echapper(p.signature ?? ctx.signature)}</div>
      <div class="question lignes" data-reduire>${echapper(p.question)}</div>
    </div>`, 56];
  },
};

const ETIQUETTES = { liste: 'Le contexte', chiffres: 'Et après ?', graphique: 'En graphique', image: 'En image', fin: 'Sources' };

// Phrases de fin, sans référence au temps (plusieurs posts par jour). Choisie selon le chiffre du post,
// pour qu'un même post garde toujours la même ; `signature` sur la page fin l'impose.
const SIGNATURES = [
  'Retenez\nce chiffre.',
  'Un chiffre,\ntoute une histoire.',
  'Le prochain\narrive vite.',
  'Suivez\nle bon chiffre.',
  'Un chiffre\nvaut mieux qu’un long discours.',
];

function signature(post) {
  const cle = `${post.pages[0].chiffre}${post.pages[0].phrase}`;
  let h = 0;
  for (const c of cle) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SIGNATURES[h % SIGNATURES.length];
}

function htmlPage(post, page, numero, total, dossier) {
  const ctx = {
    numero, total, dossier, signature: signature(post),
    etiquette: page.etiquette ?? (page.type === 'couverture' ? post.rubrique : ETIQUETTES[page.type]),
  };
  const [contenu, gap] = MODELES[page.type](page, ctx);
  return document_(ACCENTS[post.accent], cadre(page, ctx, contenu, gap), post.style);
}

module.exports = { htmlPage, ACCENTS, MODELES };
