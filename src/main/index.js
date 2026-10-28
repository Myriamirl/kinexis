const { app, BrowserWindow } = require('electron');
const path = require('path');
const { registerIpcHandlers } = require('./ipcHandlers');

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

    // En développement, chargement via le serveur Vite local
    if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    } else {
        // En production, chargement du fichier HTML compilé
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Initialisation au démarrage de l'application
app.whenReady().then(() => {
    // Enregistrement des ponts de communication IPC (SQLite / Rules Engine)
    registerIpcHandlers();
    
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Gestion de la fermeture sous Windows / macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});