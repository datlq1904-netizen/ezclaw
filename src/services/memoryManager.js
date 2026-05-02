const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let memoryFilePath = '';

function initMemoryFile() {
  const userDataPath = app.getPath('userData');
  memoryFilePath = path.join(userDataPath, 'memory.json');

  if (!fs.existsSync(memoryFilePath)) {
    fs.writeFileSync(memoryFilePath, JSON.stringify([], null, 2), 'utf8');
  }
}

function getMemory() {
  if (!memoryFilePath) initMemoryFile();
  try {
    const data = fs.readFileSync(memoryFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading memory.json:', error);
    return [];
  }
}

function saveMemory(entry) {
  if (!memoryFilePath) initMemoryFile();
  try {
    const memory = getMemory();
    memory.push(entry);
    // Limit memory to last 100 messages to avoid huge files
    const limitedMemory = memory.slice(-100);
    fs.writeFileSync(memoryFilePath, JSON.stringify(limitedMemory, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing memory.json:', error);
    return false;
  }
}

function deleteMemory() {
  if (!memoryFilePath) initMemoryFile();
  try {
    fs.writeFileSync(memoryFilePath, JSON.stringify([], null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error deleting memory.json:', error);
    return false;
  }
}

module.exports = {
  getMemory,
  saveMemory,
  deleteMemory
};
