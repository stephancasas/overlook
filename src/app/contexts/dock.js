const {
  Menu: ElectronMenu,
  app: { dock: ElectronDock },
} = require('electron');

const DockMenu = function ({ Window }) {
  return ElectronMenu.buildFromTemplate([
    {
      label: 'New Message',
      click() {
        Window.newComposer();
      },
    },
  ]);
};

const applyMenu = function (context) {
  ElectronDock.setMenu(DockMenu(context));
};

const Dock = function (context) {
  const Dock = {
    applyMenu() {
      applyMenu(context);
    },
  };
  return { Dock };
};

module.exports = Dock;
