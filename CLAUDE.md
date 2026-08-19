# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

A vanilla JavaScript to-do list app: `index.html`, `style.css`, `script.js`. No build tools, no frameworks, no package manager — open `index.html` directly in a browser to run it.

## Development

There is no build/lint/test tooling in this repo. To check work: open `index.html` in a browser (double-click, or a simple local server) and exercise the UI manually. Use the browser console to verify data-layer functions.

## Architecture

Data model — each to-do is `{ id, title, category, completed, createdAt }`, persisted to `localStorage` under the key `'todos'`.

`script.js` is expected to have two layers:
- **Data layer**: `loadTodos()`, `saveTodos(todos)`, `addTodo(title, category)`, `updateTodo(id, changes)`, `deleteTodo(id)`, `toggleComplete(id)` — pure state + localStorage I/O, no DOM access.
- **Render layer**: a `render()` function that redraws the list area from the current in-memory todos array, filtered by the active category filter (전체/업무/개인/공부), plus progress bar/text updates. Every mutating action (add/update/delete/toggle) is followed by a `render()` call.

Category values are the Korean labels `업무` (work), `개인` (personal), `공부` (study) — used as-is in data, DOM `data-filter` attributes, and CSS category tag classes.

## Build plan

`prompts/*.prompt.md` are the original Korean prompts driving this project's staged build, in order:
1. `1.prompt.md` — static skeleton (HTML/CSS/empty JS) — **done**.
2. `2.prompt.md` — localStorage data layer (`loadTodos`/`saveTodos`/`addTodo`/`updateTodo`/`deleteTodo`/`toggleComplete`), console-tested only, no rendering yet.
3. `3.prompt.md` — wire data layer to a `render()` function: list rendering, add/toggle/delete/inline-edit interactions, empty-state message, initial load on page open.
4. `4.prompt.md` — category filtering (filter buttons + active state) and progress display (bar + "n/m 완료 · x%"), category color tags in CSS.
5. `5.prompt.md` — full regression pass (persistence across reload, progress accuracy, filter correctness, empty state, Enter-to-add) and responsive/mobile CSS cleanup.

When asked to continue this project, check which stage's functionality already exists in `script.js`/`index.html`/`style.css` before assuming the next prompt's starting point.
