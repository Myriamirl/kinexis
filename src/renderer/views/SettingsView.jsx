import React from 'react';

export default function SettingsView() {
  return (
    <div className="space-y-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#1E293B]">Paramètres</h2>
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      <div className="grid grid-cols-2 gap-8 items-start">
        {/* Colonne Gauche : Coordonnées & Sauvegarde */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>🏥</span> Coordonnées & Logo Cabinet
            </h3>

            <div className="flex gap-6 items-center">
              <div className="w-32 h-32 bg-[#E5A73C] rounded-2xl p-2 flex flex-col items-center justify-center text-slate-950 font-bold text-xs text-center cursor-pointer shadow-sm">
                <span>Charger le Logo</span>
                <img src="/img/logo_cks.png" alt="CKS" className="w-12 h-12 mt-2 object-contain" />
              </div>

              <div className="flex-1 space-y-3 text-xs">
                <div><label className="text-slate-500 font-medium block">Nom du cabinet</label><input type="text" defaultValue="CKS Trélazé" className="w-full bg-slate-100 border-none rounded-xl p-2.5 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block">Adresse</label><input type="text" defaultValue="65 rue des Perreyeux, 49800 Trélazé" className="w-full bg-slate-100 border-none rounded-xl p-2.5 font-semibold text-slate-800" /></div>
                <div><label className="text-slate-500 font-medium block">Téléphone</label><input type="text" defaultValue="07.49.91.43.67" className="w-full bg-slate-100 border-none rounded-xl p-2.5 font-semibold text-slate-800" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>💾</span> Sauvegarde & Base de données
            </h3>
            <div className="flex gap-4">
              <button className="flex-1 bg-[#0F224A] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm">
                ⬇️ Exporter la base SQLite
              </button>
              <button className="flex-1 border border-slate-300 text-slate-700 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm">
                ⏱️ Restaurer une sauvegarde
              </button>
            </div>
          </div>
        </div>

        {/* Colonne Droite : Cibles de Force Musculaire */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>⚙️</span> Cibles de Force Musculaire
          </h3>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Groupe musculaire</th>
                <th className="pb-3">Sport Axe (N/kg)</th>
                <th className="pb-3">Sport Pivot (N/kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-semibold text-slate-800">Quadriceps</td>
                <td className="py-3"><input type="text" defaultValue="7.5" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" defaultValue="8.5" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-800">Ischio-jambiers</td>
                <td className="py-3"><input type="text" defaultValue="4.5" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" defaultValue="5.0" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-slate-800">Soléaire</td>
                <td className="py-3"><input type="text" defaultValue="18.0" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" defaultValue="20.0" className="w-20 bg-slate-100 border-none rounded-lg p-2 font-bold text-center" /></td>
              </tr>
            </tbody>
          </table>

          <button className="w-full bg-[#E5A73C] text-slate-950 font-bold py-3 rounded-xl text-xs shadow-sm mt-4">
            Mettre à jour les cibles
          </button>
        </div>
      </div>
    </div>
  );
}