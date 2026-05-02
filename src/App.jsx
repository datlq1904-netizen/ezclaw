import React, { useState, useEffect, useRef } from 'react';
import { Settings as SettingsIcon, Play, Square, Activity, Terminal, MessageSquare, Plus, Save, CheckSquare, Clock, Globe, User, Cpu, Smartphone, ChevronRight, Check, BookOpen, Trash2, X, Minus, ArrowDownToLine } from 'lucide-react';
import { callLLM } from './services/apiService';
import TaskPanel from './components/TaskPanel';
import Onboarding from './components/Onboarding';
import Tutorial from './components/Tutorial';

const PROVIDERS_CONFIG = {
  openai:     { name: 'OpenAI',                    defaultModel: 'gpt-4o' },
  gemini:     { name: 'Google Gemini',              defaultModel: 'gemini-2.0-flash' },
  anthropic:  { name: 'Anthropic Claude',           defaultModel: 'claude-3-5-sonnet-20241022' },
  grok:       { name: 'xAI Grok',                  defaultModel: 'grok-4.3' },
  deepseek:   { name: 'DeepSeek',                  defaultModel: 'deepseek-chat' },
  meta:       { name: 'Meta Llama (OpenRouter)',    defaultModel: 'meta-llama/llama-4-maverick' },
  openrouter: { name: 'OpenRouter',                defaultModel: 'anthropic/claude-3-5-sonnet' },
  together:   { name: 'Together AI',               defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
  groq:       { name: 'Groq',                      defaultModel: 'llama-3.3-70b-versatile' },
  fireworks:  { name: 'Fireworks AI',              defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct' },
  deepinfra:  { name: 'DeepInfra',                 defaultModel: 'meta-llama/Llama-3.3-70B-Instruct' },
};

// Verified model IDs as of May 2026
const PROVIDER_MODELS = {
  openai: [
    'gpt-4o', 'gpt-4o-mini',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
    'gpt-5.5', 'gpt-5.5-pro',
    'o3', 'o3-mini', 'o4-mini',
  ],
  gemini: [
    'gemini-2.0-flash', 'gemini-2.0-flash-lite',
    'gemini-2.5-pro-preview-05-06', 'gemini-2.5-flash-preview-04-17',
    'gemini-3.1-pro', 'gemini-3.1-flash', 'gemini-3.1-flash-lite',
    'gemini-1.5-pro', 'gemini-1.5-flash',
  ],
  anthropic: [
    'claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022',
    'claude-3-7-sonnet-20250219',
    'claude-sonnet-4-6', 'claude-opus-4-7',
  ],
  grok: [
    'grok-4.3', 'grok-3', 'grok-3-mini', 'grok-3-fast',
  ],
  deepseek: [
    'deepseek-chat', 'deepseek-reasoner',
  ],
  meta: [
    'meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout',
    'meta-llama/llama-3.3-70b-instruct',
  ],
  openrouter: [
    // OpenRouter: dùng nút "Tải models" để lấy danh sách mới nhất
    'anthropic/claude-3-5-sonnet', 'anthropic/claude-3-7-sonnet',
    'anthropic/claude-sonnet-4-6', 'anthropic/claude-opus-4-7',
    'openai/gpt-4o', 'openai/gpt-4o-mini', 'openai/gpt-4.1',
    'openai/gpt-5.5', 'openai/o3', 'openai/o4-mini',
    'google/gemini-2.0-flash', 'google/gemini-2.5-pro-preview',
    'google/gemini-3.1-pro', 'google/gemini-3.1-flash',
    'x-ai/grok-4.3', 'x-ai/grok-3', 'x-ai/grok-3-mini',
    'deepseek/deepseek-chat', 'deepseek/deepseek-reasoner',
    'meta-llama/llama-4-maverick', 'meta-llama/llama-4-scout',
    'mistralai/mistral-large-latest', 'mistralai/mistral-small-latest',
    'qwen/qwen-2.5-72b-instruct', 'qwen/qwen-2.5-coder-32b-instruct',
    'nvidia/llama-3.1-nemotron-ultra-253b-v1:free',
    'microsoft/phi-4-multimodal-instruct',
    'cohere/command-a-03-2025',
  ],
  together: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Llama-3.1-8B-Instruct-Turbo',
    'Qwen/Qwen2.5-72B-Instruct-Turbo',
    'mistralai/Mixtral-8x7B-Instruct-v0.1',
    'deepseek-ai/DeepSeek-R1',
  ],
  groq: [
    'llama-3.3-70b-versatile', 'llama-3.1-8b-instant',
    'mixtral-8x7b-32768', 'gemma2-9b-it',
    'deepseek-r1-distill-llama-70b',
  ],
  fireworks: [
    'accounts/fireworks/models/llama-v3p3-70b-instruct',
    'accounts/fireworks/models/qwen2p5-72b-instruct',
    'accounts/fireworks/models/deepseek-r1',
  ],
  deepinfra: [
    'meta-llama/Llama-3.3-70B-Instruct',
    'Qwen/Qwen2.5-72B-Instruct',
    'microsoft/phi-4',
    'deepseek-ai/DeepSeek-R1',
  ],
};

const I18N = {
  en: {
    appTitle: "EZClaw", chat: "Chat", sysLogs: "System Logs", startHeartbeat: "Start Heartbeat", stopHeartbeat: "Stop Heartbeat",
    settings: "Settings", killSwitchInfo: "Ctrl+Shift+K to Kill All", howCanIAssist: "How can I assist you today?",
    askPlaceholder: "Ask EZClaw to perform a task...", close: "Close", smartSettings: "Smart Settings", aiProvider: "AI Provider",
    apiKey: "API Key", modelName: "Model Name", remoteControlBots: "Remote Bots", telegramToken: "Telegram Token",
    telegramChatId: "Chat ID", discordToken: "Discord Token", discordUserId: "User ID", restartNote: "Restart needed for bots.",
    saveSettings: "Save Settings", language: "Language", runOnStartup: "Start with Windows", autoTasks: "Auto Tasks",
    tutorial: "Tutorial", clearChat: "Clear History", taskSaved: "Saved", taskBanner: "Autonomous mode scans every 30s.",
    taskMonitoring: "Monitoring...", addTask: "Add Task", taskPlaceholder: "Task description", resetApp: "Reset All Data",
    systemLogsTitle: "System Activity Logs"
  },
  vi: {
    appTitle: "EZClaw", chat: "Trò chuyện", sysLogs: "Hệ thống", startHeartbeat: "Bật Heartbeat", stopHeartbeat: "Tắt Heartbeat",
    settings: "Cài đặt", killSwitchInfo: "Ctrl+Shift+K để dừng khẩn cấp", howCanIAssist: "Tôi có thể giúp gì cho bạn?",
    askPlaceholder: "Yêu cầu EZClaw làm việc...", close: "Đóng", smartSettings: "Cài đặt thông minh", aiProvider: "Nhà cung cấp AI",
    apiKey: "API Key", modelName: "Tên Model", remoteControlBots: "Bot điều khiển", telegramToken: "Token Telegram",
    telegramChatId: "Chat ID", discordToken: "Token Discord", discordUserId: "User ID", restartNote: "Cần khởi động lại để áp dụng.",
    saveSettings: "Lưu cài đặt", language: "Ngôn ngữ", runOnStartup: "Khởi động cùng Windows", autoTasks: "Nhiệm vụ",
    tutorial: "Hướng dẫn", clearChat: "Xóa lịch sử", taskSaved: "Đã lưu", taskBanner: "AI quét danh sách mỗi 30s.",
    taskMonitoring: "Đang trực...", addTask: "Thêm việc", taskPlaceholder: "Mô tả nhiệm vụ", resetApp: "Xóa dữ liệu", systemLogsTitle: "Nhật ký hệ thống"
  }
};

const SYSTEM_PROMPT = `You are EZClaw, an autonomous agent that PHYSICALLY CONTROLS a real Windows PC. You have REAL tools executing REAL actions. You are NOT a chatbot.

## TOOLS
FILE: readFile(path) | writeFile(path,content) | appendFile(path,content) | deleteFile(path) | listDir(path) | createDir(path) | moveFile(src,dest)
SYSTEM: runShell(command) | getSystemInfo() | listProcesses() | killProcess(process_name)
VISION: take_screenshot() | getScreenSize() | simulateMouse(type,x,y) | simulateMouseDrag(startX,startY,endX,endY) | simulateKeyboard(text) | keyboardCombo(keys[])
BROWSER: browserNavigate(url) | browserGetHtml() | browserExtractText() | browserExtractMarkdown() | browserClick(selector) | browserType(selector,text) | browserScroll(dir)
WEB: searchWeb(query) | openSystemBrowser(url)
CORE: mark_task_completed(taskId) | send_telegram_alert(message)

## TOOL FORMAT (exact, no variation):
<tool_call><name>TOOL_NAME</name><arg1>value</arg1></tool_call>

## MOUSE TYPES: click | double_click | right_click | move
## KEYBOARD: keyboardCombo keys: ctrl,c or alt,tab or win,d — special: enter,tab,escape,space,backspace,delete,up,down,left,right,f1-f12

## MANDATORY RULES:
1. NEVER claim a task is done without using tools to do it. Saying done without acting is FORBIDDEN.
2. For ANY PC task (open app, click, type, scroll): call take_screenshot() FIRST to see the screen. You cannot know coordinates without looking.
3. After screenshot: find exact pixel x,y of target. Then call simulateMouse or simulateKeyboard.
4. After acting: call take_screenshot() again to VERIFY. If wrong, retry.
5. Opening apps: use runShell with PowerShell: runShell(Start-Process chrome) or runShell(start notepad).
6. Typing: click the input field first, then simulateKeyboard.
7. Reply in [LANGUAGE]. User name: [USER_NAME].
8. For current info/news/prices: searchWeb(query) first.
9. ONLY say the task is done AFTER screenshot confirms it.
`;

// PC control keywords to detect when enforcement is needed
const PC_CONTROL_KEYWORDS = [
  'mo','mở','open','click','nhấn','bấm','gõ','type','kéo','drag',
  'chụp','screenshot','thao tác','điều khiển','control','tìm kiếm',
  'search','truy cập','launch','start','run','khởi động','copy',
  'paste','sao chép','dán','xem màn hình','desktop','taskbar',
  'close','đóng','minimize','maximize','scroll','cuộn','chrome',
  'notepad','explorer','word','excel','powershell','cmd'
];
function isPCControlTask(text) {
  const t = (text || '').toLowerCase();
  return PC_CONTROL_KEYWORDS.some(k => t.includes(k));
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [heartbeat, setHeartbeat] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [settings, setSettings] = useState({ provider: 'gemini', language: 'en', model: 'gemini-2.0-flash' });
  const [fetchingModels, setFetchingModels] = useState(false);
  const [fetchedModels, setFetchedModels] = useState([]);

  const t = I18N[settings.language] || I18N.en;
  const messagesEndRef = useRef(null);
  // Refs to always have the latest values in callbacks (fixes stale closures)
  const settingsRef = useRef(settings);
  const messagesRef = useRef([]);
  const statusRef = useRef(status);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    if (!window.electronAPI) return;

    window.electronAPI.getSettings().then(async saved => {
      if (saved && saved.provider) {
        if (!saved.model || saved.model.trim() === '') {
          saved.model = PROVIDERS_CONFIG[saved.provider]?.defaultModel || 'gemini-2.0-flash';
        }
        setSettings(prev => ({ ...prev, ...saved }));
        if (!saved.userName) setShowOnboarding(true);
      } else setShowOnboarding(true);
      const memory = await window.electronAPI.getMemory();
      if (memory && memory.length > 0) setMessages(memory);
    });

    // Register IPC event listeners and return cleanup to prevent leaks
    const cleanupLog    = window.electronAPI.onLog(m => setLogs(p => [...p, m]));
    const cleanupStatus = window.electronAPI.onStatusChange(s => setStatus(s));
    const cleanupHB     = window.electronAPI.onHeartbeatPulse(tasks => {
      const now = new Date();
      const curMins = now.getHours() * 60 + now.getMinutes();
      const due = tasks.find(tk => {
        if (tk.completed || !tk.time) return false;
        const [h, m] = tk.time.split(':').map(Number);
        return curMins >= (h * 60 + m);
      });
      if (due) processInput(`HEARTBEAT: Task due now - ${due.description}. Complete it and call mark_task_completed with ID ${due.id}.`, 'Heartbeat', 'sys');
    });
    const cleanupRemote = window.electronAPI.onRemoteMessage(p => processInput(p.text, p.source, p.chatId));

    return () => {
      if (typeof cleanupLog === 'function') cleanupLog();
      if (typeof cleanupStatus === 'function') cleanupStatus();
      if (typeof cleanupHB === 'function') cleanupHB();
      if (typeof cleanupRemote === 'function') cleanupRemote();
    };
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const processInput = async (text, remoteSource, remoteChatId) => {
    if (!text) return;
    if (statusRef.current !== 'idle') {
      console.warn("Input dropped — agent is already busy executing a task.");
      return;
    }
    const currentSettings = settingsRef.current;
    const currentMessages = messagesRef.current;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    if (!remoteSource) setInput('');
    setStatus('thinking');

    const currentProvider = currentSettings.provider;
    const currentModel = (currentSettings.model || '').toLowerCase();
    const visionPatterns = ['gpt-4o','gpt-4.1','gpt-5','claude-3','claude-sonnet','claude-opus','claude-haiku','gemini'];
    const isVisionModel = 
      currentProvider === 'openai' || 
      currentProvider === 'anthropic' || 
      currentProvider === 'gemini' || 
      visionPatterns.some(p => currentModel.includes(p));

    let sysPrompt = SYSTEM_PROMPT
      .replace('[USER_NAME]', currentSettings.userName || '')
      .replace('[LANGUAGE]', currentSettings.language === 'vi' ? 'Vietnamese' : 'English');

    if (isPCControlTask(text)) {
      if (isVisionModel) {
        sysPrompt += "\n\n[CRITICAL SYSTEM ENFORCEMENT]: The user asked you to perform a PC task. YOU MUST execute a <tool_call> right now. DO NOT just reply with text saying you have done it. You MUST call take_screenshot() or runShell() immediately.";
      } else {
        sysPrompt += "\n\n[CRITICAL SYSTEM ENFORCEMENT]: The user asked you to perform a PC task. YOU MUST execute a <tool_call> right now. DO NOT just reply with text saying you have done it. NOTE: Your current model DOES NOT support vision. Do NOT call take_screenshot(). Use runShell(), simulateMouse(), or other tools based on your best guess of coordinates or keyboard shortcuts.";
      }
    }
    let history = [{ role: 'system', content: sysPrompt }, ...currentMessages, userMsg];
    let running = true;
    let loops = 0;

    try {
      while (running && loops < 10) {
        loops++;
        try {
          const reply = await callLLM(currentSettings.provider, currentSettings[`${currentSettings.provider}Key`] || '', currentSettings.model, history);
          const assistantMsg = { role: 'assistant', content: reply };
          setMessages(prev => [...prev, assistantMsg]);
          history.push(assistantMsg);
          // Save both user and assistant to persistent memory
          if (window.electronAPI) {
            window.electronAPI.saveMemory(userMsg);
            window.electronAPI.saveMemory(assistantMsg);
          }

          const toolMatch = reply.match(/<tool_call>[\s\S]*?<name>(.*?)<\/name>([\s\S]*?)<\/tool_call>/);
          if (toolMatch) {
            const name = toolMatch[1].trim();
            const body = toolMatch[2].trim();
            let out = "";
            setStatus(`Executing ${name}...`);
            try {
              if (name === 'readFile')      out = await window.electronAPI.readFile(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim());
              else if (name === 'writeFile')  out = await window.electronAPI.writeFile(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim(), body.match(/<content>([\s\S]*?)<\/content>/)?.[1]);
              else if (name === 'appendFile') out = await window.electronAPI.appendFile(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim(), body.match(/<content>([\s\S]*?)<\/content>/)?.[1]);
              else if (name === 'deleteFile') out = await window.electronAPI.deleteFile(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim());
              else if (name === 'listDir')    out = JSON.stringify(await window.electronAPI.listDir(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim()));
              else if (name === 'createDir')  out = await window.electronAPI.createDir(body.match(/<path>([\s\S]*?)<\/path>/)?.[1]?.trim());
              else if (name === 'moveFile')   out = await window.electronAPI.moveFile(body.match(/<src>([\s\S]*?)<\/src>/)?.[1]?.trim(), body.match(/<dest>([\s\S]*?)<\/dest>/)?.[1]?.trim());
              else if (name === 'runShell')   out = await window.electronAPI.runShell(body.match(/<command>([\s\S]*?)<\/command>/)?.[1]?.trim());
              else if (name === 'getSystemInfo')  out = JSON.stringify(await window.electronAPI.getSystemInfo());
              else if (name === 'listProcesses')  out = await window.electronAPI.listProcesses();
              else if (name === 'take_screenshot') {
                const img = await window.electronAPI.takeScreenshot();
                if (img) {
                  // Check if current model supports vision by model name
                  const currentProvider = settingsRef.current.provider;
                  const currentModel   = (settingsRef.current.model || '').toLowerCase();
                  const visionPatterns = ['gpt-4o','gpt-4.1','gpt-5','claude-3','claude-sonnet','claude-opus','claude-haiku','gemini'];
                  const isVisionModel  =
                    currentProvider === 'openai' ||
                    currentProvider === 'anthropic' ||
                    currentProvider === 'gemini' ||
                    visionPatterns.some(p => currentModel.includes(p));

                  if (isVisionModel) {
                    history.push({ role: 'user', content: 'Here is the current screenshot. Analyze it carefully: identify all visible UI elements, text, buttons, and their exact pixel coordinates. Then proceed with the task.', image: img });
                  } else {
                    history.push({ role: 'user', content: '[Screenshot captured — this model does not support vision] Proceed with the task using your knowledge of typical screen layouts and estimated coordinates.' });
                  }
                  out = 'Screenshot captured. Analyzing...';
                } else {
                  out = 'Screenshot failed — screen may be locked or display permissions missing.';
                }
              }
              else if (name === 'getScreenSize') out = JSON.stringify(await window.electronAPI.getScreenSize());
              else if (name === 'simulateMouse') {
                 const typeM = body.match(/<type>([\s\S]*?)<\/type>/);
                 const xM    = body.match(/<x>([\s\S]*?)<\/x>/);
                 const yM    = body.match(/<y>([\s\S]*?)<\/y>/);
                 out = await window.electronAPI.simulateMouse({
                   type: typeM ? typeM[1].trim() : 'click',
                   x: xM ? parseInt(xM[1].trim()) : null,
                   y: yM ? parseInt(yM[1].trim()) : null
                 });
              }
              else if (name === 'simulateKeyboard') {
                 const textM = body.match(/<text>([\s\S]*?)<\/text>/);
                 out = await window.electronAPI.simulateKeyboard({ text: textM ? textM[1] : '' });
              }
              else if (name === 'mark_task_completed') {
                 await window.electronAPI.markTaskCompleted(body.match(/<taskId>([\s\S]*?)<\/taskId>/)?.[1]?.trim());
                 out = 'Task marked completed.';
              }
              else if (name === 'searchWeb')         out = await window.electronAPI.searchWeb(body.match(/<query>([\s\S]*?)<\/query>/)?.[1]?.trim());
              else if (name === 'openSystemBrowser')  out = await window.electronAPI.openSystemBrowser(body.match(/<url>([\s\S]*?)<\/url>/)?.[1]?.trim());
              else if (name === 'browserNavigate')    out = await window.electronAPI.browserNavigate(body.match(/<url>([\s\S]*?)<\/url>/)?.[1]?.trim());
              else if (name === 'browserClick')       out = await window.electronAPI.browserClick(body.match(/<selector>([\s\S]*?)<\/selector>/)?.[1]?.trim());
              else if (name === 'browserType')        out = await window.electronAPI.browserType(body.match(/<selector>([\s\S]*?)<\/selector>/)?.[1]?.trim(), body.match(/<text>([\s\S]*?)<\/text>/)?.[1]);
              else if (name === 'browserScroll')      out = await window.electronAPI.browserScroll(body.match(/<dir>([\s\S]*?)<\/dir>/)?.[1]?.trim() || 'down');
              else if (name === 'browserGetHtml')     out = await window.electronAPI.browserGetHtml();
              else if (name === 'browserExtractText') out = await window.electronAPI.browserExtractText();
              else if (name === 'killProcess')        out = await window.electronAPI.killProcess(body.match(/<process_name>([\s\S]*?)<\/process_name>/)?.[1]?.trim());
              else if (name === 'simulateMouseDrag') {
                 out = await window.electronAPI.simulateMouseDrag({
                   startX: parseInt(body.match(/<startX>([\s\S]*?)<\/startX>/)?.[1]?.trim()),
                   startY: parseInt(body.match(/<startY>([\s\S]*?)<\/startY>/)?.[1]?.trim()),
                   endX:   parseInt(body.match(/<endX>([\s\S]*?)<\/endX>/)?.[1]?.trim()),
                   endY:   parseInt(body.match(/<endY>([\s\S]*?)<\/endY>/)?.[1]?.trim())
                 });
              }
              else if (name === 'keyboardCombo') {
                 const raw = body.match(/<keys>([\s\S]*?)<\/keys>/)?.[1]?.trim() || '';
                 const combo = raw.split(',').map(k => k.trim()).filter(Boolean);
                 out = await window.electronAPI.simulateKeyboard({ combo });
              }
              else if (name === 'browserExtractMarkdown') out = await window.electronAPI.browserExtractMarkdown();
              else if (name === 'send_telegram_alert')    out = await window.electronAPI.sendTelegramAlert(body.match(/<message>([\s\S]*?)<\/message>/)?.[1]?.trim());
              else out = `Unknown tool: ${name}`;
            } catch(err) { out = `Tool Error: ${err.message}`; }
            const resMsg = { role: 'user', content: `[Tool Output ${name}]: ${out}` };
            setMessages(p => [...p, resMsg]);
            history.push(resMsg);
          } else running = false;
        } catch (e) {
          // Show the actual error to the user so they know what went wrong
          const errMsg = { role: 'assistant', content: `Error: ${e.message || 'Unknown error occurred. Check your API key and model selection.'}` };
          setMessages(prev => [...prev, errMsg]);
          running = false;
        }
      }
      if (remoteSource && history.length > 0) {
        window.electronAPI.sendRemoteReply({ source: remoteSource, chatId: remoteChatId, text: history[history.length-1].content });
      }
    } finally {
      // ALWAYS reset status — even if everything crashes
      setStatus('idle');
    }
  };

  const handleSend = () => { if (!input.trim() || status !== 'idle') return; processInput(input); };

  // Fetch live model list from OpenRouter API
  const fetchOpenRouterModels = async () => {
    const key = settings[`${settings.provider}Key`] || '';
    if (!key.trim()) { alert('Nhập API key trước rồi mới tải models được.'); return; }
    setFetchingModels(true);
    try {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { 'Authorization': `Bearer ${key.trim()}` }
      });
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        const ids = json.data
          .filter(m => m.id)
          .map(m => m.id)
          .sort();
        setFetchedModels(ids);
      } else {
        alert('Không lấy được danh sách model. Kiểm tra lại API key.');
      }
    } catch (e) {
      alert(`Lỗi: ${e.message}`);
    } finally {
      setFetchingModels(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col p-4 gap-4 no-drag">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="text-emerald-500" />
          <span className="font-bold text-xl tracking-tighter">EZClaw</span>
        </div>
        <nav className="flex-1 space-y-2">
           <button onClick={() => {setShowTasks(false); setShowLogs(false)}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${!showTasks && !showLogs ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}`}><MessageSquare size={18}/> {t.chat}</button>
           <button onClick={() => {setShowTasks(true); setShowLogs(false)}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${showTasks ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}`}><CheckSquare size={18}/> {t.autoTasks}</button>
           <button onClick={() => {setShowLogs(true); setShowTasks(false)}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${showLogs ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}`}><Terminal size={18}/> {t.sysLogs}</button>
           <button onClick={() => setShowTutorial(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:bg-zinc-800/50 transition"><BookOpen size={18}/> {t.tutorial}</button>
        </nav>
        <div className="mt-auto space-y-2 border-t border-zinc-800 pt-4">
           <button onClick={() => setHeartbeat(!heartbeat)} className={`w-full p-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${heartbeat ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'}`}>
             {heartbeat ? <Square size={16} fill="currentColor"/> : <Play size={16} fill="currentColor"/>} {heartbeat ? t.stopHeartbeat : t.startHeartbeat}
           </button>
           <button onClick={() => setSettingsOpen(true)} className="w-full p-3 rounded-xl bg-zinc-800 flex items-center justify-center gap-2 text-zinc-400 hover:bg-zinc-700 transition shadow-lg shadow-black/10"><SettingsIcon size={16}/> {t.settings}</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-zinc-950">
        <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6" style={{WebkitAppRegion:'drag'}}>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">{t.killSwitchInfo}</div>
          <div className="flex gap-1" style={{WebkitAppRegion:'no-drag'}}>
            {/* Minimize window */}
            <button
              onClick={() => window.electronAPI.minimizeWindow()}
              title="Thu nhỏ"
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded-lg transition text-zinc-400 hover:text-white"
            ><Minus size={14}/></button>
            {/* Minimize to tray */}
            <button
              onClick={() => window.electronAPI.hideToTray()}
              title="Thu vào khay hệ thống"
              className="w-8 h-8 flex items-center justify-center hover:bg-zinc-700 rounded-lg transition text-zinc-400 hover:text-white"
            ><ArrowDownToLine size={14}/></button>
            {/* Close = quit completely */}
            <button
              onClick={() => window.electronAPI.closeWindow()}
              title="Thoát"
              className="w-8 h-8 flex items-center justify-center hover:bg-rose-500 rounded-lg transition text-zinc-400 hover:text-white"
            ><X size={14}/></button>
          </div>
        </header>

        {showLogs ? (
          <div className="flex-1 overflow-y-auto p-6 bg-black font-mono text-xs text-emerald-500 space-y-1">
             <div className="text-zinc-500 mb-4 border-b border-zinc-800 pb-2 flex justify-between items-center uppercase tracking-tighter">
                <span>{t.systemLogsTitle}</span>
                <button onClick={() => setLogs([])} className="hover:text-rose-400 font-bold">Clear</button>
             </div>
             {logs.map((l, i) => <div key={i}>{l}</div>)}
             {logs.length === 0 && <div className="text-zinc-800">No system activity captured...</div>}
          </div>
        ) : showTasks ? (
          <TaskPanel heartbeat={heartbeat} toggleHeartbeat={() => setHeartbeat(!heartbeat)} t={t} settings={settings} />
        ) : (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gradient-to-b from-zinc-950 to-zinc-900/50">
              {messages
                .filter(m => {
                  // Hide internal tool output messages
                  if (m.content?.startsWith('[Tool Output')) return false;
                  // Hide system messages
                  if (m.role === 'system') return false;
                  // Hide raw tool_call XML messages (AI thinking/acting steps)
                  if (m.role === 'assistant' && m.content?.includes('<tool_call>')) return false;
                  // Hide empty messages
                  if (!m.content?.trim()) return false;
                  return true;
                })
                .map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl shadow-2xl ${m.role === 'user' ? 'bg-indigo-600 text-white ring-1 ring-white/10' : 'bg-zinc-900 border border-zinc-800 text-zinc-200'}`}>
                    <div className="text-sm whitespace-pre-wrap leading-relaxed break-words">{m.content}</div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-6">
              <div className="relative flex items-center bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 px-4 focus-within:border-indigo-500/40 focus-within:bg-zinc-900 transition-all shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder={t.askPlaceholder} className="flex-1 bg-transparent border-none outline-none text-sm py-3 placeholder:text-zinc-600" />
                <div className="flex items-center gap-2">
                   <button onClick={async () => { if(confirm(t.clearChat + '?')) { setMessages([]); setStatus('idle'); if (window.electronAPI) await window.electronAPI.clearMemory(); } }} className="p-2 text-zinc-600 hover:text-rose-400 transition" title={t.clearChat}><Trash2 size={18}/></button>
                   <button onClick={handleSend} className="bg-indigo-600 p-2 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20"><ChevronRight size={18}/></button>
                </div>
              </div>
              {status !== 'idle' && <div className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest mt-2 ml-2 flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div> {status}...</div>}
            </div>
          </div>
        )}
      </div>

      {settingsOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] w-full max-w-4xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)]">
            <div className="p-10 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/50">
               <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4"><SettingsIcon className="text-indigo-500" size={32} /> {t.smartSettings}</h2>
               <button onClick={() => setSettingsOpen(false)} className="p-3 hover:bg-zinc-800 rounded-2xl transition"><X size={28}/></button>
            </div>
            <div className="p-10 grid grid-cols-2 gap-12 max-h-[65vh] overflow-y-auto custom-scrollbar">
                {/* AI Provider + Model + API Key */}
               <div className="space-y-6">
                  {/* Provider Dropdown */}
                  <div>
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-3">{t.aiProvider}</label>
                    <select
                      value={settings.provider}
                      onChange={e => {
                        const p = e.target.value;
                        const defaultModel = PROVIDERS_CONFIG[p]?.defaultModel || '';
                        setSettings({...settings, provider: p, model: defaultModel});
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-indigo-500 transition shadow-xl"
                    >
                      {Object.keys(PROVIDERS_CONFIG).map(p => <option key={p} value={p}>{PROVIDERS_CONFIG[p].name}</option>)}
                    </select>
                  </div>

                  {/* Model - editable text + quick chips */}
                  <div>
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-3">{t.modelName}</label>
                    <input
                      value={settings.model || ''}
                      onChange={e => setSettings({...settings, model: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-indigo-500 transition shadow-xl font-mono"
                      placeholder="Model name..."
                    />
                    {/* Quick-pick chips */}
                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {/* If we fetched live models, show them; otherwise show defaults */}
                      {(fetchedModels.length > 0 ? fetchedModels : (PROVIDER_MODELS[settings.provider] || [])).map(m => (
                        <button key={m} onClick={() => setSettings({...settings, model: m})}
                          className={`text-[10px] px-2 py-1 rounded-lg border transition truncate max-w-[220px] ${
                            settings.model === m
                              ? 'bg-indigo-600/40 border-indigo-500/60 text-indigo-200 font-bold'
                              : 'border-zinc-700 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200 hover:border-zinc-500'
                          }`}
                          title={m}
                        >{m}</button>
                      ))}
                    </div>
                    {/* Fetch live models button - only for OpenRouter */}
                    {(settings.provider === 'openrouter' || settings.provider === 'meta') && (
                      <button
                        onClick={fetchOpenRouterModels}
                        disabled={fetchingModels}
                        className="mt-2 w-full text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {fetchingModels ? (
                          <><span className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block"></span> Đang tải...</>
                        ) : (
                          <> 🔄 Tải danh sách model mới nhất từ OpenRouter</>
                        )}
                      </button>
                    )}
                    {fetchedModels.length > 0 && (
                      <p className="text-[9px] text-emerald-500 mt-1">✓ Đã tải {fetchedModels.length} models — bấm vào chip để chọn</p>
                    )}
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] block mb-3">{t.apiKey}</label>
                    <input
                      type="password"
                      value={settings[`${settings.provider}Key`] || ''}
                      onChange={e => setSettings({...settings, [`${settings.provider}Key`]: e.target.value})}
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-2xl text-sm outline-none focus:border-indigo-500 transition shadow-xl"
                      placeholder={`${PROVIDERS_CONFIG[settings.provider]?.name} API Key`}
                    />
                    {settings.provider === 'meta' && (
                      <p className="text-[10px] text-zinc-600 mt-2">⚠ Meta Llama chạy qua OpenRouter — nhập OpenRouter API key.</p>
                    )}
                  </div>
               </div>

               {/* Bots & Language */}
               <div className="space-y-8 border-l border-zinc-800 pl-12">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.2em] block">{t.remoteControlBots}</label>
                    <div className="bg-zinc-950/30 p-6 rounded-3xl border border-zinc-800 space-y-5 shadow-inner">
                       <div className="space-y-3">
                         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-sky-500 rounded-full"></div> Telegram</p>
                         <input value={settings.telegramToken || ''} onChange={e => setSettings({...settings, telegramToken: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs outline-none focus:border-sky-500/50" placeholder="Token"/>
                         <input value={settings.telegramChatId || ''} onChange={e => setSettings({...settings, telegramChatId: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs outline-none focus:border-sky-500/50" placeholder="Chat ID"/>
                       </div>
                       <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                         <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2"><div className="w-1 h-1 bg-indigo-500 rounded-full"></div> Discord</p>
                         <input value={settings.discordToken || ''} onChange={e => setSettings({...settings, discordToken: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs outline-none focus:border-indigo-500/50" placeholder="Token"/>
                         <input value={settings.discordUserId || ''} onChange={e => setSettings({...settings, discordUserId: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs outline-none focus:border-indigo-500/50" placeholder="User ID"/>
                       </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 items-end">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em] block">{t.language}</label>
                      <select value={settings.language} onChange={e => setSettings({...settings, language: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-sm outline-none">
                         <option value="vi">Tiếng Việt</option>
                         <option value="en">English</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800 shadow-xl cursor-pointer hover:bg-zinc-900 transition" onClick={() => setSettings({...settings, autoLaunch: !settings.autoLaunch})}>
                      <div className={`w-4 h-4 rounded border ${settings.autoLaunch ? 'bg-indigo-500 border-indigo-400' : 'bg-zinc-800 border-zinc-700'}`}></div>
                      <span className="text-[10px] font-black text-zinc-500 uppercase">{t.runOnStartup}</span>
                    </div>
                  </div>
               </div>
            </div>
            <div className="p-10 bg-zinc-950 flex justify-between items-center border-t border-zinc-800">
               <button onClick={async () => { if(confirm(t.resetApp + '?')) { setMessages([]); setStatus('idle'); await window.electronAPI.resetSettings(); window.location.reload(); } }} className="text-rose-500 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-rose-500/10 px-6 py-3 rounded-2xl transition border border-transparent hover:border-rose-500/20">{t.resetApp}</button>
               <button onClick={() => { window.electronAPI.saveSettings(settings); setSettingsOpen(false); }} className="bg-indigo-600 text-white font-black uppercase tracking-widest px-20 py-5 rounded-3xl shadow-2xl shadow-indigo-600/40 hover:bg-indigo-500 transition active:scale-95 text-lg"> {t.saveSettings} </button>
            </div>
          </div>
        </div>
      )}

      {showOnboarding && <Onboarding onComplete={(n, l) => { const s = {...settings, userName: n, language: l}; setSettings(s); setShowOnboarding(false); window.electronAPI.saveSettings(s); }} />}
      {showTutorial && <Tutorial lang={settings.language} onClose={() => setShowTutorial(false)} />}
    </div>
  );
}

export default App;
