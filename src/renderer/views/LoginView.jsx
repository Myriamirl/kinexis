import React, { useState } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};

export default function LoginView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    nom: '',
    prenom: '',
    numeroRpps: '',
    specialite: 'Kinésithérapeute du Sport'
  });

  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    if (!ipcRenderer) {
      setTimeout(() => {
        onLoginSuccess({ id: 1, nom: 'DUPONT', prenom: 'Marc', email: formData.email });
      }, 500);
      return;
    }

    try {
      if (isRegister) {
        const res = await ipcRenderer.invoke('kines:register', formData);
        if (res.success) {
          onLoginSuccess(res.kine);
        } else {
          setErreur(res.error);
        }
      } else {
        const res = await ipcRenderer.invoke('kines:login', {
          email: formData.email,
          motDePasse: formData.motDePasse
        });

        if (res.success) {
          onLoginSuccess(res.kine);
        } else {
          setErreur(res.error);
        }
      }
    } catch (err) {
      setErreur("Erreur système de communication.");
    } finally {
      setChargement(false);
    }
  };

  return (
<div className="p-8 space-y-6 text-slate-100">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tight">
          KIN<span className="text-[#E5A73C]">EXIS</span>
        </h1>
        <p className="text-xs font-semibold text-slate-400">
          {isRegister ? "Création de compte Praticien" : "Espace Praticien CKS Trélazé"}
        </p>
      </div>

        {erreur && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 text-xs p-3 rounded-xl font-medium text-center">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {isRegister && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-300 block mb-1">Nom</label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                />
              </div>
              <div>
                <label className="text-slate-300 block mb-1">Prénom</label>
                <input
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 block mb-1">Adresse Email</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
              placeholder="kine@cks-trelaze.fr"
            />
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={formData.motDePasse}
              onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
            />
          </div>

          {isRegister && (
            <div>
              <label className="text-slate-300 block mb-1">Numéro RPPS (Optionnel)</label>
              <input
                type="text"
                value={formData.numeroRpps}
                onChange={(e) => setFormData({ ...formData, numeroRpps: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={chargement}
            className="w-full bg-[#E5A73C] hover:bg-[#d4962b] text-slate-950 font-black py-3 rounded-xl transition-all shadow-md text-sm mt-2"
          >
            {chargement ? "Chargement..." : isRegister ? "Créer mon compte" : "Se Connecter"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700/60">
          <button
            type="button"
            onClick={() => { setIsRegister(!isRegister); setErreur(''); }}
            className="text-xs text-slate-400 hover:text-[#E5A73C] transition-colors"
          >
            {isRegister ? "Déjà un compte ? Se connecter" : "Nouveau praticien ? Créer un compte"}
          </button>
        </div>
      </div> 
  );
}