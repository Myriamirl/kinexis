import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function PatientsView({ currentKine, onStartBilan }) {
  const [activeTab, setActiveTab] = useState('liste');
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [recherche, setRecherche] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Formulaire de création complet (100% aligné sur schema.sql, zéro donnée en dur)
  const [newPatient, setNewPatient] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    sexe: 'M',
    poidsKg: '',
    tailleCm: '',
    telephone: '',
    email: '',
    adresse: '',
    sportPratique: '',
    profilSportif: 'Axe',
    medecinPrescripteur: '',
    medecinChirurgien: '',
    remarquesCliniques: ''
  });

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  // Recharger la liste depuis SQLite
  const chargerPatientsBDD = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('patients:get-actifs')
        .then((data) => {
          setPatients(data || []);
        })
        .catch(err => console.error("Erreur lecture patients BDD :", err));
    }
  };

  useEffect(() => {
    chargerPatientsBDD();
  }, []);

  const handleCreatePatient = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    if (!newPatient.nom || !newPatient.prenom || !newPatient.dateNaissance) {
      setErreur("Le nom, le prénom et la date de naissance sont obligatoires.");
      setChargement(false);
      return;
    }

    if (ipcRenderer) {
      const payload = { ...newPatient, kineId: currentKine?.id };
      const res = await ipcRenderer.invoke('patients:add', payload);
      if (res.success) {
        setShowModal(false);
        setNewPatient({
          nom: '', prenom: '', dateNaissance: '', sexe: 'M',
          poidsKg: '', tailleCm: '', telephone: '', email: '',
          adresse: '', sportPratique: '', profilSportif: 'Axe',
          medecinPrescripteur: '', medecinChirurgien: '', remarquesCliniques: ''
        });
        chargerPatientsBDD();
      } else {
        setErreur(res.error || "Erreur lors de la création du patient.");
      }
    } else {
      setShowModal(false);
    }
    setChargement(false);
  };

  const handleSelectPatientForEdit = (p) => {
    setSelectedPatient(p);
    setActiveTab('fiche');
  };

  const patientsFiltres = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Gestion des Patients</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {patients.length} patient(s) enregistré(s) en base de données
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher un patient..."
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none w-64 shadow-sm font-semibold"
          />
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span>+</span> Nouveau patient
          </button>
        </div>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      {/* Navigation Onglets */}
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
        <button 
          onClick={() => setActiveTab('historique')} 
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'historique' ? 'bg-[#E5A73C] text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Historique des bilans
        </button>
      </div>

      {/* VUE 1 : LISTE DES PATIENTS (SQLITE PURE) */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex-1">
          <h3 className="font-bold text-slate-800 text-base mb-4">Liste des Patients en Base</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Date de Naissance</th>
                <th className="pb-3">Téléphone / Email</th>
                <th className="pb-3">Sport / Profil</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {patientsFiltres.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold text-xs">
                    Aucun patient trouvé en base de données.
                  </td>
                </tr>
              ) : (
                patientsFiltres.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0B1E3D] text-white font-black text-xs flex items-center justify-center">
                        {p.nom?.[0]}{p.prenom?.[0]}
                      </div>
                      <span className="font-bold text-slate-900">{p.nom} {p.prenom}</span>
                    </td>
                    <td className="py-3.5 text-slate-700">{p.date_naissance || '-'}</td>
                    <td className="py-3.5 text-slate-700">{p.telephone || '-'} / {p.email || '-'}</td>
                    <td className="py-3.5">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                        {p.sport_pratique || 'Non spécifié'} ({p.profil_sportif || 'Axe'})
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <button 
                        onClick={() => handleSelectPatientForEdit(p)} 
                        className="border border-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100"
                      >
                        Voir / Éditer
                      </button>
                      <button 
                        onClick={() => onStartBilan(p)} 
                        className="bg-[#E5A73C] text-slate-950 px-3 py-1.5 rounded-xl font-bold hover:bg-[#d4962b]"
                      >
                        Nouveau bilan
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VUE 2 : FICHE DU PATIENT SÉLECTIONNÉ */}
      {activeTab === 'fiche' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-extrabold text-slate-800 text-lg">
              {selectedPatient ? `Fiche de ${selectedPatient.nom} ${selectedPatient.prenom}` : "Sélectionnez un patient"}
            </h3>
          </div>

          {selectedPatient ? (
            <div className="grid grid-cols-2 gap-10 text-xs font-semibold">
              <div className="space-y-3">
                <p><strong className="text-slate-500">Nom :</strong> {selectedPatient.nom}</p>
                <p><strong className="text-slate-500">Prénom :</strong> {selectedPatient.prenom}</p>
                <p><strong className="text-slate-500">Date de naissance :</strong> {selectedPatient.date_naissance || '-'}</p>
                <p><strong className="text-slate-500">Sexe :</strong> {selectedPatient.sexe}</p>
                <p><strong className="text-slate-500">Poids :</strong> {selectedPatient.poids_kg ? `${selectedPatient.poids_kg} kg` : '-'}</p>
                <p><strong className="text-slate-500">Taille :</strong> {selectedPatient.taille_cm ? `${selectedPatient.taille_cm} cm` : '-'}</p>
                <p><strong className="text-slate-500">Adresse :</strong> {selectedPatient.adresse || '-'}</p>
              </div>
              <div className="space-y-3">
                <p><strong className="text-slate-500">Téléphone :</strong> {selectedPatient.telephone || '-'}</p>
                <p><strong className="text-slate-500">Email :</strong> {selectedPatient.email || '-'}</p>
                <p><strong className="text-slate-500">Sport Pratiqué :</strong> {selectedPatient.sport_pratique || '-'}</p>
                <p><strong className="text-slate-500">Profil Sportif :</strong> {selectedPatient.profil_sportif}</p>
                <p><strong className="text-slate-500">Médecin Prescripteur :</strong> {selectedPatient.medecin_prescripteur || '-'}</p>
                <p><strong className="text-slate-500">Médecin Chirurgien :</strong> {selectedPatient.medecin_chirurgien || '-'}</p>
                <p><strong className="text-slate-500">Remarques :</strong> {selectedPatient.remarques_cliniques || '-'}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-xs py-6 text-center font-bold">
              Veuillez cliquer sur "Voir / Éditer" à côté d'un patient dans l'onglet "Tous les patients".
            </p>
          )}
        </div>
      )}

      {/* VUE 3 : HISTORIQUE DES BILANS */}
      {activeTab === 'historique' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Historique des Bilans du Patient</h3>
          <p className="text-xs text-slate-400 font-bold py-4 text-center">
            Sélectionnez un patient pour consulter son historique de bilans SQLite.
          </p>
        </div>
      )}

      {/* MODAL NOUVEAU PATIENT (FORMULAIRE COMPLET SQLITE) */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-extrabold text-slate-800">Nouveau Patient</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            {erreur && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-xl font-semibold">
                {erreur}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs font-semibold">
              
              {/* Identité */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Nom *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.nom}
                    onChange={(e) => setNewPatient({ ...newPatient, nom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={newPatient.prenom}
                    onChange={(e) => setNewPatient({ ...newPatient, prenom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>

              {/* Naissance & Sexe */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Date de Naissance *</label>
                  <input
                    type="date"
                    required
                    value={newPatient.dateNaissance}
                    onChange={(e) => setNewPatient({ ...newPatient, dateNaissance: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Sexe</label>
                  <select
                    value={newPatient.sexe}
                    onChange={(e) => setNewPatient({ ...newPatient, sexe: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Mensurations */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPatient.poidsKg}
                    onChange={(e) => setNewPatient({ ...newPatient, poidsKg: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Taille (cm)</label>
                  <input
                    type="number"
                    value={newPatient.tailleCm}
                    onChange={(e) => setNewPatient({ ...newPatient, tailleCm: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={newPatient.telephone}
                    onChange={(e) => setNewPatient({ ...newPatient, telephone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Adresse Email</label>
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Adresse Postale</label>
                <input
                  type="text"
                  value={newPatient.adresse}
                  onChange={(e) => setNewPatient({ ...newPatient, adresse: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                />
              </div>

              {/* Profil Sportif */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Sport Pratiqué</label>
                  <input
                    type="text"
                    value={newPatient.sportPratique}
                    onChange={(e) => setNewPatient({ ...newPatient, sportPratique: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Profil Sportif</label>
                  <select
                    value={newPatient.profilSportif}
                    onChange={(e) => setNewPatient({ ...newPatient, profilSportif: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  >
                    <option value="Axe">Sport Axe</option>
                    <option value="Pivot">Sport Pivot</option>
                  </select>
                </div>
              </div>

              {/* Contexte Médical */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Médecin Prescripteur</label>
                  <input
                    type="text"
                    value={newPatient.medecinPrescripteur}
                    onChange={(e) => setNewPatient({ ...newPatient, medecinPrescripteur: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Médecin Chirurgien</label>
                  <input
                    type="text"
                    value={newPatient.medecinChirurgien}
                    onChange={(e) => setNewPatient({ ...newPatient, medecinChirurgien: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Remarques Cliniques</label>
                <textarea
                  rows={2}
                  value={newPatient.remarquesCliniques}
                  onChange={(e) => setNewPatient({ ...newPatient, remarquesCliniques: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                  placeholder="Pathologies associées, antécédents, etc."
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={chargement}
                  className="flex-1 bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-md"
                >
                  {chargement ? "Enregistrement..." : "Enregistrer en BDD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}