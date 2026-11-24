import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function PatientsView({ currentKine, onStartBilan }) {
  const [activeTab, setActiveTab] = useState('liste');
  const [patientsListe, setPatientsListe] = useState([]);
  const [patientsArchives, setPatientsArchives] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [bilansPatient, setBilansPatient] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [archiveModal, setArchiveModal] = useState({ open: false, patient: null, motif: '' });

  // Formulaire de modification de la fiche patient
  const [editPatientForm, setEditPatientForm] = useState(null);
  const [succesMsg, setSuccesMsg] = useState('');

  // Formulaire de création complet
  const [newPatient, setNewPatient] = useState({
    nom: '', prenom: '', dateNaissance: '', sexe: 'M',
    poidsKg: '', tailleCm: '', telephone: '', email: '',
    adresse: '', sportPratique: '', profilSportif: 'Axe',
    medecinPrescripteur: '', medecinChirurgien: '', remarquesCliniques: ''
  });

  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  const [bilanModal, setBilanModal] = useState({ open: false, data: null, resultats: [] });

  const handleViewBilanDetails = async (bilanId) => {
    if (!ipcRenderer) return;
    const res = await ipcRenderer.invoke('bilans:get-details', bilanId);
    if (res.success) {
      setBilanModal({ open: true, data: res.bilan, resultats: res.resultats });
    } else {
      alert("Erreur lors de la récupération des détails du bilan.");
    }
  };

  const chargerPatientsBDD = () => {
    if (ipcRenderer) {
      ipcRenderer.invoke('patients:get-actifs')
        .then((data) => setPatientsListe(data || []))
        .catch(err => console.error("Erreur lecture patients actifs :", err));

      ipcRenderer.invoke('patients:get-archives')
        .then((data) => setPatientsArchives(data || []))
        .catch(err => console.error("Erreur lecture patients archivés :", err));
    }
  };

  useEffect(() => {
    chargerPatientsBDD();
  }, []);

  // Charger l'historique des bilans lorsque le patient sélectionné change
  useEffect(() => {
    if (selectedPatient && ipcRenderer) {
      setEditPatientForm({
        id: selectedPatient.id,
        nom: selectedPatient.nom || '',
        prenom: selectedPatient.prenom || '',
        dateNaissance: selectedPatient.date_naissance || '',
        sexe: selectedPatient.sexe || 'M',
        poidsKg: selectedPatient.poids_kg || '',
        tailleCm: selectedPatient.taille_cm || '',
        telephone: selectedPatient.telephone || '',
        email: selectedPatient.email || '',
        adresse: selectedPatient.adresse || '',
        sportPratique: selectedPatient.sport_pratique || '',
        profilSportif: selectedPatient.profil_sportif || 'Axe',
        medecinPrescripteur: selectedPatient.medecin_prescripteur || '',
        medecinChirurgien: selectedPatient.medecin_chirurgien || '',
        remarquesCliniques: selectedPatient.remarques_cliniques || ''
      });

      ipcRenderer.invoke('bilans:get-by-patient', selectedPatient.id)
        .then((data) => setBilansPatient(data || []))
        .catch(err => console.error("Erreur historique bilans :", err));
    } else {
      setBilansPatient([]);
      setEditPatientForm(null);
    }
  }, [selectedPatient]);

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
        setErreur(res.error || "Erreur lors de la création.");
      }
    }
    setChargement(false);
  };

  const handleUpdatePatient = async (e) => {
    e.preventDefault();
    setSuccesMsg('');
    if (!ipcRenderer || !editPatientForm) return;

    const res = await ipcRenderer.invoke('patients:update', editPatientForm);
    if (res.success) {
      setSuccesMsg("✅ Fiche patient mise à jour avec succès !");
      setSelectedPatient({ ...selectedPatient, ...editPatientForm });
      chargerPatientsBDD();
      setTimeout(() => setSuccesMsg(''), 3000);
    } else {
      alert("Erreur lors de la mise à jour : " + res.error);
    }
  };

  const handleConfirmArchive = async (e) => {
    e.preventDefault();
    if (!archiveModal.patient || !ipcRenderer) return;

    const res = await ipcRenderer.invoke('patients:archive', {
      patientId: archiveModal.patient.id,
      kineId: currentKine?.id,
      motif: archiveModal.motif
    });

    if (res.success) {
      if (selectedPatient?.id === archiveModal.patient.id) {
        setSelectedPatient(null);
      }
      setArchiveModal({ open: false, patient: null, motif: '' });
      chargerPatientsBDD();
    }
  };

  const handleUnarchivePatient = async (patientId) => {
    if (!ipcRenderer) return;
    const res = await ipcRenderer.invoke('patients:unarchive', patientId);
    if (res.success) chargerPatientsBDD();
  };
