import React from 'react';

export default function Sidebar({ currentView, setCurrentView, currentKine, onLogout }) {
  return (
    <aside className="w-72 bg-[#0B1E3D] text-white flex flex-col justify-between h-full p-6 shadow-2xl select-none">
      
      {/* LOGO & TITRE */}
      <div className="space-y-8">
        <div className="flex items-center gap-3 px-1 pt-1">
          <div className="w-[90px] h-[90px] flex-shrink-0 flex items-center justify-center">
            <img 
              src="/img/logo_app.png" 
              alt="CKS" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          
          <h1 className="text-3xl font-black tracking-wide text-white">
            KINEXIS
          </h1>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2.5 text-sm font-bold">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
              currentView === 'home'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">🏠</span> 
            <span className="text-base font-bold">Accueil</span>
          </button>

          <button
            onClick={() => setCurrentView('patients')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
              currentView === 'patients'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">👤</span> 
            <span className="text-base font-bold">Patients</span>
          </button>

          <button
            onClick={() => setCurrentView('bilan')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
              currentView === 'bilan'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">➕</span> 
            <span className="text-base font-bold">Nouveau bilan</span>
          </button>

          <button
            onClick={() => setCurrentView('archives')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
              currentView === 'archives'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">🗄️</span> 
            <span className="text-base font-bold">Patients archivés</span>
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all ${
              currentView === 'settings'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            <span className="text-xl">⚙️</span> 
            <span className="text-base font-bold">Paramètres</span>
          </button>
        </nav>
      </div>

      {/* PROFIL KINÉ & DÉCONNEXION */}
      <div className="space-y-3 pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#E5A73C] text-slate-950 font-black text-xs flex items-center justify-center flex-shrink-0">
            {currentKine?.prenom ? currentKine.prenom[0].toUpperCase() : ''}
          </div>
          <span className="text-sm font-bold text-white truncate">
            {currentKine?.prenom}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="w-full bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-extrabold px-4 py-2.5 rounded-xl text-xs shadow-md transition-all text-center"
        >
          Déconnexion
        </button>
      </div>

    </aside>
  );
}