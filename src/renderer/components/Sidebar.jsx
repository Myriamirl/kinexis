import React from 'react';

export default function Sidebar({ currentView, setCurrentView }) {
  const menuItems = [
    { id: 'home', label: 'Accueil', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    )},
    { id: 'patients', label: 'Patients', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
    )},
    { id: 'bilan', label: 'Nouveau bilan', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
    )},
    { id: 'settings', label: 'Paramètres', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>
    )}
  ];

  return (
    <aside className="w-64 bg-[#0F224A] flex flex-col justify-between p-5 h-full select-none shrink-0 border-r border-slate-800">
      <div>
        {/* Logo app + Titre Kinexis */}
        <div className="flex items-center gap-3 px-1 py-3 mb-8">
          <img 
            src="/img/logo_app.png" 
            alt="CKS Kinexis" 
            className="w-20 h-20 object-contain"
            onError={(e) => { e.target.onerror = null; e.target.src = "/img/logo_app.png"; }}
          />
          <h1 className="text-3xl font-black tracking-tight text-white font-sans">Kinexis</h1>
        </div>

        {/* Navigation */}
        <nav className="space-y-2.5">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all text-left ${
                  isActive
                    ? 'bg-[#E5A73C] text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-[#193266] hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profil praticien & Déconnexion */}
      <div className="pt-4 border-t border-[#1C376E]/60 space-y-4">
        <div className="flex items-center gap-3 px-1">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-[#0F224A] font-extrabold text-sm flex items-center justify-center border-2 border-white">
            M
          </div>
          <span className="text-sm font-bold text-white">Marion</span>
        </div>

        <button 
          onClick={() => alert('Déconnexion')}
          className="w-full bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-colors shadow-sm"
        >
          Déconnexion
        </button>
      </div>
    </aside>
  );
}