const handleOpenBilanPdf = async (cheminPdf) => {
    if (!ipcRenderer) return;
    const res = await ipcRenderer.invoke('bilans:open-pdf', cheminPdf);
    if (!res.success) {
      alert(`❌ Impossible d'ouvrir le PDF : ${res.error}`);
    }
  };

  const handleDownloadBilanPdf = async (bilan) => {
    if (!ipcRenderer) return;
    const nomFichier = `bilan_${selectedPatient?.nom || bilan.id}_${bilan.date_bilan || ''}.pdf`;
    const res = await ipcRenderer.invoke('bilans:download-pdf', {
      cheminPdf: bilan.chemin_pdf,
      nomFichier
    });
    if (res.success) {
      alert("✅ PDF téléchargé avec succès !");
    } else if (!res.cancelled) {
      alert(`❌ Erreur téléchargement : ${res.error}`);
    }
  };

  const handleSelectPatientForEdit = (p) => {
    setSelectedPatient(p);
    setActiveTab('fiche');
  };

  const patientsFiltres = patientsListe.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  const patientsArchivesFiltres = patientsArchives.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(recherche.toLowerCase())
  );

  const formatDateFR = (dateStr) => {
    if (!dateStr) return '-';
    const cleanDate = String(dateStr).split('T')[0];
    const parts = cleanDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-[#1E293B]">Gestion des Patients</h2>
          <p className="text-xs font-semibold text-slate-500 mt-1">
            {patientsListe.length} patient(s) actif(s) • {patientsArchives.length} archivé(s)
            {selectedPatient && <span className="ml-3 text-amber-700 font-bold">• Patient actif : {selectedPatient.nom} {selectedPatient.prenom}</span>}
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
          Historique des bilans ({bilansPatient.length})
        </button>
        <button
          onClick={() => setActiveTab('archives')}
          className={`px-5 py-2 rounded-xl transition-all ${activeTab === 'archives' ? 'bg-[#E5A73C] text-slate-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
        >
          Patients archivés ({patientsArchives.length})
        </button>
      </div>

      {/* VUE 1 : LISTE DES PATIENTS ACTIFS */}
      {activeTab === 'liste' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex-1">
          <h3 className="font-bold text-slate-800 text-base mb-4">Liste des Patients</h3>
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
                    <td className="py-3.5 text-slate-700">{formatDateFR(p.date_naissance)}</td>
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
                      <button
                        onClick={() => setArchiveModal({ open: true, patient: p, motif: '' })}
                        className="border border-slate-300 text-slate-500 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100 hover:text-slate-800"
                      >
                        Archiver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VUE 2 : FICHE DU PATIENT SÉLECTIONNÉ (ÉDITABLE) */}
      {activeTab === 'fiche' && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="font-extrabold text-slate-800 text-lg">
              {selectedPatient ? `Fiche de ${selectedPatient.nom} ${selectedPatient.prenom}` : "Sélectionnez un patient"}
            </h3>
            {succesMsg && <span className="text-emerald-600 font-extrabold text-xs">{succesMsg}</span>}
          </div>

          {selectedPatient && editPatientForm ? (
            <form onSubmit={handleUpdatePatient} className="space-y-6 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-600 block mb-1">Nom</label>
                    <input type="text" value={editPatientForm.nom} onChange={(e) => setEditPatientForm({ ...editPatientForm, nom: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Prénom</label>
                    <input type="text" value={editPatientForm.prenom} onChange={(e) => setEditPatientForm({ ...editPatientForm, prenom: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Date de naissance</label>
                    <input type="date" value={editPatientForm.dateNaissance} onChange={(e) => setEditPatientForm({ ...editPatientForm, dateNaissance: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Sexe</label>
                    <select value={editPatientForm.sexe} onChange={(e) => setEditPatientForm({ ...editPatientForm, sexe: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
                      <option value="M">Masculin</option>
                      <option value="F">Féminin</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Poids (kg)</label>
                      <input type="number" step="0.1" value={editPatientForm.poidsKg} onChange={(e) => setEditPatientForm({ ...editPatientForm, poidsKg: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Taille (cm)</label>
                      <input type="number" value={editPatientForm.tailleCm} onChange={(e) => setEditPatientForm({ ...editPatientForm, tailleCm: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Adresse</label>
                    <input type="text" value={editPatientForm.adresse} onChange={(e) => setEditPatientForm({ ...editPatientForm, adresse: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-slate-600 block mb-1">Téléphone</label>
                    <input type="text" value={editPatientForm.telephone} onChange={(e) => setEditPatientForm({ ...editPatientForm, telephone: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Email</label>
                    <input type="email" value={editPatientForm.email} onChange={(e) => setEditPatientForm({ ...editPatientForm, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Sport Pratiqué</label>
                    <input type="text" value={editPatientForm.sportPratique} onChange={(e) => setEditPatientForm({ ...editPatientForm, sportPratique: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Profil Sportif</label>
                    <select value={editPatientForm.profilSportif} onChange={(e) => setEditPatientForm({ ...editPatientForm, profilSportif: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
                      <option value="Axe">Sport Axe</option>
                      <option value="Pivot">Sport Pivot</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Médecin Prescripteur</label>
                      <input type="text" value={editPatientForm.medecinPrescripteur} onChange={(e) => setEditPatientForm({ ...editPatientForm, medecinPrescripteur: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">Médecin Chirurgien</label>
                      <input type="text" value={editPatientForm.medecinChirurgien} onChange={(e) => setEditPatientForm({ ...editPatientForm, medecinChirurgien: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Remarques Cliniques</label>
                    <textarea rows={2} value={editPatientForm.remarquesCliniques} onChange={(e) => setEditPatientForm({ ...editPatientForm, remarquesCliniques: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black px-6 py-3 rounded-xl shadow-md transition-all">
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          ) : (
            <p className="text-slate-400 text-xs py-10 text-center font-bold">
              Veuillez sélectionner un patient depuis l'onglet "Tous les patients" pour afficher et modifier sa fiche.
            </p>
          )}
        </div>
      )}

      {/* VUE 3 : HISTORIQUE DES BILANS DYNAMIQUE */}
      {activeTab === 'historique' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-base">
            {selectedPatient ? `Historique des bilans de ${selectedPatient.nom} ${selectedPatient.prenom}` : "Historique des bilans"}
          </h3>

          {!selectedPatient ? (
            <p className="text-slate-400 text-xs py-8 text-center font-bold">
              Veuillez sélectionner un patient dans l'onglet "Tous les patients" pour voir ses bilans enregistrés.
            </p>
          ) : bilansPatient.length === 0 ? (
            <p className="text-slate-400 text-xs py-8 text-center font-bold">
              Aucun bilan enregistré en base pour ce patient.
            </p>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                  <th className="pb-3">Date du Bilan</th>
                  <th className="pb-3">Date d'Opération</th>
                  <th className="pb-3">Délai Post-Op</th>
                  <th className="pb-3">Kiné Référent</th>
                  <th className="pb-3">Actions PDF</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {bilansPatient.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-bold text-slate-900">{formatDateFR(b.date_bilan)}</td>
                    <td className="py-3.5 text-slate-700">{formatDateFR(b.date_chirurgie)}</td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                        {b.temps_post_op_mois !== null && b.temps_post_op_mois !== undefined ? `${b.temps_post_op_mois} mois` : '-'}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-700">
                    {b.kine_prenom ? `${b.kine_prenom} ${b.kine_nom}` : 'Cabinet CKS'}
                  </td>
                  <td className="py-3.5">
                    {!b.chemin_pdf ? (
                      <span className="text-slate-400 text-[11px]">-</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenBilanPdf(b.chemin_pdf)}
                          className="bg-[#0B1E3D] hover:bg-slate-800 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all"
                        >
                          Ouvrir
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadBilanPdf(b)}
                          className="bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all"
                        >
                          Télécharger
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleViewBilanDetails(b.id)}
                        className="border border-slate-300 text-slate-800 px-3 py-1.5 rounded-xl font-bold hover:bg-slate-100"
                      >
                        Voir les détails
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* MODALE DÉTAILS DU BILAN */}
      {bilanModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800">
                  Détails du Bilan du {formatDateFR(bilanModal.data?.date_bilan)}
                </h3>
                <p className="text-xs font-semibold text-slate-500">
                  Patient : {bilanModal.data?.patient_nom} {bilanModal.data?.patient_prenom} • Côté : {bilanModal.data?.cote_opere}
                </p>
              </div>
              <button onClick={() => setBilanModal({ open: false, data: null, resultats: [] })} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Date d'opération :</span>
                  <span className="font-bold text-slate-900">{formatDateFR(bilanModal.data?.date_chirurgie) || 'Non renseignée'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Délai post-opératoire :</span>
                  <span className="font-bold text-amber-800">{bilanModal.data?.temps_post_op_mois !== null && bilanModal.data?.temps_post_op_mois !== undefined ? `${bilanModal.data?.temps_post_op_mois} mois` : '-'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Plan d'action & Directives cliniques :</h4>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 whitespace-pre-line text-slate-800 leading-relaxed font-normal">
                  {bilanModal.data?.plan_action_texte || "Aucun plan d'action enregistré."}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2">Mesures enregistrées ({bilanModal.resultats.length}) :</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {bilanModal.resultats.map((res, idx) => {
                    let contenuRendu = null;

                    if (res.valeur_num !== null && res.valeur_num !== undefined) {
                      contenuRendu = <span className="font-bold text-slate-900 text-xs pl-1">{res.valeur_num}</span>;
                    } else if (res.valeur_txt) {
                      try {
                        const parsed = JSON.parse(res.valeur_txt);
                        const entries = Object.entries(parsed).filter(([k, v]) => v !== '' && v !== false && v != null);

                        contenuRendu = entries.length > 0 ? (
                          <div className="pl-1 space-y-1 mt-1 bg-white p-2 rounded-lg border border-slate-200/80">
                            {entries.map(([k, v], i) => (
                              <div key={i} className="text-xs text-slate-900 flex justify-between items-center py-0.5 border-b border-slate-100 last:border-0">
                                <span className="text-slate-600 font-semibold capitalize">{k.replace(/([A-Z])/g, ' $1')} :</span>
                                <span className="font-bold text-slate-900">{String(v)}</span>
                              </div>
                            ))}
                          </div>
                        ) : <span className="text-slate-500 pl-1">-</span>;
                      } catch (e) {
                        contenuRendu = <span className="font-bold text-slate-900 text-xs pl-1">{res.valeur_txt}</span>;
                      }
                    } else {
                      contenuRendu = <span className="text-slate-400 pl-1">-</span>;
                    }

                    return (
                      <div key={idx} className="flex flex-col py-1.5 border-b border-slate-200/60 last:border-0 text-xs">
                        <span className="font-extrabold text-slate-700 uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded w-max mb-1">
                          {res.categorie} : {res.cle_mesure}
                        </span>
                        {contenuRendu}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={() => setBilanModal({ open: false, data: null, resultats: [] })}
                  className="bg-[#0B1E3D] hover:bg-slate-800 text-white font-black px-5 py-2.5 rounded-xl shadow-md transition-all"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VUE 4 : PATIENTS ARCHIVÉS */}
      {activeTab === 'archives' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 flex-1">
          <h3 className="font-bold text-slate-800 text-base mb-4">Dossiers Patients Archivés</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Patient</th>
                <th className="pb-3">Date d'archivage</th>
                <th className="pb-3">Motif</th>
                <th className="pb-3">Archivé par</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold">
              {patientsArchivesFiltres.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-400 font-semibold text-xs">
                    Aucun patient archivé.
                  </td>
                </tr>
              ) : (
                patientsArchivesFiltres.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3.5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-400 text-white font-black text-xs flex items-center justify-center">
                        {p.nom?.[0]}{p.prenom?.[0]}
                      </div>
                      <span className="font-bold text-slate-700">{p.nom} {p.prenom}</span>
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {p.date_archivage ? new Date(p.date_archivage).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="py-3.5 text-slate-600">{p.motif_archivage || '-'}</td>
                    <td className="py-3.5 text-slate-600">
                      {p.archive_par_prenom ? `${p.archive_par_prenom} ${p.archive_par_nom}` : '-'}
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleUnarchivePatient(p.id)}
                        className="bg-[#0B1E3D] text-white px-3 py-1.5 rounded-xl font-bold hover:bg-slate-800"
                      >
                        Restaurer le dossier
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODALE DE CONFIRMATION D'ARCHIVAGE */}
      {archiveModal.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-extrabold text-slate-800">
                Archiver {archiveModal.patient?.nom} {archiveModal.patient?.prenom}
              </h3>
              <button onClick={() => setArchiveModal({ open: false, patient: null, motif: '' })} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleConfirmArchive} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-600 block mb-1">Motif d'archivage (optionnel)</label>
                <input
                  type="text"
                  value={archiveModal.motif}
                  onChange={(e) => setArchiveModal({ ...archiveModal, motif: e.target.value })}
                  placeholder="Ex : Fin de rééducation..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-[#E5A73C]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setArchiveModal({ open: false, patient: null, motif: '' })} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all">
                  Annuler
                </button>
                <button type="submit" className="flex-1 bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-md">
                  Confirmer l'archivage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOUVEAU PATIENT */}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Nom *</label>
                  <input type="text" required value={newPatient.nom} onChange={(e) => setNewPatient({ ...newPatient, nom: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Prénom *</label>
                  <input type="text" required value={newPatient.prenom} onChange={(e) => setNewPatient({ ...newPatient, prenom: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Date de Naissance *</label>
                  <input type="date" required value={newPatient.dateNaissance} onChange={(e) => setNewPatient({ ...newPatient, dateNaissance: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Sexe</label>
                  <select value={newPatient.sexe} onChange={(e) => setNewPatient({ ...newPatient, sexe: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Poids (kg)</label>
                  <input type="number" step="0.1" value={newPatient.poidsKg} onChange={(e) => setNewPatient({ ...newPatient, poidsKg: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Taille (cm)</label>
                  <input type="number" value={newPatient.tailleCm} onChange={(e) => setNewPatient({ ...newPatient, tailleCm: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Téléphone</label>
                  <input type="text" value={newPatient.telephone} onChange={(e) => setNewPatient({ ...newPatient, telephone: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Email</label>
                  <input type="email" value={newPatient.email} onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Adresse Postale</label>
                <input type="text" value={newPatient.adresse} onChange={(e) => setNewPatient({ ...newPatient, adresse: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Sport Pratiqué</label>
                  <input type="text" value={newPatient.sportPratique} onChange={(e) => setNewPatient({ ...newPatient, sportPratique: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Profil Sportif</label>
                  <select value={newPatient.profilSportif} onChange={(e) => setNewPatient({ ...newPatient, profilSportif: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900">
                    <option value="Axe">Sport Axe</option>
                    <option value="Pivot">Sport Pivot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-600 block mb-1">Médecin Prescripteur</label>
                  <input type="text" value={newPatient.medecinPrescripteur} onChange={(e) => setNewPatient({ ...newPatient, medecinPrescripteur: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
                <div>
                  <label className="text-slate-600 block mb-1">Médecin Chirurgien</label>
                  <input type="text" value={newPatient.medecinChirurgien} onChange={(e) => setNewPatient({ ...newPatient, medecinChirurgien: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
                </div>
              </div>

              <div>
                <label className="text-slate-600 block mb-1">Remarques Cliniques</label>
                <textarea rows={2} value={newPatient.remarquesCliniques} onChange={(e) => setNewPatient({ ...newPatient, remarquesCliniques: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-slate-900" />
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl hover:bg-slate-200 transition-all">
                  Annuler
                </button>
                <button type="submit" disabled={chargement} className="flex-1 bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-md">
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