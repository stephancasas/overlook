const bindCloseEvent = ({ window, config }) =>
  window.on('close', function (event) {
    // hide instead of teardown
    event.preventDefault();
    config.set('bounds', window.getBounds());
    window.hide();
  });

const bindResizeEvent = ({ window, config }) =>
  window.on('resized', () => {
    // adjust frame drag points in nav area, store bounds
    window.webContents.send('electron-window-did-resize');
    config.set('bounds', window.getBounds());
  });

const bindMoveEvent = ({ window, config }) =>
  window.on('moved', () => {
    config.set('bounds', window.getBounds());
  });

const bindWindowEvents = (context) => {
  bindCloseEvent(context);
  bindResizeEvent(context);
  bindMoveEvent(context);
  
  console.warn('Did finish binding window events.');
};

module.exports = { windowEvents: bindWindowEvents };
