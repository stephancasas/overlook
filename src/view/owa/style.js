const $ = require('./dom');

const STYLE_STORE = {
  navHeader: '',
  appLauncher: '',
  headerButtons: '',
  featureDropdown: '',
  appBranding: '',
  searchBox: '',
  searchButton: '',
  todoApp: '',
  userAvatar: '',
};

const restyleLoginLogo = () => {
  if ($.loginLogo()) {
    $.loginLogo().src = `data:image/png;base64,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`;
  }
};

const restyleLoginForm = () => {
  // cloak externally-navigated links with high click potential
  if ($.loginForm()) {
    if ($.loginFooter()) $.loginFooter().style = 'opacity: 0;';
    if ($.loginSignup()) $.loginSignup().parentElement.style = 'opacity: 0;';
    if ($.loginForgotPassword()) $.loginForgotPassword().style = 'opacity: 0;';
  }
};

const restyleNavHeader = () => {
  // apply flex rule to navigation header
  if ($.navHeader()) {
    if (!STYLE_STORE.navHeader) {
      STYLE_STORE.navHeader = $.navHeader().getAttribute('style');
    }
    $.navHeader().setAttribute(
      'style',
      `${STYLE_STORE.navHeader} display: flex !important;`,
    );
  }
};

const restyleAppLauncher = () => {
  // hide app launcher
  if ($.appLauncher()) {
    if (!STYLE_STORE.appLauncher) {
      STYLE_STORE.appLauncher = $.appLauncher().getAttribute('style');
    }
    $.appLauncher().setAttribute(
      'style',
      `${STYLE_STORE.appLauncher} display: none !important;`,
    );
  }
};

const restyleHeaderButtons = () => {
  // hide header navigation buttons
  if ($.headerButtons()) {
    if (!STYLE_STORE.headerButtons) {
      STYLE_STORE.headerButtons = $.headerButtons().getAttribute('style');
    }
    $.headerButtons().setAttribute(
      'style',
      `${STYLE_STORE.headerButtons} display: none !important;`,
    );
  }
};

const restyleFeatureDropdown = () => {
  // hide feature dropdown
  if ($.featureDropdown()) {
    if (!STYLE_STORE.featureDropdown) {
      STYLE_STORE.featureDropdown = $.featureDropdown().getAttribute('style');
    }
    $.featureDropdown().setAttribute(
      'style',
      `${STYLE_STORE.featureDropdown} display: none !important;`,
    );
  }
};

const restyleAppBranding = () => {
  // hide app branding and set width to make room for traffic lights
  if ($.appBranding()) {
    if (!STYLE_STORE.appBranding) {
      STYLE_STORE.appBranding = $.appBranding().getAttribute('style');
    }
    $.appBranding().setAttribute(
      'style',
      [STYLE_STORE.appBranding, 'display: none !important;'].join(' '),
    );
  }
};

const restyleSearchBox = () => {
  // offset searchbox container for center alignment
  if ($.searchBox()) {
    if (!STYLE_STORE.searchBox) {
      STYLE_STORE.searchBox = $.searchBox().getAttribute('style');
    }
    $.searchBox().setAttribute(
      'style',
      `${STYLE_STORE.searchBox} padding-left: 50px !important;`,
    );
  }
};

const restyleSearchButton = () => {
  // align search button to center
  if ($.searchWrapper()) {
    if (!STYLE_STORE.searchButton) {
      STYLE_STORE.searchButton = $.searchWrapper().getAttribute('style');
    }

    $.searchWrapper().setAttribute(
      'style',
      [
        STYLE_STORE.searchButton,
        'margin-right: auto !important;',
        'margin-left: auto !important;',
      ].join(' '),
    );
  }
};

const restyleTodoApp = () => {
  // hide todo app
  if ($.todoApp()) {
    if (!STYLE_STORE.todoApp) {
      STYLE_STORE.todoApp = $.todoApp().getAttribute('style');
    }
    $.todoApp().setAttribute(
      'style',
      `${STYLE_STORE.todoApp} display: none !important;`,
    );
  }
};

const restyleUserAvatar = () => {
  // offset user avatar from application edge
  if ($.userAvatar()) {
    if (!STYLE_STORE.userAvatar) {
      STYLE_STORE.userAvatar = $.userAvatar().getAttribute('style');
    }
    $.userAvatar().setAttribute(
      'style',
      [STYLE_STORE.userAvatar, 'margin-right: 0.5rem !important;'].join(' '),
    );
  }
};

const restyle = () => {
  restyleNavHeader();
  restyleAppLauncher();
  restyleHeaderButtons();
  restyleFeatureDropdown();
  restyleAppBranding();
  restyleSearchBox();
  restyleSearchButton();
  restyleTodoApp();
  restyleUserAvatar();
  restyleLoginLogo();
  restyleLoginForm();
};

module.exports = {
  restyle,
  restyleLoginLogo,
  restyleLoginForm,
  restyleNavHeader,
  restyleAppLauncher,
  restyleHeaderButtons,
  restyleFeatureDropdown,
  restyleAppBranding,
  restyleSearchBox,
  restyleSearchButton,
  restyleTodoApp,
  restyleUserAvatar,
};
