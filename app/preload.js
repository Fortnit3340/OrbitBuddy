const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('orbit', {
  getState: () => ipcRenderer.invoke('get-state'),
  openSettings: () => ipcRenderer.send('open-settings'),
  showShutdownWarning: () => ipcRenderer.send('show-shutdown-warning'),
  moveBuddy: (point) => ipcRenderer.send('move-buddy', point),
  setBuddyEnabled: (enabled) => ipcRenderer.send('set-buddy-enabled', enabled),
  setTheme: (theme) => ipcRenderer.send('set-theme', theme),
  cancelShutdown: () => ipcRenderer.send('cancel-shutdown'),
  startShutdownAnimation: () => ipcRenderer.send('start-shutdown-animation'),
  performShutdown: () => ipcRenderer.send('perform-shutdown'),
  quitApp: () => ipcRenderer.send('quit-app'),
  onThemeChanged: (callback) => ipcRenderer.on('theme-changed', (_event, theme) => callback(theme)),
  onPlayShutdownAnimation: (callback) => ipcRenderer.on('play-shutdown-animation', callback),
  onShutdownError: (callback) => ipcRenderer.on('shutdown-error', (_event, message) => callback(message))
});
