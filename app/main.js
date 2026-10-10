const { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('node:path');
const { execFile } = require('node:child_process');

let buddyWindow = null;
let settingsWindow = null;
let shutdownWindow = null;
let tray = null;
let buddyEnabled = true;
let selectedTheme = '🚗';
let isQuitting = false;
const themes = ['🚗', '😎', '🐱', '🦊', '🤖', '🪐', '🐸', '👻'];

function makeWindow(options) {
  return new BrowserWindow({
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    ...options
  });
}

function createBuddy() {
  buddyWindow = makeWindow({
    width: 104, height: 118, x: 90, y: 180,
    frame: false, transparent: true, resizable: false,
    alwaysOnTop: true, skipTaskbar: true, hasShadow: false,
    backgroundColor: '#00000000'
  });
  buddyWindow.loadFile(path.join(__dirname, 'buddy.html'));
  buddyWindow.once('ready-to-show', () => { if (buddyEnabled) buddyWindow.show(); });
  buddyWindow.on('closed', () => { buddyWindow = null; });
}

function createSettings() {
  if (settingsWindow && !settingsWindow.isDestroyed()) { settingsWindow.show(); settingsWindow.focus(); return; }
  settingsWindow = makeWindow({
    width: 560, height: 700, minWidth: 520, minHeight: 620,
    title: 'Orbit Buddy Settings', backgroundColor: '#0b1020',
    resizable: true
  });
  settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
  settingsWindow.once('ready-to-show', () => settingsWindow.show());
  settingsWindow.on('closed', () => { settingsWindow = null; });
}

function showShutdownWarning() {
  if (shutdownWindow && !shutdownWindow.isDestroyed()) { shutdownWindow.show(); shutdownWindow.focus(); return; }
  shutdownWindow = makeWindow({
    width: 580, height: 540, minWidth: 540, minHeight: 500,
    frame: false, resizable: false, alwaysOnTop: true,
    backgroundColor: '#0b1020', center: true
  });
  shutdownWindow.loadFile(path.join(__dirname, 'shutdown.html'));
  shutdownWindow.once('ready-to-show', () => shutdownWindow.show());
  shutdownWindow.on('closed', () => { shutdownWindow = null; });
}

function createTray() {
  const iconPath = path.join(__dirname, 'orbit-tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Orbit Buddy');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open settings', click: createSettings },
    { label: buddyEnabled ? 'Hide desktop buddy' : 'Show desktop buddy', click: () => setBuddyEnabled(!buddyEnabled) },
    { type: 'separator' },
    { label: 'Shutdown PC…', click: showShutdownWarning },
    { type: 'separator' },
    { label: 'Quit Orbit Buddy', click: () => { isQuitting = true; app.quit(); } }
  ]));
  tray.on('double-click', createSettings);
}

function setBuddyEnabled(enabled) {
  buddyEnabled = Boolean(enabled);
  if (buddyWindow && !buddyWindow.isDestroyed()) buddyEnabled ? buddyWindow.show() : buddyWindow.hide();
  if (tray) {
    tray.setContextMenu(Menu.buildFromTemplate([
      { label: 'Open settings', click: createSettings },
      { label: buddyEnabled ? 'Hide desktop buddy' : 'Show desktop buddy', click: () => setBuddyEnabled(!buddyEnabled) },
      { type: 'separator' },
      { label: 'Shutdown PC…', click: showShutdownWarning },
      { type: 'separator' },
      { label: 'Quit Orbit Buddy', click: () => { isQuitting = true; app.quit(); } }
    ]));
  }
}

app.whenReady().then(() => {
  createBuddy();
  createTray();
  ipcMain.handle('get-state', () => ({ buddyEnabled, selectedTheme, themes }));
  ipcMain.on('open-settings', createSettings);
  ipcMain.on('show-shutdown-warning', showShutdownWarning);
  ipcMain.on('move-buddy', (_event, point) => {
    if (!buddyWindow || buddyWindow.isDestroyed() || !point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
    const display = screen.getDisplayNearestPoint({ x: Math.round(point.x), y: Math.round(point.y) });
    const area = display.workArea;
    const x = Math.max(area.x, Math.min(area.x + area.width - 104, Math.round(point.x)));
    const y = Math.max(area.y, Math.min(area.y + area.height - 118, Math.round(point.y)));
    buddyWindow.setPosition(x, y);
  });
  ipcMain.on('set-buddy-enabled', (_event, enabled) => setBuddyEnabled(enabled));
  ipcMain.on('set-theme', (_event, theme) => {
    if (!themes.includes(theme)) return;
    selectedTheme = theme;
    if (buddyWindow && !buddyWindow.isDestroyed()) buddyWindow.webContents.send('theme-changed', theme);
    if (settingsWindow && !settingsWindow.isDestroyed()) settingsWindow.webContents.send('theme-changed', theme);
  });
  ipcMain.on('cancel-shutdown', () => { if (shutdownWindow && !shutdownWindow.isDestroyed()) shutdownWindow.close(); });
  ipcMain.on('start-shutdown-animation', () => {
    if (shutdownWindow && !shutdownWindow.isDestroyed()) shutdownWindow.webContents.send('play-shutdown-animation');
  });
  ipcMain.on('perform-shutdown', () => {
    if (process.platform !== 'win32') {
      if (shutdownWindow && !shutdownWindow.isDestroyed()) shutdownWindow.webContents.send('shutdown-error', 'PC shutdown is available only on Windows.');
      return;
    }
    execFile('shutdown.exe', ['/s', '/t', '0'], { windowsHide: true }, (error) => {
      if (error && shutdownWindow && !shutdownWindow.isDestroyed()) shutdownWindow.webContents.send('shutdown-error', 'Windows did not accept the shutdown request. Close this message and try again.');
    });
  });
  ipcMain.on('buddy-double-click', showShutdownWarning);
  ipcMain.on('quit-app', () => { isQuitting = true; app.quit(); });
  ipcMain.on('open-external-settings', createSettings);
});

app.on('before-quit', () => { isQuitting = true; });
app.on('window-all-closed', () => {
  // Intentionally keep running in the tray until the user chooses Quit Orbit Buddy.
  if (isQuitting) app.quit();
});
app.on('activate', () => createSettings());
