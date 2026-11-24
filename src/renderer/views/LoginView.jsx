import React, { useState, useEffect } from 'react';

const { ipcRenderer } = window.require ? window.require('electron') : {};
const EMAIL_CACHE_KEY = 'kinexis_saved_emails';

export default function LoginView({ onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [savedEmails, setSavedEmails] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: '',
    nom: '',
    prenom: '',
    numeroRpps: '',
    adeli: '',
    telephone: ''
  });

  const [erreur, setErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EMAIL_CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setSavedEmails(parsed);
          if (parsed.length > 0) {
            setFormData((prev) => (prev.email ? prev : { ...prev, email: parsed[0] }));
          }
        }
      }
    } catch (e) {
      console.error("Erreur lecture cache emails :", e);
    }
  }, []);

  const cacheEmail = (email) => {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return;
    try {
      const updated = [clean, ...savedEmails.filter((item) => item !== clean)].slice(0, 8);
      setSavedEmails(updated);
      localStorage.setItem(EMAIL_CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Erreur sauvegarde cache email :", e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setChargement(true);

    if (!ipcRenderer) {
      setTimeout(() => {
        cacheEmail(formData.email);
        onLoginSuccess({ 
          id: Date.now(), 
          nom: formData.nom, 
          prenom: formData.prenom || (formData.email ? formData.email.split('@')[0] : ''), 
          email: formData.email,
          rpps: formData.numeroRpps,
          adeli: formData.adeli,
          telephone: formData.telephone
        });
      }, 500);
      return;
    }

    try {
      if (isRegister) {
        const res = await ipcRenderer.invoke('kines:register', formData);
        if (res.success) {
          cacheEmail(res.kine?.email || formData.email);
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
          cacheEmail(res.kine?.email || formData.email);
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
    <div className="min-h-screen w-screen bg-[#E8EEF5] flex items-center justify-center p-6 font-sans select-none">
      <div className="w-full max-w-md bg-[#0B1E3D] text-slate-100 rounded-2xl p-8 space-y-6 shadow-2xl border border-slate-800">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 mx-auto flex items-center justify-center">
            <img
              src="/img/logo_app.png"
              alt="CKS"
              className="w-full h-full object-contain"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">
            KIN<span className="text-[#E5A73C]">EXIS</span>
          </h1>
          <p className="text-xs font-semibold text-slate-300">
            {isRegister ? "Création de compte Praticien" : "Espace Praticien CKS Trélazé"}
          </p>
        </div>

        <div className="h-1 bg-gradient-to-r from-transparent via-[#E5A73C] to-transparent rounded-full"></div>

        {erreur && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 text-xs p-3 rounded-xl font-medium text-center">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold">
          {isRegister && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">N° RPPS</label>
                  <input
                    type="text"
                    value={formData.numeroRpps}
                    onChange={(e) => setFormData({ ...formData, numeroRpps: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">N° ADELI / Téléphone</label>
                  <input
                    type="text"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-slate-300 block mb-1">Adresse Email</label>
            <input
              type="email"
              list="kinexis-emails-list"
              autoComplete="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
              placeholder="kine@cks-trelaze.fr"
            />
            {savedEmails.length > 0 && (
              <datalist id="kinexis-emails-list">
                {savedEmails.map((email) => (
                  <option key={email} value={email} />
                ))}
              </datalist>
            )}
          </div>

          <div>
            <label className="text-slate-300 block mb-1">Mot de passe</label>
            <input
              type="password"
              required
              value={formData.motDePasse}
              onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-[#E5A73C]"
            />
          </div>

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
            className="text-xs text-slate-300 hover:text-[#E5A73C] transition-colors font-semibold"
          >
            {isRegister ? "Déjà un compte ? Se connecter" : "Nouveau praticien ? Créer un compte"}
          </button>
        </div>
      </div>
    </div>
  );
}