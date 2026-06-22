const tasks = [
    { id: 1, text: "Design the homepage layout", category: "Work", completed: false, date: "2025-05-25" },
    { id: 2, text: "Buy groceries for the week", category: "Shopping", completed: false, date: "2025-05-26" },
    { id: 3, text: "Review React hooks documentation", category: "Study", completed: false, date: "2025-05-27" },
    { id: 4, text: "Prepare presentation slides", category: "Work", completed: true, date: "2025-05-20" },
    { id: 5, text: "Plan weekend trip", category: "Personal", completed: false, date: "2025-06-01" },
    { id: 6, text: "Read Atomic Habits", category: "Personal", completed: false, date: "2025-05-30" },
    { id: 7, text: "Complete math assignment", category: "Study", completed: false, date: "2025-05-25" },
    { id: 8, text: "Buy a new mouse", category: "Shopping", completed: true, date: "2025-05-22" },
];

let categories = [
    { name: "Work", color: "blue" },
    { name: "Personal", color: "green" },
    { name: "Study", color: "violet" },
    { name: "Shopping", color: "orange" },
];

let currentFilter = { type: "menu", value: "All Tasks" };
let searchQuery = "";
let sortBy = "Recent";
let nextId = 9;

const colorMap = {
    blue: { bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-500" },
    green: { bg: "bg-green-100", text: "text-green-600", dot: "bg-green-500" },
    violet: { bg: "bg-violet-100", text: "text-violet-600", dot: "bg-violet-500" },
    orange: { bg: "bg-orange-100", text: "text-orange-600", dot: "bg-orange-500" },
    red: { bg: "bg-red-100", text: "text-red-600", dot: "bg-red-500" },
    pink: { bg: "bg-pink-100", text: "text-pink-600", dot: "bg-pink-500" },
    teal: { bg: "bg-teal-100", text: "text-teal-600", dot: "bg-teal-500" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600", dot: "bg-yellow-500" },
};

function formatDate(dateStr) {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getTodayStr() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function getCategoryColor(catName) {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.color : "blue";
}

function renderTasks() {
    const container = document.getElementById("taskContainer");

    let filtered = [...tasks];

    if (currentFilter.type === "menu") {
        const today = getTodayStr();
        if (currentFilter.value === "Today") {
            filtered = filtered.filter(t => t.date === today);
        } else if (currentFilter.value === "Upcoming") {
            filtered = filtered.filter(t => t.date > today);
        } else if (currentFilter.value === "Completed") {
            filtered = filtered.filter(t => t.completed);
        }
    } else if (currentFilter.type === "category") {
        filtered = filtered.filter(t => t.category === currentFilter.value);
    }

    if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(t => t.text.toLowerCase().includes(q));
    }

    if (sortBy === "A-Z") {
        filtered.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortBy === "Upcoming") {
        filtered.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    } else {
        filtered.sort((a, b) => b.id - a.id);
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-slate-400">
                <i data-lucide="inbox" class="w-16 h-16 mb-4"></i>
                <p class="text-lg font-medium text-slate-500">No tasks found</p>
                <p class="text-sm">Add a new task or change your filters</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    let html = "";
    filtered.forEach(task => {
        const color = getCategoryColor(task.category);
        const colors = colorMap[color] || colorMap.blue;
        html += `
            <div class="task flex items-center justify-between p-5 border border-slate-200 rounded-2xl hover:shadow-sm transition-shadow ${task.completed ? "opacity-70" : ""}">
                <div class="flex items-center gap-4">
                    <input type="checkbox" class="w-5 h-5 accent-green-600 task-checkbox" data-id="${task.id}" ${task.completed ? "checked" : ""}>
                    <span class="task-text ${task.completed ? "line-through text-slate-400" : "text-slate-800"}">${task.text}</span>
                    <span class="px-3 py-1 text-sm rounded-full ${colors.bg} ${colors.text}">${task.category}</span>
                </div>
                <div class="flex items-center gap-6 text-slate-400">
                    <div class="flex items-center gap-2 text-sm">
                        <i data-lucide="calendar" class="w-4 h-4"></i>
                        <span>${formatDate(task.date)}</span>
                    </div>
                    <div class="relative task-actions">
                        <i data-lucide="more-vertical" class="w-4 h-4 cursor-pointer hover:text-slate-600 task-menu-btn" data-id="${task.id}"></i>
                        <div class="task-dropdown hidden absolute right-0 top-8 bg-white border border-slate-200 rounded-xl shadow-lg py-2 w-36 z-10">
                            <button class="edit-task-btn w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2" data-id="${task.id}">
                                <i data-lucide="pencil" class="w-3.5 h-3.5"></i> Edit
                            </button>
                            <button class="delete-task-btn w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 flex items-center gap-2" data-id="${task.id}">
                                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    lucide.createIcons();

    document.querySelectorAll(".task-checkbox").forEach(cb => {
        cb.addEventListener("change", () => {
            toggleTask(parseInt(cb.dataset.id));
        });
    });

    document.querySelectorAll(".task-menu-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".task-dropdown").forEach(d => d.classList.add("hidden"));
            btn.nextElementSibling.classList.toggle("hidden");
        });
    });

    document.querySelectorAll(".edit-task-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            openEditTaskModal(parseInt(btn.dataset.id));
        });
    });

    document.querySelectorAll(".delete-task-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            deleteTask(parseInt(btn.dataset.id));
        });
    });
}

function renderCategories() {
    const container = document.querySelector(".space-y-2");
    container.innerHTML = "";

    categories.forEach(cat => {
        const colors = colorMap[cat.color] || colorMap.blue;
        const count = tasks.filter(t => t.category === cat.name).length;
        const div = document.createElement("div");
        div.className = "flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 transition cursor-pointer category-item";
        div.dataset.category = cat.name;
        div.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-3 h-3 rounded-full ${colors.dot}"></div>
                <span class="text-slate-600">${cat.name}</span>
            </div>
            <span class="bg-slate-200 text-slate-600 text-sm px-2 py-1 rounded-lg">${count}</span>
        `;
        container.appendChild(div);

        div.addEventListener("click", () => {
            filterByCategory(cat.name);
        });
    });
}

function updateCounts() {
    const today = getTodayStr();
    const counts = [
        tasks.length,
        tasks.filter(t => t.date === today).length,
        tasks.filter(t => t.date > today).length,
        tasks.filter(t => t.completed).length,
    ];
    document.querySelectorAll(".menu-item > span").forEach((span, i) => {
        if (counts[i] !== undefined) span.textContent = counts[i];
    });
    renderCategories();
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        renderTasks();
        updateCounts();
    }
}

function deleteTask(id) {
    if (confirm("Delete this task?")) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
        updateCounts();
    }
}

function addTask(data) {
    tasks.push({
        id: nextId++,
        text: data.text,
        category: data.category,
        completed: false,
        date: data.date || getTodayStr(),
    });
    renderTasks();
    updateCounts();
}

function editTask(id, data) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = data.text;
        task.category = data.category;
        task.date = data.date || task.date;
        renderTasks();
        updateCounts();
    }
}

