/**
 * Mount files via data URI into <input type="file"> and force upload event.
 * @param  {...any} encodedFiles [...{uri: '<base64EncodedDataUri>', filename: '<filename>'}]
 */
const handleAttachmentUpload = (...encodedFiles) => {
  const dataUri2File = (uri, filename) => {
    var arr = uri.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
  };

  const transfer = new DataTransfer();
  encodedFiles.forEach(({ uri, filename }) =>
    transfer.items.add(dataUri2File(uri, filename)),
  );

  const attachmentInput = document.querySelector(
    '#ReadingPaneContainerId input[type="file"]:not([accept])',
  );
  attachmentInput.files = transfer.files;

  const evt = document.createEvent('HTMLEvents');
  evt.initEvent('change', true, false);
  attachmentInput.dispatchEvent(evt);
};

module.exports = { handleAttachmentUpload };
