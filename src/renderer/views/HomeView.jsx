import React from 'react';

export default function HomeView({ onNavigate, onStartBilan }) {
  const patientsRecents = [
    { initials: 'MD', nom: 'DUPONT Michelle', date: '12/04/1999', id: '00124', dernierBilan: '14/10/2026' },
    { initials: 'LB', nom: 'LEFEBVRE Bastien', date: '12/07/1951', id: '00027', dernierBilan: '25/09/2026' },
    { initials: 'CM', nom: 'MOREAU Camille', date: '16/11/1981', id: '00442', dernierBilan: '16/09/2026' },
  ];

  const bilansRecents = [
    { patient: 'DUPONT Michelle', type: 'Post-LCA (3 mois)', statut: null },
    { patient: 'LEFEBVRE Bastien', type: 'Membre inférieur', statut: 'A analyser' },
    { patient: 'MOREAU Camille', type: 'Post-LCA (3 mois)', statut: 'En cours' },
    { patient: 'ROUSSEL Thomas', type: 'Bilan fonctionnel', statut: 'Validé' },
  ];

  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Interface de Marion,</h2>
          <p className="text-base text-slate-500 font-medium">Bienvenue dans votre espace</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un patient..."
              className="bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 w-72 shadow-sm"
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

      {/* Trait de séparation doré */}
      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* Cartes en responsive full width */}
      <div className="grid grid-cols-2 gap-8 flex-1 items-start">
        {/* Patients récents */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="text-slate-700 text-lg">👤</span>
            <h3 className="font-bold text-slate-800 text-base">Patients récents</h3>
          </div>

          <div className="divide-y divide-slate-100">
            {patientsRecents.map((p, idx) => (
              <div key={idx} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-[#1E293B] text-white font-extrabold text-sm flex items-center justify-center">
                    {p.initials}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{p.nom}</p>
                    <p className="text-xs text-slate-400">Date de naissance : {p.date} • ID : {p.id}</p>
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
            ))}
          </div>
        </div>

        {/* Bilans récents */}
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
              {bilansRecents.map((b, idx) => (
                <tr key={idx}>
                  <td className="py-4 font-semibold text-slate-800">{b.patient}</td>
                  <td className="py-4 text-slate-500 text-xs font-medium">{b.type}</td>
                  <td className="py-4 text-right">
                    {b.statut === 'A analyser' && (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600 border border-rose-200">⚠️ A analyser</span>
                    )}
                    {b.statut === 'En cours' && (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">En cours</span>
                    )}
                    {b.statut === 'Validé' && (
                      <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">✓ Validé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}