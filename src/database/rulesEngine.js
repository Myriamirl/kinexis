/**
 * ENGINE DE RÈGLES CLINIQUES & CALCULS AUTOMATIQUES - KINEXIS
 */

function calculerLSI(valeurOpere, valeurSain) {
    if (!valeurSain || Number(valeurSain) === 0 || !valeurOpere) return 0;
    return Math.round((Number(valeurOpere) / Number(valeurSain)) * 100) - 100;
}

function calculerForceRelative(forceNewtons, poidsKg) {
    if (!forceNewtons || !poidsKg || poidsKg === 0) return 0;
    return parseFloat((forceNewtons / poidsKg).toFixed(1));
}

function genererDirectives(donneesBilan, patient, cibles3M = { quad: 5.5, ischio: 4.0, soleaire: 15.0, fessier: 5.0, adducteur: 5.0 }) {
    const recommandations = [];
    
    // Supporte à la fois patient.poids (depuis le front React) et patient.poids_kg (depuis SQLite)
    const poidsPatient = patient?.poids || patient?.poids_kg || 0;

    // ACL-RSI (Confiance psychologique)
    const aclRsi = Number(donneesBilan.aclRsi);
    if (aclRsi < 30) {
        recommandations.push("Appréhension psychologique majeure. Accompagnement spécifique recommandé avant tout retour de la course à pied et du sport.");
    } else if (aclRsi < 60) {
        recommandations.push(`Vigilance sur la confiance du patient en sa rééducation (ACL-RSI à ${aclRsi}%, cible > 60%).`);
    } else if (aclRsi > 75) {
        recommandations.push("Excellente préparation psychologique (vigilance sur le surdimensionnement de la confiance).");
    }

    // Flessum & AMI Vaste Médial
    if (Number(donneesBilan.extG) > 0 || Number(donneesBilan.extD) > 0) {
        const flessumG = Number(donneesBilan.extG);
        if (flessumG > 10) {
            recommandations.push(`Flessum persistant important (${flessumG}°). Boiterie à la marche et schéma moteur altéré. Nécessite un travail intensif de posture en extension et verrouillage actif du quadriceps.`);
        } else if (flessumG > 0) {
            recommandations.push(`Flessum résiduel significatif (${flessumG}°). Déficit d'extension limitant le déroulé du pas. Axer le traitement sur le gain d'extension passive et la levée de tension des ischio-jambiers.`);
        }
    }

    if (Number(donneesBilan.vasteG) < 80 && donneesBilan.vasteG !== '') {
        recommandations.push("Activation du quadriceps insuffisante (AMI sévère) : privilégier le recrutement volontaire du vaste médial et le contrôle de la contraction, avec biofeedback.");
    }

    // Regroupement dynamique VALD
    const groupesMusculaires = [
        { key: 'quad', label: 'quadriceps', article: 'du' },
        { key: 'ischio', label: 'ischio-jambiers', article: 'des' },
        { key: 'soleaire', label: 'soléaire', article: 'du' },
        { key: 'fessier', label: 'moyens fessiers', article: 'des' },
        { key: 'adducteur', label: 'adducteurs', article: 'des' }
    ];

    const casGroupes = { 1: [], 2: [], 3: [], 4: [] };

    groupesMusculaires.forEach(g => {
        if (donneesBilan.vald && donneesBilan.vald[`${g.key}G`]) {
            const forceOp = calculerForceRelative(donneesBilan.vald[`${g.key}G`], poidsPatient);
            const forceSain = calculerForceRelative(donneesBilan.vald[`${g.key}D`], poidsPatient);
            const cible = cibles3M[g.key] || 5.0;

            const cibleAtteinte = forceOp >= cible;
            const lsiAbs = Math.abs(calculerLSI(forceOp, forceSain));
            const asymetrieElevée = lsiAbs > 20;

            if (!cibleAtteinte && asymetrieElevée) casGroupes[1].push(g);
            else if (!cibleAtteinte && !asymetrieElevée) casGroupes[2].push(g);
            else if (cibleAtteinte && asymetrieElevée) casGroupes[3].push(g);
            else casGroupes[4].push(g);
        }
    });

    const formatList = (list) => list.map(m => `${m.article} ${m.label}`).join(', ');

    if (casGroupes[1].length > 0) recommandations.push(`Priorité au renforcement ${formatList(casGroupes[1])} et à la réduction de l'asymétrie.`);
    if (casGroupes[2].length > 0) recommandations.push(`Poursuivre le développement de la force ${formatList(casGroupes[2])} pour atteindre la cible.`);
    if (casGroupes[3].length > 0) recommandations.push(`Poursuivre le travail de symétrie de force ${formatList(casGroupes[3])}.`);

    return recommandations.map((rec, idx) => `${idx + 1}. ${rec}`).join('\n\n');
}

module.exports = {
    calculerLSI,
    calculerForceRelative,
    genererDirectives
};