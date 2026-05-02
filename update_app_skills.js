const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Import SkillPanel
if (!code.includes('import SkillPanel')) {
  code = code.replace("import TaskPanel from './components/TaskPanel';", "import TaskPanel from './components/TaskPanel';\nimport SkillPanel from './components/SkillPanel';");
}

// 2. Add reload function
if (!code.includes('const reloadSkills = async () =>')) {
  const processInputFnIndex = code.indexOf('const processInput = async (');
  const reloadFn = `  const reloadSkills = async () => {
    const loadedSkills = await window.electronAPI.getSkills();
    if (loadedSkills) setSkills(loadedSkills);
  };

`;
  code = code.substring(0, processInputFnIndex) + reloadFn + code.substring(processInputFnIndex);
}

// 3. Render SkillPanel
const oldRender = `{showTasks ? (
          <TaskPanel tasks={tasks} setTasks={setTasks} />
        ) : showLogs ? (`;
const newRender = `{showTasks ? (
          <TaskPanel tasks={tasks} setTasks={setTasks} />
        ) : showSkills ? (
          <SkillPanel skills={skills} onReload={reloadSkills} />
        ) : showLogs ? (`;
code = code.replace(oldRender, newRender);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx updated with SkillPanel rendering');
