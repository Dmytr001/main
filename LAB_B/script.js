document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("date");
  const taskList = document.getElementById("taskList");
  const searchInput = document.getElementById("search");

  // === Local Storage ===
  function getTasks() {
    return JSON.parse(localStorage.getItem("tasks")) || [];
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // === Создание элемента задачи ===
  function renderTask(task) {
    const taskItem = document.createElement("div");
    taskItem.className = "task-item";

    // Блок текста
    const textBlock = document.createElement("div");
    textBlock.className = "task-text";
    textBlock.textContent = task.title;
    textBlock.title = "Кликните, чтобы редактировать";

    // Блок даты
    const dateBlock = document.createElement("div");
    dateBlock.className = "task-date";
    dateBlock.textContent = task.date || "____-__-__";
    dateBlock.title = "Кликните, чтобы редактировать дату";

    // Удаление
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "delete";
    deleteBtn.addEventListener("click", () => {
      deleteTask(task.id);
      taskItem.remove();
    });

// Редактирование текста
textBlock.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.maxLength = 255;
  input.minLength = 3;
  input.className = "edit-text";

  textBlock.replaceWith(input);
  input.focus();

  function saveText() {
    const newText = input.value.trim();
    if (newText.length < 3 || newText.length > 255) {
      alert("Текст должен быть от 3 до 255 символов");
      input.focus(); // оставляем поле для исправления
      return; // ничего не меняем
    }
    task.title = newText;
    updateTask(task);
    input.replaceWith(renderTextBlock(task));
  }

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") saveText();
  });

  input.addEventListener("blur", () => {
    // при уходе с поля, если текст корректный — сохраняем, иначе оставляем input
    if (input.value.trim().length >= 3 && input.value.trim().length <= 255) {
      saveText();
    }
  });
});


    // Редактирование даты
    dateBlock.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "date";
      input.value = task.date || "____-__-__";
      input.className = "edit-date";

      dateBlock.replaceWith(input);
      input.focus();

      function saveDate() {
        task.date = input.value;
        updateTask(task);
        input.replaceWith(renderDateBlock(task));
      }

      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter") saveDate();
      });
      input.addEventListener("blur", saveDate);
    });

    taskItem.appendChild(textBlock);
    taskItem.appendChild(dateBlock);
    taskItem.appendChild(deleteBtn);

    taskList.appendChild(taskItem);
  }

  // Создание блока текста для повторного использования
function renderTextBlock(task) {
  const textBlock = document.createElement("div");
  textBlock.className = "task-text";
  textBlock.textContent = task.title;
  textBlock.title = "Кликните, чтобы редактировать";

  textBlock.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = task.title;
    input.maxLength = 255;
    input.minLength = 3;
    input.className = "edit-text";

    textBlock.replaceWith(input);
    input.focus();

    function saveText() {
      const newText = input.value.trim();
      if (newText.length < 3 || newText.length > 255) {
        alert("Текст должен быть от 3 до 255 символов");
        input.focus();
        return;
      }
      task.title = newText;
      updateTask(task);
      input.replaceWith(renderTextBlock(task));
    }

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") saveText();
    });

    input.addEventListener("blur", () => {
      if (input.value.trim().length >= 3 && input.value.trim().length <= 255) {
        saveText();
      }
    });
  });

  return textBlock;
}

function renderDateBlock(task) {
    const dateBlock = document.createElement("div");
    dateBlock.className = "task-date";
    dateBlock.textContent = task.date || "____-__-__"; // дефолтный текст
    dateBlock.title = "Кликните, чтобы редактировать";

    dateBlock.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "date";
        input.value = task.date || ""; // для <input> пустая строка
        input.className = "edit-date";

        dateBlock.replaceWith(input);
        input.focus();

        function saveDate() {
            task.date = input.value;
            updateTask(task);

            // заменяем input на блок даты с текстом
            const newDateBlock = renderDateBlock(task);
            input.replaceWith(newDateBlock);
        }

        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") saveDate();
        });
        input.addEventListener("blur", saveDate);
    });

    return dateBlock;
}

  // Обновление задачи в localStorage по id
  function updateTask(updatedTask) {
    const tasks = getTasks().map(t => t.id === updatedTask.id ? updatedTask : t);
    saveTasks(tasks);
  }

  // Удаление задачи по id
  function deleteTask(id) {
    const tasks = getTasks().filter(t => t.id !== id);
    saveTasks(tasks);
  }

  // Загрузка всех задач
  function loadTasks() {
    taskList.innerHTML = "";
    const tasks = getTasks();
    tasks.forEach(renderTask);
  }

// Добавление новой задачи
addBtn.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const date = dateInput.value;

  if (title.length < 3 || title.length > 255) {
    alert("Название должно быть от 3 до 255 символов");
    return;
  }

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  if (date && date < today) { // <-- проверяем только если дата не пустая
    alert("Нельзя выбрать дату раньше сегодняшней");
    return;
  }


  const newTask = { id: Date.now(), title, date };
  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);

  renderTask(newTask);

  titleInput.value = "";
  dateInput.value = "";
});



searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const tasks = document.querySelectorAll(".task-item");

  tasks.forEach(task => {
    const titleBlock = task.querySelector(".task-text");
    const text = titleBlock.textContent;

    if (query !== "" && text.toLowerCase().includes(query)) {
      task.style.display = "flex";

      // Подсветка только первого совпадения
      const index = text.toLowerCase().indexOf(query);
      if (index !== -1) {
        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);
        titleBlock.innerHTML = `${before}<span class="highlight">${match}</span>${after}`;
      }
    } else {
      task.style.display = text.toLowerCase().includes(query) ? "flex" : "none";
      titleBlock.innerHTML = text; // возвращаем обычный текст
    }
  });
});


  // Инициализация
  loadTasks();
});
