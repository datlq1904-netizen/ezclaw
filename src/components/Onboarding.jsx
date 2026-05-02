import React, { useState } from 'react';
import { User, Globe, Check, ChevronRight } from 'lucide-react';

function Onboarding({ onComplete }) {
  const [name, setName] = useState('');
  const [lang, setLang] = useState('en');

  const handleComplete = () => {
    if (!name.trim()) return;
    onComplete(name, lang);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleComplete();
    }
  };

  const text = {
    en: {
      title: "Welcome to EZClaw!",
      desc: "Before we begin, how should I address you?",
      input: "Enter your name...",
      lang: "Language",
      start: "Get Started"
    },
    vi: {
      title: "Chào mừng đến với EZClaw!",
      desc: "Trước khi bắt đầu, tôi nên xưng hô với bạn là gì?",
      input: "Nhập tên của bạn...",
      lang: "Ngôn ngữ",
      start: "Bắt đầu sử dụng"
    }
  };

  const t = text[lang];

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-6 no-drag">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md shadow-2xl flex flex-col items-center text-center relative overflow-hidden transition-all duration-500">
        
        <div className="flex flex-col items-center w-full mt-2 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/30">
            <User size={40} className="text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{t.title}</h2>
          <p className="text-zinc-400 text-sm mb-8">{t.desc}</p>
          
          <div className="w-full flex flex-col gap-4">
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.input}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none transition"
                autoFocus
              />
            </div>

            <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-700 rounded-xl p-2">
              <Globe size={18} className="text-zinc-400 ml-2" />
              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-white outline-none flex-1 py-1 cursor-pointer"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          onClick={handleComplete}
          disabled={!name.trim()}
          className="mt-10 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
        >
          <Check size={18} /> {t.start}
        </button>
      </div>
    </div>
  );
}

export default Onboarding;
