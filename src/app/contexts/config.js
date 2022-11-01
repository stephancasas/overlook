const ElectronConfig = require('electron-config');

const Config = function (context) {
  const config = new ElectronConfig();
  context.bind({ config });

  const Config = {};
  return { Config };
};

module.exports = Config;
