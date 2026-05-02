const fs = require('fs');
const path = require('path');
const { app } = require('electron');

let tasksFilePath = '';

function initTasksFile() {
  const userDataPath = app.getPath('userData');
  tasksFilePath = path.join(userDataPath, 'tasks.json');

  if (!fs.existsSync(tasksFilePath)) {
    const template = [
      { id: Date.now().toString() + "-1", time: "", description: "", completed: false },
      { id: Date.now().toString() + "-2", time: "", description: "", completed: false },
      { id: Date.now().toString() + "-3", time: "", description: "", completed: false }
    ];
    fs.writeFileSync(tasksFilePath, JSON.stringify(template, null, 2), 'utf8');
  }
}

function readTasks() {
  if (!tasksFilePath) initTasksFile();
  try {
    const data = fs.readFileSync(tasksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading tasks.json:', error);
    return [];
  }
}

function updateTasks(tasksArray) {
  if (!tasksFilePath) initTasksFile();
  try {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasksArray, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing tasks.json:', error);
    return false;
  }
}

function markTaskCompleted(taskId) {
  const tasks = readTasks();
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = true;
    updateTasks(tasks);
    return true;
  }
  return false;
}

module.exports = {
  initTasksFile,
  readTasks,
  updateTasks,
  markTaskCompleted
};
