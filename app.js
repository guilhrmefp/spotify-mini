const {
  app,
  BrowserWindow,
  Tray,
  ipcMain,
  Menu,
} = require('electron');

let win;
let tray;
let playlistOpened = false;
const playlistHeight = 192;
const playerHeight = 52;

function createWindow() {
  win = new BrowserWindow({
    width: playlistHeight,
    height: playerHeight,
    autoHideMenuBar: true,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // win.loadFile('index.html');
  win.loadURL('http://localhost:8080');
  win.webContents.openDevTools({ mode: 'detach' });
}

app.whenReady().then(createWindow);

app.on('ready', () => {
  tray = new Tray('./src/img/icon.png');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Exit',
      role: 'quit',
    },
  ]);

  tray.setToolTip('Spotify Mini');
  tray.setContextMenu(contextMenu);
});

ipcMain.on('resize', (e, x, y) => {
  const Xpos = win.getPosition()[0];
  const Ypos = win.getPosition()[1];
  playlistOpened = !playlistOpened;
  win.resizable = true;

  win.setSize(x, y);

  if (playlistOpened) {
    win.setPosition(Xpos, Ypos - playlistHeight);
  } else {
    win.setPosition(Xpos, Ypos + playlistHeight);
  }

  win.resizable = false;
});

ipcMain.on('synchronous-message', (e, message) => {
  const event = e;

  if (message.type === 'close') {
    win.close();
  }

  event.returnValue = '';
});
