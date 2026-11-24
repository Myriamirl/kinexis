const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const generatePdfHtml = require('./pdfTemplates');

async function exportBilanToPdf(payload, cabinet) {
  let workerWindow = null;
  let tempHtmlPath = null;

  try {
    const { patient = {}, dataBilan = {} } = payload || {};
    const safeNom = (patient.nom || 'Patient').toString().trim().replace(/\s+/g, '_') || 'Patient';

    // Demande à l'utilisateur où enregistrer le fichier PDF
    const { filePath, canceled } = await dialog.showSaveDialog({
      title: 'Enregistrer le compte-rendu Bilan LCA',
      defaultPath: path.join(
        process.env.HOME || process.env.USERPROFILE || os.homedir(),
        `Bilan_LCA_${safeNom}.pdf`
      ),
      filters: [{ name: 'Fichiers PDF', extensions: ['pdf'] }]
    });

    if (canceled || !filePath) {
      return { success: false, cancelled: true };
    }

    // Génération du HTML
    const htmlContent = generatePdfHtml({ patient, dataBilan, cabinet });

    // Écriture dans un fichier temporaire pour éviter les limites d'URL data: avec images base64
    tempHtmlPath = path.join(os.tmpdir(), `kinexis_bilan_${Date.now()}.html`);
    fs.writeFileSync(tempHtmlPath, htmlContent, 'utf8');

    // Création d'une fenêtre invisible Electron pour effectuer le rendu PDF
    workerWindow = new BrowserWindow({
      show: false,
      webPreferences: { nodeIntegration: false, contextIsolation: true }
    });

    await workerWindow.loadFile(tempHtmlPath);

    // Conversion en PDF
    const pdfBuffer = await workerWindow.webContents.printToPDF({
      marginsType: 0,
      pageSize: 'A4',
      printBackground: true,
      printSelectionOnly: false
    });

    // Écriture du fichier sur le disque dur
    fs.writeFileSync(filePath, pdfBuffer);

    return { success: true, filePath };
  } catch (error) {
    console.error('Erreur exportBilanToPdf :', error);
    return { success: false, error: error.message || 'Erreur lors de la génération du PDF' };
  } finally {
    if (workerWindow && !workerWindow.isDestroyed()) {
      workerWindow.destroy();
    }
    if (tempHtmlPath && fs.existsSync(tempHtmlPath)) {
      try {
        fs.unlinkSync(tempHtmlPath);
      } catch (_) {}
    }
  }
}

module.exports = { exportBilanToPdf };