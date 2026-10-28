import React, { useState } from 'react';

export default function PatientsView({ onStartBilan }) {
  const [activeTab, setActiveTab] = useState('liste'); // 'liste' ou 'fiche'

  const patients = [
    { initials: 'MD', nom: 'DUPONT Michelle', date: '12/04/1999', dernierBilan: 'Post-LCA (14/10/2026)', sport: 'Basket-ball', profil: 'Pivot' },
    { initials: 'LB', nom: 'LEFEBVRE Bastien', date: '12/07/1951', dernierBilan: 'Membre inférieur (25/09/2026)', sport: 'Marche', profil: 'Axe' },
    { initials: 'CM', nom: 'MOREAU Camille', date: '16/11/1981', dernierBilan: 'Post-LCA (16/09/2026)', sport: 'Football', profil: 'Pivot' },
    { initials: 'TR', nom: 'ROUSSEL Thomas', date: '25/08/1992', dernierBilan: 'Bilan fonctionnel (02/09/2026)', sport: 'Course', profil: 'Axe' },
    { initials: 'GP', nom: 'PETIT Géraldine', date: '03/05/1974', dernierBilan: 'Post-LCA (18/08/2026)', sport: 'Tennis', profil: 'Pivot' },
    { initials: 'LA', nom: 'ADGARD Lea', date: '18/09/1988', dernierBilan: '—', sport: 'Rugby', profil: 'Pivot' },
  ];

  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#1E293B]">Gestion des Patients</h2>

        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none w-64 shadow-sm"
          />
          <button className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm">
            <span>+</span> Nouveau patient
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* Onglets officiels (Maquette 4) */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/60 shadow-sm w-max text-xs font-bold">
        <button 
          onClick={() => setActiveTab('liste')}
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'liste' ? 'bg-[#E5A73C] text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Tous les patients
        </button>
        <button 
          onClick={() => setActiveTab('fiche')}
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'fiche' ? 'bg-[#E5A73C] text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Informations générales
        </button>
        <button className="px-5 py-2 text-slate-400 font-semibold cursor-not-allowed">Antécédents / Chirurgie</button>
        <button className="px-5 py-2 text-slate-400 font-semibold cursor-not-allowed">Historique des bilans</button>
        <button className="px-5 py-2 text-slate-400 font-semibold cursor-not-allowed">Documents</button>
      </div>

      {/* Vue 1 : Liste complète des patients (Maquette 4) */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h3 className="font-bold text-slate-800 text-base mb-4">Liste des Patients</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Nom & Prénom</th>
                <th className="pb-3">Date de naissance</th>
                <th className="pb-3">Dernier Bilan</th>
                <th className="pb-3">Sport</th>
                <th className="pb-3">Profil</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center">
                      {p.initials}
                    </div>
                    <span className="font-bold text-slate-800">{p.nom}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">{p.date}</td>
                  <td className="py-3.5 text-slate-600 font-medium">{p.dernierBilan}</td>
                  <td className="py-3.5 text-slate-600 font-medium">{p.sport}</td>
                  <td className="py-3.5">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">{p.profil}</span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <button onClick={() => setActiveTab('fiche')} className="border border-slate-300 text-slate-700 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100">
                      Voir / Éditer
                    </button>
                    <button onClick={onStartBilan} className="bg-[#E5A73C] text-slate-950 px-3 py-1.5 rounded-xl font-bold hover:bg-[#d4962b]">
                      Nouveau bilan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Vue 2 : Fiche détaillée du patient (Maquette 3) */}
      {activeTab === 'fiche' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <div className="flex justify-end">
            <button className="bg-[#E5A73C] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2">
              ✏️ Modifier la fiche
            </button>
          </div>

          <div className="grid grid-cols-2 gap-12">
            {/* États-civil */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b pb-2">États-civil & Contacts</h3>
              <div className="space-y-3 text-xs">
                <div><label className="text-slate-500 font-medium block mb-1">Nom</label><input type="text" readOnly value="DUPONT" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Prénom</label><input type="text" readOnly value="Michelle" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Date de naissance</label><input type="text" readOnly value="12/04/1999" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Âge</label><input type="text" readOnly value="27 ans" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Taille / Poids</label><input type="text" readOnly value="178 cm / 65 kg" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
              </div>
            </div>

            {/* Dossier Clinique */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base border-b pb-2">Dossier Clinique & Sport</h3>
              <div className="space-y-3 text-xs">
                <div><label className="text-slate-500 font-medium block mb-1">Sport pratiqué</label><input type="text" readOnly value="Basket-ball" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Profil sportif</label><input type="text" readOnly value="Pivot" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Date d'opération</label><input type="text" readOnly value="23/07/2026" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Technique opératoire</label><input type="text" readOnly value="DIDIT + LAL + suture ménisque interne" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block mb-1">Chirurgien</label><input type="text" readOnly value="Dr Tamalou" className="w-full bg-slate-100 border-none rounded-xl p-3 font-semibold text-slate-800" /></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}