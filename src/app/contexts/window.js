const Path = require('path');
const { BrowserWindow } = require('electron');

const WindowOptions = function (preload, ...options) {
  const baseWindowOptions = {
    width: 800,
    height: 700,
    show: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: {
      x: 10,
      y: 16,
    },
    frame: false,
    icon: Path.join(__dirname, '../../..', 'asset/Overlook.icns'),
  };

  const baseWebPreferences = {
    sandbox: false,
    partition: 'persist:owa',
    webviewTag: true,
    nodeIntegration: true,
  };

  return Object.assign(
    Object.assign(baseWindowOptions, {
      webPreferences: Object.assign(baseWebPreferences, { preload }),
    }),
    ...(!options.length ? [{}] : options),
  );
};

/**
 * Create or reference the main application window.
 * @param {AppContext} param0 The AppContext instance.
 * @returns {BrowserWindow}
 */
const init = ({ Menu, config, window, bind }) => {
  if (!!window) return window;

  const preload = Path.join(
    __dirname,
    '../..',
    'view',
    'wrapper',
    'preload.js',
  );

  window = new BrowserWindow(
    new WindowOptions(
      preload,
      { width: 1300, height: 900, title: 'Overlook' },
      config.get('bounds'),
    ),
  );

  Menu.applyMainMenu(window);
  window.loadFile(Path.join(__dirname, '../..', 'index.html'));

  return bind({ window });
};

/**
 * Create a new floating composer window.
 * @param {AppContext} param0 The AppContext instance.
 * @param {string} mailtoURI If external, the mailto uri to handle.
 * @returns {BrowserWindow}
 */
const newComposer = (context, mailtoURI = '') => {
  const preload = Path.join(
    __dirname,
    '../..',
    'view',
    'owa',
    'compose',
    'preload.js',
  );

  const window = new BrowserWindow(
    // wait for initialization event to show window
    new WindowOptions(preload, { title: 'New Message', show: false }),
  );

  // assign custom uuid
  const composerId = (() =>
    ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (a) =>
      (a ^ ((Math.random() * 16) >> (a / 4))).toString(16),
    ))();

  // check for origin of close event
  Object.assign(window, { closeInvokedByProcess: false }, { composerId });

  const encodedMailtoUri = !!mailtoURI
    ? `&encoded_mailto_uri=${Buffer.from(mailtoURI).toString('base64')}`
    : '';

  window.loadFile(
    Path.join(__dirname, '../..', 'view', 'owa', 'compose', 'index.html'),
    { search: `&composer_id=${composerId}${encodedMailtoUri}` },
  );

  // delay window for url load
  setTimeout(() => window.show(), 500);

  //   window.webContents.toggleDevTools();

  bindComposerWindowEvents(window, context);

  return window;
};

const bindComposerWindowEvents = (window, { ipc }) => {
  const { composerId } = window;
  window.on('close', function (event) {
    // if user invoked, check for draft discard first
    if (!!window.closeInvokedByProcess) return true;
    event.preventDefault();
    window.webContents.send('composer-will-close');
  });

  // auto-close when the dismissal text displays
  ipc.on(`composer-should-close--${composerId}`, () => {
    // ignore previously-destroyed windows
    window.closeInvokedByProcess = true;
    window.close();
  });

  // hide the window
  ipc.on(`composer-should-hide--${composerId}`, () => {
    window.hide();
  });
};

const Window = function (context) {
  const Window = {
    init: () => init(context),
    newComposer: (mailtoURI = '') => newComposer(context, mailtoURI),
  };
  return { Window };
};

module.exports = Window;
