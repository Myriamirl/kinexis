import React, { useState } from 'react';

export default function BilanFormView() {
  const [patient] = useState({
    nom: 'DUPONT Michelle',
    id: '00124',
    poids: 65,
    taille: 178,
    coteOpere: 'Gauche',
    profilSportif: 'Pivot'
  });

  // BLOC 1 : MOBILITÉ & CONFIANCE (7.2.1)
  const [aclRsi, setAclRsi] = useState('18.33');
  const [extG, setExtG] = useState('0');
  const [extD, setExtD] = useState('0');
  const [flexG, setFlexG] = useState('130');
  const [flexD, setFlexD] = useState('150');

  // Cicatrice détaillée
  const [cicatriceTrophicite, setCicatriceTrophicite] = useState('Normotrophique');
  const [cicatriceAdherence, setCicatriceAdherence] = useState('Souple et mobile');
  const [cicatriceSensibilite, setCicatriceSensibilite] = useState('Indolore');

  // Vaste Médial
  const [vasteG, setVasteG] = useState('80');
  const [vasteD, setVasteD] = useState('200');

  // BLOC 2 : TESTS FONCTIONNELS (7.2.2)
  const [squatG, setSquatG] = useState('384');
  const [squatD, setSquatD] = useState('468');
  const [fenteG, setFenteG] = useState('70');
  const [fenteD, setFenteD] = useState('88');
  const [hopG, setHopG] = useState('114');
  const [hopD, setHopD] = useState('124');
  const [side15G, setSide15G] = useState('28');
  const [side15D, setSide15D] = useState('32');
  const [side30G, setSide30G] = useState('50');
  const [side30D, setSide30D] = useState('63');

  // BLOC 3 : QUALITÉ DU MOUVEMENT (7.2.3)
  const [qualite, setQualite] = useState({
    pelvicDropDroit: false,
    pelvicDropGauche: true,
    valgusDroit: false,
    valgusGauche: true,
    stiffLandingDroit: false,
    stiffLandingGauche: false,
  });

  // BLOC 4 : BILAN DE FORCE VALD (7.2.4)
  const [vald, setVald] = useState({
    quadG: 347, quadD: 480,
    ischioG: 183, ischioD: 200,
    soleaireG: 1130, soleaireD: 1311,
    fessierG: 277, fessierD: 347,
    adducteurG: 351, adducteurD: 384,
  });

  // Cibles minimales à 3 Mois (Section 8.4 du CdC)
  const cibles3M = { quad: 5.5, ischio: 4.0, soleaire: 15.0, fessier: 5.0, adducteur: 5.0 };

  // Cibles Sport selon le profil
  const ciblesSport = patient.profilSportif === 'Pivot'
    ? { quad: 8.5, ischio: 5.0, soleaire: 20.0, fessier: 6.0, adducteur: 6.0 }
    : { quad: 7.5, ischio: 4.5, soleaire: 18.0, fessier: 6.0, adducteur: 6.0 };

  // Calculs automatiques
  const calcRelative = (forceN) => (forceN / patient.poids).toFixed(1);
  const calcLSI = (forceOperee, forceSaine) => {
    if (!forceSaine) return 0;
    return Math.round((forceOperee / forceSaine) * 100) - 100;
  };

  const getLsiBadge = (lsiAbs) => {
    if (Math.abs(lsiAbs) <= 10) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">{lsiAbs}%</span>;
    if (Math.abs(lsiAbs) <= 20) return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">{lsiAbs}%</span>;
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">{lsiAbs}%</span>;
  };

  return (
    <div className="space-y-8 w-full h-full flex flex-col pb-12 text-slate-900">
      {/* En-tête Bilan */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Nouveau Bilan Post-LCA</h2>
          <p className="text-sm text-slate-600 font-medium">
            Patient: <span className="font-bold text-slate-900">{patient.nom}</span> • Côté Opéré: <span className="font-bold text-slate-900">{patient.coteOpere}</span> • Poids: <span className="font-bold text-slate-900">{patient.poids} kg</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <span>📄</span> Générer le bilan PDF
          </button>
          <button className="bg-white border border-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm">
            Enregistrer le brouillon
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* RANGÉE 1 : MOBILITÉ & TESTS FONCTIONNELS */}
      <div className="grid grid-cols-2 gap-8 items-start">

        {/* BLOC 1 : Mobilité Articulaire & Confiance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">1</span>
            <h3 className="font-bold text-slate-800 text-base">Mobilité Articulaire & Confiance</h3>
          </div>

          <div className="space-y-4 text-xs">
            {/* ACL-RSI (Centré) */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
              <span className="font-bold text-slate-800 w-1/3">Confiance (ACL-RSI) %</span>
              <div className="flex-1 flex justify-center">
                <input
                  type="number"
                  value={aclRsi}
                  onChange={(e) => setAclRsi(e.target.value)}
                  className="w-24 bg-white border border-slate-300 text-slate-900 rounded-lg p-2 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                />
              </div>
              <div className="w-1/3 flex justify-end">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${Number(aclRsi) >= 60 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                  {Number(aclRsi) >= 60 ? 'Validé' : 'Non-Validé'}
                </span>
              </div>
            </div>

            {/* ROM Amplitudes (Alignement centré pour G et D) */}
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-3">
              <p className="font-bold text-slate-800">Amplitudes ROM (°)</p>

              {/* Extension */}
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-semibold w-1/3">Extension (G / D)</span>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold text-[11px]">G:</span>
                    <input
                      type="number"
                      value={extG}
                      onChange={(e) => setExtG(e.target.value)}
                      className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold text-[11px]">D:</span>
                    <input
                      type="number"
                      value={extD}
                      onChange={(e) => setExtD(e.target.value)}
                      className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="w-1/3 flex justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${Number(extG) === 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {Number(extG) === 0 ? 'Validé' : 'Flessum'}
                  </span>
                </div>
              </div>

              {/* Flexion */}
              <div className="flex items-center justify-between">
                <span className="text-slate-700 font-semibold w-1/3">Flexion (G / D)</span>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold text-[11px]">G:</span>
                    <input
                      type="number"
                      value={flexG}
                      onChange={(e) => setFlexG(e.target.value)}
                      className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-bold text-[11px]">D:</span>
                    <input
                      type="number"
                      value={flexD}
                      onChange={(e) => setFlexD(e.target.value)}
                      className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
                <div className="w-1/3 flex justify-end">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${Number(flexG) >= 120 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {Number(flexG) >= 120 ? 'Validé' : 'Non-Validé'}
                  </span>
                </div>
              </div>
            </div>

            {/* État Cicatriciel (Menus centrés et uniformes) */}
            <div className="bg-slate-50 p-3.5 rounded-xl space-y-2.5">
              <p className="font-bold text-slate-800">État Cicatriciel</p>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={cicatriceTrophicite}
                  onChange={(e) => setCicatriceTrophicite(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 rounded-lg p-2 font-bold shadow-sm text-center focus:outline-none focus:border-amber-500"
                >
                  <option value="Normotrophique">Normotrophique</option>
                  <option value="Inflammatoire">Inflammatoire</option>
                  <option value="Hypertrophique">Hypertrophique</option>
                  <option value="Chéloïde">Chéloïde</option>
                </select>

                <select
                  value={cicatriceAdherence}
                  onChange={(e) => setCicatriceAdherence(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 rounded-lg p-2 font-bold shadow-sm text-center focus:outline-none focus:border-amber-500"
                >
                  <option value="Souple et mobile">Souple & mobile</option>
                  <option value="Adhérence superficielle">Adhérence superficielle</option>
                  <option value="Adhérence profonde">Adhérence profonde</option>
                </select>

                <select
                  value={cicatriceSensibilite}
                  onChange={(e) => setCicatriceSensibilite(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-900 rounded-lg p-2 font-bold shadow-sm text-center focus:outline-none focus:border-amber-500"
                >
                  <option value="Indolore">Indolore</option>
                  <option value="Douloureuse">Douloureuse</option>
                  <option value="Hypoesthésie">Hypoesthésie</option>
                </select>
              </div>
            </div>

            {/* Activation Vaste Médial (Centré) */}
            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl">
              <div className="w-1/3">
                <p className="font-bold text-slate-800">Activation Vaste Médial</p>
                <p className="text-[10px] text-slate-500">Unités dynamométriques</p>
              </div>
              <div className="flex-1 flex items-center justify-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold text-[11px]">G:</span>
                  <input
                    type="number"
                    value={vasteG}
                    onChange={(e) => setVasteG(e.target.value)}
                    className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500 font-bold text-[11px]">D:</span>
                  <input
                    type="number"
                    value={vasteD}
                    onChange={(e) => setVasteD(e.target.value)}
                    className="w-16 bg-white border border-slate-300 text-slate-900 rounded-lg p-1.5 text-center font-bold shadow-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="w-1/3 flex justify-end">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold text-white ${Number(vasteG) < 80 ? 'bg-rose-500' : Number(vasteG) < 150 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                  {Number(vasteG) < 80 ? 'AMI Sévère' : Number(vasteG) < 150 ? 'Inhibition Modérée' : 'Optimal'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* BLOC 2 : Tests Fonctionnels */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <div className="flex items-center gap-3 border-b pb-3">
            <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">2</span>
            <h3 className="font-bold text-slate-800 text-base">Tests Fonctionnels & Dynamiques</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-4 gap-2 text-center font-bold text-slate-600 text-[10px]">
              <span>Épreuve</span>
              <span>Opéré </span>
              <span>Sain</span>
              <span>LSI %</span>
            </div>

            {/* Squat Bipodal */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <span className="font-semibold text-slate-800">Squat Bipodal (N)</span>
              <input type="number" value={squatG} onChange={(e) => setSquatG(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <input type="number" value={squatD} onChange={(e) => setSquatD(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <div className="text-center">{getLsiBadge(calcLSI(Number(squatG), Number(squatD)))}</div>
            </div>

            {/* Side Hop 15s */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <span className="font-semibold text-slate-800">Side Hop 15s (reps)</span>
              <input type="number" value={side15G} onChange={(e) => setSide15G(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <input type="number" value={side15D} onChange={(e) => setSide15D(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <div className="text-center">{getLsiBadge(calcLSI(Number(side15G), Number(side15D)))}</div>
            </div>

            {/* Side Hop 30s */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <span className="font-semibold text-slate-800">Side Hop 30s (reps)</span>
              <input type="number" value={side30G} onChange={(e) => setSide30G(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <input type="number" value={side30D} onChange={(e) => setSide30D(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <div className="text-center">{getLsiBadge(calcLSI(Number(side30G), Number(side30D)))}</div>
            </div>

            {/* Single Leg Hop */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <span className="font-semibold text-slate-800">Single Leg Hop (cm)</span>
              <input type="number" value={hopG} onChange={(e) => setHopG(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <input type="number" value={hopD} onChange={(e) => setHopD(e.target.value)} className="bg-slate-50 border border-slate-300 text-slate-900 rounded p-1.5 text-center font-bold" />
              <div className="text-center">{getLsiBadge(calcLSI(Number(hopG), Number(hopD)))}</div>
            </div>
          </div>
        </div>

      </div>

      {/* RANGÉE 2 : QUALITÉ DU MOUVEMENT */}
{/* RANGÉE 2 : QUALITÉ DU MOUVEMENT (Analyse Step Down avec colonnes Gauche / Droite) */}
<div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4 text-slate-900">
  <div className="flex items-center gap-3 border-b pb-3">
    <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">3</span>
    <h3 className="font-bold text-slate-800 text-base">Qualité du Mouvement (Analyse Fonctionnelle Latéral Step Down)</h3>
  </div>

  <div className="grid grid-cols-2 gap-8 items-start text-xs">
    {/* Anomalies observées en 2 colonnes distinctes : Gauche / Droite */}
    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
      <p className="font-bold text-slate-800 border-b pb-2">Anomalies observées au Step Down</p>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Colonne Jambe Gauche */}
        <div className="space-y-2.5">
          <p className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-200/60 px-2 py-1 rounded text-center">
            Jambe Gauche
          </p>
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.pelvicDropGauche} 
                onChange={(e) => setQualite({...qualite, pelvicDropGauche: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Pelvic Drop</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.valgusGauche} 
                onChange={(e) => setQualite({...qualite, valgusGauche: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Valgus Dynamique</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.stiffLandingGauche} 
                onChange={(e) => setQualite({...qualite, stiffLandingGauche: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Stiff Landing</span>
            </label>
          </div>
        </div>

        {/* Colonne Jambe Droite */}
        <div className="space-y-2.5">
          <p className="font-extrabold text-slate-700 text-[11px] uppercase tracking-wider bg-slate-200/60 px-2 py-1 rounded text-center">
            Jambe Droite
          </p>
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.pelvicDropDroit} 
                onChange={(e) => setQualite({...qualite, pelvicDropDroit: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Pelvic Drop</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.valgusDroit} 
                onChange={(e) => setQualite({...qualite, valgusDroit: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Valgus Dynamique</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 hover:text-amber-600 transition-colors">
              <input 
                type="checkbox" 
                checked={qualite.stiffLandingDroit} 
                onChange={(e) => setQualite({...qualite, stiffLandingDroit: e.target.checked})} 
                className="accent-[#E5A73C] w-4 h-4 rounded" 
              />
              <span>Stiff Landing</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    {/* Galerie de photos Step Down (Face / Profil) */}
    <div className="grid grid-cols-4 gap-2 text-center h-full items-center">
      {['Face - Sain', 'Face - Opéré', 'Profil - Sain', 'Profil - Opéré'].map((title, i) => (
        <div key={i} className="border-2 border-dashed border-slate-300 rounded-xl p-3 h-32 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
          <span className="text-xl">📷</span>
          <span className="text-[10px] font-bold text-slate-700 mt-1.5">{title}</span>
        </div>
      ))}
    </div>
  </div>
</div>

      {/* RANGÉE 3 : BILAN VALD PROFILING N/kg (AVEC CIBLE 3M RESTAURÉE) */}
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
              <td className="py-2"><input type="number" value={vald.quadD} onChange={(e) => setVald({ ...vald, quadD: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.quadG} onChange={(e) => setVald({ ...vald, quadG: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.quadG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.quad} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.quad} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.quadG, vald.quadD))}</td>
            </tr>

            {/* Ischios */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Ischios-Jambiers (30°)</td>
              <td className="py-2"><input type="number" value={vald.ischioD} onChange={(e) => setVald({ ...vald, ischioD: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.ischioG} onChange={(e) => setVald({ ...vald, ischioG: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.ischioG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.ischio} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.ischio} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.ischioG, vald.ischioD))}</td>
            </tr>

            {/* Soléaire */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Soléaire / Mollet</td>
              <td className="py-2"><input type="number" value={vald.soleaireD} onChange={(e) => setVald({ ...vald, soleaireD: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.soleaireG} onChange={(e) => setVald({ ...vald, soleaireG: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.soleaireG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.soleaire} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.soleaire} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.soleaireG, vald.soleaireD))}</td>
            </tr>

            {/* Fessiers */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Moyens Fessiers</td>
              <td className="py-2"><input type="number" value={vald.fessierD} onChange={(e) => setVald({ ...vald, fessierD: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.fessierG} onChange={(e) => setVald({ ...vald, fessierG: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.fessierG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.fessier} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.fessier} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.fessierG, vald.fessierD))}</td>
            </tr>

            {/* Adducteurs */}
            <tr>
              <td className="py-3 font-bold text-slate-800">Adducteurs de Hanche</td>
              <td className="py-2"><input type="number" value={vald.adducteurD} onChange={(e) => setVald({ ...vald, adducteurD: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2"><input type="number" value={vald.adducteurG} onChange={(e) => setVald({ ...vald, adducteurG: Number(e.target.value) })} className="w-16 bg-slate-50 border border-slate-300 text-slate-900 rounded p-1 text-center font-bold" /></td>
              <td className="py-2 font-bold text-slate-800">{calcRelative(vald.adducteurG)} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{cibles3M.adducteur} N/kg</td>
              <td className="py-2 font-bold text-slate-600">&gt;{ciblesSport.adducteur} N/kg</td>
              <td className="py-2 text-right">{getLsiBadge(calcLSI(vald.adducteurG, vald.adducteurD))}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* RANGÉE 4 : PLAN D'ACTION GÉNÉRÉ AUTOMATIQUEMENT */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-3">
        <h3 className="font-extrabold text-slate-800 text-base">Plan d'Action & Directives de Rééducation (Rédigé automatiquement)</h3>
        <p className="text-xs text-slate-500 font-medium">Ce texte est généré selon les règles métier et reste modifiable avant l'export PDF :</p>

        <textarea
          rows={5}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold leading-relaxed focus:outline-none focus:border-amber-500"
          defaultValue={
            `1. Priorité au renforcement du quadriceps, du soléaire et à la réduction de l'asymétrie.\n` +
            `2. Poursuivre le travail de symétrie de force pour les ischios-jambiers, moyens fessiers et adducteurs.\n` +
            `3. Présence de Pelvic Drop et Valgus dynamique sur la jambe opérée lors du Latéral Step Down.\n` +
            `4. Vigilance sur la confiance du patient en sa rééducation (ACL-RSI < 60%).`
          }
        />
      </div>

    </div>
  );
}