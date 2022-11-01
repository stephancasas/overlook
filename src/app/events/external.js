const Path = require('path');
const FS = require('fs');
const { getMimeType, prepareMailToURI } = require('../../util/util');

const bindMailtoEvent = ({ external, Window }) =>
  external.on('mailto', (_, mailtoURI) => {

    ({ mailtoURI } = prepareMailToURI(mailtoURI));

    Window.newComposer(mailtoURI);
  });

const bindExtendedMailtoEvent = ({ ipc, external, Window }) =>
  external.on('x-mailto', (_, xMailtoURI) => {
    const {
      mailtoURI,
      extendedProps: { attachments, fromName, fromSmtp, send },
    } = prepareMailToURI(xMailtoURI);

    const window = Window.newComposer(mailtoURI);
    const { composerId } = window;

    // wait for initialization before sending files
    ipc.on(`composer-did-initialize--${composerId}`, () => {
      window.webContents.send('xmailto-digest-options', {
        fromName,
        fromSmtp,
        send,
      });

      if (!attachments && send) {
        window.webContents.send('message-should-dispatch-immediately');
      }

      const encodedFiles = attachments.map((path) => ({
        uri: `data:${getMimeType(path)};base64,${FS.readFileSync(path, {
          encoding: 'base64',
        })}`,
        filename: Path.basename(path),
      }));

      window.webContents.send('handle-message-attachments', encodedFiles);
    });
  });

const bindExternalEvents = (context) => {
  bindMailtoEvent(context);
  bindExtendedMailtoEvent(context);
  return {};
};

module.exports = { externalEvents: bindExternalEvents };
