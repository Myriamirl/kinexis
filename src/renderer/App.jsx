import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import HomeView from './views/HomeView.jsx';
import PatientsView from './views/PatientsView.jsx';
import BilanFormView from './views/BilanFormView.jsx';
import SettingsView from './views/SettingsView.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />

      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#EBF1F5] p-8">
        {currentView === 'home' && (
          <HomeView onNavigate={setCurrentView} onStartBilan={() => setCurrentView('bilan')} />
        )}

        {currentView === 'patients' && (
          <PatientsView onStartBilan={() => setCurrentView('bilan')} />
        )}

        {currentView === 'bilan' && (
          <BilanFormView />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}
      </main>
    </div>
  );
}