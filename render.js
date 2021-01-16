const { ipcRenderer } = require('electron');

const btnSelectFolder = document.querySelector('.btn-select-folder');
const btnRenameFiles = document.querySelector('.btn-rename-files');
const message = document.querySelector('.message');
const inputName = document.querySelector('.input-name');

const selectFolder = () => {
  reset();

  if (!inputName.value) {
    message.innerHTML = 'You have to enter a name for the TV Show!';
    message.classList.add('text-danger');
    return;
  }

  ipcRenderer.invoke('select-folder').then((result) => {
    if (typeof result === 'undefined') {
      message.innerHTML = 'Failed to select the folder!';
      btnRenameFiles.disabled = true;
      message.classList.add('text-danger');
    } else if (result.length <= 0) {
      message.innerHTML = 'There is no files on the selected directory!';
      btnRenameFiles.disabled = true;
      message.classList.add('text-danger');
    } else {
      message.innerHTML = result.directoryName;
      btnRenameFiles.disabled = false;
      message.classList.add('text-success');
    }
  });
}

const renameFiles = () => {
  const data = {
    path: message.innerHTML,
    name: toTitleCase(inputName.value.trim()).replaceAll(' ', '.')
  }

  ipcRenderer.invoke('rename-files', data).then((result) => {
    if (!result.error) {
      inputName.value = '';
      reset();
    }
  });
}

const reset = () => {
  message.innerHTML = '';
  message.classList.remove('text-danger', 'text-success');
  btnRenameFiles.disabled = true;
}

// https://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript?page=1&tab=votes#tab-top
const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

btnSelectFolder.addEventListener('click', selectFolder, false);
btnRenameFiles.addEventListener('click', renameFiles, false);


