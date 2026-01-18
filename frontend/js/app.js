/* ====================================
   KANBAN BOARD - FULL LOGIC
   ==================================== */

// API Base URL (Port 8000 matches your backend configuration)
const API_URL = 'http://127.0.0.1:8000/tasks';

// DOM Elements
const todoColumn = document.getElementById('todoColumn');
const inprogressColumn = document.getElementById('inprogressColumn');
const doneColumn = document.getElementById('doneColumn');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const todoCount = document.getElementById('todoCount');
const inprogressCount = document.getElementById('inprogressCount');
const doneCount = document.getElementById('doneCount');

/* ====================================
   INITIALIZATION
   ==================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Kanban Board initialized');
    fetchTasks();
    setupEventListeners();
});

function setupEventListeners() {
    // Add Task Button
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addNewTask);
    }
    
    // Add Task on Enter Key Press
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewTask();
        });
    }
}

/* ====================================
   API FUNCTIONS (GET, POST, PUT, DELETE)
   ==================================== */

// 1. GET - Fetch All Tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        const tasks = await response.json();
        clearAllColumns();
        
        tasks.forEach(task => renderTask(task));
        updateTaskCounts(tasks);
        
    } catch (error) {
        console.error('❌ Error fetching tasks:', error);
        showError('Backend connection failed. Is Port 8000 open?');
    }
}

// 2. POST - Add New Task
async function addNewTask() {
    const title = taskInput.value.trim();
    if (!title) {
        alert("Please do not enter an empty task!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title })
        });

        if (response.ok) {
            taskInput.value = ''; // Clear input
            fetchTasks(); // Refresh list
        } else {
            console.error("Add failed:", await response.text());
        }
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

// 3. DELETE - Delete Task
async function deleteTask(id) {
    if(!confirm("Are you sure you want to delete this task?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            fetchTasks();
        } else {
            console.error("Delete failed:", await response.text());
        }
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// 4. PUT - Update Task Status
async function updateTaskStatus(id, newStatus) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            fetchTasks();
        } else {
            console.error("Update failed:", await response.text());
        }
    } catch (error) {
        console.error('Error updating status:', error);
    }
}

/* ====================================
   RENDER & HELPER FUNCTIONS
   ==================================== */

function renderTask(task) {
    const card = document.createElement('div');
    card.className = `task-card ${task.status}`;
    
    // Task Title
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    card.appendChild(title);
    
    // Action Buttons Container
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    // Status Buttons (Start / Complete)
    if (task.status === 'todo') {
        const startBtn = createButton('▶ Start', 'btn-start', () => updateTaskStatus(task.id, 'inprogress'));
        actions.appendChild(startBtn);
    } else if (task.status === 'inprogress') {
        const completeBtn = createButton('✓ Complete', 'btn-complete', () => updateTaskStatus(task.id, 'done'));
        actions.appendChild(completeBtn);
    }
    
    // Delete Button
    const deleteBtn = createButton('✕ Delete', 'btn-delete', () => deleteTask(task.id));
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);
    
    // Append to correct column
    const targetColumn = getColumnByStatus(task.status);
    if (targetColumn) targetColumn.appendChild(card);
}

// Button Creator Helper
function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.className = `task-btn ${className}`;
    button.textContent = text;
    button.onclick = onClick; 
    return button;
}

function getColumnByStatus(status) {
    const safeStatus = status ? status.toLowerCase().trim() : 'todo';

    if (safeStatus === 'todo') return todoColumn;
    if (safeStatus === 'inprogress') return inprogressColumn;
    if (safeStatus === 'done') return doneColumn;
    
    console.warn(`⚠️ Unknown status: "${status}", defaulting to 'To Do'`);
    return todoColumn;
}


function clearAllColumns() {
    if(todoColumn) todoColumn.innerHTML = '';
    if(inprogressColumn) inprogressColumn.innerHTML = '';
    if(doneColumn) doneColumn.innerHTML = '';
}

function updateTaskCounts(tasks) {
    const counts = { todo: 0, inprogress: 0, done: 0 };
    tasks.forEach(task => {
        if (counts[task.status] !== undefined) counts[task.status]++;
    });
    
    if(todoCount) todoCount.textContent = counts.todo;
    if(inprogressCount) inprogressCount.textContent = counts.inprogress;
    if(doneCount) doneCount.textContent = counts.done;
}

function showError(message) {
    console.error('ERROR:', message);
    const errDiv = document.createElement('div');
    errDiv.className = 'empty-state';
    errDiv.style.color = '#ef4444'; // Red color for error
    errDiv.textContent = message;
    if(todoColumn) todoColumn.appendChild(errDiv);
}