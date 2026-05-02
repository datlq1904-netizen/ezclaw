<img width="275" height="153" alt="Gemini_Generated_Image_6djghj6djghj6djg" src="https://github.com/user-attachments/assets/752e93d0-51e4-4838-b021-0d05f51c8048" />

  <p><strong>Let AI take the wheel. EZClaw physically controls your PC, automating tasks while you sit back and relax.</strong></p>
 
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
 
  [![Platform](https://img.shields.io/badge/Platform-Windows-blue.svg)](#)
 
  [![Electron](https://img.shields.io/badge/Electron-Latest-brightgreen.svg)](#)
</div>

---

## 🌟 What is EZClaw?
**EZClaw** is a powerful, production-ready desktop application that turns any modern LLM into an **autonomous agent capable of physically operating a Windows PC**. 

Instead of just chatting with an AI, you can tell EZClaw to "Open Chrome, search for the latest news on VNExpress, and summarize it for me" — and watch as it takes screenshots, calculates coordinates, moves your mouse, and types on your keyboard, all by itself!

---

## ✨ Key Features

- 👁️ **Computer Vision Enabled**: EZClaw takes intelligent screenshots to understand your screen layout before making any moves.
- 🖱️ **Physical OS Control**: Native automation for mouse movements, clicks, dragging, and full keyboard combos (including Windows, Alt, Ctrl, and F1-F12 keys).
- 🧠 **Dynamic AI Brains**: Connects seamlessly with over 300+ LLMs via direct APIs or OpenRouter.
  - *Vision-capable models* (GPT-4o, Gemini 3.1 Pro, Claude 3.5 Sonnet) utilize screenshots for precise navigation.
  - *Text-only models* (DeepSeek, Llama 4, Grok) navigate blindly using estimated coordinates and system shortcuts!
- ⚡ **Autonomous Heartbeat Loop**: Schedule tasks for the future. EZClaw wakes up, completes the task on your PC, and goes back to sleep.
- 🛡️ **Built-in Kill Switch**: Press `Ctrl+Shift+K` at any time to instantly stop all AI actions and regain manual control.
- 💬 **Clean UX**: A sleek, dark-themed dashboard that filters out noisy tool logs, showing you only the clean conversation history.

---

## 🛠️ Technology Stack
- **Frontend**: React + Vite + TailwindCSS
- **Backend/Desktop Core**: Electron.js
- **OS Automation**: Node.js + Native PowerShell interop (for exact coordinate clicking and bypassing standard API limits)
- **State Management**: Local `electron-store` (zero-database requirement)

---

## 🚀 Getting Started

### 1. Prerequisites
- **OS**: Windows 10 / Windows 11
- **Node.js**: v18 or higher

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/datlq1904-netizen/ezclaw
cd EZClaw

# Install dependencies
npm install

# Start the application in development mode
npm run electron:dev
```

### 3. Build for Production
To package the app into a standalone `.exe` installer:
```bash
npm run electron:build
```
You will find the installer in the `dist` folder.

---

## ⚙️ How It Works
1. **User Request**: You ask EZClaw to do something (e.g., "Open Notepad and code "Hello World").
2. **Context Gathering**: If using a vision model, EZClaw silently captures your screen and feeds it to the LLM.
3. **Execution**: The AI outputs specific tool calls (`<tool_call><name>simulateMouse</name><arg>...</arg></tool_call>`).
4. **Action**: The Electron backend translates these calls into native Windows PowerShell scripts to physically move your cursor and type.
5. **Verification**: The AI takes another screenshot to verify the action was successful before proceeding to the next step.

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ☕ Support & Donate
Building an autonomous AI agent takes countless hours of coding, testing, and coffee! If EZClaw has saved you time, automated your boring tasks, or you just want to support future development, please consider donating.

**Donate via Crypto (USDT - BEP20):**
> `0xe573a07e808b1c3907fb31b4058598a752abf35e`

*Every contribution helps keep this project alive and updated with the latest AI models! ❤️*

---

<div align="center">
  <i>"The future of PC automation is autonomous."</i>
</div>
