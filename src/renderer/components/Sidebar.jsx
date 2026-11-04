import React from 'react';

export default function Sidebar({ currentView, setCurrentView, currentKine, onLogout, onLoginClick }) {
  return (
    <aside className="w-64 bg-[#0F172A] text-slate-300 flex flex-col justify-between h-full p-6 shadow-xl border-r border-slate-800">
      
      {/* 1. LOGO & TITRE APPLICATION */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E5A73C] rounded-2xl flex items-center justify-center text-slate-950 font-black text-xl shadow-lg">
            K
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wider">
              KIN<span className="text-[#E5A73C]">EXIS</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
              CKS Trélazé
            </p>
          </div>
        </div>

        {/* 2. NAVIGATION PRINCIPALE */}
        <nav className="space-y-2 text-xs font-bold">
          <button
            onClick={() => setCurrentView('home')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'home'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">🏠</span> Accueil
          </button>

          <button
            onClick={() => setCurrentView('patients')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'patients'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">👥</span> Patients
          </button>

          <button
            onClick={() => setCurrentView('bilan')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'bilan'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">📋</span> Nouveau Bilan
          </button>

          <button
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'settings'
                ? 'bg-[#E5A73C] text-slate-950 font-black shadow-md'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-white'
            }`}
          >
            <span className="text-base">⚙️</span> Paramètres
          </button>
        </nav>
      </div>

      {/* 3. BAS DE SIDEBAR : PROFIL KINÉ + BOUTONS DYNAMIQUES */}
      <div className="pt-6 border-t border-slate-800 space-y-4">
        {currentKine ? (
          /* CAS KINÉ CONNECTÉ */
          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-[#E5A73C]/20 text-[#E5A73C] font-black text-xs flex items-center justify-center border border-[#E5A73C]/30">
                {currentKine.prenom ? currentKine.prenom[0] : 'K'}{currentKine.nom ? currentKine.nom[0] : ''}
              </div>
              <div className="overflow-hidden text-left">
                <p className="text-xs font-bold text-white truncate">
                  {currentKine.prenom} {currentKine.nom}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentKine.specialite || 'Praticien'}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>🚪</span> Déconnexion
            </button>
          </div>
        ) : (
          /* CAS KINÉ NON CONNECTÉ */
          <button
            onClick={onLoginClick}
            className="w-full bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>🔑</span> Se Connecter
          </button>
        )}
      </div>

    </aside>
  );
}