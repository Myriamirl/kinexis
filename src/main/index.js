const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipcHandlers');
const db = require('../database/db');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 1024,
        minHeight: 700,
        title: 'Kinexis - CKS Trélazé',
        backgroundColor: '#0F172A', // Teinte bleu foncé de la charte
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // Utilisation d'app.isPackaged pour détecter proprement le mode dev vs prod
    if (!app.isPackaged) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Initialisation au démarrage de l'application
app.whenReady().then(async () => {
    await db.ready;
    registerIpcHandlers();
    createWindow();
});

// Gestion de la fermeture sous Windows / macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});