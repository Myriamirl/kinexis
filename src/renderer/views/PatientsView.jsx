import React, { useState } from 'react';

export default function PatientsView({ onStartBilan }) {
  const [activeTab, setActiveTab] = useState('liste');

  // État local de la fiche patient avec Poids et Taille séparés
  const [patientForm, setPatientForm] = useState({
    nom: 'DUPONT',
    prenom: 'Michelle',
    dateNaissance: '1999-04-12',
    sexe: 'F',
    taille: '178', // cm
    poids: '65',   // kg
    lateralite: 'Droitier', // Droitier / Gaucher
    sportPratique: 'Basket-ball',
    profilSportif: 'Pivot', // Pivot / Axe
    dateOperation: '2026-07-23',
    tempsDepuisOperation: '3 mois',
    techniqueOperatoire: 'DIDIT + LAL + suture ménisque interne',
    mecanismeLasionnel: 'Choc au Basket',
    coteOpere: 'Gauche', // Gauche / Droit / Bilatéral
    chirurgien: 'Dr Tamalou',
    kine: 'Marion GALLEN'
  });

  const handleChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

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

      {/* Onglets */}
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
      </div>

      {/* Vue 1 : Liste */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h3 className="font-bold text-slate-800 text-base mb-4">Liste des Patients</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Nom & Prénom</th>
                <th className="pb-3">Date de naissance</th>
                <th className="pb-3">Taille / Poids</th>
                <th className="pb-3">Sport / Profil</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center">
                    MD
                  </div>
                  <span className="font-bold text-slate-800">{patientForm.nom} {patientForm.prenom}</span>
                </td>
                <td className="py-3.5 text-slate-600 font-medium">{patientForm.dateNaissance}</td>
                <td className="py-3.5 text-slate-600 font-medium">{patientForm.taille} cm / {patientForm.poids} kg</td>
                <td className="py-3.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {patientForm.sportPratique} ({patientForm.profilSportif})
                  </span>
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
            </tbody>
          </table>
        </div>
      )}

      {/* Vue 2 : Fiche détaillée (Cahier des charges 7.1) */}
      {activeTab === 'fiche' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Dossier Médical & État-Civil</h3>
            <button className="bg-[#E5A73C] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm">
              💾 Enregistrer les modifications
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* Colonne 1 : Identification du patient */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-b pb-1">Identification & Morphologie</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Nom</label>
                  <input type="text" name="nom" value={patientForm.nom} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Prénom</label>
                  <input type="text" name="prenom" value={patientForm.prenom} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Date de naissance</label>
                  <input type="date" name="dateNaissance" value={patientForm.dateNaissance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Latéralité</label>
                  <select name="lateralite" value={patientForm.lateralite} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                    <option value="Droitier">Droitier</option>
                    <option value="Gaucher">Gaucher</option>
                  </select>
                </div>
                {/* TAILLE ET POIDS SÉPARÉS */}
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Taille (cm)</label>
                  <input type="number" name="taille" value={patientForm.taille} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Poids (kg)</label>
                  <input type="number" name="poids" value={patientForm.poids} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
              </div>
            </div>

            {/* Colonne 2 : Sport & Données Chirurgicales */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-b pb-1">Contexte Sportif & Chirurgical</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Sport Pratiqué</label>
                  <input type="text" name="sportPratique" value={patientForm.sportPratique} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Profil Sportif (Cibles)</label>
                  <select name="profilSportif" value={patientForm.profilSportif} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                    <option value="Pivot">Sport Pivot (Cibles élevées)</option>
                    <option value="Axe">Sport Axe</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Côté Opéré</label>
                  <select name="coteOpere" value={patientForm.coteOpere} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800">
                    <option value="Gauche">Gauche</option>
                    <option value="Droit">Droit</option>
                    <option value="Bilateral">Bilatéral</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Temps post-opératoire</label>
                  <input type="text" name="tempsDepuisOperation" value={patientForm.tempsDepuisOperation} onChange={handleChange} placeholder="ex: 3 mois" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 font-semibold block mb-1">Mécanisme lésionnel</label>
                  <input type="text" name="mecanismeLasionnel" value={patientForm.mecanismeLasionnel} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 font-semibold block mb-1">Technique Opératoire</label>
                  <input type="text" name="techniqueOperatoire" value={patientForm.techniqueOperatoire} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}