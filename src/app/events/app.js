const { BrowserWindow } = require('electron');
const { exec } = require('child_process');

const bindSignOutEvent = function (context) {
  context.ipc.on('user-did-sign-out', () => {
    context.window.webContents.session.clearAuthCache();
    context.window.webContents.session.clearCache();
    context.window.webContents.session.clearStorageData();

    // close any dangling composers
    BrowserWindow.getAllWindows().forEach(($window) => {
      $window.closeInvokedByProcess = true; // allow close on composer windows
      $window.close();
    });

    // close intercepted on main window -- show with login route
    context.window.webContents.send('user-will-sign-in');
    context.window.show();
  });
};

const bindNewComposerEvent = function ({ Window, ipc }) {
  ipc.on('create-new-deeplink-composer', (_, mailtoURI = '') =>
    Window.newComposer(),
  );
};

const bindExternalNavigation = function ({ ipc }) {
  // forward e-mail link clicks to default browser
  ipc.on('navigate-href-in-default-browser', (_, href) => {
    // TODO: filter by regex on https/http? -- very severe potential for abuse
    exec(`open '${href}'`);
    // for now, keep as is -- some erp/crm systems use custom protocols in
    // dashboard messages or notification e-mails
  });
};

const bindReadyEvent = function ({ Window, app, Dock }) {
  app.whenReady().then(() => {
    Window.init();
    Dock.applyMenu();
  });
};

const bindActivateEvent = function (context) {
  context.app.on('activate', function () {
    if (!!context.window) context.window.show(); // restore from hidden
    if (BrowserWindow.getAllWindows().length === 0) context.Window.init();
  });
};

const bindAllClosedEvent = function ({ app }) {
  app.on('window-all-closed', function (_) {
    // TODO: delete this if not used by next release
    if (process.platform !== 'darwin') app.quit();
  });
};

const bindQuitEvent = function (context) {
  context.app.on('before-quit', () => {
    context.external.close();
    process.exit();
  });
};

const bindAppEvents = function (context) {
  bindReadyEvent(context);
  bindActivateEvent(context);
  bindAllClosedEvent(context);
  bindQuitEvent(context);

  bindSignOutEvent(context);
  bindNewComposerEvent(context);
  bindExternalNavigation(context);

  return {};
};

module.exports = { appEvents: bindAppEvents };
