import React, { useState } from 'react';

export default function PatientsView({ onStartBilan }) {
  const [activeTab, setActiveTab] = useState('fiche');

  const [patientForm, setPatientForm] = useState({
    nom: 'DUPONT',
    prenom: 'Michelle',
    dateNaissance: '1999-04-12',
    sexe: 'F',
    taille: '178',
    poids: '65',
    lateralite: 'Droitier',
    telephone: '06 12 34 56 78',
    email: 'michelle.dupont@email.com',
    adresse: '12 Rue de la Paix, 49000 Angers',
    profession: 'Étudiante',
    sportPratique: 'Basket-ball',
    profilSportif: 'Pivot',
    niveauSportif: 'Nationale 2 (3-4 x / semaine)',
    medecinTraitant: 'Dr. Martin',
    medecinChirurgien: 'Dr Tamalou',
    kine: 'Marion GALLEN',
    dateOperation: '2026-07-23',
    tempsDepuisOperation: '3 mois',
    techniqueOperatoire: 'DIDIT + LAL + suture ménisque interne',
    mecanismeLasionnel: 'Choc au Basket',
    coteOpere: 'Gauche',
    contactUrgenceNom: 'DUPONT Marc',
    contactUrgenceLien: 'Père',
    contactUrgenceTel: '06 98 76 54 32'
  });

  const handleChange = (e) => {
    setPatientForm({ ...patientForm, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#1E293B]">Gestion des Patients</h2>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Rechercher un patient..."
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none w-64 shadow-sm"
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
        <button onClick={() => setActiveTab('historique')} className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'historique' ? 'bg-[#E5A73C] text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>
          Historique des bilans
        </button>
      </div>

      {/* Vue 1 : Liste */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60">
          <h3 className="font-bold text-slate-800 text-base mb-4">Liste des Patients</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Nom & Prénom</th>
                <th className="pb-3">Né(e) le</th>
                <th className="pb-3">Médecins (Prescr. / Chir.)</th>
                <th className="pb-3">Sport / Profil</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50">
                <td className="py-3.5 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E293B] text-white font-bold text-xs flex items-center justify-center">
                    MD
                  </div>
                  <span className="font-bold text-slate-900">{patientForm.nom} {patientForm.prenom}</span>
                </td>
                <td className="py-3.5 text-slate-700 font-semibold">{patientForm.dateNaissance}</td>
                <td className="py-3.5 text-slate-700 font-semibold">{patientForm.medecinTraitant} / {patientForm.medecinChirurgien}</td>
                <td className="py-3.5">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                    {patientForm.sportPratique} ({patientForm.profilSportif})
                  </span>
                </td>
                <td className="py-3.5 text-right space-x-2">
                  <button onClick={() => setActiveTab('fiche')} className="border border-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100">
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

      {/* Vue 2 : Fiche détaillée complète */}
      {activeTab === 'fiche' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-extrabold text-slate-800 text-lg">Fiche Patient Complète</h3>
            <button className="bg-[#E5A73C] text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-sm">
              💾 Enregistrer les modifications
            </button>
          </div>

          <div className="grid grid-cols-2 gap-10">
            {/* Colonne 1 : Informations Personnelles */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-b pb-1">👤 Informations Personnelles</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Nom</label>
                  <input type="text" name="nom" value={patientForm.nom} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Prénom</label>
                  <input type="text" name="prenom" value={patientForm.prenom} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Date de naissance</label>
                  <input type="date" name="dateNaissance" value={patientForm.dateNaissance} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Latéralité</label>
                  <select name="lateralite" value={patientForm.lateralite} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Droitier">Droitier</option>
                    <option value="Gaucher">Gaucher</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Taille (cm)</label>
                  <input type="number" name="taille" value={patientForm.taille} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Poids (kg)</label>
                  <input type="number" name="poids" value={patientForm.poids} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Téléphone</label>
                  <input type="text" name="telephone" value={patientForm.telephone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Email</label>
                  <input type="email" name="email" value={patientForm.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 font-semibold block mb-1">Adresse</label>
                  <input type="text" name="adresse" value={patientForm.adresse} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>

              {/* Contact Urgence */}
              <h4 className="font-bold text-slate-700 text-sm border-b pb-1 pt-2">📞 Contact d'urgence</h4>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Nom / Prénom</label>
                  <input type="text" name="contactUrgenceNom" value={patientForm.contactUrgenceNom} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Lien</label>
                  <input type="text" name="contactUrgenceLien" value={patientForm.contactUrgenceLien} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Téléphone</label>
                  <input type="text" name="contactUrgenceTel" value={patientForm.contactUrgenceTel} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>
            </div>

            {/* Colonne 2 : Données Médicales & Chirurgicales */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm border-b pb-1">🩺 Contexte Médical & Sportif</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Médecin traitant / Prescripteur</label>
                  <input type="text" name="medecinTraitant" value={patientForm.medecinTraitant} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Chirurgien</label>
                  <input type="text" name="medecinChirurgien" value={patientForm.medecinChirurgien} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Sport Pratiqué</label>
                  <input type="text" name="sportPratique" value={patientForm.sportPratique} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Profil Sportif (Cibles)</label>
                  <select name="profilSportif" value={patientForm.profilSportif} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Pivot">Sport Pivot</option>
                    <option value="Axe">Sport Axe</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Date d'opération</label>
                  <input type="date" name="dateOperation" value={patientForm.dateOperation} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Côté Opéré</label>
                  <select name="coteOpere" value={patientForm.coteOpere} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900">
                    <option value="Gauche">Gauche</option>
                    <option value="Droit">Droit</option>
                    <option value="Bilateral">Bilatéral</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 font-semibold block mb-1">Mécanisme lésionnel</label>
                  <input type="text" name="mecanismeLasionnel" value={patientForm.mecanismeLasionnel} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
                <div className="col-span-2">
                  <label className="text-slate-500 font-semibold block mb-1">Technique Opératoire</label>
                  <input type="text" name="techniqueOperatoire" value={patientForm.techniqueOperatoire} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vue 3 : Historique des Bilans */}
      {activeTab === 'historique' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Archives & Historique des Bilans du Patient</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Date du Bilan</th>
                <th className="pb-3">Type de Bilan</th>
                <th className="pb-3">Temps post-op</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-bold text-slate-900">14/10/2026</td>
                <td className="py-3 font-semibold text-slate-700">Post-LCA (3 mois)</td>
                <td className="py-3 text-slate-600">2.7 mois (82 jours)</td>
                <td className="py-3"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ Validé</span></td>
                <td className="py-3 text-right">
                  <button className="border border-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100">Voir PDF</button>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-900">20/08/2026</td>
                <td className="py-3 font-semibold text-slate-700">Bilan Fonctionnel Initial</td>
                <td className="py-3 text-slate-600">1.0 mois (28 jours)</td>
                <td className="py-3"><span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">Archivé</span></td>
                <td className="py-3 text-right">
                  <button className="border border-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100">Voir PDF</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}