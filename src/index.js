const customConsole = (w) => {
  const pushToConsole = (payload, type) => {
    w.parent.postMessage({
      console: {
        payload: stringify(payload),
        type: type
      }
    }, "*")
  }

  w.onerror = (message, url, line, column) => {
    // the line needs to correspond with the editor panel
    // unfortunately this number needs to be altered every time this view is changed
    line = line - 70
    if (line < 0) {
      pushToConsole(message, "error")
    } else {
      pushToConsole(`[${line}:${column}] ${message}`, "error")
    }
  }

  let console = (function (systemConsole) {
    return {
      log: function () {
        let args = Array.from(arguments)
        pushToConsole(args, "log")
        systemConsole.log.apply(this, args)
      },
      info: function () {
        let args = Array.from(arguments)
        pushToConsole(args, "info")
        systemConsole.info.apply(this, args)
      },
      warn: function () {
        let args = Array.from(arguments)
        pushToConsole(args, "warn")
        systemConsole.warn.apply(this, args)
      },
      error: function () {
        let args = Array.from(arguments)
        pushToConsole(args, "error")
        systemConsole.error.apply(this, args)
      },
      system: function (arg) {
        pushToConsole(arg, "system")
      },
      clear: function () {
        systemConsole.clear.apply(this, {})
      },
      time: function () {
        let args = Array.from(arguments)
        systemConsole.time.apply(this, args)
      },
      assert: function (assertion, label) {
        if (!assertion) {
          pushToConsole(label, "log")
        }

        let args = Array.from(arguments)
        systemConsole.assert.apply(this, args)
      }
    }
  }(window.console))

  window.console = { ...window.console, ...console }

  console.system("Running fiddle")
}

if (window.parent) {
  customConsole(window)
}

let todoItems = [];

function renderTodo(todo) {
  localStorage.setItem('todoItems', JSON.stringify(todoItems));

  const list = document.querySelector('.js-todo-list');
  // todo 들어가는 시점
  const item = document.querySelector(`[data-key='${todo.id}']`);
  if (todo.deleted) {
    item.remove();
    if (todoItems.length === 0) list.innerHTML = '';
    return
  }
  // todo 들어가는 시점
  const isChecked = todo.checked ? 'done' : '';
  const node = document.createElement("li");
  node.setAttribute('class', `todo-item ${isChecked}`);
  // todo 들어가는 시점
  node.setAttribute('data-key', todo.id);
  node.innerHTML = `
        <input id="${todo.id}" type="checkbox"/>
        <label for="${todo.id}" class="tick js-tick"></label>
        <span>${todo.text}</span>
        <button class="delete-todo js-delete-todo">
        <svg><use href="#delete-icon"></use></svg>
        </button>
      `;

  if (item) {
    list.replaceChild(node, item);
  } else {
    list.append(node);
  }
}

// todo 들어가는 시점
function addTodo(text) {
  const todo = {
    text,
    checked: false,
    id: Date.now(),
  };

  todoItems.push(todo);
  renderTodo(todo);
}

function toggleDone(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  todoItems[index].checked = !todoItems[index].checked;
  renderTodo(todoItems[index]);
}

// todo 들어가는 시점
function deleteTodo(key) {
  const index = todoItems.findIndex(item => item.id === Number(key));
  const todo = {
    deleted: true,
    ...todoItems[index]
  };
  todoItems = todoItems.filter(item => item.id !== Number(key));
  renderTodo(todo);
}

const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
  event.preventDefault();
  const input = document.querySelector('.js-todo-input');
  // todo 들어가는 시점
  const text = input.value.trim();
  if (text !== '') {
    addTodo(text);
    input.value = '';
    input.focus();
  }
});

const list = document.querySelector('.js-todo-list');
list.addEventListener('click', event => {
  if (event.target.classList.contains('js-tick')) {
    const itemKey = event.target.parentElement.dataset.key;
    toggleDone(itemKey);
  }
  // todo 들어가는 시점
  if (event.target.classList.contains('js-delete-todo')) {
    const itemKey = event.target.parentElement.dataset.key;
    deleteTodo(itemKey);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const ref = localStorage.getItem('todoItems');
  if (ref) {
    todoItems = JSON.parse(ref);
    todoItems.forEach(t => {
      renderTodo(t);
    });
  }
});

if (window.parent && window.parent.parent) {
  window.parent.parent.postMessage(["resultsFrame", {
    height: document.body.getBoundingClientRect().height,
    slug: "0gxLab39"
  }], "*")
}

// always overwrite window.name, in case users try to set it manually
window.name = "result"

let allLines = []

window.addEventListener("message", (message) => {
  if (message.data.console) {
    let insert = document.querySelector("#insert")
    allLines.push(message.data.console.payload)
    insert.innerHTML = allLines.join(";\r")

    let result = eval.call(null, message.data.console.payload)
    if (result !== undefined) {
      console.log(result)
    }
  }
})