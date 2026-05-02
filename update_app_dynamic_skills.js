const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Inject Dynamic Skills into System Prompt
const promptInjectionMarker = "let sysPrompt = SYSTEM_PROMPT\n      .replace('[USER_NAME]', currentSettings.userName || '')\n      .replace('[LANGUAGE]', currentSettings.language === 'vi' ? 'Vietnamese' : 'English');";

const promptInjectionAdd = `
    let dynamicToolsText = "";
    if (skillsRef.current && skillsRef.current.length > 0) {
      dynamicToolsText = "\\n\\n## DYNAMIC COMMUNITY SKILLS (Format: <tool_call><name>SKILL_NAME</name><args>JSON_STRING_OF_ARGS</args></tool_call>):\\n";
      skillsRef.current.forEach(s => {
         dynamicToolsText += \`SKILL: \${s.name} - \${s.description}\\nArgs JSON Schema: \${JSON.stringify(s.parameters || {})}\\n\`;
      });
    }
    
    let sysPrompt = SYSTEM_PROMPT
      .replace('[USER_NAME]', currentSettings.userName || '')
      .replace('[LANGUAGE]', currentSettings.language === 'vi' ? 'Vietnamese' : 'English') + dynamicToolsText;
`;

code = code.replace(promptInjectionMarker, promptInjectionAdd);

// Add skillsRef to avoid stale closure
code = code.replace("const statusRef = useRef(status);", "const statusRef = useRef(status);\n  const skillsRef = useRef(skills);");
code = code.replace("useEffect(() => { statusRef.current = status; }, [status]);", "useEffect(() => { statusRef.current = status; }, [status]);\n  useEffect(() => { skillsRef.current = skills; }, [skills]);");

// 2. Inject Dynamic Skill Execution
const executionMarker = "else if (name === 'searchWeb')         out = await window.electronAPI.searchWeb(body.match(/<query>([\\s\\S]*?)<\\/query>/)?.[1]?.trim());";

const executionAdd = `else if (name === 'searchWeb')         out = await window.electronAPI.searchWeb(body.match(/<query>([\\s\\S]*?)<\\/query>/)?.[1]?.trim());
              else if (skillsRef.current.find(s => s.name === name)) {
                 const argsM = body.match(/<args>([\\s\\S]*?)<\\/args>/);
                 out = await window.electronAPI.executeSkill(name, argsM ? argsM[1].trim() : '');
              }`;

code = code.replace(executionMarker, executionAdd);

fs.writeFileSync('src/App.jsx', code, 'utf8');
console.log('App.jsx updated with dynamic skill injection and execution');
