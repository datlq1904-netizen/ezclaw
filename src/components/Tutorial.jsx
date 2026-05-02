import React, { useState } from 'react';
import { X, ChevronLeft, Key, Clock, Smartphone, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';

function Tutorial({ onClose, lang }) {
  const [category, setCategory] = useState(null); 

  const isVi = lang === 'vi';

  const t = {
    title: isVi ? "Học viện EZClaw" : "EZClaw Academy",
    subtitle: isVi ? "Hướng dẫn làm chủ đặc vụ AI của bạn từ A-Z" : "Learn how to master your autonomous desktop agent",
    catApi: isVi ? "Cài đặt API Keys" : "API Keys Setup",
    catTasks: isVi ? "Auto Tasks & Heartbeat" : "Auto Tasks & Heartbeat",
    catBots: isVi ? "Điều khiển Telegram & Discord" : "Telegram & Discord Bots",
    catSkills: isVi ? "Danh sách 26+ Kỹ năng" : "EZClaw Skill List",
    back: isVi ? "Quay lại Menu" : "Back to Menu",
    close: isVi ? "Đóng hướng dẫn" : "Close Academy"
  };

  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-in fade-in zoom-in duration-300">
      <button onClick={() => setCategory('api')} className="bg-zinc-800/50 hover:bg-indigo-600/20 border border-zinc-700 hover:border-indigo-500 p-6 rounded-3xl transition group text-left">
        <Key className="text-indigo-400 mb-4 group-hover:scale-110 transition" size={32} />
        <h3 className="font-bold text-white text-lg">{t.catApi}</h3>
        <p className="text-zinc-500 text-sm mt-1">{isVi ? "Cài đặt Gemini, OpenAI, Anthropic..." : "Setup Gemini, OpenAI, Anthropic..."}</p>
      </button>
      <button onClick={() => setCategory('tasks')} className="bg-zinc-800/50 hover:bg-emerald-600/20 border border-zinc-700 hover:border-emerald-500 p-6 rounded-3xl transition group text-left">
        <Clock className="text-emerald-400 mb-4 group-hover:scale-110 transition" size={32} />
        <h3 className="font-bold text-white text-lg">{t.catTasks}</h3>
        <p className="text-zinc-500 text-sm mt-1">{isVi ? "Lập lịch nhiệm vụ tự động." : "Autonomous scheduling & pulses."}</p>
      </button>
      <button onClick={() => setCategory('bots')} className="bg-zinc-800/50 hover:bg-sky-600/20 border border-zinc-700 hover:border-sky-500 p-6 rounded-3xl transition group text-left">
        <Smartphone className="text-sky-400 mb-4 group-hover:scale-110 transition" size={32} />
        <h3 className="font-bold text-white text-lg">{t.catBots}</h3>
        <p className="text-zinc-500 text-sm mt-1">{isVi ? "Điều khiển từ xa qua điện thoại." : "Remote control via your phone."}</p>
      </button>
      <button onClick={() => setCategory('skills')} className="bg-zinc-800/50 hover:bg-amber-600/20 border border-zinc-700 hover:border-amber-500 p-6 rounded-3xl transition group text-left">
        <Zap className="text-amber-400 mb-4 group-hover:scale-110 transition" size={32} />
        <h3 className="font-bold text-white text-lg">{t.catSkills}</h3>
        <p className="text-zinc-500 text-sm mt-1">{isVi ? "Trình duyệt, Tệp tin, Hệ thống & Thị giác." : "Browser, Files, System & Vision."}</p>
      </button>
    </div>
  );

  const renderApiGuide = () => (
    <div className="text-left space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Key className="text-indigo-400" /> {t.catApi}</h2>
      <div className="space-y-4">
        {[
          { 
            title: isVi ? "Bước 1: Lấy API Key" : "Step 1: Get your API Key", 
            desc: isVi ? "Truy cập Google AI Studio (Gemini) hoặc OpenAI Dashboard để tạo key mới." : "Go to Google AI Studio (Gemini) or OpenAI Dashboard and create a new key.", 
            link: "https://aistudio.google.com/" 
          },
          { 
            title: isVi ? "Bước 2: Mở Cài đặt" : "Step 2: Open Settings", 
            desc: isVi ? "Bấm vào biểu tượng Bánh răng ở thanh bên trái của EZClaw." : "Click the Gear icon in the sidebar of EZClaw.", 
            icon: <CheckCircle2 size={16} className="text-emerald-500"/> 
          },
          { 
            title: isVi ? "Bước 3: Dán & Lưu" : "Step 3: Paste & Save", 
            desc: isVi ? "Dán key vào ô tương ứng, chọn Model và bấm 'Lưu cài đặt'." : "Paste your key into the corresponding field and click 'Save Settings'.", 
            icon: <CheckCircle2 size={16} className="text-emerald-500"/> 
          }
        ].map((item, i) => (
          <div key={i} className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
            <h4 className="font-bold text-zinc-100 flex items-center gap-2">{item.icon} {item.title}</h4>
            <p className="text-sm text-zinc-400 mt-1">{item.desc}</p>
            {item.link && <a href={item.link} target="_blank" className="text-indigo-400 text-xs mt-2 flex items-center gap-1 hover:underline">{isVi ? "Truy cập trang web" : "Visit Site"} <ExternalLink size={12}/></a>}
          </div>
        ))}
      </div>
    </div>
  );

  const renderTasksGuide = () => (
    <div className="text-left space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Clock className="text-emerald-400" /> {t.catTasks}</h2>
      <div className="space-y-4">
        {[
          { title: isVi ? "Bước 1: Mở Nhiệm vụ" : "Step 1: Open Auto Tasks", desc: isVi ? "Bấm vào biểu tượng tích (v) ở thanh bên." : "Click the 'Check' icon in the sidebar." },
          { title: isVi ? "Bước 2: Thêm việc (+)" : "Step 2: Add Task (+)", desc: isVi ? "Bấm vào nút có dấu cộng ở dưới để thêm nhiệm vụ." : "Click the plus button at the bottom to add a new task row." },
          { title: isVi ? "Bước 3: Hẹn giờ" : "Step 3: Schedule Time", desc: isVi ? "Nhập thời gian (Giờ:Phút) và mô tả việc AI cần làm." : "Input the time (HH:mm) and describe what the AI should do." },
          { title: isVi ? "Bước 4: Bật Heartbeat" : "Step 4: Start Heartbeat", desc: isVi ? "Bấm nút 'Bật Heartbeat'. AI sẽ tự động quét và làm việc mỗi 30 giây." : "Click 'Start Heartbeat'. The AI will now scan your tasks every 30s." }
        ].map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold mt-1 shrink-0">{i+1}</div>
            <div>
              <h4 className="font-bold text-zinc-100">{item.title}</h4>
              <p className="text-sm text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBotsGuide = () => (
    <div className="text-left space-y-6 animate-in slide-in-from-right-4 duration-300">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Smartphone className="text-sky-400" /> {t.catBots}</h2>
      <div className="space-y-4">
        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
          <h4 className="font-bold text-sky-400 uppercase text-xs mb-2">Telegram Setup</h4>
          <p className="text-sm text-zinc-300">{isVi ? "1. Chat với @BotFather để tạo bot và lấy Token." : "1. Talk to @BotFather to create a bot and get a Token."}</p>
          <p className="text-sm text-zinc-300">{isVi ? "2. Chat với @userinfobot để lấy Chat ID của bạn." : "2. Message @userinfobot to get your Chat ID."}</p>
          <p className="text-sm text-zinc-300">{isVi ? "3. Nhập cả hai vào Cài đặt EZClaw và Lưu." : "3. Enter both into EZClaw Settings and Save."}</p>
        </div>
        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
          <h4 className="font-bold text-indigo-400 uppercase text-xs mb-2">Discord Setup</h4>
          <p className="text-sm text-zinc-300">{isVi ? "1. Truy cập Discord Developer Portal, tạo App & Bot." : "1. Go to Discord Developer Portal, create an App & Bot."}</p>
          <p className="text-sm text-zinc-300">{isVi ? "2. Copy Bot Token và User ID của bạn." : "2. Copy the Bot Token and your User ID."}</p>
          <p className="text-sm text-zinc-300">{isVi ? "3. Dán vào Cài đặt và khởi động lại EZClaw." : "3. Paste into Settings and restart EZClaw."}</p>
        </div>
      </div>
    </div>
  );

  const renderSkillsList = () => (
    <div className="text-left space-y-6 animate-in slide-in-from-right-4 duration-300 h-full overflow-y-auto custom-scrollbar pr-2">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Zap className="text-amber-400" /> {t.catSkills}</h2>
      <div className="space-y-4">
        {[
          { cat: isVi ? "Hệ thống Tệp tin" : "File System", list: "readFile, writeFile, appendFile, deleteFile, listDir, createDir, moveFile." },
          { cat: isVi ? "Điều khiển Hệ thống" : "System Control", list: "runShell, getSystemInfo, listProcesses." },
          { cat: isVi ? "Thị giác & Mô phỏng" : "Vision & Human Sim", list: "takeScreenshot, getScreenSize, simulateMouse, simulateKeyboard." },
          { cat: isVi ? "Trình duyệt & Tìm kiếm" : "Browser & Search", list: "Navigate, Click, Type, Scroll, SearchWeb (Google Search)." }
        ].map((item, i) => (
          <div key={i} className="border-l-2 border-amber-500/30 pl-4 py-1">
            <h4 className="text-amber-400 font-bold text-sm uppercase">{item.cat}</h4>
            <p className="text-xs text-zinc-400 font-mono mt-1">{item.list}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[200] bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-10 w-full max-w-2xl h-[85vh] shadow-2xl flex flex-col relative overflow-hidden">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter">{category ? t.back : t.title}</h1>
            <p className="text-zinc-500 mt-1">{category ? (isVi ? "Hướng dẫn chi tiết từng bước" : "Step-by-step guide") : t.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-zinc-800 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-500 rounded-2xl transition">
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {!category && renderMenu()}
          {category === 'api' && renderApiGuide()}
          {category === 'tasks' && renderTasksGuide()}
          {category === 'bots' && renderBotsGuide()}
          {category === 'skills' && renderSkillsList()}
        </div>
        {category && (
          <button onClick={() => setCategory(null)} className="mt-8 w-fit bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-8 rounded-2xl flex items-center gap-2 transition border border-zinc-700">
            <ChevronLeft size={20} /> {t.back}
          </button>
        )}
      </div>
    </div>
  );
}

export default Tutorial;
