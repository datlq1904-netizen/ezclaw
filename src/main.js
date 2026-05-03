const { app, BrowserWindow, ipcMain, screen, desktopCapturer, shell, globalShortcut, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const Store = require('electron-store');
const store = new Store();

let mainWindow;
let tray = null;
let puppeteer;
try { puppeteer = require('puppeteer'); } catch (e) { console.log("Puppeteer not found"); }

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      backgroundThrottling: false
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Global Kill Switch
  globalShortcut.register('Control+Shift+K', () => {
    app.relaunch();
    app.exit();
  });

  // X button = quit completely
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

const { loadCustomSkills } = require('./services/skillLoader');
let loadedSkills = { schemas: [], executables: new Map() };

app.whenReady().then(async () => {
  createWindow();
  initRemoteBots();

  // Load Custom Skills
  const customSkillsDir = path.join(app.getPath('userData'), 'custom_skills');
  loadedSkills = await loadCustomSkills(customSkillsDir);
  console.log(`[Main] Loaded ${loadedSkills.schemas.length} custom skills.`);

  // Initialize Tray
  try {
    let iconPath = path.join(__dirname, '../public/vite.svg');
    if (!fs.existsSync(iconPath)) iconPath = path.join(__dirname, '../dist/vite.svg');
    const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : nativeImage.createEmpty();
    
    tray = new Tray(icon);
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open EZClaw', click: () => { if (mainWindow) mainWindow.show(); } },
      { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
    ]);
    tray.setToolTip('EZClaw Autonomous Agent');
    tray.setContextMenu(contextMenu);
    tray.on('click', () => { if (mainWindow) mainWindow.show(); });
  } catch(e) { console.error("Tray init error:", e); }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// REMOTE BOTS LOGIC
let tgBot, discordClient;
async function initRemoteBots() {
  const settings = store.get('settings');
  if (!settings) return;

  // Telegram
  if (settings.telegramToken && settings.telegramChatId) {
    try {
      const TelegramBot = require('node-telegram-bot-api');
      tgBot = new TelegramBot(settings.telegramToken, { polling: true });
      tgBot.on('message', (msg) => {
        if (msg.chat.id.toString() === settings.telegramChatId.toString() && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('remote-message', { text: msg.text, source: 'telegram', chatId: msg.chat.id });
        }
      });
    } catch (e) { console.error("Telegram Init Error", e); }
  }

  // Discord
  if (settings.discordToken && settings.discordUserId) {
    try {
      const { Client, GatewayIntentBits } = require('discord.js');
      discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages] });
      discordClient.on('messageCreate', (msg) => {
        if (msg.author.id === settings.discordUserId && mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('remote-message', { text: msg.content, source: 'discord', chatId: msg.author.id });
        }
      });
      discordClient.login(settings.discordToken).catch(e => console.error("Discord Login Error", e));
    } catch (e) { console.error("Discord Init Error", e); }
  }
}

// IPC HANDLERS
ipcMain.handle('get-skills', () => loadedSkills.schemas);
ipcMain.handle('execute-skill', async (e, name, argsStr) => {
  const fn = loadedSkills.executables.get(name);
  if (!fn) return `Skill ${name} not found.`;
  try {
    let argsObj = {};
    if (argsStr) {
      try { argsObj = JSON.parse(argsStr); } catch(_) { argsObj = argsStr; }
    }
    const result = await fn(argsObj);
    return typeof result === 'object' ? JSON.stringify(result) : String(result);
  } catch (err) {
    return `Skill Error: ${err.message}`;
  }
});
ipcMain.handle('close-window',    () => { if (mainWindow) { app.isQuitting = true; mainWindow.close(); } });
ipcMain.handle('minimize-window', () => { if (mainWindow) mainWindow.minimize(); });
ipcMain.handle('hide-to-tray',    () => { if (mainWindow) mainWindow.hide(); });

