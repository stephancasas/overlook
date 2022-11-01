/**
 * Access the OWA Webview Instance
 */
const owa = () => document.querySelector('webview');

/**
 * Access the overlay elements.
 */
const preloadOverlay = () => document.querySelector('#preload-overlay');
const preloadIcon = () => preloadOverlay().querySelector('svg');

(() => {
  const animatePreloadTiles = () =>
    [...preloadIcon().querySelectorAll('.owa-icon-tile')].forEach((tile, i) => {
      setTimeout(
        () =>
          (tile.style.animation =
            'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'),
        ((i + 1) % 3) * 300 + (i + 1) * 100,
      );
    });

  const animatePreloadContainer = () => {
    preloadIcon().querySelector(
      '#owa-icon-letter-container-copy',
    ).style.animation = 'ping 1.3s cubic-bezier(0, 0, 0.2, 1) infinite';
  };

  setTimeout(() => {
    preloadIcon().style.transform = 'translateY(0px)'; // slide-in icon on load
    preloadIcon().style.opacity = 1; // fade-in icon on load
    setTimeout(() => {
      animatePreloadTiles();
      animatePreloadContainer();
    }, 700); // specialty animation during app init -- 700ms in style.css
  }, 100);
})();

/**
 * -----------------------------------------------------------------------------
 * App Events Forwarded to OWA Webview
 * -----------------------------------------------------------------------------
 *
 * Events originating from the main IPC process, forwarded into the Outlook Web
 * App webview from the main preload context (mostly menu item triggers).
 */
(() => {
  const OWA_FORWARD_EVENTS = [
    'electron-window-did-resize',
    'app-menu-item-find',
    'app-menu-item-sign-out',
    'handle-message-attachments',
  ];

  OWA_FORWARD_EVENTS.forEach((event) =>
    window.addEventListener(event, ({ detail }) => owa().send(event, detail)),
  );
})();

/**
 * -----------------------------------------------------------------------------
 * OWA Event Listeners
 * -----------------------------------------------------------------------------
 *
 * Events originating from the OWA webview (mostly triggered by the observed
 * insertion of a watched DOM node).
 */
(() => {
  // forward rest events to preload context
  const FORWARD_UP = (base, ...forwards) =>
    Object.assign(
      base,
      forwards.reduce(
        (acc, cur) =>
          Object.assign(acc, {
            [cur]: (_, detail) => {
              const evt = new CustomEvent(cur, { detail });
              window.dispatchEvent(evt);
            },
          }),
        {},
      ),
    );

  const HANDLERS = FORWARD_UP(
    {
      'report-searchbox-dimensions': (detail) => {
        const { width, height, left } = detail;

        const overlayLeft = document.querySelector('#electron-frame-left');
        const overlayRight = document.querySelector('#electron-frame-right');

        overlayLeft.setAttribute(
          'style',
          `left: 0px; top: 0px; height: ${height}px; width: ${left}px;`,
        );

        overlayRight.setAttribute(
          'style',
          `left: ${left + width}px; top: 0px; height: ${height}px; width: ${
            // extends right overlay to rest of nav -- minus user avatar
            // user avatar is 1x1 -- use height + offset threshold of 12
            document.body.offsetWidth - (height + 12 + left + width)
          }px;`,
        );
      },
      'owa-did-initialize': () => {
        preloadOverlay().style.opacity = 0;
        setTimeout(() => (preloadIcon().style.transform = 'scale(40)'), 100);
        setTimeout(() => {
          preloadOverlay().style.display = 'none';
        }, 700); // 700ms transition duration in style.css
      },
    },
    // forward to preload context
    'inject-mailto-handler-capture',
    'inject-attachment-handler',
    'user-did-sign-out',
  );

  owa().addEventListener('ipc-message', ({ channel, args }) => {
    HANDLERS[channel](...args);
  });
})();

/**
 * -----------------------------------------------------------------------------
 * Event Listeners from Main App IPC
 * -----------------------------------------------------------------------------
 *
 * Events from the main app IPC channels which must be handled in the main
 * renderer context (mostly used to forward code for execution in OWA webview).
 */
(() => {
  // execute arbitrary js function src in owa webview
  window.addEventListener('execute-js-in-owa', ({ detail }) => {
    console.log(detail);
    owa().executeJavaScript(`(${detail})();`);
  });

  // launch composer for external mailto protocol
  window.addEventListener(
    'external-inbound-mailto-protocol',
    ({ detail: mailtoURI }) => {
      owa()
        .executeJavaScript(`typeof window.__INJECT_MAILTO_EVENT`)
        .then((res) => {
          if (res === 'function') {
            owa().executeJavaScript(
              `window.__INJECT_MAILTO_EVENT('${mailtoURI}')`,
            );
          } else {
            const evt = new CustomEvent(
              'create-deeplink-composer-from-mailto-uri',
              { detail: mailtoURI },
            );
            window.dispatchEvent(evt);
          }
        });
    },
  );

  window.addEventListener('compose-new-message', () => {
    owa()
      .executeJavaScript(`typeof window.__INJECT_MAILTO_EVENT`)
      .then((res) => {
        if (res === 'function') {
          owa().executeJavaScript(
            `document.querySelector('[aria-label="New mail"]').click()`,
          );
        } else {
          const evt = new CustomEvent(
            'create-deeplink-composer-from-mailto-uri',
            { detail: '' },
          );
          window.dispatchEvent(evt);
        }
      });
  });

  // navigate owa webview to sign-in
  window.addEventListener('user-will-sign-in', () => {
    owa().loadURL('https://outlook.live.com/owa/?nlp=1');
  });

  // process message attachments -- move to owa forward after testing
  //   window.addEventListener('handle-message-attachments', ({ detail }) => {});
})();
