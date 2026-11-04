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
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fonction pour se déconnecter
  const handleLogout = () => {
    setCurrentKine(null);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden font-sans select-none relative">
      {/* Sidebar toujours visible */}
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        currentKine={currentKine}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
      />

      {/* Contenu principal de l'application */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-[#EBF1F5] p-8">
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

{/* Modal / Overlay de Connexion */}
{(showLoginModal || !currentKine) && (
  <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
    {/* Boîte centrale ajustée */}
    <div className="relative w-full max-w-md bg-[#1E293B] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
      
      {/* Bouton pour fermer si déjà connecté */}
      {currentKine && (
        <button 
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xs bg-slate-800/80 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg z-10 transition-all"
        >
          ✕ Fermer
        </button>
      )}

      <LoginView 
        onLoginSuccess={(kine) => {
          setCurrentKine(kine);
          setShowLoginModal(false);
        }} 
      />
    </div>
  </div>
)}
    </div>
  );
}