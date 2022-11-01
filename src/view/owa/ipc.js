const { ipcRenderer } = require('electron');
const { handleAttachmentUpload } = require('./attachment');
const $ = require('./dom');
const { applyFrame } = require('./frame');

const bindIpcEvents = () => {
  ipcRenderer.on('electron-window-did-resize', () => {
    if ($.searchWrapper()) {
      applyFrame();
    }
  });

  // forward native find shortcut to search box
  ipcRenderer.on('app-menu-item-find', () => {
    $.searchButton().click();
  });

  // activate signout from menu
  ipcRenderer.on('app-menu-item-sign-out', () => {
    setTimeout(() => $.userAvatarButton().click(), 100);
    setTimeout(() => $.signOutButton().click(), 200);
  });

  // handle file attachment from custom external mailto protocol
  ipcRenderer.on('handle-message-attachments', handleAttachmentUpload);
};

module.exports = { bindIpcEvents };
