const { ipcRenderer } = require('electron');
const $ = require('./dom');

// navigate to owa login on user signed-out
const bindLoadEvents = () =>
  window.addEventListener('load', () => {
    // FIXME: this should go into a mutation observer
    if (!!$.fatalErrorBody()) {
      // session has redirect loop or other fatal error?
      // dispatch sign-out event to main process
      ipcRenderer.send('user-did-sign-out');
    }

    if (!window.location.href.match(/logout/)) {
      return;
    }

    ipcRenderer.send('user-did-sign-out');
  });

const bindWindowEvents = () => {
  bindLoadEvents();
};

module.exports = { bindWindowEvents };
