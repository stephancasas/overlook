const $ = require('./dom');
const { ipcRenderer } = require('electron');

const interceptLinkElements = () => {
  // forward link clicks to default browser
  if ($.conversationContainer()) {
    Array.from($.conversationContainer().querySelectorAll('a')).forEach((a) => {
      if (!!a.getAttribute('data-electron-intercept-navigate')) return;

      // mailto links are handled internally by custom listener
      if (a.getAttribute('href').match(/^mailto/)) return;

      a.setAttribute('data-electron-intercept-navigate', 'true');
      a.addEventListener('click', (evt) => {
        evt.preventDefault();
        ipcRenderer.send(
          'navigate-href-in-default-browser',
          a.getAttribute('href'),
        );
      });
    });
  }
};

module.exports = {
  interceptLinkElements,
};
