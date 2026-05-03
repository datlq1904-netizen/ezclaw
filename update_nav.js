const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. I18N
code = code.replace('tutorial: "Tutorial"', 'tutorial: "Tutorial", skills: "Custom Skills"');
code = code.replace('tutorial: "Hướng dẫn"', 'tutorial: "Hướng dẫn", skills: "Skill cộng đồng"');

// 2. Navigation buttons
const oldNav = `        <nav className="flex-1 space-y-2">
           <button onClick={() => {setShowTasks(false); setShowLogs(false)}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${!showTasks && !showLogs ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><MessageSquare size={18}/> {t.chat}</button>
           <button onClick={() => {setShowTasks(true); setShowLogs(false)}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${showTasks ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><CheckSquare size={18}/> {t.autoTasks}</button>
           <button onClick={() => {setShowLogs(true); setShowTasks(false)}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${showLogs ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><Terminal size={18}/> {t.sysLogs}</button>
           <button onClick={() => setShowTutorial(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:bg-zinc-800/50 transition"><BookOpen size={18}/> {t.tutorial}</button>
        </nav>`;

const newNav = `        <nav className="flex-1 space-y-2">
           <button onClick={() => {setShowTasks(false); setShowLogs(false); setShowSkills(false);}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${!showTasks && !showLogs && !showSkills ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><MessageSquare size={18}/> {t.chat}</button>
           <button onClick={() => {setShowTasks(true); setShowLogs(false); setShowSkills(false);}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${showTasks ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><CheckSquare size={18}/> {t.autoTasks}</button>
           <button onClick={() => {setShowSkills(true); setShowTasks(false); setShowLogs(false);}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${showSkills ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><Puzzle size={18}/> {t.skills}</button>
           <button onClick={() => {setShowLogs(true); setShowTasks(false); setShowSkills(false);}} className={\`w-full flex items-center gap-3 p-3 rounded-xl transition \${showLogs ? 'bg-zinc-800 text-white shadow-lg shadow-black/20' : 'text-zinc-500 hover:bg-zinc-800/50'}\`}><Terminal size={18}/> {t.sysLogs}</button>
           <button onClick={() => setShowTutorial(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:bg-zinc-800/50 transition"><BookOpen size={18}/> {t.tutorial}</button>
        </nav>`;

code = code.replace(oldNav, newNav);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('Nav fixed');
