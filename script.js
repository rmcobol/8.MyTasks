// ===== 데이터 레이어 =====

const STORAGE_KEY = 'todos';

function loadTodos() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function addTodo(title, category) {
  const todos = loadTodos();
  const todo = {
    id: generateId(),
    title,
    category,
    completed: false,
    createdAt: Date.now(),
  };
  todos.push(todo);
  saveTodos(todos);
  return todo;
}

function updateTodo(id, changes) {
  const todos = loadTodos();
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;
  todos[index] = { ...todos[index], ...changes };
  saveTodos(todos);
  return todos[index];
}

function deleteTodo(id) {
  const todos = loadTodos();
  const filtered = todos.filter((todo) => todo.id !== id);
  saveTodos(filtered);
  return filtered;
}

function toggleComplete(id) {
  const todos = loadTodos();
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) return null;
  todos[index].completed = !todos[index].completed;
  saveTodos(todos);
  return todos[index];
}

// ===== 렌더 레이어 =====

let todos = [];
let editingId = null;

const todoListEl = document.querySelector('.todo-list');
const todoInputEl = document.querySelector('.todo-input');
const categorySelectEl = document.querySelector('.category-select');
const addBtnEl = document.querySelector('.add-btn');

function render() {
  todos = loadTodos();
  todoListEl.innerHTML = '';

  if (todos.length === 0) {
    const emptyEl = document.createElement('li');
    emptyEl.className = 'empty-message';
    emptyEl.textContent = '할 일이 없습니다';
    todoListEl.appendChild(emptyEl);
    return;
  }

  todos.forEach((todo) => {
    const itemEl =
      todo.id === editingId ? createEditItem(todo) : createTodoItem(todo);
    todoListEl.appendChild(itemEl);
  });
}

function createTodoItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item' + (todo.completed ? ' completed' : '');
  li.dataset.id = todo.id;

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'todo-checkbox';
  checkbox.checked = todo.completed;
  checkbox.addEventListener('change', () => {
    toggleComplete(todo.id);
    render();
  });

  const title = document.createElement('span');
  title.className = 'todo-title';
  title.textContent = todo.title;

  const category = document.createElement('span');
  category.className = 'category-tag';
  category.textContent = todo.category;

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'edit-btn';
  editBtn.textContent = '수정';
  editBtn.addEventListener('click', () => {
    editingId = todo.id;
    render();
  });

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = '삭제';
  deleteBtn.addEventListener('click', () => {
    deleteTodo(todo.id);
    render();
  });

  li.append(checkbox, title, category, editBtn, deleteBtn);
  return li;
}

function createEditItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo-item editing';
  li.dataset.id = todo.id;

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.className = 'edit-title-input';
  titleInput.value = todo.title;

  const categorySelect = document.createElement('select');
  categorySelect.className = 'edit-category-select';
  ['업무', '개인', '공부'].forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    if (cat === todo.category) option.selected = true;
    categorySelect.appendChild(option);
  });

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'save-btn';
  saveBtn.textContent = '저장';
  saveBtn.addEventListener('click', () => {
    const newTitle = titleInput.value.trim();
    if (!newTitle) return;
    updateTodo(todo.id, {
      title: newTitle,
      category: categorySelect.value,
    });
    editingId = null;
    render();
  });

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'cancel-btn';
  cancelBtn.textContent = '취소';
  cancelBtn.addEventListener('click', () => {
    editingId = null;
    render();
  });

  li.append(titleInput, categorySelect, saveBtn, cancelBtn);
  return li;
}

function handleAddTodo() {
  const title = todoInputEl.value.trim();
  if (!title) return;
  const category = categorySelectEl.value;
  addTodo(title, category);
  todoInputEl.value = '';
  render();
}

addBtnEl.addEventListener('click', handleAddTodo);
todoInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTodo();
});

render();
