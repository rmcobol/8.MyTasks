// ===== 데이터 레이어 =====

const STORAGE_KEY = 'todos';
const THEME_KEY = 'theme';

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

function deleteCompletedTodos() {
  const todos = loadTodos();
  const filtered = todos.filter((todo) => !todo.completed);
  saveTodos(filtered);
  return filtered;
}

// ===== 렌더 레이어 =====

let todos = [];
let editingId = null;
let currentFilter = '전체';
let searchQuery = '';

const todoListEl = document.querySelector('.todo-list');
const todoInputEl = document.querySelector('.todo-input');
const categorySelectEl = document.querySelector('.category-select');
const addBtnEl = document.querySelector('.add-btn');
const searchInputEl = document.querySelector('.search-input');
const filterBtnEls = document.querySelectorAll('.filter-btn');
const clearCompletedBtnEl = document.querySelector('.clear-completed-btn');
const progressFillEl = document.querySelector('.progress-fill');
const progressTextEl = document.querySelector('.progress-text');
const remainingBadgeEl = document.querySelector('.remaining-badge');
const themeToggleInputEl = document.querySelector('.theme-toggle-input');
const themeToggleIconEl = document.querySelector('.theme-toggle-icon');
const toastEl = document.querySelector('.toast');

function getFilteredTodos() {
  return todos
    .filter((todo) => currentFilter === '전체' || todo.category === currentFilter)
    .filter(
      (todo) => !searchQuery || todo.title.toLowerCase().includes(searchQuery)
    );
}

function render() {
  todos = loadTodos();
  todoListEl.innerHTML = '';

  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    const emptyEl = document.createElement('li');
    emptyEl.className = 'empty-message';
    emptyEl.textContent =
      todos.length === 0
        ? '할 일이 없습니다. 추가해보세요!'
        : '조건에 맞는 할 일이 없습니다';
    todoListEl.appendChild(emptyEl);
  } else {
    filtered.forEach((todo) => {
      const itemEl =
        todo.id === editingId ? createEditItem(todo) : createTodoItem(todo);
      todoListEl.appendChild(itemEl);
    });
  }

  renderProgress();
}

function renderProgress() {
  const total = todos.length;
  const completed = todos.filter((todo) => todo.completed).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  progressFillEl.style.width = `${percent}%`;
  progressTextEl.textContent = `${completed}/${total} 완료 · ${percent}%`;
  remainingBadgeEl.textContent = String(total - completed);
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
  category.className = `category-tag category-${todo.category}`;
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
    showToast('할 일을 삭제했습니다');
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
    if (!newTitle) {
      titleInput.classList.add('shake');
      titleInput.addEventListener(
        'animationend',
        () => titleInput.classList.remove('shake'),
        { once: true }
      );
      showToast('할 일 제목을 입력해주세요');
      return;
    }
    updateTodo(todo.id, {
      title: newTitle,
      category: categorySelect.value,
    });
    editingId = null;
    render();
    showToast('수정했습니다');
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
  if (!title) {
    todoInputEl.classList.add('shake');
    todoInputEl.addEventListener(
      'animationend',
      () => todoInputEl.classList.remove('shake'),
      { once: true }
    );
    showToast('할 일을 입력해주세요');
    todoInputEl.focus();
    return;
  }
  const category = categorySelectEl.value;
  addTodo(title, category);
  todoInputEl.value = '';
  render();
  showToast('할 일을 추가했습니다');
  todoInputEl.focus();
}

addBtnEl.addEventListener('click', handleAddTodo);
todoInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleAddTodo();
});

searchInputEl.addEventListener('input', () => {
  searchQuery = searchInputEl.value.trim().toLowerCase();
  render();
});

filterBtnEls.forEach((btn) => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtnEls.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

clearCompletedBtnEl.addEventListener('click', () => {
  const completedCount = todos.filter((todo) => todo.completed).length;
  if (completedCount === 0) {
    showToast('완료된 항목이 없습니다');
    return;
  }
  const confirmed = confirm(`완료된 항목 ${completedCount}개를 삭제할까요?`);
  if (!confirmed) return;
  deleteCompletedTodos();
  render();
  showToast(`완료된 항목 ${completedCount}개를 삭제했습니다`);
});

// ===== 다크 모드 =====

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggleInputEl.checked = theme === 'dark';
  themeToggleIconEl.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const next = themeToggleInputEl.checked ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
  showToast(next === 'dark' ? '다크 모드로 전환했습니다' : '라이트 모드로 전환했습니다');
}

themeToggleInputEl.addEventListener('change', toggleTheme);

// ===== 토스트 알림 =====

let toastTimer = null;

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// ===== 키보드 단축키 =====

document.addEventListener('keydown', (e) => {
  if (!e.altKey) return;

  if (e.key.toLowerCase() === 'n') {
    e.preventDefault();
    todoInputEl.focus();
  } else if (['1', '2', '3', '4'].includes(e.key)) {
    e.preventDefault();
    const btn = filterBtnEls[Number(e.key) - 1];
    if (btn) btn.click();
  } else if (e.key.toLowerCase() === 'd') {
    e.preventDefault();
    themeToggleInputEl.click();
  }
});

// ===== 초기화 =====

applyTheme(localStorage.getItem(THEME_KEY) || 'light');
render();
