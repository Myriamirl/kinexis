/**
 * TEMPLATE HTML DE RENDU DU COMPTE-RENDU DE BILAN KINEXIS (PDF)
 */

module.exports = function generatePdfHtml(data) {
  const { patient, dataBilan, cabinet } = data;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <title>Bilan LCA - ${patient.nom}</title>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #0f172a;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #e5a73c;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }
        .logo { font-size: 20px; font-weight: 900; color: #0f172a; }
        .logo span { color: #e5a73c; }
        .patient-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
        }
        .section-title {
          font-size: 12px;
          font-weight: bold;
          color: #1e293b;
          border-left: 4px solid #e5a73c;
          padding-left: 8px;
          margin-top: 15px;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 12px;
        }
        th, td {
          border: 1px solid #cbd5e1;
          padding: 5px 8px;
          text-align: left;
        }
        th { background-color: #f1f5f9; font-weight: bold; }
        .badge {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: bold;
          color: white;
          font-size: 9px;
        }
        .bg-green { background-color: #10b981; }
        .bg-amber { background-color: #f59e0b; }
        .bg-red { background-color: #ef4444; }
        .plan-box {
          background-color: #fffbeb;
          border: 1px solid #fde68a;
          border-radius: 8px;
          padding: 12px;
          margin-top: 15px;
          white-space: pre-line;
        }
        .footer {
          margin-top: 25px;
          text-align: center;
          font-size: 9px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 8px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">KIN<span>EXIS</span></div>
        <div style="text-align: right;">
          <div style="font-weight: bold;">${cabinet?.nom || 'CKS Trélazé'}</div>
          <div>Bilan Évolutif Post-Opératoire LCA</div>
        </div>
      </div>

      <div class="patient-card">
        <div>
          <strong>Patient :</strong> ${patient.nom} <br>
          <strong>Côté Opéré :</strong> ${patient.coteOpere || 'Gauche'} | <strong>Poids :</strong> ${patient.poids} kg
        </div>
        <div style="text-align: right;">
          <strong>Date du bilan :</strong> ${formatDate(dataBilan.dateBilan)} <br>
          <strong>Délai Post-Op :</strong> ${dataBilan.delaiPostOp || ''}
        </div>
      </div>

      <!-- MOBILITÉ & CONFIANCE -->
      <div class="section-title">1. Mobilité, Vaste Médial & Confiance</div>
      <table>
        <tr>
          <th>Score ACL-RSI</th>
          <th>Extension Gauche / Droite</th>
          <th>Flexion Gauche / Droite</th>
          <th>Activation Vaste Médial (G / D)</th>
        </tr>
        <tr>
          <td><strong>${dataBilan.aclRsi}%</strong> (${Number(dataBilan.aclRsi) >= 60 ? 'Confiance Validée' : 'Appréhension'})</td>
          <td>${dataBilan.extG}° / ${dataBilan.extD}°</td>
          <td>${dataBilan.flexG}° / ${dataBilan.flexD}°</td>
          <td>${dataBilan.vasteG} / ${dataBilan.vasteD} u.d.</td>
        </tr>
      </table>

      <!-- FORCE VALD -->
      <div class="section-title">2. Force Isométrique (VALD Hub)</div>
      <table>
        <thead>
          <tr>
            <th>Groupe Musculaire</th>
            <th>Force Gauche (N)</th>
            <th>Force Droite (N)</th>
            <th>Relative (N/kg)</th>
            <th>LSI (%)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Quadriceps (90°)</td>
            <td>${dataBilan.vald?.quadG || '-'} N</td>
            <td>${dataBilan.vald?.quadD || '-'} N</td>
            <td>${(Number(dataBilan.vald?.quadG) / patient.poids).toFixed(1)} N/kg</td>
            <td><strong>${Math.round(((dataBilan.vald?.quadG || 0) / (dataBilan.vald?.quadD || 1)) * 100) - 100}%</strong></td>
          </tr>
          <tr>
            <td>Ischio-Jambiers (30°)</td>
            <td>${dataBilan.vald?.ischioG || '-'} N</td>
            <td>${dataBilan.vald?.ischioD || '-'} N</td>
            <td>${(Number(dataBilan.vald?.ischioG) / patient.poids).toFixed(1)} N/kg</td>
            <td><strong>${Math.round(((dataBilan.vald?.ischioG || 0) / (dataBilan.vald?.ischioD || 1)) * 100) - 100}%</strong></td>
          </tr>
        </tbody>
      </table>

      <!-- PLAN D'ACTION -->
      <div class="section-title">3. Directives & Plan d'Action Clinique</div>
      <div class="plan-box">
        ${dataBilan.planAction || 'Aucune consigne rédigée.'}
      </div>

      <div class="footer">
        Document généré automatiquement par Kinexis le ${new Date().toLocaleDateString('fr-FR')} — Données confidentielles réservées à l'usage médical.
      </div>
    </body>
    </html>
  `;
};