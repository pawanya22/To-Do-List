// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filters = document.querySelectorAll('.filter');
const searchInput = document.querySelector('.search-input');
const projectItems = document.querySelectorAll('.project-item');

// Sample tasks data
let tasks = JSON.parse(localStorage.getItem('tasks')) || [
    { id: 1, text: 'Create a Notion-style to-do list', completed: true, project: 'Personal Tasks' },
    { id: 2, text: 'Add dark mode toggle functionality', completed: false, project: 'Personal Tasks' },
    { id: 3, text: 'Implement local storage', completed: true, project: 'Personal Tasks' },
    { id: 4, text: 'Design responsive layout', completed: false, project: 'Personal Tasks' },
    { id: 5, text: 'Add task filtering options', completed: false, project: 'Personal Tasks' }
];

let currentFilter = 'All';
let currentProject = 'Personal Tasks';

// Initialize the app
function init() {
    loadTheme();
    renderTasks();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Theme toggle
    themeToggle.addEventListener('change', toggleTheme);
    
    // Add task
    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    // Task filters
    filters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            filters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            currentFilter = filter.textContent;
            renderTasks();
        });
    });
    
    // Project selection
    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            // Remove active class from all project items
            projectItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked project
            item.classList.add('active');
            currentProject = item.querySelector('span').textContent;
            document.querySelector('.content-header h2').textContent = currentProject;
            renderTasks();
        });
    });
    
    // Search functionality
    searchInput.addEventListener('input', () => {
        renderTasks();
    });
}

// Theme functions
function loadTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-theme', isDarkMode);
    themeToggle.checked = isDarkMode;
}

function toggleTheme() {
    const isDarkMode = themeToggle.checked;
    document.body.classList.toggle('dark-theme', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
}

// Task functions
function addTask() {
    const text = newTaskInput.value.trim();
    if (text === '') return;
    
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false,
        project: currentProject
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    newTaskInput.value = '';
    newTaskInput.focus();
}

function toggleTaskStatus(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function editTask(taskId, newText) {
    const task = tasks.find(task => task.id === taskId);
    if (task && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Render tasks
function renderTasks() {
    // Filter tasks by current project
    let filteredTasks = tasks.filter(task => task.project === currentProject);
    
    // Apply current filter
    if (currentFilter === 'Active') {
        filteredTasks = filteredTasks.filter(task => !task.completed);
    } else if (currentFilter === 'Completed') {
        filteredTasks = filteredTasks.filter(task => task.completed);
    }
    
    // Apply search filter
const searchTerm = searchInput.value.toLowerCase();
if (searchTerm) {
    filteredTasks = filteredTasks.filter(task => 
        task.text.toLowerCase().includes(searchTerm)
    );
}

    // Render tasks
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <h3>No tasks found</h3>
                <p>${currentFilter === 'All' ? 'Add a new task to get started' : 'No tasks match your filter'}</p>
            </div>
        `;
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                <i class="fas fa-check"></i>
            </div>
            <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn" data-id="${task.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        taskList.appendChild(taskElement);
    });
    
    // Add event listeners to new task elements
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const taskId = parseInt(checkbox.getAttribute('data-id'));
            toggleTaskStatus(taskId);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = parseInt(button.getAttribute('data-id'));
            deleteTask(taskId);
        });
    });
    
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const taskId = parseInt(button.getAttribute('data-id'));
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const newText = prompt('Edit your task:', task.text);
                if (newText !== null) {
                    editTask(taskId, newText);
                }
            }
        });
    });
}

// Initialize the application
init();