// NHÓM 1: FILE SYSTEM
ipcMain.handle('read-file', async (e, p) => fs.promises.readFile(p, 'utf8'));
ipcMain.handle('write-file', async (e, p, c) => fs.promises.writeFile(p, c, 'utf8'));
ipcMain.handle('append-file', async (e, p, c) => fs.promises.appendFile(p, c, 'utf8'));
ipcMain.handle('delete-file', async (e, p) => fs.promises.unlink(p));
ipcMain.handle('list-dir', async (e, p) => fs.promises.readdir(p));
ipcMain.handle('create-dir', async (e, p) => fs.promises.mkdir(p, { recursive: true }));
ipcMain.handle('move-file', async (e, s, d) => fs.promises.rename(s, d));

// NHÓM 2: HỆ THỐNG
ipcMain.handle('run-shell', (e, cmd) => {
  return new Promise(res => {
    const proc = exec(cmd, { timeout: 30000 }, (err, stdout, stderr) => {
      res(stdout || stderr || (err ? err.message : 'Success'));
    });
    proc.on('error', (err) => res(`Shell Error: ${err.message}`));
  });
});
ipcMain.handle('sys-info', () => ({
  platform: process.platform,
  arch: process.arch,
  version: process.version,
  memory: process.memoryUsage()
}));
ipcMain.handle('list-processes', () => {
  return new Promise(res => {
    const cmd = process.platform === 'win32' ? 'tasklist' : 'ps aux';
    exec(cmd, (err, stdout) => res(stdout));
  });
});
ipcMain.handle('kill-process', (e, name) => {
  return new Promise(res => {
    const cmd = process.platform === 'win32'
      ? `taskkill /F /IM "${name}" /T`
      : `pkill -f "${name}"`;
    exec(cmd, (err, stdout, stderr) => res(stdout || stderr || (err ? err.message : 'Killed')));
  });
});

