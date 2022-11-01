const navHeader = () => document.querySelector('#O365_NavHeader');

const searchBox = () => document.querySelector('#owaSearchBox');

const searchWrapper = () => document.querySelector('#owaSearchBox > div');

const searchButton = () =>
  searchBox().querySelector('input').closest('div').closest('div');

const appLauncher = () => document.querySelector('#O365_HeaderLeftRegion');

const headerButtons = () => document.querySelector('#headerButtonsRegionId');

const appBranding = () => document.querySelector('#Region_2');

const featureDropdown = () =>
  document.querySelector('[title="Access additional features"]');

const todoApp = () => document.querySelector('div[title="To Do"]');

const conversationContainer = () =>
  document.querySelector('[data-app-section="ConversationContainer"]');

const userAvatar = () => document.querySelector('#O365_HeaderRightRegion');

// button is different in non-chromium applications
const userAvatarButton = () => document.querySelector('#O365_MainLink_Me');

const signOutButton = () => document.querySelector('#mectrl_body_signOut');

const logoutBanner = () => document.querySelector('#login_workload_logo_text');

const loginLogo = () => document.querySelector('.background-logo-holder > img');

const loginForm = () => document.querySelector('form[action="/common/login"]');

const loginFooter = () => loginForm().querySelector('#footer');

const loginSignup = () => loginForm().querySelector('#signup');

const loginForgotPassword = () =>
  loginForm().querySelector('#cantAccessAccount');

const fatalErrorBody = () => document.querySelector('body#errorAspx');

module.exports = {
  navHeader,
  searchBox,
  searchWrapper,
  searchButton,
  appLauncher,
  headerButtons,
  appBranding,
  featureDropdown,
  todoApp,
  conversationContainer,
  userAvatar,
  userAvatarButton,
  signOutButton,
  logoutBanner,
  loginLogo,
  loginForm,
  loginFooter,
  loginSignup,
  loginForgotPassword,
  fatalErrorBody,
};
