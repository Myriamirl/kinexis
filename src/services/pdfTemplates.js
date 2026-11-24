/**
 * TEMPLATE HTML DE RENDU DU COMPTE-RENDU DE BILAN KINEXIS (PDF)
 */
const fs = require('fs');
const path = require('path');

const pdfCss = fs.readFileSync(path.join(__dirname, 'pdfStyles.css'), 'utf8');

module.exports = function generatePdfHtml(data) {
  const { patient = {}, dataBilan = {}, cabinet = {} } = data || {};

  const escapeHtml = (val) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const clean = String(dateStr).split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0].slice(-2)}`;
    }
    return dateStr;
  };

  const formatTaille = (taille) => {
    if (!taille) return '';
    const num = Number(taille);
    if (!Number.isNaN(num) && num > 3) {
      const m = Math.floor(num / 100);
      const cm = String(Math.round(num % 100)).padStart(2, '0');
      return `${m}m${cm}`;
    }
    return String(taille);
  };

  const nomComplet = `${patient.nom || ''} ${patient.prenom || ''}`.trim() || '-';
  const coteOpereRaw = (dataBilan.coteOpere || patient.cote_opere || patient.coteOpere || '').toString().trim();
  const isOpereDroit = coteOpereRaw.toLowerCase().includes('droit');
  const coteOpereLabel = coteOpereRaw || '-';
  const coteSainLabel = coteOpereRaw
    ? (isOpereDroit ? 'Gauche' : 'Droit')
    : '-';

  const poidsKg = Number(dataBilan.poids || patient.poids_kg || patient.poids || 0);
  const tailleFormatted = formatTaille(dataBilan.taille || patient.taille_cm || patient.taille);

  const dateChirurgie = formatDate(
    dataBilan.dateOperation || dataBilan.dateChirurgie || dataBilan.date_chirurgie || patient.date_chirurgie
  );
  const dateBilan = formatDate(dataBilan.dateBilan || dataBilan.date_bilan);

  const titreBilan =
    dataBilan.delaiPostOp && dataBilan.delaiPostOp !== '-'
      ? `Bilan ${dataBilan.delaiPostOp.split('(')[0].trim().toUpperCase()} POST-LCA`
      : 'BILAN POST-LCA';

  const sportOrigine = dataBilan.sport || patient.sport_pratique || patient.sport || '-';
  const profilSportif = (dataBilan.profilSportif || patient.profil_sportif || '').toString().trim();
  const isPivot = profilSportif.toLowerCase().includes('pivot');
  const techniqueOp = dataBilan.techniqueOperatoire || patient.technique_operatoire || '-';
  const chirurgien = dataBilan.chirurgien || patient.medecin_chirurgien || '-';
  const kineNom = dataBilan.kineNom || cabinet?.praticien || 'Cabinet CKS';
  const mecanisme = dataBilan.mecanismeLesionnel || patient.mecanisme_lesionnel || '-';

  const renderDotBadge = (color, label) => {
    const cls =
      color === 'green'
        ? 'dot-green'
        : color === 'orange'
          ? 'dot-orange'
          : color === 'red'
            ? 'dot-red'
            : 'dot-gray';
    const textCls =
      color === 'green' ? 'text-green' : color === 'orange' ? 'text-orange' : color === 'red' ? 'text-red' : '';
    return `<span class="badge-item"><span class="dot ${cls}"></span><span class="${textCls}">${escapeHtml(label)}</span></span>`;
  };

  // 1. Mobilité articulaire & confiance
  const aclRsiVal = dataBilan.aclRsi ?? '';
  const aclRsiNum = Number(aclRsiVal);
  const hasAcl = aclRsiVal !== '' && !Number.isNaN(aclRsiNum);
  const aclValid = hasAcl && aclRsiNum >= 60;

  const extG = dataBilan.extG !== '' && dataBilan.extG !== undefined ? dataBilan.extG : 0;
  const extD = dataBilan.extD !== '' && dataBilan.extD !== undefined ? dataBilan.extD : 0;
  const extOp = isOpereDroit ? Number(extD) : Number(extG);
  const extValid = extOp === 0;

  const flexG = dataBilan.flexG !== '' && dataBilan.flexG !== undefined ? dataBilan.flexG : 0;
  const flexD = dataBilan.flexD !== '' && dataBilan.flexD !== undefined ? dataBilan.flexD : 0;
  const flexOp = isOpereDroit ? Number(flexD) : Number(flexG);
  const flexValid = flexOp >= 120;

  const vasteG = Number(dataBilan.vasteG || 0);
  const vasteD = Number(dataBilan.vasteD || 0);
  const vasteOp = isOpereDroit ? vasteD : vasteG;

  let vasteColor = 'green';
  let vasteLabel = 'Validé';
  if (vasteOp > 0 && vasteOp < 80) {
    vasteColor = 'red';
    vasteLabel = 'Non-Validé';
  } else if (vasteOp >= 80 && vasteOp < 150) {
    vasteColor = 'orange';
    vasteLabel = 'À renforcer';
  } else if (!dataBilan.vasteG && !dataBilan.vasteD) {
    vasteColor = 'gray';
    vasteLabel = 'NR';
  }

  // 2. Tests fonctionnels & capacités dynamiques
  const squatQual = dataBilan.squatQual || {};
  const hopTests = dataBilan.hopTests || {};

  const computeSym = (sainRaw, opRaw) => {
    const s = Number(sainRaw);
    const o = Number(opRaw);
    if (!s && !o) return null;
    if (!s || !o) return { pct: null, label: 'NR', color: 'gray' };
    const diff = Math.round(((o - s) / Math.max(s, o)) * 100);
    const abs = Math.abs(diff);
    const color = abs <= 10 ? 'green' : abs <= 20 ? 'orange' : 'red';
    return {
      pct: diff,
      label: `${diff > 0 ? '+' : ''}${diff}%`,
      color
    };
  };

  const squatSain = isOpereDroit ? squatQual.peakConcG : squatQual.peakConcD;
  const squatOp = isOpereDroit ? squatQual.peakConcD : squatQual.peakConcG;
  const squatSym = computeSym(squatSain, squatOp);

  const slhSain = isOpereDroit ? hopTests.singleLegG : hopTests.singleLegD;
  const slhOp = isOpereDroit ? hopTests.singleLegD : hopTests.singleLegG;
  const slhSym = computeSym(slhSain, slhOp);

  const fshSain = isOpereDroit
    ? hopTests.frontSide30G || hopTests.side15G
    : hopTests.frontSide30D || hopTests.side15D;
  const fshOp = isOpereDroit
    ? hopTests.frontSide30D || hopTests.side15D
    : hopTests.frontSide30G || hopTests.side15G;
  const fshSym = computeSym(fshSain, fshOp);

  const tripleSain = isOpereDroit ? hopTests.tripleHopG : hopTests.tripleHopD;
  const tripleOp = isOpereDroit ? hopTests.tripleHopD : hopTests.tripleHopG;
  const tripleSym = computeSym(tripleSain, tripleOp);

  const appreciationFromSym = (sym, okLabel = 'Validé') => {
    if (!sym || sym.pct === null) return `<span class="text-red">Non-Réalisé</span>`;
    const abs = Math.abs(sym.pct);
    if (abs <= 10) return renderDotBadge('green', okLabel);
    if (abs <= 20) return renderDotBadge('orange', 'À surveiller');
    return renderDotBadge('red', 'Asymétrie importante');
  };

  // 3. Qualité du mouvement
  const stepDown = dataBilan.qualiteStepDown || {};
  const photos = dataBilan.photos || {};
  const photoG = photos.photoG || dataBilan.photoG || '';
  const photoD = photos.photoD || dataBilan.photoD || '';

  const anomalies = [];
  if (stepDown.pelvicDropG || stepDown.pelvicDropD) anomalies.push('Pelvic Drop');
  if (stepDown.valgusG || stepDown.valgusD) anomalies.push('valgus dynamique');
  if (stepDown.stiffLandingG || stepDown.stiffLandingD) anomalies.push('stiff landing');

  const analyseText =
    anomalies.length > 0
      ? `Présence de ${anomalies.join(' et ')} lors du latéral step down`
      : 'Aucune anomalie biomécanique relevée lors du latéral step down';

  // 4. VALD Profiling N/Kg
  const vald = dataBilan.vald || {};
  const muscles = [
    {
      name: 'Quadriceps (90°)',
      g: vald.quadG,
      d: vald.quadD,
      c3m: '> 5.5 N/kg',
      csport: isPivot ? '> 8,5 N/kg' : '> 7,5 N/kg'
    },
    {
      name: 'Ischio-Jambiers (30°)',
      g: vald.ischioG,
      d: vald.ischioD,
      c3m: '> 4.0 N/kg',
      csport: isPivot ? '> 5 N/kg' : '> 4,5 N/kg'
    },
    {
      name: 'Mollet (Flexion Plant.)',
      g: vald.soleaireG,
      d: vald.soleaireD,
      c3m: '> 15.0 N/kg',
      csport: isPivot ? '> 20N/kg' : '> 18N/kg'
    },
    {
      name: 'Moyen Fessier / Abducteurs',
      g: vald.fessierG,
      d: vald.fessierD,
      c3m: '> 5.0 N/kg',
      csport: '> 6 N/kg'
    },
    {
      name: 'Adducteurs de Hanche',
      g: vald.adducteurG,
      d: vald.adducteurD,
      c3m: '> 5.0 N/kg',
      csport: '> 6 N/kg'
    }
  ];

  const renderMuscleRow = (m) => {
    const sainN = Number(isOpereDroit ? m.g : m.d);
    const opN = Number(isOpereDroit ? m.d : m.g);

    const fmtForce = (nVal) => {
      if (!nVal) return '-';
      if (poidsKg > 0) {
        const rel = (nVal / poidsKg).toFixed(1).replace('.', ',');
        return `${rel} N/kg (${Math.round(nVal)}N)`;
      }
      return `${Math.round(nVal)}N`;
    };

    let ecartCell = '-';
    if (sainN > 0 && opN > 0) {
      const ecart = Math.round(((opN - sainN) / Math.max(opN, sainN)) * 100);
      const abs = Math.abs(ecart);
      const col = abs <= 10 ? 'green' : abs <= 20 ? 'orange' : 'red';
      ecartCell = renderDotBadge(col, `${ecart > 0 ? '+' : ''}${ecart} %`);
    }

    return `
      <tr>
        <td><strong>${escapeHtml(m.name)}</strong></td>
        <td>${fmtForce(sainN)}</td>
        <td>${fmtForce(opN)}</td>
        <td>${escapeHtml(m.c3m)}</td>
        <td>${escapeHtml(m.csport)}</td>
        <td>${ecartCell}</td>
      </tr>
    `;
  };

  const planAction = dataBilan.planAction || 'Aucune directive renseignée.';
  const repriseCourse = dataBilan.repriseCourse || '';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>${escapeHtml(titreBilan)} - ${escapeHtml(nomComplet)}</title>
      <style>${pdfCss}</style>
    </head>
    <body>
      <div class="pdf-page">
        <!-- EN-TÊTE & INFOS PATIENT -->
        <div class="card header-card page-break-avoid">
          <div class="header-top">
            <div>
              <div>
                <span class="brand-cks">CKS</span><span class="brand-trelaze">Trélazé</span>
              </div>
              <div class="brand-sub">Cabinet de kinésithérapie du Sport</div>
            </div>
            <div class="header-right">
              <div class="bilan-title">${escapeHtml(titreBilan)}</div>
              <div class="bilan-patient">${escapeHtml(nomComplet)}</div>
            </div>
          </div>

          <div class="date-bilan-line">Date Bilan:${escapeHtml(dateBilan)}</div>

          <div class="meta-row">
            <div class="meta-item"><span class="meta-label">Patient:</span> <span class="meta-val">${escapeHtml(nomComplet)}</span></div>
            <div class="meta-item"><span class="meta-label">Côté Opéré:</span> <span class="meta-val">${escapeHtml(coteOpereLabel)}</span></div>
            <div class="meta-item"><span class="meta-label">Technique:</span> <span class="meta-val">${escapeHtml(techniqueOp)}</span></div>
          </div>

          <div class="meta-row">
            <div class="meta-item"><span class="meta-label">Date chirurgie:</span> <span class="meta-val">${escapeHtml(dateChirurgie)}</span></div>
            <div class="meta-item"><span class="meta-label">Chirurgien:</span> <span class="meta-val">${escapeHtml(chirurgien)}</span></div>
            <div class="meta-item"><span class="meta-label">Kiné:</span> <span class="meta-val">${escapeHtml(kineNom)}</span></div>
            <div class="meta-item">
              <span class="meta-label">Poids/Taille:</span>
              <span class="meta-poids-taille">
                ${tailleFormatted ? `<div>${escapeHtml(tailleFormatted)}</div>` : ''}
                <div>${poidsKg ? `${poidsKg}kg` : '-'}</div>
              </span>
            </div>
          </div>

          <div class="meta-row">
            <div class="meta-item"><span class="meta-label">Sport d'origine:</span> <span class="meta-val">${escapeHtml(sportOrigine)}</span></div>
            <div class="meta-item"><span class="meta-label">Mécanisme lésionnel:</span> <span class="meta-val">${escapeHtml(mecanisme)}</span></div>
          </div>
        </div>

        <!-- PLAN D'ACTION -->
        <div class="card page-break-avoid">
          <div class="plan-header">
            <span class="target-icon">◎</span>
            <span>PLAN D'ACTION &amp; DIRECTIVES DE REEDUCATION</span>
          </div>
          <div class="plan-text">${escapeHtml(planAction)}</div>
        </div>

        ${repriseCourse
      ? `
        <div class="course-box page-break-avoid">
          <div class="course-title">Reprise Course à pied:</div>
          <div class="course-body">${escapeHtml(repriseCourse)}</div>
        </div>`
      : ''
    }

        <!-- 1. MOBILITÉ ARTICULAIRE & CONFIANCE PSYCHOLOGIQUE -->
        <div class="section-block page-break-avoid">
          <div class="section-title">1.Mobilité articulaire &amp; Confiance psychologique</div>
          <div class="table-card">
            <table>
              <tbody>
                <tr>
                  <td style="width: 34%;">Confiance (ACL-RSI)</td>
                  <td style="width: 28%;">${hasAcl ? `${escapeHtml(aclRsiVal)} %` : '-'}</td>
                  <td style="width: 20%;">&gt; 60 %</td>
                  <td style="width: 18%;">${!hasAcl ? '-' : renderDotBadge(aclValid ? 'green' : 'red', aclValid ? 'Validé' : 'Non-Validé')}</td>
                </tr>
                <tr>
                  <td>Extension du genou</td>
                  <td>G : ${escapeHtml(extG)}° | D : ${escapeHtml(extD)}°</td>
                  <td>0° (Complet)</td>
                  <td>${renderDotBadge(extValid ? 'green' : 'red', extValid ? 'Validé' : 'Non-Validé')}</td>
                </tr>
                <tr>
                  <td>Flexion du genou</td>
                  <td>G : ${escapeHtml(flexG)}° | D : ${escapeHtml(flexD)}°</td>
                  <td>&gt; 120°</td>
                  <td>${renderDotBadge(flexValid ? 'green' : 'red', flexValid ? 'Validé' : 'Non-Validé')}</td>
                </tr>
                <tr>
                  <td>État Cicatriciel &amp; Contraction</td>
                  <td>
                    AMI vaste médial<br>
                    Droite: ${escapeHtml(vasteD)} unités d'activation<br>
                    Gauche: ${escapeHtml(vasteG)} unités d'activation
                  </td>
                  <td></td>
                  <td>${renderDotBadge(vasteColor, vasteLabel)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. TESTS FONCTIONNELS & CAPACITÉS DYNAMIQUES -->
        <div class="section-block page-break-avoid">
          <div class="section-title">2.Tests Fonctionnels &amp; Capacités dynamiques</div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th style="width: 34%;">Épreuve Fonctionnelle</th>
                  <th style="width: 14%;">Sain<br>(${escapeHtml(coteSainLabel)})</th>
                  <th style="width: 14%;">Opéré<br>(${escapeHtml(coteOpereLabel)})</th>
                  <th style="width: 18%;">Asymétrie /<br>Répartition</th>
                  <th style="width: 20%;">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Squat Bipodal — Peak Force Concentrique</td>
                  <td>${squatSain ? `${escapeHtml(squatSain)} N` : 'NR'}</td>
                  <td>${squatOp ? `${escapeHtml(squatOp)}N` : 'NR'}</td>
                  <td>${!squatSym || squatSym.pct === null ? 'NR' : `${escapeHtml(squatSym.label)} ${escapeHtml(coteSainLabel)} (Concentric)`}</td>
                  <td>${appreciationFromSym(squatSym, 'Bonne répartition')}</td>
                </tr>
                <tr>
                  <td>Single Leg Hop (Longueur)</td>
                  <td>${slhSain ? `${escapeHtml(slhSain)} cm` : 'NR'}</td>
                  <td>${slhOp ? `${escapeHtml(slhOp)} cm` : 'NR'}</td>
                  <td>${!slhSym || slhSym.pct === null ? 'NR' : escapeHtml(slhSym.label)}</td>
                  <td>${appreciationFromSym(slhSym, 'Validé')}</td>
                </tr>
                <tr>
                  <td>Triple Hop Test (Longueur)</td>
                  <td>${tripleSain ? `${escapeHtml(tripleSain)} cm` : 'NR'}</td>
                  <td>${tripleOp ? `${escapeHtml(tripleOp)} cm` : 'NR'}</td>
                  <td>${!tripleSym || tripleSym.pct === null ? 'NR' : escapeHtml(tripleSym.label)}</td>
                  <td>${appreciationFromSym(tripleSym, 'Validé')}</td>
                </tr>
                <tr>
                  <td>Front Side Hop (15s) — Explosivité</td>
                  <td>${fshSain ? `${escapeHtml(fshSain)} reps` : 'NR'}</td>
                  <td>${fshOp ? `${escapeHtml(fshOp)} reps` : 'NR'}</td>
                  <td>${!fshSym || fshSym.pct === null ? 'NR' : escapeHtml(fshSym.label)}</td>
                  <td>${appreciationFromSym(fshSym, 'Validé')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 3. QUALITÉ DU MOUVEMENT -->
        <div class="section-block page-break-avoid">
          <div class="section-title">3. Qualité du Mouvement (Analyse fonctionnelle Latéral Step Down)</div>
          <div class="card">
            <div class="photos-subheaders">
              <div>Vue de Face</div>
              <div>Vue de Profil</div>
            </div>
            <div class="photos-grid">
              <div class="photo-card">
                <div class="photo-frame">
                  ${photoG ? `<img src="${photoG}" alt="Jambe gauche">` : `<span class="photo-empty">Aucune photo</span>`}
                </div>
                <div class="photo-label">Jambe gauche ${!isOpereDroit ? '(Opérée)' : '(Saine)'}</div>
              </div>
              <div class="photo-card">
                <div class="photo-frame">
                  ${photoD ? `<img src="${photoD}" alt="Jambe droite">` : `<span class="photo-empty">Aucune photo</span>`}
                </div>
                <div class="photo-label">Jambe droite ${isOpereDroit ? '(Opérée)' : '(Saine)'}</div>
              </div>
            </div>
            <div class="analyse-line">
              <strong>Analyse</strong> ${escapeHtml(analyseText)}
            </div>
          </div>
        </div>

        <!-- 4. BILAN DE FORCE ISOMÉTRIQUE (VALD) PROFILING N/KG -->
        <div class="section-block page-break-avoid">
          <div class="section-title">4. Bilan de Force Isométrique (VALD) Profiling N/Kg</div>
          <div class="table-card">
            <table>
              <thead>
                <tr>
                  <th style="width: 25%;">Muscle Évalué</th>
                  <th style="width: 18%;">Sain (${escapeHtml(coteSainLabel)})</th>
                  <th style="width: 18%;">Opéré (${escapeHtml(coteOpereLabel)})</th>
                  <th style="width: 13%;">Cible 3M</th>
                  <th style="width: 13%;">Cible<br>Sport</th>
                  <th style="width: 13%;">Écart (LSI)</th>
                </tr>
              </thead>
              <tbody>
                ${muscles.map(renderMuscleRow).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- PIED DE PAGE -->
        <div class="footer-bar page-break-avoid">
          <div class="footer-left">
            <div>${escapeHtml(cabinet?.nom || 'CKS Cabinet Kiné Sport')}</div>
            <div>${escapeHtml(cabinet?.adresse || '65 rue des Perreyeux,')}</div>
            <div>${escapeHtml(cabinet?.cpVille || '49800 Trélazé.')}</div>
          </div>
          <div class="footer-right">
            <div>${escapeHtml(cabinet?.mobile || '07.49.91.43.67')}</div>
            <div>${escapeHtml(cabinet?.telephone || '02.41.27.32.66')}</div>
            <div>${escapeHtml(cabinet?.email || 'ckstrelaze@gmail.com')}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};