// NHÓM 3: THỊ GIÁC & MÔ PHỎNG
ipcMain.handle('take-screenshot', async () => {
  try {
    const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 1920, height: 1080 } });
    return sources[0].thumbnail.toDataURL();
  } catch (e) { return null; }
});
ipcMain.handle('sys-get-screen-size', () => screen.getPrimaryDisplay().size);
ipcMain.handle('simulate-mouse', async (e, { type, x, y }) => {
  const os = require('os');
  const tmpFile = path.join(os.tmpdir(), `ezclaw_mouse_${Date.now()}.ps1`);
  let script = `Add-Type -AssemblyName System.Windows.Forms\n`;
  if (x !== undefined && x !== null && y !== undefined && y !== null && !isNaN(x) && !isNaN(y)) {
    script += `[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${Math.round(x)}, ${Math.round(y)})\nStart-Sleep -Milliseconds 80\n`;
  }
  if (type === 'click' || !type) {
    script += `Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);' -Name User32 -Namespace Win32 -ErrorAction SilentlyContinue\n[Win32.User32]::mouse_event(0x0002, 0, 0, 0, 0)\nStart-Sleep -Milliseconds 30\n[Win32.User32]::mouse_event(0x0004, 0, 0, 0, 0)\n`;
  } else if (type === 'right_click') {
    script += `Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);' -Name User32 -Namespace Win32 -ErrorAction SilentlyContinue\n[Win32.User32]::mouse_event(0x0008, 0, 0, 0, 0)\nStart-Sleep -Milliseconds 30\n[Win32.User32]::mouse_event(0x0010, 0, 0, 0, 0)\n`;
  } else if (type === 'double_click') {
    script += `Add-Type -MemberDefinition '[DllImport("user32.dll")] public static extern void mouse_event(int dwFlags, int dx, int dy, int dwData, int dwExtraInfo);' -Name User32 -Namespace Win32 -ErrorAction SilentlyContinue\n[Win32.User32]::mouse_event(0x0002, 0, 0, 0, 0)\n[Win32.User32]::mouse_event(0x0004, 0, 0, 0, 0)\nStart-Sleep -Milliseconds 50\n[Win32.User32]::mouse_event(0x0002, 0, 0, 0, 0)\n[Win32.User32]::mouse_event(0x0004, 0, 0, 0, 0)\n`;
  } else if (type === 'move') {
    // just move, no click
  }
  return new Promise(res => {
    fs.writeFileSync(tmpFile, script, 'utf8');
    exec(`powershell -ExecutionPolicy Bypass -File "${tmpFile}"`, (err) => {
      try { fs.unlinkSync(tmpFile); } catch(_) {}
      res(err ? `Error: ${err.message}` : 'Mouse action done');
    });
  });
});
ipcMain.handle('simulate-keyboard', async (e, { text, combo }) => {
  const os = require('os');
  const tmpFile = path.join(os.tmpdir(), `ezclaw_kb_${Date.now()}.ps1`);
  let script = `Add-Type -AssemblyName System.Windows.Forms\nStart-Sleep -Milliseconds 100\n`;

  if (combo && Array.isArray(combo)) {
    const psKeys = combo.map(k => {
      const lower = k.toLowerCase().trim();
      if (lower === 'control' || lower === 'ctrl') return '^';
      if (lower === 'alt')   return '%';
      if (lower === 'shift') return '+';
      if (lower === 'win' || lower === 'windows') return '^{ESC}';
      if (lower === 'enter' || lower === 'return') return '{ENTER}';
      if (lower === 'tab')   return '{TAB}';
      if (lower === 'escape'|| lower === 'esc') return '{ESC}';
      if (lower === 'space') return '{SPACE}';
      if (lower === 'backspace') return '{BACKSPACE}';
      if (lower === 'delete' || lower === 'del') return '{DELETE}';
      if (lower === 'home')  return '{HOME}';
      if (lower === 'end')   return '{END}';
      if (lower === 'pageup') return '{PGUP}';
      if (lower === 'pagedown') return '{PGDN}';
      if (lower === 'up')    return '{UP}';
      if (lower === 'down')  return '{DOWN}';
      if (lower === 'left')  return '{LEFT}';
      if (lower === 'right') return '{RIGHT}';
      if (lower === 'f1')  return '{F1}';  if (lower === 'f2')  return '{F2}';
      if (lower === 'f3')  return '{F3}';  if (lower === 'f4')  return '{F4}';
      if (lower === 'f5')  return '{F5}';  if (lower === 'f6')  return '{F6}';
      if (lower === 'f7')  return '{F7}';  if (lower === 'f8')  return '{F8}';
      if (lower === 'f9')  return '{F9}';  if (lower === 'f10') return '{F10}';
      if (lower === 'f11') return '{F11}'; if (lower === 'f12') return '{F12}';
      // Single char — escape if it's a SendKeys special char
      if (['+', '^', '%', '~', '(', ')', '{', '}', '[', ']'].includes(k)) return `{${k}}`;
      return k;
    }).join('');
    script += `[System.Windows.Forms.SendKeys]::SendWait('${psKeys.replace(/'/g, "''")}')\n`;
  } else if (text) {
    // For plain text typing: escape ALL SendKeys special chars
    const escaped = text
      .replace(/[+^%~(){}\[\]]/g, c => `{${c}}`)
      .replace(/'/g, "''");
    script += `[System.Windows.Forms.SendKeys]::SendWait('${escaped}')\n`;
  } else {
    return 'No text provided';
  }

  return new Promise(res => {
    fs.writeFileSync(tmpFile, script, 'utf8');
    exec(`powershell -ExecutionPolicy Bypass -File "${tmpFile}"`, (err) => {
      try { fs.unlinkSync(tmpFile); } catch(_) {}
      res(err ? `Error: ${err.message}` : 'Keyboard action done');
    });
  });
});
ipcMain.handle('simulate-mouse-drag', async (e, { startX, startY, endX, endY }) => {
  const os = require('os');
  const tmpFile = path.join(os.tmpdir(), `ezclaw_drag_${Date.now()}.ps1`);
  const script = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -MemberDefinition @"
  [DllImport("user32.dll")] public static extern void mouse_event(int f, int x, int y, int d, int e);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
"@ -Name User32 -Namespace Win32 -ErrorAction SilentlyContinue
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${Math.round(startX)}, ${Math.round(startY)})
Start-Sleep -Milliseconds 150
[Win32.User32]::mouse_event(0x0002, 0, 0, 0, 0)
Start-Sleep -Milliseconds 80
$steps = 20
for ($i = 1; $i -le $steps; $i++) {
  $x = [int](${Math.round(startX)} + ($i / $steps) * (${Math.round(endX)} - ${Math.round(startX)}))
  $y = [int](${Math.round(startY)} + ($i / $steps) * (${Math.round(endY)} - ${Math.round(startY)}))
  [System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point($x, $y)
  Start-Sleep -Milliseconds 15
}
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${Math.round(endX)}, ${Math.round(endY)})
Start-Sleep -Milliseconds 80
[Win32.User32]::mouse_event(0x0004, 0, 0, 0, 0)
`;
  return new Promise(res => {
    fs.writeFileSync(tmpFile, script, 'utf8');
    exec(`powershell -ExecutionPolicy Bypass -File "${tmpFile}"`, (err) => {
      try { fs.unlinkSync(tmpFile); } catch(_) {}
      res(err ? `Error: ${err.message}` : 'Drag complete');
    });
  });
});

// NHÓM 4: BROWSER & WEB
let browserInstance;
ipcMain.handle('browser-action', async (e, { action, url, selector, text }) => {
  if (!puppeteer) return "Puppeteer missing";
  try {
    if (!browserInstance) browserInstance = await puppeteer.launch({ headless: false });
    const pages = await browserInstance.pages();
    const page = pages.length > 0 ? pages[0] : await browserInstance.newPage();
    if (action === 'navigate') await page.goto(url, { waitUntil: 'networkidle2' });
    else if (action === 'click') await page.click(selector);
    else if (action === 'type') await page.type(selector, text);
    else if (action === 'gethtml') return await page.content();
    else if (action === 'extracttext') return await page.evaluate(() => document.body.innerText);
    else if (action === 'extractmarkdown') {
      const rawText = await page.evaluate(() => {
        const sel = 'p, h1, h2, h3, h4, li, td, th';
        return Array.from(document.querySelectorAll(sel)).map(el => el.innerText.trim()).filter(Boolean).join('\n');
      });
      return rawText;
    }
    else if (action === 'scroll') await page.evaluate((d) => window.scrollBy(0, d === 'up' ? -500 : 500), url);
    return "Browser action success";
  } catch (err) { return `Browser Error: ${err.message}`; }
});
ipcMain.handle('sys-search-web', async (e, query) => {
  if (!puppeteer) return "Puppeteer not available - install puppeteer";
  try {
    const b = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
    });
    const p = await b.newPage();
    // Fake real browser User-Agent to avoid bot detection
    await p.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await p.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

    // Try DuckDuckGo first (less bot detection)
    let results = '';
    try {
      await p.goto(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, { waitUntil: 'networkidle2', timeout: 15000 });
      results = await p.evaluate(() => {
        return Array.from(document.querySelectorAll('.result')).slice(0, 5).map(el => {
          const title   = el.querySelector('.result__title')?.innerText?.trim();
          const snippet = el.querySelector('.result__snippet')?.innerText?.trim();
          const url     = el.querySelector('.result__url')?.innerText?.trim();
          return [title, snippet, url ? `(${url})` : ''].filter(Boolean).join(' - ');
        }).filter(Boolean).join('\n\n');
      });
    } catch (_) {
      // Fallback to Google if DuckDuckGo fails
      await p.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`, { waitUntil: 'networkidle2', timeout: 15000 });
      results = await p.evaluate(() => {
        // Try multiple known Google selectors
        const items = Array.from(document.querySelectorAll('[data-snf], .g, .MjjYud')).slice(0, 5);
        return items.map(el => {
          const title   = el.querySelector('h3')?.innerText?.trim();
          const snippet = (el.querySelector('.VwiC3b, [data-sncf], .lyLwlc, .yXK7lf'))?.innerText?.trim();
          return [title, snippet].filter(Boolean).join(': ');
        }).filter(Boolean).join('\n\n');
      });
    }

    await b.close();
    return results || 'No results found for: ' + query;
  } catch (err) { return `Search Error: ${err.message}`; }
});
ipcMain.handle('sys-open-browser', async (e, url) => {
  try { await shell.openExternal(url); return "Success"; } catch (e) { return e.message; }
});

