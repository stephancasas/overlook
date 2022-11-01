const { ipcRenderer } = require('electron');
const { mountAttachmentHandler } = require('../owa/attachment');
const { captureMailtoHandler, useDeepLinkComposer } = require('../owa/mailto');

/**
 * -----------------------------------------------------------------------------
 * Forward App Events to OWA Webview
 * -----------------------------------------------------------------------------
 *
 * Events originating from the main IPC process, forwarded into the Outlook Web
 * App webview (mostly menu item triggers).
 */
(() => {
  const OWA_FORWARD_EVENTS = [
    'electron-window-did-resize',
    'app-menu-item-find',
    'app-menu-item-sign-out',
  ];

  OWA_FORWARD_EVENTS.forEach((event) =>
    ipcRenderer.on(event, (_, detail) => {
      const evt = new CustomEvent(event, { detail });
      window.dispatchEvent(evt);
    }),
  );
})();

/**
 * -----------------------------------------------------------------------------
 * Event Listeners from Renderer Main World
 * -----------------------------------------------------------------------------
 *
 * Events which originate or are forwarded from the main world (likely spawned
 * from OWA).
 */
(() => {
  const executeInOWA = (src) => {
    const evt = new CustomEvent('execute-js-in-owa', {
      detail: src,
    });
    window.dispatchEvent(evt);
  };

  // inject handler capture via webview.executeJavaScript()
  window.addEventListener('inject-mailto-handler-capture', () =>
    executeInOWA(captureMailtoHandler.toString()),
  );

  window.addEventListener('inject-attachment-handler', () =>
    executeInOWA(mountAttachmentHandler.toString()),
  );

  // forward to ipc main -- clear session on user sign-out
  window.addEventListener('user-did-sign-out', () =>
    ipcRenderer.send('user-did-sign-out'),
  );

  // create new composer window for mailto uri
  window.addEventListener(
    'create-deeplink-composer-from-mailto-uri',
    ({ detail: mailtoURI }) => {
      useDeepLinkComposer(mailtoURI);
    },
  );
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
    'external-inbound-mailto-protocol',
    'user-will-sign-in',
    'handle-message-attachments',
    'compose-new-message'
  ];

  RENDERER_FORWARD_EVENTS.forEach((event) =>
    ipcRenderer.on(event, (_, detail) => {
      const evt = new CustomEvent(event, { detail });
      window.dispatchEvent(evt);
    }),
  );
})();

(() => {
  ipcRenderer.on('test-attachment', () => {
    ipcRenderer.send(
      'test-attachment',
      '/Users/stephancasas/Downloads/awaiting_action/503_boc.pdf',
    );
  });
})();
