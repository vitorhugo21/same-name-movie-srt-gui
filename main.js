const fs = require('fs');
const { app, BrowserWindow, ipcMain, dialog  } = require('electron');

let mainWindow = null;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    webPreferences: {
      nodeIntegration: true
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadFile('./index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('select-folder', () => {
  const folder =  dialog.showOpenDialogSync(mainWindow, {
    title: 'Select folder',
    properties: ['openDirectory']
  });

  if (!folder) return;

  const files = fs.readdirSync(folder[0]);

  return {
    directoryName: folder,
    length: files.length,
    files
  }
});

ipcMain.handle('rename-files', (event, data) => {
  const files = fs.readdirSync(data.path);
  const regex = 'S[0-9]?[0-9]E[0-9]?[0-9]';
  try {
    files.forEach(file => {
      const parts = file.replaceAll(' ', '.').split('.');
      const extension = parts[parts.length - 1];
      let seasonEpisode = parts.find(part => part.match(regex));

      if (seasonEpisode.length !== 6) {
        seasonEpisode = formatSeasonEpisode(seasonEpisode);
      }

      const oldPath = `${data.path}\\${file}`;
      const newPath = `${data.path}\\${data.name}.${seasonEpisode}.${extension}`;

      fs.renameSync(oldPath, newPath, (err) => {
        if (err) {
          throw new Error('Error renaming a file');
        }
      });
    });

    dialog.showMessageBoxSync(mainWindow, {
      title: 'Success!',
      message: 'The files were successfully renamed!'
    });

    return {
      error: false
    }

  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      title: err.name,
      message: 'There was an error renaming a file'
    });

    return {
      error: true
    }
  }
});

const formatSeasonEpisode = (seasonEpisode) => {
  const parts = seasonEpisode.split('');
  return parts.reduce((acc, char) => {
    if (isNumeric(char)) {
      return acc += '0' + char;
    }

    return acc += char;
  }, '');
}

// https://stackoverflow.com/questions/175739/built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
function isNumeric(str) {
  if (typeof str != 'string') return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}
