const { bindIpcEvents } = require('./ipc');
const { bindWindowEvents } = require('./window');
const { initFrame } = require('./frame');
const { restyle, restyleSearchButton } = require('./style');
const { injectCaptureMailtoHandlerSrc } = require('./mailto');
const { ipcRenderer } = require('electron');
const { interceptLinkElements } = require('./link');

window.addEventListener('DOMContentLoaded', () => {
  let debounce;

  const defaultObserverSettings = [
    document.querySelector('body'),
    {
      childList: true,
      subtree: true,
    },
  ];

  // watch for continuously-restyled elements
  const watchContinuous = () => {
    restyleSearchButton();
    interceptLinkElements();
  };

  // watch contexts for traps
  const watchContexts = (_, observer) => {
    injectCaptureMailtoHandlerSrc(observer); // observer disconnect in callback
  };

  // start continuous and trapped observers
  const onInitialized = () => {
    new MutationObserver(watchContexts).observe(...defaultObserverSettings);
    new MutationObserver(watchContinuous).observe(...defaultObserverSettings);
  };

  // apply initial style overrides
  const watchInitialization = (_, observer) => {
    initFrame();
    restyle();

    clearTimeout(debounce);
    debounce = setTimeout(() => {
      ipcRenderer.sendToHost('owa-did-initialize');
      observer.disconnect();
      onInitialized();
    }, 600);
  };

  bindIpcEvents();
  bindWindowEvents();

  new MutationObserver(watchInitialization).observe(...defaultObserverSettings);
});
