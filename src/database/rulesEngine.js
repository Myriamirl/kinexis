/**
 * ENGINE DE RÈGLES CLINIQUES & CALCULS AUTOMATIQUES - KINEXIS
 */

// ============================================================================
//   CALCULS MATHÉMATIQUES & CLINIQUES
// ============================================================================

/**
 * Calcul du LSI (Limb Symmetry Index) en %
 * Formule : (Valeur Membre Opéré / Valeur Membre Sain) * 100
 */
function calculerLSI(valeurOpere, valeurSain) {
    if (!valeurSain || valeurSain === 0 || !valeurOpere) return null;
    const lsi = (valeurOpere / valeurSain) * 100;
    const ecart = Math.round(lsi - 100); // Ex: -28%
    return {
        lsiPercent: Math.round(lsi),
        ecartPercent: ecart,
        formatted: `${ecart > 0 ? '+' : ''}${ecart}%`
    };
}

/**
 * Calcul de la force relative en N/kg
 * Formule : Force en Newtons / Poids en kg
 */
function calculerForceRelative(forceNewtons, poidsKg) {
    if (!forceNewtons || !poidsKg || poidsKg === 0) return null;
    return parseFloat((forceNewtons / poidsKg).toFixed(1)); // Ex: 5.5 N/kg
}

/**
 * Détermination de la pastille de couleur pour les forces VALD
 */
function determinerStatutForce(valeurNkg, cibleNkg, lsiPercent) {
    if (!valeurNkg || !cibleNkg) return 'neutre';
    
    // Si la cible N/kg est atteinte et l'asymétrie < 10%
    if (valeurNkg >= cibleNkg && lsiPercent >= 90) {
        return 'vert';
    } 
    // Si proche de la cible (à 15% près)
    else if (valeurNkg >= cibleNkg * 0.85 && lsiPercent >= 80) {
        return 'orange';
    } 
    // Déficit marqué
    else {
        return 'rouge';
    }
}

// ============================================================================
//    GÉNÉRATION AUTOMATIQUE DU PLAN D'ACTION (SYNTHÈSE)
// ============================================================================

/**
 * Génère le texte rédigé du plan d'action en fonction des résultats du bilan
 */
function genererPlanAction(donneesBilan, patient) {
    const recommandations = [];

    // Analyse ACL-RSI (Confiance)
    const aclRsi = donneesBilan.acl_rsi_percent;
    if (aclRsi !== undefined && aclRsi < 60) {
        recommandations.push(
            `Vigilance sur la confiance du patient (ACL-RSI à ${aclRsi}%, cible > 60%). Appréhension à prendre en compte dans la progression des charges.`
        );
    }

    // Mobilité & Séquelles
    if (donneesBilan.ami_vaste_medial === 'Non-Validé') {
        recommandations.push(
            `Contraction : Attention à l'Inhibition Musculaire Arthrogène (AMI) sur le vaste médial. Reprogrammation neuro-musculaire prioritaire.`
        );
    }

    //Force Musculaire (VALD) & Asymétries
    const quadLsi = donneesBilan.lsi_quadriceps;
    if (quadLsi && quadLsi < 85) {
        recommandations.push(
            `Renforcement musculaire : Accentuer le travail analytique du quadriceps gauche/droit pour réduire l'asymétrie (LSI actuel : ${quadLsi}%).`
        );
    }

    const ischioLsi = donneesBilan.lsi_ischios;
    if (ischioLsi && ischioLsi < 85) {
        recommandations.push(
            `Ischio-jambiers : Déficit de force identifié. Renforcer le travail excentrique et en course externe.`
        );
    }

    // 4. Reprise de la course à pied
    const courseValidee = donneesBilan.aptitude_course === 'Validé';
    if (!courseValidee) {
        recommandations.push(
            `Reprise Course à pied : Tests de force et/ou sauts non validés. Aptitude non validée ce jour. Accentuer le travail de biomécanique et de poussée.`
        );
    } else {
        recommandations.push(
            `Reprise Course à pied : Critères validés. Débuter le continuum de course de manière progressive sur terrain meuble.`
        );
    }

    // Formatage des points numérotés
    return recommandations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');
}

module.exports = {
    calculerLSI,
    calculerForceRelative,
    determinerStatutForce,
    genererPlanAction
};