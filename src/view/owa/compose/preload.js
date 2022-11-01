const { ipcRenderer } = require('electron');

const getComposerId = () =>
  document.querySelector(`meta[name="composer_id"]`).getAttribute('content');

const eventName = function (name) {
  return `${name}--${getComposerId()}`;
};

/**
 * -----------------------------------------------------------------------------
 * Event Listeners from Renderer Main World
 * -----------------------------------------------------------------------------
 *
 * Events which originate or are forwarded from the main world (likely spawned
 * from OWA).
 */
(() => {
  // forward to ipc main -- close the composer window
  window.addEventListener('composer-should-close', () =>
    ipcRenderer.send(eventName('composer-should-close')),
  );

  // forward to ipc main -- show the composer window after init finished
  window.addEventListener('composer-did-initialize', () =>
    ipcRenderer.send(eventName('composer-did-initialize')),
  );

  // forward to ipc main -- hide the composer window
  window.addEventListener('composer-discard-confirm', () => {
    ipcRenderer.send(eventName('composer-should-hide'));
  });
})();

/**
 * -----------------------------------------------------------------------------
 * Forward App Events to Main Renderer
 * -----------------------------------------------------------------------------
 *
 * Events from the main app IPC channels which must be handled in the main
 * renderer context (mostly used to forward executable code into OWA webview).
 */
(() => {
  const RENDERER_FORWARD_EVENTS = [
    'composer-will-close',
    'handle-message-attachments',
    'xmailto-digest-options',
  ];

  RENDERER_FORWARD_EVENTS.forEach((event) =>
    ipcRenderer.on(event, (_, detail) => {
      const evt = new CustomEvent(event, { detail });
      window.dispatchEvent(evt);
    }),
  );
})();
