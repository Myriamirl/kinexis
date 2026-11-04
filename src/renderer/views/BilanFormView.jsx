import React, { useState, useEffect } from 'react';

// Accès au pont Electron IPC
const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function BilanFormView({ currentKine }) {
  // --- ÉTAT PATIENTS ET SÉLECTION DEPUIS SQLITE ---
  const [patientsListe, setPatientsListe] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patient, setPatient] = useState({
    id: null,
    nom: '',
    prenom: '',
    poids: 0,
    taille: 0,
    coteOpere: 'Gauche',
    profilSportif: 'Amateur'
  });

  // Chargement dynamique des patients au montage
  useEffect(() => {
    if (ipcRenderer) {
      ipcRenderer.invoke('patients:get-actifs')
        .then((data) => {
          setPatientsListe(data);
          if (data && data.length > 0) {
            setSelectedPatientId(data[0].id);
            updatePatientState(data[0]);
          }
        })
        .catch((err) => console.error("Erreur récupération patients :", err));
    }
  }, []);

  const updatePatientState = (pData) => {
    setPatient({
      id: pData.id,
      nom: pData.nom || '',
      prenom: pData.prenom || '',
      poids: pData.poids_kg || 0,
      taille: pData.taille_cm || 0,
      coteOpere: pData.cote_opere || 'Gauche',
      profilSportif: pData.profil_sportif || 'Amateur'
    });
  };

  const handlePatientChange = (e) => {
    const pId = Number(e.target.value);
    setSelectedPatientId(pId);
    const pFound = patientsListe.find(p => p.id === pId);
    if (pFound) {
      updatePatientState(pFound);
    }
  };

  // --- DATES ET POST-OPÉRATOIRE ---
  const [dateBilan, setDateBilan] = useState(new Date().toISOString().split('T')[0]);
  const [dateOperation, setDateOperation] = useState('');
  const [delaiPostOp, setDelaiPostOp] = useState('-');

  useEffect(() => {
    if (dateBilan && dateOperation) {
      const dBilan = new Date(dateBilan);
      const dOp = new Date(dateOperation);
      const diffDays = Math.floor((dBilan - dOp) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        setDelaiPostOp("Date d'opération postérieure au bilan !");
      } else {
        const moisExact = (diffDays / 30.4375).toFixed(1);
        setDelaiPostOp(`${moisExact} mois (${diffDays} jours)`);
      }
    } else {
      setDelaiPostOp('-');
    }
  }, [dateBilan, dateOperation]);

  // --- MOBILITÉ & CONFIANCE (Champs vides) ---
  const [aclRsi, setAclRsi] = useState('');
  const [extG, setExtG] = useState('');
  const [extD, setExtD] = useState('');
  const [flexG, setFlexG] = useState('');
  const [flexD, setFlexD] = useState('');

  const [cicatriceTrophicite, setCicatriceTrophicite] = useState('Normotrophique');
  const [cicatriceAdherence, setCicatriceAdherence] = useState('Souple et mobile');
  const [cicatriceSensibilite, setCicatriceSensibilite] = useState('Indolore');

  const [vasteG, setVasteG] = useState('');
  const [vasteD, setVasteD] = useState('');

  // --- TESTS FONCTIONNELS QUALITATIFS (Champs vides) ---
  const [squatQual, setSquatQual] = useState({
    peakConcG: '', peakConcD: '',
    peakExcG: '', peakExcD: '',
    meanConcG: '', meanConcD: '',
    meanExcG: '', meanExcD: '',
    hauteurCm: ''
  });

  const [cmj, setCmj] = useState({
    impulsionConcG: '', impulsionConcD: '',
    freinageExcG: '', freinageExcD: '',
    vitesseFreinG: '', vitesseFreinD: '',
    picReceptionG: '', picReceptionD: '',
    hauteurSautCm: ''
  });

  // --- TESTS FONCTIONNELS QUANTITATIFS (Champs vides - 10 Tests) ---
  const [hopTests, setHopTests] = useState({
    singleLegG: '', singleLegD: '',
    tripleHopG: '', tripleHopD: '',
    crossoverG: '', crossoverD: '',
    side15G: '', side15D: '',
    side30G: '', side30D: '',
    frontSide30G: '', frontSide30D: '',
    sideMod15G: '', sideMod15D: '',
    sideMod30G: '', sideMod30D: '',
    illinoisModG: '', illinoisModD: '',
    timed6mG: '', timed6mD: ''
  });

  // --- QUALITÉ DU MOUVEMENT (Décochés par défaut) ---
  const [qualiteStepDown, setQualiteStepDown] = useState({
    pelvicDropG: false, pelvicDropD: false,
    valgusG: false, valgusD: false,
    stiffLandingG: false, stiffLandingD: false
  });

  const [qasls, setQasls] = useState({
    mouvementExcessifBrasG: false, mouvementExcessifBrasD: false,
    inclinePositionsG: false, inclinePositionsD: false,
    pertePlanHorizontalG: false, pertePlanHorizontalD: false,
    basculeOuRotationG: false, basculeOuRotationD: false,
    abductionHancheG: false, abductionHancheD: false,
    positionNeutreNonMaintenueG: false, positionNeutreNonMaintenueD: false,
    rotule2emeOrteilG: false, rotule2emeOrteilD: false,
    rotuleInterieurPiedG: false, rotuleInterieurPiedD: false,
    reequilibrerAutreJambeG: false, reequilibrerAutreJambeD: false,
    jambeReceptionVacilleG: false, jambeReceptionVacilleD: false
  });

  const calcTotalQasls = (side) => {
    const keys = side === 'G'
      ? ['mouvementExcessifBrasG', 'inclinePositionsG', 'pertePlanHorizontalG', 'basculeOuRotationG', 'abductionHancheG', 'positionNeutreNonMaintenueG', 'rotule2emeOrteilG', 'rotuleInterieurPiedG', 'reequilibrerAutreJambeG', 'jambeReceptionVacilleG']
      : ['mouvementExcessifBrasD', 'inclinePositionsD', 'pertePlanHorizontalD', 'basculeOuRotationD', 'abductionHancheD', 'positionNeutreNonMaintenueD', 'rotule2emeOrteilD', 'rotuleInterieurPiedD', 'reequilibrerAutreJambeD', 'jambeReceptionVacilleD'];
    return keys.reduce((acc, key) => acc + (qasls[key] ? 1 : 0), 0);
  };

  // Photos de contrôle
  const [photoG, setPhotoG] = useState(null);
  const [photoD, setPhotoD] = useState(null);

  const handlePhotoUpload = (e, side) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'G') setPhotoG(reader.result);
        else setPhotoD(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- FORCE ISOMÉTRIQUE VALD (Champs vides - 6 Tests) ---
  const [vald, setVald] = useState({
    quadG: '', quadD: '',
    ischioG: '', ischioD: '',
    soleaireG: '', soleaireD: '',
    fessierG: '', fessierD: '',
    adducteurG: '', adducteurD: '',
  });

  const cibles3M = { quad: 5.5, ischio: 4.0, soleaire: 15.0, fessier: 5.0, adducteur: 5.0 };
  const ciblesSport = patient.profilSportif === 'Pivot'
    ? { quad: 8.5, ischio: 5.0, soleaire: 20.0, fessier: 6.0, adducteur: 6.0 }
    : { quad: 7.5, ischio: 4.5, soleaire: 18.0, fessier: 6.0, adducteur: 6.0 };

  // --- RECALCUL AUTOMATIQUE DU PLAN D'ACTION ---
  const [planActionText, setPlanActionText] = useState('');

  useEffect(() => {
    if (ipcRenderer && patient.id) {
      const dataBilan = { aclRsi, extG, extD, vasteG, vasteD, qualiteStepDown, qasls, vald };
      ipcRenderer.invoke('rules:calculer-texte', dataBilan, patient, cibles3M)
        .then(text => setPlanActionText(text))
        .catch(err => console.error("Erreur calcul règles :", err));
    }
  }, [aclRsi, extG, extD, vasteG, vasteD, qualiteStepDown, qasls, vald, patient, cibles3M]);

  // --- SAUVEGARDE EN BASE SQLITE ---
  const handleSaveBilan = async () => {
    if (!patient.id) {
      alert("Veuillez sélectionner un patient avant d'enregistrer.");
      return;
    }

    if (!ipcRenderer) {
      alert("Mode Web : Simulation d'enregistrement.");
      return;
    }

    const payload = {
      patientId: patient.id,
      kineId: currentKine?.id || 1,
      dataBilan: {
        dateBilan,
        dateOperation,
        delaiPostOp,
        aclRsi,
        extG, extD, flexG, flexD,
        cicatriceTrophicite, cicatriceAdherence, cicatriceSensibilite,
        vasteG, vasteD,
        squatQual,
        cmj,
        hopTests,
        qualiteStepDown,
        qasls,
        vald,
        planAction: planActionText
      },
      photos: { photoG, photoD }
    };

    const res = await ipcRenderer.invoke('bilans:save', payload);
    if (res.success) {
      alert(`✅ Bilan enregistré en BDD pour ${patient.nom} ${patient.prenom} (ID Bilan : ${res.bilanId})`);
    } else {
      alert(`❌ Erreur BDD : ${res.error}`);
    }
  };

  // --- EXPORT PDF ---
  const handleExportPdf = async () => {
    await handleSaveBilan();

    if (!ipcRenderer) {
      alert("Génération PDF disponible via Electron.");
      return;
    }

    const payload = {
      patient: {
        nom: `${patient.nom} ${patient.prenom}`,
        coteOpere: patient.coteOpere,
        poids: patient.poids
      },
      dataBilan: {
        dateBilan,
        dateOperation,
        delaiPostOp,
        aclRsi,
        extG, extD, flexG, flexD,
        vasteG, vasteD,
        vald,
        planAction: planActionText
      }
    };

    const res = await ipcRenderer.invoke('pdf:generate', payload);
    if (res.success) {
      alert(`✅ Compte-rendu PDF généré et enregistré !`);
    } else if (!res.cancelled) {
      alert(`❌ Erreur PDF : ${res.error}`);
    }
  };

  // Calculs dynamiques
  const calcRelative = (forceN) => {
    if (!forceN || !patient.poids || patient.poids === 0) return '-';
    return (Number(forceN) / patient.poids).toFixed(1);
  };

  const calcLSI = (forceOperee, forceSaine) => {
    if (!forceSaine || Number(forceSaine) === 0 || !forceOperee) return 0;
    return Math.round((Number(forceOperee) / Number(forceSaine)) * 100) - 100;
  };

  const getLsiBadge = (lsiAbs) => {
    if (!lsiAbs && lsiAbs !== 0) return <span className="text-slate-400 font-normal">-</span>;
    if (Math.abs(lsiAbs) <= 10) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">{lsiAbs}%</span>;
    if (Math.abs(lsiAbs) <= 20) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">{lsiAbs}%</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">{lsiAbs}%</span>;
  };

  return (
    <div className="space-y-8 w-full h-full flex flex-col pb-12 text-slate-900">
      
      {/* EN-TÊTE DYNAMIQUE AVEC SELECTION PATIENT SQLITE */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-[#1E293B]">Nouveau Bilan Post-LCA</h2>
          
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-500">Patient :</span>
            <select
              value={selectedPatientId}
              onChange={handlePatientChange}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 shadow-sm focus:outline-none focus:border-amber-500"
            >
              {patientsListe.length === 0 && <option value="">Aucun patient trouvé en BDD</option>}
              {patientsListe.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nom} {p.prenom} (Poids: {p.poids_kg || '-'}kg)
                </option>
              ))}
            </select>

            {patient.id && (
              <span className="text-xs font-semibold text-slate-600">
                • Côté Opéré: <strong className="text-slate-900">{patient.coteOpere}</strong> • Profil: <strong className="text-slate-900">{patient.profilSportif}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleSaveBilan}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm flex items-center gap-2 transition-all"
          >
            <span>💾</span> Enregistrer le brouillon
          </button>

          <button 
            onClick={handleExportPdf}
            className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <span>📄</span> Générer le bilan PDF
          </button>
        </div>
      </div>

      {/* BANDEAU DATES ET DÉLAI POST-OP */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-semibold">Date du bilan :</span>
          <input 
            type="date" 
            value={dateBilan} 
            onChange={(e) => setDateBilan(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500 font-semibold">Date d'opération :</span>
          <input 
            type="date" 
            value={dateOperation} 
            onChange={(e) => setDateOperation(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
          />
        </div>

        <div className="bg-amber-100 border border-amber-300 px-4 py-2 rounded-xl text-amber-900 font-extrabold flex items-center gap-2">
          <span>⏱️ Temps écoulé :</span>
          <span className="text-sm text-slate-950">{delaiPostOp}</span>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* RANGÉE 1 : MOBILITÉ & CONFIANCE */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">1</span>
          <h3 className="font-bold text-slate-800 text-base">Mobilité Articulaire, Cicatrice & Confiance</h3>
        </div>

        <div className="grid grid-cols-3 gap-6 text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
              <span className="font-bold text-slate-800">Confiance (ACL-RSI) %</span>
              <input
                type="number"
                value={aclRsi}
                placeholder="0"
                onChange={(e) => setAclRsi(e.target.value)}
                className="w-20 bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-center font-bold shadow-sm"
              />
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${Number(aclRsi) >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {Number(aclRsi) >= 60 ? 'Validé' : 'Non-Validé'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
              <div>
                <p className="font-bold text-slate-800">Activation Vaste Médial</p>
                <p className="text-[10px] text-slate-500">Unités dynamométriques</p>
              </div>
              <div className="flex gap-2">
                <input type="number" value={vasteG} onChange={(e) => setVasteG(e.target.value)} className="w-14 bg-white border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" placeholder="G" />
                <input type="number" value={vasteD} onChange={(e) => setVasteD(e.target.value)} className="w-14 bg-white border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" placeholder="D" />
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white ${Number(vasteG) < 80 && vasteG !== '' ? 'bg-rose-500' : Number(vasteG) < 150 && vasteG !== '' ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                {Number(vasteG) < 80 && vasteG !== '' ? 'Inhibition' : 'OK'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl space-y-3">
            <p className="font-bold text-slate-800">Amplitudes ROM (°)</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Extension (G / D)</span>
              <div className="flex gap-2">
                <input type="number" value={extG} placeholder="G" onChange={(e) => setExtG(e.target.value)} className="w-14 bg-white border border-slate-300 rounded p-1 text-center font-bold" />
                <input type="number" value={extD} placeholder="D" onChange={(e) => setExtD(e.target.value)} className="w-14 bg-white border border-slate-300 rounded p-1 text-center font-bold" />
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white ${Number(extG) === 0 && extG !== '' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {Number(extG) === 0 && extG !== '' ? 'Validé' : 'Flessum'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-700 font-semibold">Flexion (G / D)</span>
              <div className="flex gap-2">
                <input type="number" value={flexG} placeholder="G" onChange={(e) => setFlexG(e.target.value)} className="w-14 bg-white border border-slate-300 rounded p-1 text-center font-bold" />
                <input type="number" value={flexD} placeholder="D" onChange={(e) => setFlexD(e.target.value)} className="w-14 bg-white border border-slate-300 rounded p-1 text-center font-bold" />
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-bold text-white ${Number(flexG) >= 120 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                {Number(flexG) >= 120 ? 'Validé' : 'Non-Validé'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl space-y-2.5">
            <p className="font-bold text-slate-800">État Cicatriciel</p>
            <div className="space-y-2">
              <select value={cicatriceTrophicite} onChange={(e) => setCicatriceTrophicite(e.target.value)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold">
                <option value="Normotrophique">Normotrophique</option>
                <option value="Inflammatoire">Inflammatoire</option>
                <option value="Hypertrophique">Hypertrophique</option>
                <option value="Chéloïde">Chéloïde</option>
              </select>
              <select value={cicatriceAdherence} onChange={(e) => setCicatriceAdherence(e.target.value)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold">
                <option value="Souple et mobile">Souple & mobile</option>
                <option value="Adhérence superficielle">Adhérence superficielle</option>
                <option value="Adhérence profonde">Adhérence profonde</option>
              </select>
              <select value={cicatriceSensibilite} onChange={(e) => setCicatriceSensibilite(e.target.value)} className="w-full bg-white border border-slate-300 rounded p-1.5 font-bold">
                <option value="Indolore">Indolore</option>
                <option value="Douloureuse">Douloureuse</option>
                <option value="Hypoesthésie">Hypoesthésie</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* RANGÉE 2 : TESTS FONCTIONNELS (STRUCTURES ET EN-TÊTES INITIALES CONSERVÉES) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-6">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">2</span>
          <h3 className="font-bold text-slate-800 text-base">Tests Fonctionnels & Dynamiques</h3>
        </div>

        <div className="grid grid-cols-2 gap-8 items-start">
          
          {/* SOUS-BLOC A : QUALITATIFS (SQUAT & CMJ) */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-4">
            <h4 className="font-extrabold text-amber-700 text-xs uppercase tracking-wider border-b border-amber-200 pb-2 flex justify-between items-center">
              <span>A. Test Fonctionnel Qualitatif</span>
              <span className="text-[10px] text-slate-500 font-normal">Plateforme / Force</span>
            </h4>

            {/* Squat Bipodal */}
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 text-xs">Squat Bipodal</p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <span className="text-slate-600 font-semibold">Paramètre</span>
                <span className="text-center font-bold text-slate-700">Gauche</span>
                <span className="text-center font-bold text-slate-700">Droite</span>

                <span>Peak Force Conc. (N)</span>
                <input type="number" value={squatQual.peakConcG} onChange={(e) => setSquatQual({...squatQual, peakConcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={squatQual.peakConcD} onChange={(e) => setSquatQual({...squatQual, peakConcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Peak Force Exc. (N)</span>
                <input type="number" value={squatQual.peakExcG} onChange={(e) => setSquatQual({...squatQual, peakExcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={squatQual.peakExcD} onChange={(e) => setSquatQual({...squatQual, peakExcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Mean Force Conc. (N)</span>
                <input type="number" value={squatQual.meanConcG} onChange={(e) => setSquatQual({...squatQual, meanConcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={squatQual.meanConcD} onChange={(e) => setSquatQual({...squatQual, meanConcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Mean Force Exc. (N)</span>
                <input type="number" value={squatQual.meanExcG} onChange={(e) => setSquatQual({...squatQual, meanExcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={squatQual.meanExcD} onChange={(e) => setSquatQual({...squatQual, meanExcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-semibold text-slate-700">Hauteur de déplacement :</span>
                <div className="flex items-center gap-1">
                  <input type="number" value={squatQual.hauteurCm} onChange={(e) => setSquatQual({...squatQual, hauteurCm: e.target.value})} className="w-16 bg-slate-50 border rounded p-1 text-center font-bold" />
                  <span className="font-bold text-slate-600">cm</span>
                </div>
              </div>
            </div>

            {/* CMJ (Countermovement Jump) */}
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-800 text-xs">CMJ (Countermovement Jump)</p>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <span className="text-slate-600 font-semibold">Paramètre</span>
                <span className="text-center font-bold text-slate-700">Gauche</span>
                <span className="text-center font-bold text-slate-700">Droite</span>

                <span>Impulsion Conc.</span>
                <input type="number" value={cmj.impulsionConcG} onChange={(e) => setCmj({...cmj, impulsionConcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={cmj.impulsionConcD} onChange={(e) => setCmj({...cmj, impulsionConcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Force Freinage Exc.</span>
                <input type="number" value={cmj.freinageExcG} onChange={(e) => setCmj({...cmj, freinageExcG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={cmj.freinageExcD} onChange={(e) => setCmj({...cmj, freinageExcD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Vitesse Freinage Exc.</span>
                <input type="number" value={cmj.vitesseFreinG} onChange={(e) => setCmj({...cmj, vitesseFreinG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={cmj.vitesseFreinD} onChange={(e) => setCmj({...cmj, vitesseFreinD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />

                <span>Pic Force Réception</span>
                <input type="number" value={cmj.picReceptionG} onChange={(e) => setCmj({...cmj, picReceptionG: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
                <input type="number" value={cmj.picReceptionD} onChange={(e) => setCmj({...cmj, picReceptionD: e.target.value})} className="bg-slate-50 border rounded p-1 text-center font-bold" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="font-semibold text-slate-700">Hauteur du saut :</span>
                <div className="flex items-center gap-1">
                  <input type="number" value={cmj.hauteurSautCm} onChange={(e) => setCmj({...cmj, hauteurSautCm: e.target.value})} className="w-16 bg-slate-50 border rounded p-1 text-center font-bold" />
                  <span className="font-bold text-slate-600">cm</span>
                </div>
              </div>
            </div>

          </div>

          {/* SOUS-BLOC B : QUANTITATIFS (10 HOP TESTS ET AGILITÉ) */}
          <div className="bg-slate-50 p-4 rounded-xl space-y-3">
            <h4 className="font-extrabold text-amber-700 text-xs uppercase tracking-wider border-b border-amber-200 pb-2 flex justify-between items-center">
              <span>B. Test Fonctionnel Quantitatif</span>
              <span className="text-[10px] text-slate-500 font-normal">Sauts & Temps</span>
            </h4>

            <div className="space-y-2 text-[11px]">
              <div className="grid grid-cols-4 gap-2 text-center font-bold text-slate-600 border-b pb-1">
                <span className="text-left">Test Hop</span>
                <span>Gauche</span>
                <span>Droite</span>
                <span>LSI %</span>
              </div>

              {[
                { label: 'Single Leg Hop Test', keyG: 'singleLegG', keyD: 'singleLegD' },
                { label: 'Triple Hop Test', keyG: 'tripleHopG', keyD: 'tripleHopD' },
                { label: 'Crossover Hop Test', keyG: 'crossoverG', keyD: 'crossoverD' },
                { label: 'Side Hop Test 15s', keyG: 'side15G', keyD: 'side15D' },
                { label: 'Side Hop Test 30s', keyG: 'side30G', keyD: 'side30D' },
                { label: 'Front Side Hop Test 30s', keyG: 'frontSide30G', keyD: 'frontSide30D' },
                { label: 'Side Hop Test Modifié 15s', keyG: 'sideMod15G', keyD: 'sideMod15D' },
                { label: 'Side Hop Test Modifié 30s', keyG: 'sideMod30G', keyD: 'sideMod30D' },
                { label: 'Illinois Modifié (s)', keyG: 'illinoisModG', keyD: 'illinoisModD' },
                { label: '6m Timed Hop Test (s)', keyG: 'timed6mG', keyD: 'timed6mD' },
              ].map((item, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                  <span className="font-semibold text-slate-800 text-[10px]">{item.label}</span>
                  <input
                    type="number"
                    value={hopTests[item.keyG]}
                    onChange={(e) => setHopTests({ ...hopTests, [item.keyG]: e.target.value })}
                    className="bg-white border rounded p-1 text-center font-bold"
                  />
                  <input
                    type="number"
                    value={hopTests[item.keyD]}
                    onChange={(e) => setHopTests({ ...hopTests, [item.keyD]: e.target.value })}
                    className="bg-white border rounded p-1 text-center font-bold"
                  />
                  <div className="text-center">
                    {getLsiBadge(calcLSI(hopTests[item.keyG], hopTests[item.keyD]))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* RANGÉE 3 : QUALITÉ DU MOUVEMENT (LATERAL STEP DOWN + TABLEAU QASLS STRICT) */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-6 text-slate-900">
        <div className="flex items-center gap-3 border-b pb-3">
          <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">3</span>
          <h3 className="font-bold text-slate-800 text-base">Qualité du Mouvement</h3>
        </div>

        {/* LATERAL STEP DOWN */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-200 text-xs">
          <p className="font-bold text-slate-800 border-b pb-2">Latéral Step Down</p>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-extrabold text-slate-700 text-[10px] uppercase bg-slate-100 px-2 py-1 rounded text-center">Jambe Gauche</p>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.pelvicDropG} onChange={(e) => setQualiteStepDown({...qualiteStepDown, pelvicDropG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Pelvic Drop</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.valgusG} onChange={(e) => setQualiteStepDown({...qualiteStepDown, valgusG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Valgus Dynamique</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.stiffLandingG} onChange={(e) => setQualiteStepDown({...qualiteStepDown, stiffLandingG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Stiff Landing</span>
              </label>
            </div>

            <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
              <p className="font-extrabold text-slate-700 text-[10px] uppercase bg-slate-100 px-2 py-1 rounded text-center">Jambe Droite</p>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.pelvicDropD} onChange={(e) => setQualiteStepDown({...qualiteStepDown, pelvicDropD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Pelvic Drop</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.valgusD} onChange={(e) => setQualiteStepDown({...qualiteStepDown, valgusD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Valgus Dynamique</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input type="checkbox" checked={qualiteStepDown.stiffLandingD} onChange={(e) => setQualiteStepDown({...qualiteStepDown, stiffLandingD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 rounded" />
                <span>Stiff Landing</span>
              </label>
            </div>
          </div>
        </div>

        {/* QASLS GRILLE COMPLETE */}
        <div className="bg-slate-50 p-4 rounded-xl space-y-4 border border-slate-200 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-extrabold text-slate-800 text-xs">Single Leg Landing : nombre d'erreurs (QASLS)</p>
              <p className="text-[10px] text-slate-500">Qualitative Assessment of Single-Leg Loading System</p>
            </div>

            <div className="flex gap-3">
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1 rounded-lg text-[11px]">
                TOTAL Erreurs Gauche : <span className="text-slate-950 font-black">{calcTotalQasls('G')}</span>
              </span>
              <span className="bg-amber-100 text-amber-900 border border-amber-300 font-extrabold px-3 py-1 rounded-lg text-[11px]">
                TOTAL Erreurs Droite : <span className="text-slate-950 font-black">{calcTotalQasls('D')}</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse bg-white rounded-lg border border-slate-300">
              <thead>
                <tr className="border-b text-slate-800 font-extrabold bg-slate-200/80">
                  <th className="p-2 border-r w-1/4">Domaine d'Analyse</th>
                  <th className="p-2 border-r">QASLS - Erreurs à cocher</th>
                  <th className="p-2 text-center w-20 border-r">Gauche</th>
                  <th className="p-2 text-center w-20">Droite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50">Utilisation des bras</td>
                  <td className="p-2 border-r font-medium">Mouvement excessif des bras</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.mouvementExcessifBrasG} onChange={(e)=>setQasls({...qasls, mouvementExcessifBrasG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.mouvementExcessifBrasD} onChange={(e)=>setQasls({...qasls, mouvementExcessifBrasD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50">Alignement du buste</td>
                  <td className="p-2 border-r font-medium">Incliné dans différentes positions</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.inclinePositionsG} onChange={(e)=>setQasls({...qasls, inclinePositionsG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.inclinePositionsD} onChange={(e)=>setQasls({...qasls, inclinePositionsD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50" rowSpan="2">Niveau du Bassin</td>
                  <td className="p-2 border-r font-medium">Perte du plan horizontal</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.pertePlanHorizontalG} onChange={(e)=>setQasls({...qasls, pertePlanHorizontalG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.pertePlanHorizontalD} onChange={(e)=>setQasls({...qasls, pertePlanHorizontalD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr>
                  <td className="p-2 border-r font-medium">Bascule ou rotation</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.basculeOuRotationG} onChange={(e)=>setQasls({...qasls, basculeOuRotationG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.basculeOuRotationD} onChange={(e)=>setQasls({...qasls, basculeOuRotationD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50" rowSpan="2">Mouvement de la cuisse</td>
                  <td className="p-2 border-r font-medium">Abduction de hance</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.abductionHancheG} onChange={(e)=>setQasls({...qasls, abductionHancheG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.abductionHancheD} onChange={(e)=>setQasls({...qasls, abductionHancheD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-2 border-r font-medium">Position neutre cuisse controlatérale non maintenue</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.positionNeutreNonMaintenueG} onChange={(e)=>setQasls({...qasls, positionNeutreNonMaintenueG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.positionNeutreNonMaintenueD} onChange={(e)=>setQasls({...qasls, positionNeutreNonMaintenueD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50" rowSpan="2">Position du genou</td>
                  <td className="p-2 border-r font-medium">Rotule orientée vers le 2ième orteils</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.rotule2emeOrteilG} onChange={(e)=>setQasls({...qasls, rotule2emeOrteilG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.rotule2emeOrteilD} onChange={(e)=>setQasls({...qasls, rotule2emeOrteilD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr>
                  <td className="p-2 border-r font-medium">Rotule orientée vers l'intérieur du pied</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.rotuleInterieurPiedG} onChange={(e)=>setQasls({...qasls, rotuleInterieurPiedG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.rotuleInterieurPiedD} onChange={(e)=>setQasls({...qasls, rotuleInterieurPiedD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-2.5 font-bold text-slate-800 border-r bg-slate-50/50" rowSpan="2">Stabilité de la posture</td>
                  <td className="p-2 border-r font-medium">Rééquilibrer avec l'autre jambe</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.reequilibrerAutreJambeG} onChange={(e)=>setQasls({...qasls, reequilibrerAutreJambeG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.reequilibrerAutreJambeD} onChange={(e)=>setQasls({...qasls, reequilibrerAutreJambeD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-50/30">
                  <td className="p-2 border-r font-medium">La jambe de reception vacille</td>
                  <td className="text-center p-2 border-r"><input type="checkbox" checked={qasls.jambeReceptionVacilleG} onChange={(e)=>setQasls({...qasls, jambeReceptionVacilleG: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                  <td className="text-center p-2"><input type="checkbox" checked={qasls.jambeReceptionVacilleD} onChange={(e)=>setQasls({...qasls, jambeReceptionVacilleD: e.target.checked})} className="accent-[#E5A73C] w-4 h-4 cursor-pointer" /></td>
                </tr>
                <tr className="bg-slate-200/80 font-extrabold text-slate-900 border-t-2 border-slate-300">
                  <td className="p-2.5 border-r" colSpan="2">TOTAL Erreurs</td>
                  <td className="text-center p-2 border-r text-amber-900 font-black text-xs">{calcTotalQasls('G')}</td>
                  <td className="text-center p-2 text-amber-900 font-black text-xs">{calcTotalQasls('D')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CAPTURES PHOTOS */}
          <div className="pt-2">
            <p className="font-bold text-slate-800 text-[11px] mb-2">+ 2 photos: face jambe gauche, face jambe droite :</p>
            <div className="grid grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 h-32 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden">
                {photoG ? (
                  <img src={photoG} alt="Face Jambe Gauche" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <>
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-bold text-slate-700 mt-1.5">Face Jambe Gauche</span>
                    <span className="text-[10px] text-slate-400">Importer la photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'G')} />
              </label>

              <label className="border-2 border-dashed border-slate-300 rounded-xl p-3 h-32 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden">
                {photoD ? (
                  <img src={photoD} alt="Face Jambe Droite" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <>
                    <span className="text-2xl">📷</span>
                    <span className="text-xs font-bold text-slate-700 mt-1.5">Face Jambe Droite</span>
                    <span className="text-[10px] text-slate-400">Importer la photo</span>
                  </>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(e, 'D')} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* RANGÉE 4 : BILAN VALD PROFILING N/kg */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">4</span>
            <h3 className="font-bold text-slate-800 text-base">Bilan de Force Isométrique (VALD) Profiling N/kg</h3>
          </div>
          <button className="text-xs text-slate-800 font-bold border border-slate-300 px-3 py-1.5 rounded-xl hover:bg-slate-50">
            🔄 Synchroniser Hub De Vald
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-600 border-b border-slate-200 text-[11px] font-bold">
              <th className="pb-2">Groupes Musculaires</th>
              <th className="pb-2">DROITE<br />Force (N)</th>
              <th className="pb-2">GAUCHE<br />Force (N)</th>
              <th className="pb-2">Relative (N/kg)</th>
              <th className="pb-2">Cible 3M</th>
              <th className="pb-2">Cible Sport</th>
              <th className="pb-2 text-right">LSI %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {/* Quadriceps */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Quadriceps (90°)</td>
              <td className="py-2"><input type="number" value={vald.quadD} onChange={(e) => setVald({ ...vald, quadD: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.quadG} onChange={(e) => setVald({ ...vald, quadG: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.quadG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.quad} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.quad} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.quadG, vald.quadD))}</td>
            </tr>

            {/* Ischios */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Ischios-Jambiers (30°)</td>
              <td className="py-2"><input type="number" value={vald.ischioD} onChange={(e) => setVald({ ...vald, ischioD: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.ischioG} onChange={(e) => setVald({ ...vald, ischioG: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.ischioG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.ischio} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.ischio} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.ischioG, vald.ischioD))}</td>
            </tr>

            {/* Soléaire */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Soléaire / Mollet</td>
              <td className="py-2"><input type="number" value={vald.soleaireD} onChange={(e) => setVald({ ...vald, soleaireD: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.soleaireG} onChange={(e) => setVald({ ...vald, soleaireG: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.soleaireG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.soleaire} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.soleaire} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.soleaireG, vald.soleaireD))}</td>
            </tr>

            {/* Fessiers */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Moyens Fessiers</td>
              <td className="py-2"><input type="number" value={vald.fessierD} onChange={(e) => setVald({ ...vald, fessierD: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.fessierG} onChange={(e) => setVald({ ...vald, fessierG: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.fessierG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.fessier} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.fessier} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.fessierG, vald.fessierD))}</td>
            </tr>

            {/* Adducteurs */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Adducteurs de Hanche</td>
              <td className="py-2"><input type="number" value={vald.adducteurD} onChange={(e) => setVald({ ...vald, adducteurD: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.adducteurG} onChange={(e) => setVald({ ...vald, adducteurG: e.target.value })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.adducteurG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.adducteur} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.adducteur} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.adducteurG, vald.adducteurD))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RANGÉE 5 : PLAN D'ACTION GÉNÉRÉ AUTOMATIQUEMENT */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-3">
        <h3 className="font-extrabold text-slate-800 text-base">Plan d'Action & Directives de Rééducation (Rédigé automatiquement)</h3>
        <p className="text-xs text-slate-500 font-medium">Ce texte se génère automatiquement selon vos saisies ci-dessus et reste modifiable avant l'export PDF :</p>

        <textarea
          rows={5}
          value={planActionText}
          onChange={(e) => setPlanActionText(e.target.value)}
          placeholder="Remplissez les mesures pour générer les consignes automatiques..."
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold leading-relaxed focus:outline-none focus:border-amber-500"
        />
      </div>

    </div>
  );
}