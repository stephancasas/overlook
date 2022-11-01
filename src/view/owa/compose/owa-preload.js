const { ipcRenderer } = require('electron');
const { handleAttachmentUpload } = require('../attachment');
const $ = require('../dom');

window.addEventListener('DOMContentLoaded', () => {
  let debounceInit;

  const defaultObserverSettings = [
    document.querySelector('body'),
    {
      childList: true,
      subtree: true,
    },
  ];

  const $discardButton = () => document.querySelector(`[aria-label="Discard"]`);

  const $discardDialog = () =>
    [...document.querySelectorAll('[role="heading"]')]
      .find((heading) => heading.textContent.match(/discard message/i))
      .closest(`[role="dialog"]`);

  const $discardConfirmButton = () =>
    $discardDialog().querySelector('.ms-Button--primary');

  const $subjectInput = () =>
    document.querySelector(`[aria-label="Add a subject"]`);

  const $progressBar = () => document.querySelector(`[role="progressbar"]`);

  let didSeeProgressBar;
  const watchForAttachmentProgress = (_, observer) => {
    if ($progressBar()) {
      didSeeProgressBar = true;
      return;
    }
    if (!didSeeProgressBar) return;
    ipcRenderer.sendToHost('attachments-did-finish-upload');
    observer.disconnect();
  };

  const handleAttachmentUploadWithProgressObserver = (_, encodedFiles) => {
    handleAttachmentUpload(...encodedFiles);
    new MutationObserver(watchForAttachmentProgress).observe(
      ...defaultObserverSettings,
    );
  };

  const attachSubjectKeyupListener = () => {
    $subjectInput().addEventListener('keyup', (event) => {
      ipcRenderer.sendToHost(
        'update-message-subject',
        event.currentTarget.value,
      );
    });
  };

  const attachIntentToDiscardListener = () => {
    $discardButton().addEventListener('click', () => {
      ipcRenderer.sendToHost('composer-discard-intent');
    });
  };

  let didHide;
  const watchForDismiss = (_, observer) => {
    // FIXME: this should go into a mutation observer
    if (!!$.fatalErrorBody()) {
      // session has redirect loop or other fatal error?
      // dispatch sign-out event to main process
      ipcRenderer.send('user-did-sign-out');
    }

    // hide window while awaiting full dismissal/close
    if (!didHide && !!$discardDialog() && !!$discardConfirmButton()) {
      $discardConfirmButton().addEventListener('click', () => {
        didHide = true;
        ipcRenderer.sendToHost('composer-discard-confirm');
      });
    }

    // check for dismissal instructions
    if (
      !document
        .querySelector('#ReadingPaneContainerId')
        .textContent.match(/you\smay\snow\sclose/i)
    )
      return;

    // disconnect and notify close
    ipcRenderer.sendToHost('composer-should-close');
    observer.disconnect();
  };

  const watchInitialization = (_, observer) => {
    clearTimeout(debounceInit);
    debounceInit = setTimeout(() => {
      // watch for appearance of subject field to indicate initialization
      if (!$subjectInput()) return;
      ipcRenderer.sendToHost('composer-did-initialize');
      attachIntentToDiscardListener();
      attachSubjectKeyupListener();
      observer.disconnect();
    }, 600);
  };

  new MutationObserver(watchInitialization).observe(...defaultObserverSettings);
  new MutationObserver(watchForDismiss).observe(...defaultObserverSettings);

  ipcRenderer.on(
    'handle-message-attachments',
    handleAttachmentUploadWithProgressObserver,
  );

  // send message immediately
  ipcRenderer.on('message-should-dispatch-immediately', () => {
    document.querySelector(`[aria-label="Send"]`).click();
  });
});