// NHÓM 5: SETTINGS & MEMORY
ipcMain.handle('get-settings', () => store.get('settings'));
ipcMain.handle('save-settings', (e, s) => { store.set('settings', s); initRemoteBots(); });
ipcMain.handle('get-memory', () => store.get('memory') || []);
ipcMain.handle('save-memory', (e, m) => {
  let mem = store.get('memory') || [];
  // Deduplicate: don't add if same content as last message
  if (mem.length > 0 && mem[mem.length - 1].content === m.content && mem[mem.length - 1].role === m.role) return;
  mem.push(m);
  if (mem.length > 100) mem = mem.slice(-100); // keep last 100 messages
  store.set('memory', mem);
});
ipcMain.handle('clear-memory', () => {
  store.delete('memory');
});
ipcMain.handle('reset-settings', () => {
  store.clear(); // wipes ALL: settings + memory
  // Also delete tasks.json file
  const taskFile = path.join(app.getPath('userData'), 'tasks.json');
  try { if (fs.existsSync(taskFile)) fs.unlinkSync(taskFile); } catch(e) {}
});
const taskPath = path.join(app.getPath('userData'), 'tasks.json');
ipcMain.handle('read-tasks', () => {
  if (!fs.existsSync(taskPath)) return [];
  try { return JSON.parse(fs.readFileSync(taskPath, 'utf8')); } catch { return []; }
});
ipcMain.handle('save-task', (e, t) => {
  let tasks = [];
  if (fs.existsSync(taskPath)) { try { tasks = JSON.parse(fs.readFileSync(taskPath, 'utf8')); } catch { tasks = []; } }
  tasks.push({ ...t, id: Date.now().toString(), completed: false });
  fs.writeFileSync(taskPath, JSON.stringify(tasks, null, 2));
});
ipcMain.handle('update-tasks', (e, newTasks) => {
  fs.writeFileSync(taskPath, JSON.stringify(newTasks, null, 2));
});
ipcMain.handle('mark-task-completed', (e, id) => {
  if (!fs.existsSync(taskPath)) return;
  let tasks = [];
  try { tasks = JSON.parse(fs.readFileSync(taskPath, 'utf8')); } catch { return; }
  tasks = tasks.map(tk => tk.id === id ? { ...tk, completed: true } : tk);
  fs.writeFileSync(taskPath, JSON.stringify(tasks, null, 2));
});

// REMOTE REPLY & TELEGRAM ALERT
ipcMain.handle('send-remote-reply', (e, { source, chatId, text }) => {
  if (source === 'telegram' && tgBot) tgBot.sendMessage(chatId, text);
  if (source === 'discord' && discordClient) {
    const channel = discordClient.channels.cache.get(chatId);
    if (channel) channel.send(text);
  }
});
ipcMain.handle('send-telegram-alert', async (e, message) => {
  try {
    const settings = store.get('settings');
    if (!settings || !settings.telegramToken || !settings.telegramChatId) return 'Telegram not configured';
    if (!tgBot) {
      const TelegramBot = require('node-telegram-bot-api');
      tgBot = new TelegramBot(settings.telegramToken, { polling: false });
    }
    await tgBot.sendMessage(settings.telegramChatId, `🤖 EZClaw Alert:\n${message}`);
    return 'Alert sent';
  } catch (err) { return `Telegram Error: ${err.message}`; }
});
