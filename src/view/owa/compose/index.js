const owaCompose = () => document.querySelector('webview');

// update window frame text from subject
const updateWindowTitle = (subjectStr) =>
  (document.querySelector('#electron-frame > span').textContent =
    !!subjectStr.length ? subjectStr : 'New Message');

setTimeout(() => {
  const windowParams = new URLSearchParams(window.location.search);

  // store composer id in global element
  document
    .querySelector(`meta[name="composer_id"]`)
    .setAttribute('content', windowParams.get('composer_id'));

  // resolve mailto, if given
  let mailtoURI = windowParams.get('encoded_mailto_uri');
  if (!!mailtoURI) {
    mailtoURI = atob(mailtoURI);

    // set window title to subject, if given in mailto uri
    const subject = new URLSearchParams(
      `?&${mailtoURI.replace(/^[^\?]+./, '')}`
        .replace(/%26/g, '&')
        .replace(/%2526/g, '%26'),
    ).get`subject`;

    if (subject) updateWindowTitle(subject);
    mailtoURI = mailtoURI.replace(/%3F/gi, '%253F'); // double-escape `?` chars
  }

  const baseRoute = 'https://outlook.office365.com/mail/deeplink/compose';
  const route = `${baseRoute}${mailtoURI ? `?mailtouri=${mailtoURI}` : ''}`;

  owaCompose().executeJavaScript(`window.location.href='${route}'`);
}, 500);

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
 * Event Listeners from OWA Compose
 * -----------------------------------------------------------------------------
 *
 * Events originating from the OWA Compose webview.
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
      'composer-did-initialize': () => {
        preloadOverlay().style.opacity = 0;
        setTimeout(() => (preloadIcon().style.transform = 'scale(40)'), 100);
        setTimeout(() => {
          preloadOverlay().style.display = 'none';
        }, 700); // 700ms transition duration in style.css

        const evt = new CustomEvent('composer-did-initialize');
        window.dispatchEvent(evt);
      },
      'update-message-subject': (subjectStr) => updateWindowTitle(subjectStr),
      'attachments-did-finish-upload': () => {
        if (!window.__XMAILTO_OPTIONS.send) return;
        owaCompose().send('message-should-dispatch-immediately');
      },
      'composer-discard-intent': () => {
        const checkDirtyState = () =>
          window.__satchelGlobalContext.rootStore
            .get('compose')
            .viewStates.data_.values()
            .next().value.value_.isDirty;

        // if state is not dirty, discard is immediate -- prepare to close
        owaCompose()
          .executeJavaScript(`(${checkDirtyState.toString()})()`)
          .then((res) => {
            if (res) return;

            const evt = new CustomEvent('composer-discard-confirm');
            window.dispatchEvent(evt);
          });
      },
    },
    // forward to preload context
    'composer-should-close',
    'composer-discard-confirm',
  );

  owaCompose().addEventListener('ipc-message', ({ channel, args }) => {
    HANDLERS[channel](...args);
  });
})();

/**
 * -----------------------------------------------------------------------------
 * Event Listeners from Main App IPC
 * -----------------------------------------------------------------------------
 *
 * Events from the main app IPC channels which must be handled in the main
 * renderer context.
 */
(() => {
  window.addEventListener('composer-will-close', () => {
    const executable = () => document.querySelector('#discardCompose').click();
    owaCompose().executeJavaScript(`(${executable.toString()})();`);
  });

  // mount x-mailto options
  window.addEventListener('xmailto-digest-options', ({ detail }) => {
    const { fromName, fromSmtp, send } = detail;
    window.__XMAILTO_OPTIONS = { fromName, fromSmtp, send };

    if (!fromSmtp) return;

    const setSenderAddress = (fromName, fromSmtp) => {
      window.__satchelGlobalContext.rootStore
        .get('compose')
        .viewStates.data_.values()
        .next().value.value_.fromViewState.from.email.Name = fromName;

      window.__satchelGlobalContext.rootStore
        .get('compose')
        .viewStates.data_.values()
        .next().value.value_.fromViewState.from.email.EmailAddress = fromSmtp;
    };

    // set sender address
    owaCompose().executeJavaScript(
      `(${setSenderAddress.toString()})('${fromName}', '${fromSmtp}')`,
    );
  });
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
    'handle-message-attachments',
    'message-should-dispatch-immediately',
  ];

  OWA_FORWARD_EVENTS.forEach((event) =>
    window.addEventListener(event, ({ detail }) =>
      owaCompose().send(event, detail),
    ),
  );
})();
