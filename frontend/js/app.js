/* ====================================
   KANBAN BOARD - FULL LOGIC (WITH ALERTS FOR T-07)
   ==================================== */

// API Base URL
const API_URL = 'http://127.0.0.1:8000/tasks';

// DOM Elements
const todoColumn = document.getElementById('todoColumn');
const inprogressColumn = document.getElementById('inprogressColumn');
const doneColumn = document.getElementById('doneColumn');
const taskInput = document.getElementById('taskInput');
const taskDescription = document.getElementById('taskDescription');
const taskAssignee = document.getElementById('taskAssignee');
const addTaskBtn = document.getElementById('addTaskBtn');
const todoCount = document.getElementById('todoCount');
const inprogressCount = document.getElementById('inprogressCount');
const doneCount = document.getElementById('doneCount');

/* ====================================
   STATUS MAPPING (Backend ↔ Frontend)
   ==================================== */

function normalizeStatus(backendStatus) {
    const mapping = {
        'To Do': 'todo',
        'In Progress': 'inprogress',
        'Done': 'done'
    };
    return mapping[backendStatus] || 'todo';
}

function toBackendStatus(frontendStatus) {
    const mapping = {
        'todo': 'To Do',
        'inprogress': 'In Progress',
        'done': 'Done'
    };
    return mapping[frontendStatus] || 'To Do';
}

/* ====================================
   INITIALIZATION
   ==================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Kanban Board initialized');
    fetchTasks();
    setupEventListeners();
});

function setupEventListeners() {
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addNewTask);
    }
    
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addNewTask();
        });
    }
}

/* ====================================
   API FUNCTIONS
   ==================================== */

// 1. GET - Fetch All Tasks
async function fetchTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
        
        const tasks = await response.json();
        console.log('📥 Tasks fetched:', tasks);
        
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
    const description = taskDescription.value.trim();
    const assignee = taskAssignee.value.trim();
    
    // Validation
    if (!title) {
        alert("Please enter a task title!");
        taskInput.focus();
        return;
    }

    try {
        const requestBody = {
            title: title,
            description: description || "No description",
            assignee: assignee || "Unassigned"
        };
        
        console.log('📤 Creating task:', requestBody);
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            console.log('✅ Task added successfully');
            
            // Clear all form fields
            taskInput.value = '';
            taskDescription.value = '';
            taskAssignee.value = '';
            taskInput.focus();
            
            fetchTasks();
        } else {
            console.error("❌ Add failed:", await response.text());
            alert("Failed to add task. Server might be busy.");
        }
    } catch (error) {
        console.error('❌ Error adding task:', error);
        alert("Connection Error: Could not connect to the backend. Is the server running?");
    }
}

// 3. DELETE - Delete Task
async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            console.log(`✅ Task #${id} deleted`);
            fetchTasks();
        } else {
            console.error("❌ Delete failed:", await response.text());
            alert("Could not delete task.");
        }
    } catch (error) {
        console.error('❌ Error deleting task:', error);
        alert("Connection Error: Could not delete task. Please check your connection.");
    }
}

// 4. PATCH - Update Task Status
async function updateTaskStatus(id, newFrontendStatus) {
    const backendStatus = toBackendStatus(newFrontendStatus);
    
    console.log(`🔄 Updating task #${id}: ${newFrontendStatus} → ${backendStatus}`);
    
    try {
        const response = await fetch(`${API_URL}/${id}/status?status=${encodeURIComponent(backendStatus)}`, {
            method: 'PATCH'
        });

        if (response.ok) {
            console.log(`✅ Status updated successfully`);
            fetchTasks();
        } else {
            console.error("❌ Update failed:", await response.text());
            alert("Could not update task status.");
        }
    } catch (error) {
        console.error('❌ Error updating status:', error);
        alert("Connection Error: Could not update status. Changes may not be saved.");
    }
}

/* ====================================
   RENDER FUNCTIONS
   ==================================== */

function renderTask(task) {
    const normalizedStatus = normalizeStatus(task.status);
    
    const card = document.createElement('div');
    card.className = `task-card ${normalizedStatus}`;
    card.setAttribute('data-id', task.id);
    
    // Task Title
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    card.appendChild(title);
    
    // Task Metadata
    const metaContainer = document.createElement('div');
    metaContainer.className = 'task-meta';
    
    if (task.description && task.description !== 'No description') {
        const description = document.createElement('div');
        description.className = 'task-description';
        description.textContent = task.description;
        metaContainer.appendChild(description);
    }
    
    if (task.assignee && task.assignee !== 'Unassigned') {
        const assignee = document.createElement('div');
        assignee.className = 'task-assignee';
        assignee.innerHTML = `<strong>${task.assignee}</strong>`;
        metaContainer.appendChild(assignee);
    }
    
    if (metaContainer.children.length > 0) {
        card.appendChild(metaContainer);
    }
    
    // Action Buttons
    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    if (normalizedStatus === 'todo') {
        const startBtn = createButton('▶ Start', 'btn-start', () => {
            updateTaskStatus(task.id, 'inprogress');
        });
        actions.appendChild(startBtn);
    } else if (normalizedStatus === 'inprogress') {
        const completeBtn = createButton('✓ Complete', 'btn-complete', () => {
            updateTaskStatus(task.id, 'done');
        });
        actions.appendChild(completeBtn);
    }
    
    const deleteBtn = createButton('✕ Delete', 'btn-delete', () => {
        deleteTask(task.id);
    });
    actions.appendChild(deleteBtn);
    
    card.appendChild(actions);
    
    const targetColumn = getColumnByStatus(normalizedStatus);
    if (targetColumn) targetColumn.appendChild(card);
}

/* ====================================
   HELPER FUNCTIONS
   ==================================== */

function createButton(text, className, onClick) {
    const button = document.createElement('button');
    button.className = `task-btn ${className}`;
    button.textContent = text;
    button.onclick = onClick;
    return button;
}

function getColumnByStatus(status) {
    const columns = {
        'todo': todoColumn,
        'inprogress': inprogressColumn,
        'done': doneColumn
    };
    return columns[status] || todoColumn;
}

function clearAllColumns() {
    if (todoColumn) todoColumn.innerHTML = '';
    if (inprogressColumn) inprogressColumn.innerHTML = '';
    if (doneColumn) doneColumn.innerHTML = '';
}

function updateTaskCounts(tasks) {
    const counts = { todo: 0, inprogress: 0, done: 0 };
    
    tasks.forEach(task => {
        const normalized = normalizeStatus(task.status);
        if (counts[normalized] !== undefined) counts[normalized]++;
    });
    
    if (todoCount) todoCount.textContent = counts.todo;
    if (inprogressCount) inprogressCount.textContent = counts.inprogress;
    if (doneCount) doneCount.textContent = counts.done;
    
    if (counts.todo === 0) showEmptyState(todoColumn, 'No tasks yet');
    if (counts.inprogress === 0) showEmptyState(inprogressColumn, 'No tasks in progress');
    if (counts.done === 0) showEmptyState(doneColumn, 'No completed tasks');
}

function showEmptyState(column, message) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-state';
    emptyDiv.textContent = message;
    if (column) column.appendChild(emptyDiv);
}

function showError(message) {
    console.error('💥 ERROR:', message);
    const errDiv = document.createElement('div');
    errDiv.className = 'empty-state';
    errDiv.style.color = '#ef4444';
    errDiv.textContent = '⚠️ ' + message;
    if (todoColumn) todoColumn.appendChild(errDiv);
}