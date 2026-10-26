# KINEXIS — Application Locale de Bilans Kinésithérapeutiques

Application de bureau 100 % locale et hors ligne conçue pour le cabinet **CKS Trélazé**. Elle permet de centraliser la saisie des bilans kinésithérapeutiques (notamment post-LCA), d'automatiser le calcul des scores de force et d'asymétrie, et de générer des comptes-rendus rédigés au format PDF.

---

## 🚀 Technologies utilisées

* **Framework App Bureau** : [Electron](https://www.electronjs.org/)
* **Interface Utilisateur** : [React](https://reactjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
* **Base de Données Locale** : [SQLite](https://www.sqlite.org/) via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3)
* **Génération PDF** : Impression native Electron (`webContents.printToPDF`)
* **Build & Packaging** : `electron-builder`

---

## 🛠️ Installation & Développement (Windows / macOS)

### Prérequis

* **Node.js** (version 18+ recommandée)
* **npm** ou **yarn**
