import React, { useState, useEffect } from 'react';
import { Play, Square, CheckSquare, Plus, Save, Trash2, Clock, Check, X } from 'lucide-react';

function TaskPanel({ heartbeat, toggleHeartbeat, t, settings }) {
  const [tasks, setTasks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Suggestions based on language
  const suggestions = settings?.language === 'en' 
    ? ["Clear Downloads folder", "Read today's news", "Empty Recycle Bin"]
    : ["Dọn dẹp thư mục Downloads", "Đọc tin tức hôm nay", "Dọn thùng rác"];

  const fetchTasks = async () => {
    if (window.electronAPI) {
      const data = await window.electronAPI.readTasks();
      if (Array.isArray(data)) {
        setTasks(data);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
    // Refresh periodically if heartbeat is active
    let interval;
    if (heartbeat) {
      interval = setInterval(fetchTasks, 10000); // UI poll every 10s to see updates
    }
    return () => {
      if (interval) clearInterval(interval);
    }
  }, [heartbeat]);

  const saveTasks = async () => {
    if (window.electronAPI) {
      setIsSaving(true);
      await window.electronAPI.updateTasks(tasks);
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }, 500);
    }
  };

  const updateTask = (id, field, value) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addTask = () => {
    const newTask = { id: Date.now().toString(), time: "", description: "", completed: false };
    setTasks([...tasks, newTask]);
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const addSuggestion = (text) => {
    // Find the first empty task
    const emptyIndex = tasks.findIndex(t => t.description.trim() === "");
    if (emptyIndex !== -1) {
      const newTasks = [...tasks];
      newTasks[emptyIndex].description = text;
      // Set time to current time + 2 mins for quick demo
      const d = new Date();
      d.setMinutes(d.getMinutes() + 2);
      newTasks[emptyIndex].time = d.toTimeString().substring(0, 5);
      setTasks(newTasks);
    } else {
      // Create new
      const d = new Date();
      d.setMinutes(d.getMinutes() + 2);
      const newTask = { id: Date.now().toString(), time: d.toTimeString().substring(0, 5), description: text, completed: false };
      setTasks([...tasks, newTask]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border-l border-zinc-800 w-full lg:w-[450px]">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
        <h2 className="font-bold text-zinc-100 flex items-center gap-2">
          <CheckSquare size={18} className="text-indigo-400" /> {t.autoTasks || "Auto Tasks"}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={saveTasks}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${saveSuccess ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
            title="Save Tasks">
            {saveSuccess ? <Check size={14} /> : <Save size={14} />} 
            {saveSuccess ? (t.taskSaved || "Saved") : (t.saveSettings || "Save")}
          </button>
        </div>
      </div>

      <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex flex-col gap-3">
        <p className="text-xs text-zinc-400 leading-relaxed">
          {t.taskBanner}
        </p>
        <button 
          onClick={toggleHeartbeat}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold uppercase tracking-wider transition ${heartbeat ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>
          {heartbeat ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          {heartbeat ? t.stopHeartbeat : t.startHeartbeat}
        </button>
        {heartbeat && (
          <div className="flex items-center justify-center gap-2 text-xs text-emerald-400 animate-pulse font-mono mt-1">
            <div className="w-2 h-2 bg-emerald-400 rounded-full"></div> {t.taskMonitoring}
          </div>
        )}
      </div>

      <div className="p-3 border-b border-zinc-800 bg-zinc-900/30 flex gap-2 overflow-x-auto custom-scrollbar whitespace-nowrap">
        {suggestions.map((sug, i) => (
          <button key={i} onClick={() => addSuggestion(sug)} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-full transition border border-zinc-700">
            + {sug}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col gap-3">
        {tasks.map((task, index) => (
          <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border transition ${task.completed ? 'bg-emerald-950/20 border-emerald-900/30 opacity-70' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}>
            <div className="pt-1">
              {task.completed ? (
                <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                  <Check size={14} strokeWidth={3} />
                </div>
              ) : (
                <div className="w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800"></div>
              )}
            </div>
            
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <div className="relative">
                  <Clock size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="time" 
                    value={task.time}
                    onChange={(e) => updateTask(task.id, 'time', e.target.value)}
                    disabled={task.completed}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg py-1.5 pl-8 pr-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
                <button onClick={() => removeTask(task.id)} className="ml-auto text-zinc-500 hover:text-rose-400 transition p-1">
                  <X size={16} />
                </button>
              </div>
              <input 
                type="text" 
                value={task.description}
                onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                placeholder={t.taskPlaceholder}
                disabled={task.completed}
                className="w-full bg-transparent border-b border-zinc-800 focus:border-indigo-500 py-1 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition disabled:opacity-50"
              />
            </div>
          </div>
        ))}

        <button 
          onClick={addTask}
          className="w-full py-3 rounded-xl border border-dashed border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 hover:bg-zinc-800/50 transition flex items-center justify-center gap-2 text-sm font-medium mt-2">
          <Plus size={16} /> {t.addTask}
        </button>
        <div className="h-4"></div>
      </div>
    </div>
  );
}

export default TaskPanel;
