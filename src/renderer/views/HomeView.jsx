import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function HomeView({ currentKine, onNavigate }) {
  const [patientsRecents, setPatientsRecents] = useState([]);
  const [bilansRecents, setBilansRecents] = useState([]);
  const [recherche, setRecherche] = useState('');

  useEffect(() => {
    if (ipcRenderer) {
      // Charger les vrais patients depuis la base SQLite
      ipcRenderer.invoke('patients:get-actifs')
        .then((data) => {
          if (data && Array.isArray(data)) {
            const formatted = data.slice(0, 5).map(p => ({
              id: p.id,
              initials: `${p.nom ? p.nom[0] : ''}${p.prenom ? p.prenom[0] : ''}`.toUpperCase(),
              nom: `${p.nom} ${p.prenom}`,
              date: p.date_naissance || 'Non renseignée',
              idFormatted: String(p.id).padStart(5, '0'),
              dernierBilan: p.dernier_bilan_date || 'Aucun'
            }));
            setPatientsRecents(formatted);
          }
        })
        .catch(err => console.error("Erreur BDD Patients :", err));

      // Charger les vrais bilans depuis la base SQLite
      ipcRenderer.invoke('bilans:get-recents')
        .then((data) => {
          if (data && Array.isArray(data)) {
            setBilansRecents(data);
          }
        })
        .catch(err => console.error("Erreur BDD Bilans :", err));
    }
  }, []);

  const patientsFiltres = patientsRecents.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      {/* En-tête Dynamique sans aucun prénom en dur */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">
            Interface de {currentKine?.prenom},
          </h2>
          <p className="text-base text-slate-500 font-medium">
            Bienvenue dans votre espace {currentKine?.specialite ? `• ${currentKine.specialite}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">🔍</span>
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un patient..."
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E5A73C] w-72 shadow-sm font-semibold"
            />
          </div>
          <button 
            onClick={() => onNavigate('patients')}
            className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 shadow-sm transition-all"
          >
            <span className="text-lg font-extrabold leading-none">+</span> Créer un nouveau patient
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      <div className="grid grid-cols-2 gap-8 flex-1 items-start">
        {/* Cartes Patients (Lecture SQLite Pure) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-slate-700 text-lg">👤</span>
            <h3 className="font-bold text-slate-800 text-base">Patients récents</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {patientsFiltres.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 font-semibold text-center">
                Aucun patient trouvé en base de données.
              </p>
            ) : (
              patientsFiltres.map((p) => (
                <div key={p.id} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-[#0B1E3D] text-white font-extrabold text-sm flex items-center justify-center">
                      {p.initials}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{p.nom}</p>
                      <p className="text-xs text-slate-400">Date de naissance : {p.date} • ID : {p.idFormatted}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="text-xs text-slate-400">Dernier bilan</p>
                      <p className="text-xs font-bold text-slate-700">{p.dernierBilan}</p>
                    </div>
                    <span className="text-slate-400 text-lg font-bold">›</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cartes Bilans (Lecture SQLite Pure) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-slate-700 text-lg">📄</span>
            <h3 className="font-bold text-slate-800 text-base">Bilans récents</h3>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 text-xs font-bold uppercase tracking-wider">
                <th className="pb-3">PATIENT</th>
                <th className="pb-3">TYPE DE BILAN</th>
                <th className="pb-3 text-right">STATUT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bilansRecents.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-6 text-center text-xs text-slate-400 font-semibold">
                    Aucun bilan enregistré en BDD.
                  </td>
                </tr>
              ) : (
                bilansRecents.map((b, idx) => (
                  <tr key={b.id || idx}>
                    <td className="py-4 font-semibold text-slate-800">{b.patient_nom} {b.patient_prenom}</td>
                    <td className="py-4 text-slate-500 text-xs font-medium">{b.type_bilan || 'Post-LCA'}</td>
                    <td className="py-4 text-right">
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        ✓ {b.statut || 'Validé'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}