import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LoginView from './views/LoginView.jsx';
import HomeView from './views/HomeView.jsx';
import PatientsView from './views/PatientsView.jsx';
import BilanFormView from './views/BilanFormView.jsx';
import SettingsView from './views/SettingsView.jsx';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function App() {
  const [currentKine, setCurrentKine] = useState(null);
  const [currentView, setCurrentView] = useState('home');
  const [selectedPatientForView, setSelectedPatientForView] = useState(null);
  const [initialPatientTab, setInitialPatientTab] = useState('fiche');

  useEffect(() => {
    if (!ipcRenderer) return;
    if (!currentKine) {
      ipcRenderer.invoke('window:set-size', { width: 520, height: 660, center: true });
    } else {
      ipcRenderer.invoke('window:set-size', { width: 1000, height: 700, center: true });
    }
  }, [currentKine]);

  const handleOpenPatientFromHome = (patient) => {
    setSelectedPatientForView(patient);
    setInitialPatientTab('fiche');
    setCurrentView('patients');
  };

const handleOpenBilanFromHome = async (bilan) => {
    if (!bilan) return;

    let patientId = bilan.patient_id ?? bilan.id_patient ?? bilan.patientId ?? null;
    let patientObj = {
      id: patientId,
      nom: bilan.patient_nom || bilan.nom || '',
      prenom: bilan.patient_prenom || bilan.prenom || ''
    };

    if (ipcRenderer) {
      try {
        if (patientId) {
          const fullPatient = await ipcRenderer.invoke('patients:get-by-id', patientId);
          if (fullPatient && typeof fullPatient === 'object') {
            patientObj = { ...patientObj, ...fullPatient, id: fullPatient.id ?? patientId };
          }
        } else if (patientObj.nom || patientObj.prenom) {
          const actifs = await ipcRenderer.invoke('patients:get-actifs');
          if (Array.isArray(actifs)) {
            const found = actifs.find(
              (p) =>
                `${p.nom || ''} ${p.prenom || ''}`.trim().toLowerCase() ===
                `${patientObj.nom} ${patientObj.prenom}`.trim().toLowerCase()
            );
            if (found) {
              patientObj = found;
              patientId = found.id;
            }
          }
        }
      } catch (err) {
        console.error("Erreur récupération patient du bilan :", err);
      }
    }

    if (!patientObj.id && !patientObj.nom && !patientObj.prenom) return;

    setSelectedPatientForView(patientObj);
    setInitialPatientTab('historique');
    setCurrentView('patients');
  };

// Si non connecté : Écran de connexion
if (!currentKine) {
  return <LoginView onLoginSuccess={(kine) => setCurrentKine(kine)} />;
}

return (
  <div className="flex h-screen w-screen overflow-hidden font-sans select-none bg-[#E8EEF5]">
    {/* Sidebar fidèle à la maquette */}
    <Sidebar
      currentView={currentView}
      setCurrentView={(view) => {
        if (view !== 'patients') setSelectedPatientForView(null);
        setCurrentView(view);
      }}
      currentKine={currentKine}
      onLogout={() => {
        setSelectedPatientForView(null);
        setCurrentKine(null);
      }}
    />

    {/* Contenu principal */}
    <main className="flex-1 flex flex-col h-full overflow-y-auto p-8">
      {currentView === 'home' && (
        <HomeView
          currentKine={currentKine}
          onNavigate={setCurrentView}
          onStartBilan={() => setCurrentView('bilan')}
          onSelectPatient={handleOpenPatientFromHome}
          onSelectBilan={handleOpenBilanFromHome}
        />
      )}

      {(currentView === 'patients' || currentView === 'archives') && (
        <PatientsView
          currentKine={currentKine}
          currentView={currentView}
          initialSelectedPatient={selectedPatientForView}
          initialTab={initialPatientTab}
          onClearInitialPatient={() => {
            setSelectedPatientForView(null);
            setInitialPatientTab('fiche');
          }}
          onStartBilan={() => setCurrentView('bilan')}
        />
      )}

      {currentView === 'bilan' && (
        <BilanFormView currentKine={currentKine} />
      )}

      {currentView === 'settings' && (
        <SettingsView currentKine={currentKine} />
      )}
    </main>
  </div>
);
}