function filterByMenu(menu) {
    currentFilter = { type: "menu", value: menu };
    document.querySelectorAll(".menu-item").forEach(item => {
        const text = item.querySelector("span")?.textContent?.trim() || "";
        item.classList.remove("bg-violet-100", "text-violet-600", "font-medium");
        if (text === menu) {
            item.classList.add("bg-violet-100", "text-violet-600", "font-medium");
        }
    });
    document.querySelectorAll(".category-item").forEach(el => el.classList.remove("bg-violet-50"));
    document.querySelector("main nav h2").textContent = menu;
    renderTasks();
}

function filterByCategory(category) {
    currentFilter = { type: "category", value: category };
    document.querySelectorAll(".category-item").forEach(el => {
        el.classList.remove("bg-violet-50");
        if (el.dataset.category === category) {
            el.classList.add("bg-violet-50");
        }
    });
    document.querySelectorAll(".menu-item").forEach(item => {
        item.classList.remove("bg-violet-100", "text-violet-600", "font-medium");
    });
    document.querySelector("main nav h2").textContent = category;
    renderTasks();
}

function addCategory(name, color) {
    if (categories.some(c => c.name === name)) {
        alert("Category already exists!");
        return false;
    }
    categories.push({ name, color });
    renderCategories();
    populateCategoryDropdown();
    return true;
}

