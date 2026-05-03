const fs = require('fs');
let code = fs.readFileSync('src/components/Tutorial.jsx', 'utf8');

// Add Puzzle import
code = code.replace("import { X, ChevronLeft, Key, Clock, Smartphone, Zap, ExternalLink, CheckCircle2 } from 'lucide-react';", 
                    "import { X, ChevronLeft, Key, Clock, Smartphone, Zap, ExternalLink, CheckCircle2, Puzzle } from 'lucide-react';");

// Add I18N
code = code.replace("catSkills: isVi ? \"Danh sách 26+ Kỹ năng\" : \"EZClaw Skill List\",",
                    "catSkills: isVi ? \"Danh sách 26+ Kỹ năng\" : \"EZClaw Skill List\",\n    catCustomSkills: isVi ? \"Cài đặt Custom Skills\" : \"Custom Skills Setup\",");

// Add menu button
const newMenuButton = `      <button onClick={() => setCategory('custom_skills')} className="bg-zinc-800/50 hover:bg-fuchsia-600/20 border border-zinc-700 hover:border-fuchsia-500 p-6 rounded-3xl transition group text-left">
        <Puzzle className="text-fuchsia-400 mb-4 group-hover:scale-110 transition" size={32} />
        <h3 className="font-bold text-white text-lg">{t.catCustomSkills}</h3>
        <p className="text-zinc-500 text-sm mt-1">{isVi ? "Thêm plugin từ cộng đồng." : "Add community plugins."}</p>
      </button>
    </div>`;
code = code.replace("</div>\n  );", newMenuButton + "\n  );");

// Add render function
const customSkillsGuide = `
  const renderCustomSkillsGuide = () => (
    <div className="text-left space-y-6 animate-in slide-in-from-right-4 duration-300 h-full overflow-y-auto custom-scrollbar pr-2">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Puzzle className="text-fuchsia-400" /> {t.catCustomSkills}</h2>
      <div className="space-y-4">
        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
          <h4 className="font-bold text-zinc-100 mb-2">{isVi ? "Bước 1: Tải Skill" : "Step 1: Download Skill"}</h4>
          <p className="text-sm text-zinc-400">{isVi ? "Tải thư mục chứa mã nguồn của skill (phải có schema.json và index.js)." : "Download the skill folder containing schema.json and index.js."}</p>
        </div>
        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
          <h4 className="font-bold text-zinc-100 mb-2">{isVi ? "Bước 2: Cài đặt" : "Step 2: Installation"}</h4>
          <p className="text-sm text-zinc-400">
            {isVi ? "1. Bấm tổ hợp phím Win + R, nhập: " : "1. Press Win + R, type: "} 
            <code className="text-fuchsia-400 ml-1">%APPDATA%\\ezclaw-agent\\custom_skills\\</code>
          </p>
          <p className="text-sm text-zinc-400 mt-2">{isVi ? "2. Copy thư mục skill vừa tải vào đây." : "2. Copy the downloaded skill folder here."}</p>
        </div>
        <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800">
          <h4 className="font-bold text-zinc-100 mb-2">{isVi ? "Bước 3: Tải lại (Reload)" : "Step 3: Reload"}</h4>
          <p className="text-sm text-zinc-400">{isVi ? "Vào menu 'Skill cộng đồng' trên thanh bên trái và bấm 'Reload Skills' để AI cập nhật khả năng mới." : "Go to the 'Custom Skills' menu on the left sidebar and click 'Reload Skills' to update AI capabilities."}</p>
        </div>
      </div>
    </div>
  );
`;

const renderSkillsListIdx = code.indexOf("const renderSkillsList = () => (");
code = code.substring(0, renderSkillsListIdx) + customSkillsGuide + "\n  " + code.substring(renderSkillsListIdx);

// Add to switch
const switchTarget = "{category === 'skills' && renderSkillsList()}";
code = code.replace(switchTarget, switchTarget + "\n          {category === 'custom_skills' && renderCustomSkillsGuide()}");

fs.writeFileSync('src/components/Tutorial.jsx', code, 'utf8');
console.log('Tutorial updated');
