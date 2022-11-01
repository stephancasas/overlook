const { app, ipcMain: ipc } = require('electron');
require('update-electron-app')();

const Context = require('./context');
const Config = require('./contexts/config');
const Dock = require('./contexts/dock');
const Menu = require('./contexts/menu');
const Window = require('./contexts/window');
const External = require('./contexts/external');

const { appEvents } = require('./events/app');
const { windowEvents } = require('./events/window');
const { externalEvents } = require('./events/external');

new Context({ app, ipc }).bind(
  Config,
  Dock,
  Menu,
  Window,
  External,
  appEvents,
  windowEvents,
  externalEvents,
);
