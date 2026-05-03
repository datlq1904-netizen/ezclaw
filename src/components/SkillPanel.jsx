import React from 'react';
import { Puzzle, FolderOpen, RefreshCcw } from 'lucide-react';

function SkillPanel({ skills, onReload }) {
  return (
    <div className="flex-1 bg-zinc-950 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
              <Puzzle size={24} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Community Skills</h2>
              <p className="text-zinc-400">Load dynamic tools from OpenClaw community.</p>
            </div>
          </div>
          <button 
            onClick={onReload}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition"
          >
            <RefreshCcw size={16} /> Reload Skills
          </button>
        </div>

        {skills && skills.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex flex-col gap-3 hover:border-indigo-500/50 transition">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Puzzle size={14} className="text-zinc-300" />
                  </div>
                  <h3 className="font-bold text-white text-lg">{skill.name}</h3>
                </div>
                <p className="text-zinc-400 text-sm flex-1">{skill.description}</p>
                
                <div className="pt-3 border-t border-zinc-800 mt-2">
                  <h4 className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Parameters</h4>
                  {skill.parameters?.properties ? (
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(skill.parameters.properties).map(p => (
                        <span key={p} className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">
                          {p} {skill.parameters.required?.includes(p) && <span className="text-rose-400">*</span>}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-600">No parameters</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No custom skills loaded</h3>
            <p className="text-zinc-400 max-w-md">
              Download OpenClaw skills and place them in the <code>userData/custom_skills/</code> directory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillPanel;
