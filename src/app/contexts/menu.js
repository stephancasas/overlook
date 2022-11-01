const { Menu: ElectronMenu, app: ElectronApp } = require('electron');

const AppMenu = (window, { app }) => ({
  label: 'Overlook',
  submenu: [
    {
      label: 'Sign-out...',
      click: () => window.webContents.send('app-menu-item-sign-out'),
      accelerator: 'Command-Esc',
    },
    { type: 'separator' },
    {
      label: 'About Overlook',
      selector: 'orderFrontStandardAboutPanel:',
    },
    { type: 'separator' },
    {
      label: 'Hide Overlook',
      accelerator: 'Command+H',
      selector: 'hide:',
    },
    {
      label: 'Hide Others',
      accelerator: 'Command+Shift+H',
      selector: 'hideOtherApplications:',
    },
    { label: 'Show All', selector: 'unhideAllApplications:' },
    { type: 'separator' },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => app.quit(),
    },
  ],
});

const FileMenu = (window) => ({
  label: 'File',
  submenu: [
    {
      label: 'Compose New Message...',
      accelerator: 'Command+N',
      click: () => window.webContents.send('compose-new-message'),
    },
  ],
});

const EditMenu = (window) => ({
  label: 'Edit',
  submenu: [
    { label: 'Undo', accelerator: 'Command+Z', selector: 'undo:' },
    { label: 'Redo', accelerator: 'Shift+Command+Z', selector: 'redo:' },
    { type: 'separator' },
    { label: 'Cut', accelerator: 'Command+X', selector: 'cut:' },
    { label: 'Copy', accelerator: 'Command+C', selector: 'copy:' },
    { label: 'Paste', accelerator: 'Command+V', selector: 'paste:' },
    {
      label: 'Select All',
      accelerator: 'Command+A',
      selector: 'selectAll:',
    },
    { type: 'separator' },
    {
      label: 'Find',
      accelerator: 'Command+F',
      click: () => window.webContents.send('app-menu-item-find'),
    },
  ],
});

const ViewMenu = function (window) {
  return {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: 'Ctrl+Command+F',
        click: () => {
          window.setFullScreen(!window.isFullScreen());
        },
      },
    ].concat(
      ElectronApp.isPackaged
        ? []
        : [
            {
              label: 'Toggle Developer Tools',
              accelerator: 'Alt+Command+I',
              click: () => window.webContents.toggleDevTools(),
            },
          ],
    ),
  };
};

const applyMainMenu = (window, context) => {
  ElectronMenu.setApplicationMenu(
    ElectronMenu.buildFromTemplate([
      AppMenu(window, context),
      FileMenu(window, context),
      EditMenu(window, context),
      ViewMenu(window, context),
    ]),
  );
};

const Menu = function (context) {
  const Menu = {
    applyMainMenu: (window) => applyMainMenu(window, context),
  };
  return { Menu };
};

module.exports = Menu;
