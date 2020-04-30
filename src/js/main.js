// eslint-disable-next-line
const { ipcRenderer } = __non_webpack_require__('electron');

(function init() {
  const container = document.querySelector('.container');
  const btnPlaylist = document.querySelector('.btn--playlist');
  const btnClose = document.querySelector('.btn--close');

  btnPlaylist.addEventListener('click', () => {
    const { classList } = container;

    if (classList.contains('show')) {
      classList.remove('show');
      ipcRenderer.send('resize', 192, 52);
    } else {
      classList.add('show');
      ipcRenderer.send('resize', 192, 244);
    }
  });

  btnClose.addEventListener('click', () => {
    ipcRenderer.sendSync('synchronous-message', {type: 'close'});
  });
}());
