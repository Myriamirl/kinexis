import React, { useState } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function SettingsView({ currentKine }) {
  const [cabinetInfo, setCabinetInfo] = useState({
    nom: 'CKS Trélazé',
    adresse: '65 rue des Perreyeux 49800 Trélazé',
    telephone: '07.49.91.43.67',
    email: 'ckstrelaze@gmail.com'
  });

  const [cibles, setCibles] = useState({
    quadAxe: '7.5', quadPivot: '8.5',
    ischioAxe: '4.5', ischioPivot: '5.0',
    soleaireAxe: '18.0', soleairePivot: '20.0',
    fessiersAxe: '6.0', fessiersPivot: '6.0',
    adducteursAxe: '6.0', adducteursPivot: '6.0'
  });

  const [messageExport, setMessageExport] = useState('');
  const [messageRestore, setMessageRestore] = useState('');

  const handleSaveSettings = async () => {
    if (ipcRenderer) {
      await ipcRenderer.invoke('settings:save', { cabinetInfo, cibles });
    }
  };

  // Gestion de l'export de la base SQLite
  const handleExportDB = async () => {
    setMessageExport('');
    if (!ipcRenderer) return;

    const res = await ipcRenderer.invoke('db:export');
    if (res.success) {
      setMessageExport(`✅ Export réussi : ${res.path}`);
    } else if (res.error) {
      setMessageExport(`❌ Erreur : ${res.error}`);
    }
  };

  // Gestion de la restauration de la base SQLite
  const handleRestoreDB = async () => {
    setMessageRestore('');
    if (!ipcRenderer) return;

    const confirmation = window.confirm(
      "⚠️ Attention : Restaurer une base de données va remplacer toutes les données actuelles. Voulez-vous continuer ?"
    );

    if (!confirmation) return;

    const res = await ipcRenderer.invoke('db:restore');
    if (res.success) {
      setMessageRestore("✅ Base restaurée ! Redémarrage...");
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else if (res.error) {
      setMessageRestore(`❌ Erreur : ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 w-full h-full flex flex-col text-slate-900">
      
      {/* EN-TÊTE + BOUTON CRÉER PATIENT */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-extrabold text-[#1E293B]">Paramètres</h2>
      </div>

      <div className="h-0.5 bg-[#E5A73C] rounded-full"></div>

      <div className="grid grid-cols-2 gap-8 items-start">
        
        {/* COLONNE GAUCHE */}
        <div className="space-y-6">
          {/* COORDONNÉES & LOGO */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>📇</span> Coordonnées & Logo Cabinet
            </h3>

            <div className="flex gap-6 items-center">
              {/* BOUTON CHARGER LE LOGO */}
              <label className="w-36 h-36 bg-[#E5A73C] hover:bg-[#d4962b] rounded-2xl p-3 flex flex-col items-center justify-between text-slate-950 font-bold text-xs text-center cursor-pointer shadow-md transition-all">
                <span>Charger le Logo</span>
                <img src="/img/logo_cks.png" alt="Logo CKS" className="w-16 h-16 object-contain" onError={(e) => e.target.style.display = 'none'} />
                <span className="text-base">⇪</span>
                <input type="file" accept="image/*" className="hidden" />
              </label>

              <div className="flex-1 space-y-3 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Nom du cabinet</label>
                  <input type="text" value={cabinetInfo.nom} onChange={(e)=>setCabinetInfo({...cabinetInfo, nom: e.target.value})} className="w-full bg-slate-100/80 border-0 rounded-lg p-2 font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Adresse</label>
                  <input type="text" value={cabinetInfo.adresse} onChange={(e)=>setCabinetInfo({...cabinetInfo, adresse: e.target.value})} className="w-full bg-slate-100/80 border-0 rounded-lg p-2 font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Téléphone</label>
                  <input type="text" value={cabinetInfo.telephone} onChange={(e)=>setCabinetInfo({...cabinetInfo, telephone: e.target.value})} className="w-full bg-slate-100/80 border-0 rounded-lg p-2 font-semibold text-slate-800" />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">E-mail</label>
                  <input type="text" value={cabinetInfo.email} onChange={(e)=>setCabinetInfo({...cabinetInfo, email: e.target.value})} className="w-full bg-slate-100/80 border-0 rounded-lg p-2 font-semibold text-slate-800" />
                </div>
              </div>
            </div>
          </div>

          {/* SAUVEGARDE & BDD */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <span>💾</span> Sauvegarde & Base de données
            </h3>
            <div className="flex gap-4">
              <button 
                onClick={handleExportDB}
                className="flex-1 bg-[#0B1E3D] hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>⬇</span> Exporter la base SQLite
              </button>
              <button 
                onClick={handleRestoreDB}
                className="flex-1 bg-white border border-slate-300 text-slate-800 hover:bg-slate-50 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>⏱</span> Restaurer une sauvegarde
              </button>
            </div>
            {messageExport && <p className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">{messageExport}</p>}
            {messageRestore && <p className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg">{messageRestore}</p>}
          </div>
        </div>

        {/* COLONNE DROITE : CIBLES DE FORCE */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <span>⚙️</span> Cibles de Force Musculaire
          </h3>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-600 border-b border-slate-100 font-bold text-[11px]">
                <th className="pb-3">Groupe musculaire</th>
                <th className="pb-3">Sport Axe (N/kg)</th>
                <th className="pb-3">Sport Pivot (N/kg)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              <tr>
                <td className="py-3 font-semibold">Quadriceps</td>
                <td className="py-3"><input type="text" value={cibles.quadAxe} onChange={(e)=>setCibles({...cibles, quadAxe: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
                <td className="py-3"><input type="text" value={cibles.quadPivot} onChange={(e)=>setCibles({...cibles, quadPivot: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Ischio-jambiers</td>
                <td className="py-3"><input type="text" value={cibles.ischioAxe} onChange={(e)=>setCibles({...cibles, ischioAxe: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
                <td className="py-3"><input type="text" value={cibles.ischioPivot} onChange={(e)=>setCibles({...cibles, ischioPivot: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Soléaire</td>
                <td className="py-3"><input type="text" value={cibles.soleaireAxe} onChange={(e)=>setCibles({...cibles, soleaireAxe: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
                <td className="py-3"><input type="text" value={cibles.soleairePivot} onChange={(e)=>setCibles({...cibles, soleairePivot: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Moyens fessiers</td>
                <td className="py-3"><input type="text" value={cibles.fessiersAxe} onChange={(e)=>setCibles({...cibles, fessiersAxe: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
                <td className="py-3"><input type="text" value={cibles.fessiersPivot} onChange={(e)=>setCibles({...cibles, fessiersPivot: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
              </tr>
              <tr>
                <td className="py-3 font-semibold">Adducteurs</td>
                <td className="py-3"><input type="text" value={cibles.adducteursAxe} onChange={(e)=>setCibles({...cibles, adducteursAxe: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
                <td className="py-3"><input type="text" value={cibles.adducteursPivot} onChange={(e)=>setCibles({...cibles, adducteursPivot: e.target.value})} className="w-20 bg-slate-100/80 border border-slate-200 rounded-lg p-1.5 text-center font-bold" /></td>
              </tr>
            </tbody>
          </table>

          <button 
            onClick={handleSaveSettings}
            className="w-full bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-bold py-3 rounded-xl text-xs shadow-sm mt-4 transition-all"
          >
            Mettre à jour les cibles
          </button>
        </div>

      </div>
    </div>
  );
}