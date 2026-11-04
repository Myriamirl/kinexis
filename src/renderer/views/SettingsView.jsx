import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function SettingsView({ currentKine }) {
  const [cabinetInfo, setCabinetInfo] = useState({
    nom: 'CKS Trélazé',
    adresse: '65 rue des Perreyeux, 49800 Trélazé',
    telephone: '07.49.91.43.67'
  });

  const [cibles, setCibles] = useState({
    quadAxe: '7.5', quadPivot: '8.5',
    ischioAxe: '4.5', ischioPivot: '5.0',
    soleaireAxe: '18.0', soleairePivot: '20.0'
  });

  const [message, setMessage] = useState('');

  const handleSaveSettings = async () => {
    if (ipcRenderer) {
      try {
        await ipcRenderer.invoke('settings:save', { cabinetInfo, cibles });
        setMessage('✅ Paramètres enregistrés avec succès !');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('❌ Erreur lors de la sauvegarde.');
      }
    } else {
      setMessage('✅ Simulation d\'enregistrement des paramètres.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#1E293B]">Paramètres</h2>
        {message && <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">{message}</span>}
      </div>

      <div className="h-1 bg-gradient-to-r from-[#E5A73C] via-[#E5A73C]/50 to-transparent rounded-full"></div>

      <div className="grid grid-cols-2 gap-8 items-start">
        <div className="space-y-6">

          {/* Fiche du Kiné Connecté */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>👨‍⚕️</span> Profil Praticien Connecté
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-semibold">
              <div className="flex justify-between"><span className="text-slate-500">Nom & Prénom :</span><span className="text-slate-900 font-bold">{currentKine?.nom} {currentKine?.prenom}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email :</span><span className="text-slate-900 font-bold">{currentKine?.email}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Spécialité :</span><span className="text-slate-900 font-bold">{currentKine?.specialite || 'Kinésithérapeute du Sport'}</span></div>
            </div>
          </div>

          {/* Coordonnées & Logo */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>🏥</span> Coordonnées & Logo Cabinet
            </h3>

            <div className="flex gap-6 items-center">
              {/* LOGO AVEC CHEMIN FIXE ET FALLBACK */}
              <div className="w-28 h-28 bg-[#E5A73C] rounded-2xl p-2 flex flex-col items-center justify-center text-slate-950 font-extrabold text-[10px] text-center shadow-md overflow-hidden relative">
                <img
                  src="/img/logo_cks.png"
                  alt="Logo CKS"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Si le fichier n'est pas trouvé dans public/img/
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden flex-col items-center justify-center">
                  <span>Logo Officiel</span>
                  <span className="text-2xl mt-1">🏥</span>
                </div>
              </div>

              <div className="flex-1 space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Nom du cabinet</label>
                  <input
                    type="text"
                    value={cabinetInfo.nom}
                    onChange={(e) => setCabinetInfo({ ...cabinetInfo, nom: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Adresse</label>
                  <input
                    type="text"
                    value={cabinetInfo.adresse}
                    onChange={(e) => setCabinetInfo({ ...cabinetInfo, adresse: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={cabinetInfo.telephone}
                    onChange={(e) => setCabinetInfo({ ...cabinetInfo, telephone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* BDD SQLite */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <span>💾</span> Sauvegarde & Base de données
            </h3>
            <div className="flex gap-4">
              <button className="flex-1 bg-[#0F224A] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-slate-900 transition-all">
                ⬇️ Exporter la base SQLite
              </button>
            </div>
          </div>
        </div>

        {/* Cibles Musculaires */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
            <span>⚙️</span> Cibles de Force Musculaire
          </h3>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 font-bold uppercase text-[10px]">
                <th className="pb-3">Groupe musculaire</th>
                <th className="pb-3">Sport Axe (N/kg)</th>
                <th className="pb-3">Sport Pivot (N/kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 font-bold text-slate-800">Quadriceps</td>
                <td className="py-3"><input type="text" value={cibles.quadAxe} onChange={(e) => setCibles({ ...cibles, quadAxe: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" value={cibles.quadPivot} onChange={(e) => setCibles({ ...cibles, quadPivot: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Ischio-jambiers</td>
                <td className="py-3"><input type="text" value={cibles.ischioAxe} onChange={(e) => setCibles({ ...cibles, ischioAxe: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" value={cibles.ischioPivot} onChange={(e) => setCibles({ ...cibles, ischioPivot: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-slate-800">Soléaire</td>
                <td className="py-3"><input type="text" value={cibles.soleaireAxe} onChange={(e) => setCibles({ ...cibles, soleaireAxe: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
                <td className="py-3"><input type="text" value={cibles.soleairePivot} onChange={(e) => setCibles({ ...cibles, soleairePivot: e.target.value })} className="w-20 bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2 font-bold text-center" /></td>
              </tr>
            </tbody>
          </table>

          <button
            onClick={handleSaveSettings}
            className="w-full bg-[#E5A73C] text-slate-950 font-bold py-3 rounded-xl text-xs shadow-sm mt-4 hover:bg-[#d4962b] transition-all"
          >
            Mettre à jour les paramètres
          </button>
        </div>
      </div>
    </div>
  );
}