const { BrowserWindow, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const generatePdfHtml = require('./pdfTemplate');

async function exportBilanToPdf(payload, cabinet) {
  const { patient, dataBilan } = payload;

  //Demande à l'utilisateur où enregistrer le fichier PDF
  const { filePath } = await dialog.showSaveDialog({
    title: 'Enregistrer le compte-rendu Bilan LCA',
    defaultPath: path.join(process.env.HOME || process.env.USERPROFILE, `Bilan_LCA_${patient.nom.replace(/\s+/g, '_')}.pdf`),
    filters: [{ name: 'Fichiers PDF', extensions: ['pdf'] }]
  });

  if (!filePath) return { success: false, cancelled: true };

  //Génération du HTML
  const htmlContent = generatePdfHtml({ patient, dataBilan, cabinet });

  //Création d'une fenêtre invisible Electron pour effectuer le rendu PDF
  let workerWindow = new BrowserWindow({
    show: false,
    webPreferences: { nodeIntegration: false }
  });

  await workerWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`);

  // Conversion en PDF
  const pdfBuffer = await workerWindow.webContents.printToPDF({
    marginsType: 0,
    pageSize: 'A4',
    printBackground: true,
    printSelectionOnly: false
  });

  // Écriture du fichier sur le disque dur
  fs.writeFileSync(filePath, pdfBuffer);

  // Fermeture de la fenêtre temporaire
  workerWindow.destroy();

  return { success: true, filePath };
}

module.exports = { exportBilanToPdf };