import React, { useState } from 'react';

export default function BilanFormView() {
  const [patient] = useState({ nom: 'DUPONT Michelle', id: '00124', poids: 65 });

  // États locaux du Bloc 1
  const [aclRsi, setAclRsi] = useState('18.33');
  const [extG, setExtG] = useState('0');
  const [extD, setExtD] = useState('0');
  const [flexG, setFlexG] = useState('130');
  const [flexD, setFlexD] = useState('150');
  const [vasteG, setVasteG] = useState('80');
  const [vasteD, setVasteD] = useState('200');

  // États locaux du Bloc 3 (Forces mesurées en N)
  const [quadG, setQuadG] = useState(347);
  const [quadD, setQuadD] = useState(480);
  const [ischioG, setIschioG] = useState(183);
  const [ischioD, setIschioD] = useState(200);

  // Fonction de calcul automatique du LSI %
  const calcLSI = (g, d) => {
    if (!g || !d || d === 0) return 0;
    return Math.round(((g - d) / d) * 100);
  };

  const getLsiBadge = (lsi) => {
    const absLsi = Math.abs(lsi);
    if (absLsi <= 10) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white">{lsi}%</span>;
    if (absLsi <= 15) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">{lsi}%</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white">{lsi}%</span>;
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      {/* En-tête avec Boutons d'action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Nouveau Bilan Post-LCA</h2>
          <p className="text-base text-slate-500 font-medium">Patient : {patient.nom} (ID : {patient.id} - Poids : {patient.poids} kg)</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm">
            <span>+</span> Générer le bilan PDF
          </button>
          <button className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold px-4 py-2.5 rounded-xl text-xs shadow-sm">
            Enregistrer le bilan
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* Grid 2 colonnes */}
      <div className="grid grid-cols-2 gap-8 flex-1 items-start">
        
        {/* Colonne Gauche : Bloc 1 & Bloc 2 */}
        <div className="space-y-6">
          
          {/* Bloc 1 : Mobilité Articulaire & Confiance (Aligné au centre & Pleine largeur) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">1</span>
              <h3 className="font-bold text-slate-800 text-base">Mobilité Articulaire & Confiance</h3>
            </div>

            <div className="space-y-4 text-xs">
              {/* Confiance ACL-RSI */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div className="w-1/3">
                  <label className="font-bold text-slate-700 block">Confiance (ACL-RSI) %</label>
                  <span className="text-[10px] text-slate-400">Objectif &gt; 56%</span>
                </div>
                <div className="flex-1 flex justify-center">
                  <input 
                    type="number" 
                    value={aclRsi} 
                    onChange={(e) => setAclRsi(e.target.value)}
                    className="w-24 bg-white border border-slate-300 rounded-lg py-1.5 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" 
                  />
                </div>
                <div className="w-24 flex justify-end">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold text-white ${Number(aclRsi) >= 56 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                    {Number(aclRsi) >= 56 ? 'Validé' : 'Non-Validé'}
                  </span>
                </div>
              </div>

              {/* Amplitudes ROM (Alignées au centre) */}
              <div className="bg-slate-50 p-3 rounded-xl space-y-3">
                <p className="font-bold text-slate-700 mb-1">ROM (Amplitudes Articulaires)</p>
                
                {/* Extension */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium w-1/3">Extension genou (°)</span>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-semibold">G:</span>
                      <input type="number" value={extG} onChange={(e) => setExtG(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-semibold">D:</span>
                      <input type="number" value={extD} onChange={(e) => setExtD(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                    </div>
                  </div>
                  <div className="w-24 flex justify-end">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white">Lef/Gauche</span>
                  </div>
                </div>

                {/* Flexion */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium w-1/3">Flexion genou (°)</span>
                  <div className="flex-1 flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-semibold">G:</span>
                      <input type="number" value={flexG} onChange={(e) => setFlexG(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-semibold">D:</span>
                      <input type="number" value={flexD} onChange={(e) => setFlexD(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                    </div>
                  </div>
                  <div className="w-24 flex justify-end">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white">Validé</span>
                  </div>
                </div>
              </div>

              {/* État cicatriciel (Pleine largeur) */}
              <div className="bg-slate-50 p-3.5 rounded-xl w-full">
                <p className="font-bold text-slate-700 mb-2.5">État cicatriciel</p>
                <div className="grid grid-cols-3 gap-4 w-full text-slate-800 font-medium">
                  <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-amber-500">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#E5A73C]" />
                    <span>Normotrophique</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-amber-500">
                    <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#E5A73C]" />
                    <span>Mobile</span>
                  </label>
                  <label className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 cursor-pointer hover:border-amber-500">
                    <input type="checkbox" className="w-4 h-4 accent-[#E5A73C]" />
                    <span>Indolore</span>
                  </label>
                </div>
              </div>

              {/* Activation Vaste Médial */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div className="w-1/3">
                  <p className="font-bold text-slate-700">Activation vaste médial</p>
                  <p className="text-[10px] text-slate-400">Unités dynamométriques</p>
                </div>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">G:</span>
                    <input type="number" value={vasteG} onChange={(e) => setVasteG(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-semibold">D:</span>
                    <input type="number" value={vasteD} onChange={(e) => setVasteD(e.target.value)} className="w-16 bg-white border border-slate-300 rounded-lg py-1 text-center font-bold" />
                  </div>
                </div>
                <div className="w-24 flex justify-end">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500 text-white">Non-Validé</span>
                </div>
              </div>

            </div>
          </div>

          {/* Bloc 2 : Tests Fonctionnels */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <div className="flex items-center gap-3 border-b pb-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">2</span>
              <h3 className="font-bold text-slate-800 text-base">Tests Fonctionnels</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2 text-center font-bold text-slate-500 text-[11px] pb-1">
                <span>Test</span>
                <span>Gauche (Opéré)</span>
                <span>Droit (Sain)</span>
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="font-semibold text-slate-700">Squat Bipodal (N)</span>
                <input type="text" defaultValue="384N" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                <input type="text" defaultValue="468N" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="font-semibold text-slate-700">Fente Bulgare (ISOM)</span>
                <input type="text" defaultValue="1min10" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                <input type="text" defaultValue="1min28" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-3 gap-2 items-center">
                <span className="font-semibold text-slate-700">Single Leg Hop (cm)</span>
                <input type="text" defaultValue="NR" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-slate-800 focus:outline-none focus:border-amber-500" />
                <input type="text" defaultValue="NR" className="bg-slate-50 border border-slate-200 rounded-lg py-2 text-center font-bold text-rose-500 focus:outline-none focus:border-amber-500" />
              </div>
            </div>
          </div>

        </div>

        {/* Colonne Droite : Bloc 3 Tableau VALD (Calculs automatiques + Saisie) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">3</span>
              <h3 className="font-bold text-slate-800 text-base">Bilan de Force Isométrique (VALD) Profiling</h3>
            </div>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 text-[11px] font-bold">
                <th className="pb-2">Muscle</th>
                <th className="pb-2">Opéré (G)<br/>Force (N)</th>
                <th className="pb-2">Sain (D)<br/>Force (N)</th>
                <th className="pb-2">Cible 3M</th>
                <th className="pb-2">Cible Sport</th>
                <th className="pb-2 text-right">LSI % / Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-semibold text-slate-800">Quadriceps (90°)</td>
                <td className="py-2">
                  <input type="number" value={quadG} onChange={(e) => setQuadG(Number(e.target.value))} className="w-16 bg-slate-100 border border-slate-200 rounded p-1 text-center font-bold" />
                  <p className="text-[10px] text-slate-400 mt-0.5">{(quadG / patient.poids).toFixed(1)} N/kg</p>
                </td>
                <td className="py-2">
                  <input type="number" value={quadD} onChange={(e) => setQuadD(Number(e.target.value))} className="w-16 bg-slate-100 border border-slate-200 rounded p-1 text-center font-bold" />
                  <p className="text-[10px] text-slate-400 mt-0.5">{(quadD / patient.poids).toFixed(1)} N/kg</p>
                </td>
                <td className="py-3 font-semibold text-slate-600">&gt;5.5</td>
                <td className="py-3 font-semibold text-slate-600">&gt;8.5</td>
                <td className="py-3 text-right">{getLsiBadge(calcLSI(quadG, quadD))}</td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-800">Ischios-Jambiers (30°)</td>
                <td className="py-2">
                  <input type="number" value={ischioG} onChange={(e) => setIschioG(Number(e.target.value))} className="w-16 bg-slate-100 border border-slate-200 rounded p-1 text-center font-bold" />
                  <p className="text-[10px] text-slate-400 mt-0.5">{(ischioG / patient.poids).toFixed(1)} N/kg</p>
                </td>
                <td className="py-2">
                  <input type="number" value={ischioD} onChange={(e) => setIschioD(Number(e.target.value))} className="w-16 bg-slate-100 border border-slate-200 rounded p-1 text-center font-bold" />
                  <p className="text-[10px] text-slate-400 mt-0.5">{(ischioD / patient.poids).toFixed(1)} N/kg</p>
                </td>
                <td className="py-3 font-semibold text-slate-600">&gt;4.0</td>
                <td className="py-3 font-semibold text-slate-600">&gt;5.0</td>
                <td className="py-3 text-right">{getLsiBadge(calcLSI(ischioG, ischioD))}</td>
              </tr>
            </tbody>
          </table>

          <div className="pt-4 flex justify-end">
            <button className="text-xs text-slate-600 font-semibold flex items-center gap-1.5 hover:text-slate-900 border border-slate-200 p-2 rounded-xl">
              🔄 Mettre à jour depuis le Hub De Vald
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}