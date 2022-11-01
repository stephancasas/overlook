const { ipcRenderer } = require('electron');
const $ = require('./dom');

var DID_APPLY_ELECTRON_DRAGGABLE = false;

const applyFrame = () => {
  const { offsetHeight: height } = $.searchBox();
  const { offsetLeft: left, offsetWidth: width } = $.searchWrapper();

  ipcRenderer.sendToHost('report-searchbox-dimensions', {
    width,
    height,
    left,
  });
};

const initFrame = () => {
  // apply initial draggable dimensions on first capture of search wrapper
  if (!DID_APPLY_ELECTRON_DRAGGABLE) {
    // delay for animation
    setTimeout(() => applyFrame(), 2300);
    DID_APPLY_ELECTRON_DRAGGABLE = true;
  }
};

module.exports = {
  applyFrame,
  initFrame,
};
