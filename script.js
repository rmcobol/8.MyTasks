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

// ===== 콘솔 테스트 =====

(function testDataLayer() {
  localStorage.removeItem(STORAGE_KEY);

  console.log('1) 초기 로드 (빈 배열이어야 함):', loadTodos());

  const t1 = addTodo('장보기', '개인');
  console.log('2) addTodo 후:', loadTodos());

  const t2 = addTodo('보고서 작성', '업무');
  console.log('3) addTodo 두번째 후:', loadTodos());

  updateTodo(t1.id, { title: '장보기 (수정됨)' });
  console.log('4) updateTodo 후:', loadTodos());

  toggleComplete(t2.id);
  console.log('5) toggleComplete 후:', loadTodos());

  deleteTodo(t1.id);
  console.log('6) deleteTodo 후:', loadTodos());
})();
