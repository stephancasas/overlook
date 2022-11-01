const { execSync } = require('child_process');

const getMimeType = (path) =>
  execSync(`file --mime-type -b '${path}'`)
    .toString()
    .trim()
    .split('/')
    .reduce((acc, cur, i) => (i === 0 ? [cur] : ((acc[1] = cur), acc)), [])
    .join('/');

const prepareMailToURI = (mailtoURI) => {
  // process uri without "to" field
  const params = new URLSearchParams(`?&${mailtoURI.replace(/^[^\?]+./, '')}`);

  const attachments = params.getAll`attachment`;
  params.delete`attachment`;
  const fromSmtp = params.get`from_smtp`;
  params.delete`from_smtp`;
  const fromName = params.get`from_name` || fromSmtp;
  params.delete`from_name`;
  const send = (params.get`send` || '').toLowerCase() == 'yes';
  params.delete`send`;

  // double-escape `&` char before passing as nested query param to owa
  if (params.get`subject`)
    params.set('subject', params.get`subject`.replace(/&/g, '%2526'));
  if (params.get`body`)
    params.set('body', (params.get`body` || '').replace(/&/g, '%2526'));

  // re-apply "to" field with stripped-down params
  mailtoURI = `mailto:${
    mailtoURI.match(/(?<=:)[^\?]+/)[0]
  }?${params.toString()}`;

  // single-escape `&` character (as query param field separator)
  mailtoURI = mailtoURI.replace(/&/g, '%26');

  return {
    mailtoURI,
    extendedProps: { attachments, fromSmtp, fromName, send },
  };
};

module.exports = { getMimeType, prepareMailToURI };
