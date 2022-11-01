const { ipcRenderer } = require('electron');

/**
 * Runs inside of OWA webview via `executeJavaScript`.
 * Capture the context of the React application's mailto protocol handler.
 * -
 * To persist on the `window` object, this must run in context of the window
 * and not in the preloader.
 * @returns {void}
 */
const captureMailtoHandler = () => {
  if (typeof window.__INJECT_MAILTO_EVENT === 'function') {
    return 'function exists';
  }

  const msgBody = document.querySelector('[aria-label="Message body"]');
  if (!msgBody) {
    return 'message body not found';
  }

  const reactKey = Object.keys(msgBody).find((key) =>
    key.match(/^__reactFiber/),
  );
  if (!reactKey) {
    return 'no react key on message body element';
  }

  const mailtoHandler = [
    'memoizedProps',
    'children',
    'props',
    'contentHandlerDictionary',
    'mailToHandler',
  ].reduce((acc, cur) => acc[cur] || null, msgBody[reactKey]);

  if (!mailtoHandler) {
    return;
  }

  const MailtoHandler = Object.getPrototypeOf(mailtoHandler).constructor;

  window.__INJECT_MAILTO_EVENT = (mailtoURI) => {
    new MailtoHandler(
      (() => {
        const a = document.createElement('a');
        a.href = mailtoURI;
        return a;
      })(),
    ).handler(
      (() => {
        const a = document.createElement('a');
        a.href = mailtoURI;
        a.target = '_blank';
        setTimeout(() => a.click(), 100);
        return a;
      })(),
    );
  };
  return true;
};

/**
 * Watch for readable e-mail message body element. This React component has the
 * mailto handler whicih should be captured.
 * @returns {void}
 */
const injectCaptureMailtoHandlerSrc = (observer) => {
  if (!document.querySelector('[aria-label="Message body"]')) {
    return;
  }

  observer.disconnect();

  // request injection of handler capture src
  ipcRenderer.sendToHost('inject-mailto-handler-capture');
};

/**
 * Create a new message composer for a mailto URI using an external window.
 * @param {string} mailtoURI The mailto URI to handle.
 */
const useDeepLinkComposer = (mailtoURI) => {
  ipcRenderer.send('create-new-deeplink-composer', mailtoURI);
};

module.exports = {
  captureMailtoHandler,
  injectCaptureMailtoHandlerSrc,
  useDeepLinkComposer,
};
