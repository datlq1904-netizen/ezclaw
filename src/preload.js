const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // ── Window Controls ──────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  hideToTray:     () => ipcRenderer.invoke('hide-to-tray'),
  closeWindow:    () => ipcRenderer.invoke('close-window'),   // quit completely

  // ── Settings & Memory ────────────────────────────────────────────────
  getSettings:   () => ipcRenderer.invoke('get-settings'),
  saveSettings:  (s) => ipcRenderer.invoke('save-settings', s),
  resetSettings: () => ipcRenderer.invoke('reset-settings'),
  getMemory:     () => ipcRenderer.invoke('get-memory'),
  saveMemory:    (m) => ipcRenderer.invoke('save-memory', m),
  clearMemory:   () => ipcRenderer.invoke('clear-memory'),

  // ── Group 1: File System ─────────────────────────────────────────────
  readFile:   (path)        => ipcRenderer.invoke('read-file', path),
  writeFile:  (path, data)  => ipcRenderer.invoke('write-file', path, data),
  appendFile: (path, data)  => ipcRenderer.invoke('append-file', path, data),
  deleteFile: (path)        => ipcRenderer.invoke('delete-file', path),
  listDir:    (path)        => ipcRenderer.invoke('list-dir', path),
  createDir:  (path)        => ipcRenderer.invoke('create-dir', path),
  moveFile:   (src, dest)   => ipcRenderer.invoke('move-file', src, dest),

  // ── Group 2: System / Shell ──────────────────────────────────────────
  runShell:       (cmd)  => ipcRenderer.invoke('run-shell', cmd),
  getSystemInfo:  ()     => ipcRenderer.invoke('sys-info'),
  listProcesses:  ()     => ipcRenderer.invoke('list-processes'),
  killProcess:    (name) => ipcRenderer.invoke('kill-process', name),

  // ── Group 3: Vision & Human Simulation ──────────────────────────────
  takeScreenshot:   ()       => ipcRenderer.invoke('take-screenshot'),
  getScreenSize:    ()       => ipcRenderer.invoke('sys-get-screen-size'),
  simulateMouse:    (action) => ipcRenderer.invoke('simulate-mouse', action),
  simulateMouseDrag:(action) => ipcRenderer.invoke('simulate-mouse-drag', action),
  simulateKeyboard: (action) => ipcRenderer.invoke('simulate-keyboard', action),

  // ── Group 4: Browser & Web ───────────────────────────────────────────
  browserNavigate:       (url)            => ipcRenderer.invoke('browser-action', { action: 'navigate',         url }),
  browserGetHtml:        ()               => ipcRenderer.invoke('browser-action', { action: 'gethtml'               }),
  browserExtractText:    ()               => ipcRenderer.invoke('browser-action', { action: 'extracttext'           }),
  browserExtractMarkdown:()               => ipcRenderer.invoke('browser-action', { action: 'extractmarkdown'       }),
  browserClick:          (selector)       => ipcRenderer.invoke('browser-action', { action: 'click',       selector }),
  browserType:           (selector, text) => ipcRenderer.invoke('browser-action', { action: 'type',        selector, text }),
  browserScroll:         (dir)            => ipcRenderer.invoke('browser-action', { action: 'scroll',      url: dir }),
  searchWeb:             (query)          => ipcRenderer.invoke('sys-search-web', query),
  openSystemBrowser:     (url)            => ipcRenderer.invoke('sys-open-browser', url),

  // ── Group 5: Tasks & Alerts ──────────────────────────────────────────
  readTasks:          ()     => ipcRenderer.invoke('read-tasks'),
  saveTask:           (t)    => ipcRenderer.invoke('save-task', t),
  updateTasks:        (tasks)=> ipcRenderer.invoke('update-tasks', tasks),
  markTaskCompleted:  (id)   => ipcRenderer.invoke('mark-task-completed', id),
  sendTelegramAlert:  (msg) => ipcRenderer.invoke('send-telegram-alert', msg),

  // ── Events (one-way from main → renderer) ────────────────────────────
  onHeartbeatPulse: (cb) => {
    const handler = (_e, v) => cb(v);
    ipcRenderer.on('heartbeat-pulse', handler);
    return () => ipcRenderer.removeListener('heartbeat-pulse', handler);
  },
  onLog: (cb) => {
    const handler = (_e, v) => cb(v);
    ipcRenderer.on('system-log', handler);
    return () => ipcRenderer.removeListener('system-log', handler);
  },
  onStatusChange: (cb) => {
    const handler = (_e, v) => cb(v);
    ipcRenderer.on('status-change', handler);
    return () => ipcRenderer.removeListener('status-change', handler);
  },
  onRemoteMessage: (cb) => {
    const handler = (_e, v) => cb(v);
    ipcRenderer.on('remote-message', handler);
    return () => ipcRenderer.removeListener('remote-message', handler);
  },
  sendRemoteReply:  (p)  => ipcRenderer.invoke('send-remote-reply', p),
});