function populateCategoryDropdown() {
    const select = document.getElementById("taskCategoryInput");
    select.innerHTML = categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("");
}

function openAddTaskModal() {
    document.getElementById("modalTitle").textContent = "Add Task";
    document.getElementById("editTaskId").value = "";
    document.getElementById("taskForm").reset();
    document.getElementById("taskDateInput").value = getTodayStr();
    populateCategoryDropdown();
    document.getElementById("taskModal").classList.remove("hidden");
    document.getElementById("taskModal").classList.add("flex");
}

function openEditTaskModal(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    document.getElementById("modalTitle").textContent = "Edit Task";
    document.getElementById("editTaskId").value = id;
    document.getElementById("taskNameInput").value = task.text;
    document.getElementById("taskDateInput").value = task.date;
    populateCategoryDropdown();
    document.getElementById("taskCategoryInput").value = task.category;
    document.getElementById("taskModal").classList.remove("hidden");
    document.getElementById("taskModal").classList.add("flex");
}

function closeModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", () => {
        const text = item.querySelector("span")?.textContent?.trim();
        if (text) filterByMenu(text);
    });
});

document.getElementById("searchInput").addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderTasks();
});

document.getElementById("sortSelect").addEventListener("change", (e) => {
    sortBy = e.target.value;
    renderTasks();
});

document.getElementById("addTaskBtn").addEventListener("click", openAddTaskModal);

document.getElementById("taskForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("editTaskId").value;
    const data = {
        text: document.getElementById("taskNameInput").value.trim(),
        category: document.getElementById("taskCategoryInput").value,
        date: document.getElementById("taskDateInput").value,
    };
    if (id) {
        editTask(parseInt(id), data);
    } else {
        addTask(data);
    }
    closeModal(document.getElementById("taskModal"));
});

document.getElementById("closeModalBtn").addEventListener("click", () => closeModal(document.getElementById("taskModal")));
document.getElementById("cancelModalBtn").addEventListener("click", () => closeModal(document.getElementById("taskModal")));
document.getElementById("taskModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal(document.getElementById("taskModal"));
});

document.getElementById("closeCategoryModalBtn").addEventListener("click", () => closeModal(document.getElementById("categoryModal")));
document.getElementById("cancelCategoryBtn").addEventListener("click", () => closeModal(document.getElementById("categoryModal")));
document.getElementById("categoryModal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) closeModal(document.getElementById("categoryModal"));
});

document.addEventListener("click", () => {
    document.querySelectorAll(".task-dropdown").forEach(d => d.classList.add("hidden"));
});

document.querySelector(".add-category").addEventListener("click", () => {
    document.getElementById("categoryNameInput").value = "";
    document.getElementById("categoryColorInput").value = "blue";
    document.querySelectorAll("#colorPicker div").forEach(el => {
        el.classList.remove("selected", "ring-2", "ring-offset-2", "ring-white", "scale-110");
    });
    document.querySelector('#colorPicker div[data-color="blue"]').classList.add("selected", "ring-2", "ring-offset-2", "ring-white", "scale-110");
    document.getElementById("categoryModal").classList.remove("hidden");
    document.getElementById("categoryModal").classList.add("flex");
});

document.querySelectorAll("#colorPicker div").forEach(el => {
    el.addEventListener("click", () => {
        document.querySelectorAll("#colorPicker div").forEach(d => {
            d.classList.remove("selected", "ring-2", "ring-offset-2", "ring-white", "scale-110");
        });
        el.classList.add("selected", "ring-2", "ring-offset-2", "ring-white", "scale-110");
        document.getElementById("categoryColorInput").value = el.dataset.color;
    });
});

document.getElementById("categoryForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("categoryNameInput").value.trim();
    const color = document.getElementById("categoryColorInput").value;
    if (name && addCategory(name, color)) {
        closeModal(document.getElementById("categoryModal"));
    }
});

renderTasks();
renderCategories();
updateCounts();
populateCategoryDropdown();

const heading = document.querySelector("main nav h2");
if (heading) heading.textContent = "All Tasks";
