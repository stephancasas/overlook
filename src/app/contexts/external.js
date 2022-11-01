const Http = require('http');
const FS = require('fs');

const listenForExternalEvents = ({ external }) => {
  const eventsServer = Http.createServer((req, res) => {
    req.on('data', (stream) => {
      const eventName = req.url.match(/[^\/].*/)[0];
      external.fire(eventName, stream.toString());
    });

    res.statusCode = 202;
    res.statusMessage = 'Accepted';
    return res.end();
  });

  // use first-available port
  eventsServer.listen(0);

  const APPLE_EVENTS_PORT = eventsServer.address().port;
  console.info(`Listening for events on port ${APPLE_EVENTS_PORT}.`);

  // write port to file for jxa uri handler
  FS.writeFileSync(
    `/tmp/com.stephancasas.overlook_events.port`,
    `${APPLE_EVENTS_PORT}`,
    {
      encoding: 'utf-8',
    },
  );

  return eventsServer;
};

const listenForUrlEvents = function ({ app, external }) {
  app.setAsDefaultProtocolClient('x-mailto');
  app.setAsDefaultProtocolClient('x-overlook');

  app.on('open-url', (event, url) => {
    event.preventDefault();

    const protocol = url.match(/^[^:]+/)[0];
    external.fire(protocol, url);
  });

  return { close() {} }; // no-op for dev server close
};

const ExternalEventListener = function (context) {
  const events = [];

  return {
    on: (eventName, callback) => events.push({ eventName, callback }),
    fire: (event, args = {}) =>
      events
        .filter(({ eventName }) => eventName === event)
        .forEach(({ callback }) => callback(context, args)),
    close() {
      context._eventsServer.close();
    },
  };
};

const External = function (context) {
  context.bind({ external: new ExternalEventListener(context) });

  let _eventsServer;
  if (context.app.isPackaged) {
    _eventsServer = listenForUrlEvents(context);
  } else {
    _eventsServer = listenForExternalEvents(context);
  }

  context.bind({ _eventsServer });

  const External = {};
  return { External };
};

module.exports = External;
