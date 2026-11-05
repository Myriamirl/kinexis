import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import LoginView from './views/LoginView.jsx';
import HomeView from './views/HomeView.jsx';
import PatientsView from './views/PatientsView.jsx';
import BilanFormView from './views/BilanFormView.jsx';
import SettingsView from './views/SettingsView.jsx';

export default function App() {
  const [currentKine, setCurrentKine] = useState(null);
  const [currentView, setCurrentView] = useState('home');

  // Si non connecté : Écran de connexion
  if (!currentKine) {
    return <LoginView onLoginSuccess={(kine) => setCurrentKine(kine)} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none bg-[#E8EEF5]">
      {/* Sidebar fidèle à la maquette */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentKine={currentKine}
        onLogout={() => setCurrentKine(null)}
      />

      {/* Contenu principal */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto p-8">
        {currentView === 'home' && (
          <HomeView 
            currentKine={currentKine}
            onNavigate={setCurrentView} 
            onStartBilan={() => setCurrentView('bilan')} 
          />
        )}

        {currentView === 'patients' && (
          <PatientsView 
            currentKine={currentKine}
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