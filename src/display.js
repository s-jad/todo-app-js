import { TodoApp } from "./app";
import { UserEvents } from "./user-events";
import { SearchBar } from "./searchbar";
import { compareAsc, compareDesc, isSameDay, isAfter, parse, isValid, format } from "date-fns";

export const Display = ((doc) => {
    const app = doc.createElement('div');
    app.id = "app-container";

    let state = {
        currentProjectGrid: {},
        expandedCardPrevPosition: {},
        progressBarCount: 0,
        progressBarPercentages: [],
        currentTodoNames: [],
        currentUserNameColorIndex: 0,
        currentView: "project-grid",
        todoListSortByProjAsc: true,
        todoListSortByTodoAsc: true,
        todoListSortByDueDateAsc: true,
        todoListSortByCheckAsc: true,
    };

    const getCurrentProjectGrid = () => {
        return state.currentProjectGrid;
    }

    const getCurrentView = () => {
        return state.currentView;
    };

    const renderApp = () => {
        return app;
    };

    const renderWelcomeScreen = () => {
        const welcomeFlex = doc.createElement('div');
        welcomeFlex.id = "welcome-flex";

        const welcomeTitle = doc.createElement('h2');
        welcomeTitle.id = "welcome-title";
        welcomeTitle.textContent = `Welcome,
                                    please enter a username`;

        const welcomeInput = doc.createElement('input');
        welcomeInput.id = "welcome-input";
        welcomeInput.placeholder = "Username";
        welcomeInput.maxLength = "20";

        const welcomeConfirmBtn = doc.createElement('button');
        welcomeConfirmBtn.id = "welcome-confirm-btn";
        welcomeConfirmBtn.type = "button";
        welcomeConfirmBtn.innerText = "Confirm";
        welcomeConfirmBtn.onclick = UserEvents.switchToProjectDashboard;
        welcomeConfirmBtn.disabled = true;

        welcomeInput.addEventListener("input", function(ev) {
            if (ev.target.value === "") {
                welcomeConfirmBtn.disabled = true;
            } else {
                welcomeConfirmBtn.disabled = false;
                welcomeConfirmBtn.classList.add("activated");
            }
        })

        welcomeFlex.appendChild(welcomeTitle);
        welcomeFlex.appendChild(welcomeInput);
        welcomeFlex.appendChild(welcomeConfirmBtn);
        welcomeFlex.addEventListener("shown.bs.welcomeFlex", setFocusToFirstInput(welcomeInput));

        return welcomeFlex;
    };

    const removeWelcomeScreen = () => {
        const welcomeFlex = doc.getElementById("welcome-flex");
        app.removeChild(welcomeFlex);
    };

    const setFocusToFirstInput = (firstInput) => {
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }

    const renderProjectDashboard = () => {
        const welcomeInput = doc.getElementById("welcome-input");
        const dashboardContainer = doc.createElement("div");
        dashboardContainer.id = "dashboard-container";

        const header = renderHeader(welcomeInput.value);
        const projectGrid = renderProjectGrid();
        const sidebar = renderSidebar();

        dashboardContainer.appendChild(header);
        dashboardContainer.appendChild(sidebar);
        dashboardContainer.appendChild(projectGrid);
        app.appendChild(dashboardContainer);

        removeWelcomeScreen();
    };

    const renderHeader = (username) => {
        const dashboardHeader = doc.createElement('header');
        dashboardHeader.id = "dashboard-header";

        const headerUtilsFlex = doc.createElement('div');
        headerUtilsFlex.id = "header-utils-flex";
        headerUtilsFlex.appendChild(generateCreateProjectBtn());
        headerUtilsFlex.appendChild(generateSwitchViewBtn());

        const searchFlex = doc.createElement('div');
        searchFlex.id = "search-flex";
        searchFlex.appendChild(SearchBar.generateSearchBar());

        dashboardHeader.appendChild(generateUserNameHeader(username));
        dashboardHeader.appendChild(searchFlex);
        dashboardHeader.appendChild(headerUtilsFlex);

        return dashboardHeader;
    };

    const switchToProjectGrid = () => {
        const dashboardContainer = doc.getElementById('dashboard-container');
        const todoList = doc.getElementById('todo-list-view-container');

        const progressBarPercentages = countProgressBarPercentages(todoList);

        dashboardContainer.removeChild(todoList);

        const projectGridOuter = doc.createElement('div');
        let projectGrid;

        if (state.currentProjectGrid.childNodes === undefined) {
            projectGrid = doc.createElement('div');
        } else {
            projectGrid = state.currentProjectGrid;
        }

        projectGridOuter.id = "project-grid-outer";
        projectGrid.id = "project-grid";

        projectGridOuter.appendChild(projectGrid);

        window.addEventListener("keypress", scrollProjects);

        dashboardContainer.appendChild(projectGridOuter);

        state.currentView = "project-grid";

        if (state.currentProjectGrid.childNodes === undefined) {
            return;
        }

        const projectCards = Array.from(projectGrid.querySelectorAll('[id^="project-card-"]'));

        projectCards.forEach((project, index) => {
            const progressBar = project.querySelector('.progress-bar');
            progressBar.style.width = `${progressBarPercentages[index]}%`;

            const progressbarIdNum = parseInt((progressBar.id).slice(progressBar.id.lastIndexOf("-") + 1));

            state.progressBarPercentages[progressbarIdNum] = progressBarPercentages[index];

            if (state.progressBarPercentages[progressbarIdNum] === 100) {
                progressBar.style.background = "var(--contrast-green-glow)";
                progressBar.style.boxShadow = `0 0 4px var(--contrast-green), 
                    inset 0 0 1px var(--base-white),
                    inset 0 0 4px var(--contrast-green-faded)`;
            } else {
                progressBar.style.background = "var(--contrast-red-glow)";
                progressBar.style.boxShadow = `0 0 4px var(--contrast-red), 
                    inset 0 0 1px var(--base-white),
                    inset 0 0 4px var(--contrast-red-faded)`;
            }
        });
    };

    const countProgressBarPercentages = (todoList) => {
        const rows = Array.from(todoList.querySelectorAll('.todo-list-row'));

        const projectTitleArr = [];
        const checkBoxCheckedArr = []

        rows.forEach(row => {
            const projectTitle = row.querySelector('.todo-list-row-project-title').innerText;

            const checkBoxChecked = row.querySelector('.todo-check').checked;

            projectTitleArr.push(projectTitle);
            checkBoxCheckedArr.push(checkBoxChecked);
        });

        let prevProjectTitle = projectTitleArr[0];
        let checkedCount = 0;
        let checkboxCount = 0;
        let progressBarPercentagesIndex = 0;
        const progressBarPercentages = [];

        for (let i = 0; i < projectTitleArr.length; i++) {
            if (projectTitleArr[i] !== prevProjectTitle) {
                progressBarPercentages[progressBarPercentagesIndex] = (checkedCount / checkboxCount) * 100;
                progressBarPercentagesIndex++;
                prevProjectTitle = projectTitleArr[i];

                checkedCount = 0;
                checkboxCount = 0;
            }

            if (checkBoxCheckedArr[i]) {
                checkedCount++;
            }

            checkboxCount++;

            if (i === projectTitleArr.length - 1) {
                progressBarPercentages[progressBarPercentagesIndex] = (checkedCount / checkboxCount) * 100;
            }
        }

        return progressBarPercentages;
    };

    const switchToTodoList = () => {
        const dashboardContainer = doc.getElementById('dashboard-container');
        const projectGrid = doc.getElementById('project-grid-outer');
        dashboardContainer.removeChild(projectGrid);

        window.removeEventListener("keypress", scrollProjects);

        const todoListContainer = renderTodoListView();
        dashboardContainer.appendChild(todoListContainer);

        state.currentView = "todo-list";
    };

    const renderTodoListView = () => {
        const todoListContainer = doc.createElement("div");
        todoListContainer.id = "todo-list-view-container";

        const todoList = doc.createElement("table");
        todoList.id = "todo-list-table";
        todoList.innerHTML = `
            <tr class="todo-list-table-header-row">
                <th id="project-header" class="todo-list-table-header">Project</th>
                <th id="todo-header" class="todo-list-table-header">Todo</th>
                <th id="due-date-header" class="todo-list-table-header">Due</th>
                <th id="completed-header" class="todo-list-table-header">Complete</th>
            </tr>
        `;

        const projectHeader = todoList.querySelector("#project-header");
        const todoHeader = todoList.querySelector("#todo-header");
        const dueDateHeader = todoList.querySelector("#due-date-header");
        const completedHeader = todoList.querySelector("#completed-header");

        projectHeader.addEventListener("click", sortByProject);
        todoHeader.addEventListener("click", sortByTodo);
        dueDateHeader.addEventListener("click", sortByDueDate);
        completedHeader.addEventListener("click", sortByCompletion);

        const user = TodoApp.getCurrentUser();
        const projects = user.getAllProjects();

        projects.forEach(project => {
            const todos = project.getAllTodos();
            todos.forEach((todo, index) => {
                const todoRow = doc.createElement("tr");
                todoRow.classList.add("todo-list-row");
                todoRow.style.backgroundImage = `
                    linear-gradient(-90deg, hsl(${-10 + (todo.priority * 15)}, 95%, 78%) 1%, 
                                    var(--shadow-blue) 3%,
                                    var(--shadow-blue) 97%,
                                    hsl(${-10 + (todo.priority * 15)}, 95%, 78%) 99%)`;

                const projectTitle = doc.createElement("td");
                projectTitle.classList.add("todo-list-row-project-title");
                projectTitle.innerText = project.title;
                todoRow.appendChild(projectTitle)

                const todoTitle = doc.createElement('td');
                todoTitle.classList.add("todo-list-row-todo-title")
                todoTitle.innerText = todo.title;

                todoRow.appendChild(todoTitle);

                const todoDueDate = doc.createElement('td');
                todoDueDate.classList.add("todo-list-row-todo-due-date");
                todoDueDate.innerText = todo.dueDate;

                todoRow.appendChild(todoDueDate);

                const checkBoxWrapper = doc.createElement("td");
                const checkBoxContainer = doc.createElement("div");
                checkBoxContainer.classList.add("checkbox-container");
                checkBoxContainer.innerHTML = `
                    <input type="checkbox" name="todo-${index}" class="todo-check" 
                        tabindex="${(index + 2)}"></input>
                    <div class="todo-check-image-left unchecked"></div>
                    <div class="todo-check-image-right unchecked"></div>
                `;

                const checkBox = checkBoxContainer.querySelector('.todo-check');

                checkBox.checked = todo.checked;

                if (checkBox.checked) {
                    checkBoxContainer.style.border = "2px solid var(--contrast-green)";
                    checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)";
                } else {
                    checkBoxContainer.style.border = "2px solid var(--contrast-red)";
                    checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
                }

                checkBox.addEventListener("click", handleCheckBoxTodoList);
                checkBox.addEventListener("keydown", function(ev) {
                    if (ev.key === "Enter") {
                        ev.preventDefault();
                        handleCheckBoxTodoList(ev);
                    }
                });

                checkBoxWrapper.appendChild(checkBoxContainer);
                todoRow.appendChild(checkBoxWrapper);

                todoList.appendChild(todoRow);
            });
        });

        todoListContainer.appendChild(todoList);
        return todoListContainer;
    };

    const sortByProject = () => {
        const todoTable = doc.getElementById('todo-list-table');

        const rows = Array.from(todoTable.rows);
        const headerRow = rows.shift();

        if (state.todoListSortByProjAsc) {

            state.todoListSortByProjAsc = false;

            rows.sort(function(a, b) {
                const projA = a.cells[0].textContent.toLowerCase();
                const projB = b.cells[0].textContent.toLowerCase();

                if (projA < projB) {
                    return -1;
                }
                if (projA > projB) {
                    return 1;
                }

                return 0;
            });
        } else {
            state.todoListSortByProjAsc = true;

            rows.sort(function(a, b) {
                const projA = a.cells[0].textContent.toLowerCase();
                const projB = b.cells[0].textContent.toLowerCase();

                if (projA < projB) {
                    return 1;
                }
                if (projA > projB) {
                    return -1;
                }

                return 0;
            });
        }

        todoTable.appendChild(headerRow);
        rows.forEach(row => todoTable.appendChild(row));
    };

    const sortByTodo = () => {
        const todoTable = doc.getElementById('todo-list-table');

        const rows = Array.from(todoTable.rows);
        const headerRow = rows.shift();

        if (state.todoListSortByTodoAsc) {

            state.todoListSortByTodoAsc = false;

            rows.sort(function(a, b) {
                const todoA = a.cells[1].textContent.toLowerCase();
                const todoB = b.cells[1].textContent.toLowerCase();

                if (todoA < todoB) {
                    return -1;
                }
                if (todoA > todoB) {
                    return 1;
                }

                return 0;
            });
        } else {
            state.todoListSortByTodoAsc = true;

            rows.sort(function(a, b) {
                const todoA = a.cells[1].textContent.toLowerCase();
                const todoB = b.cells[1].textContent.toLowerCase();

                if (todoA < todoB) {
                    return 1;
                }
                if (todoA > todoB) {
                    return -1;
                }

                return 0;
            });
        }

        todoTable.appendChild(headerRow);
        rows.forEach(row => todoTable.appendChild(row));
    };

    const sortByDueDate = () => {
        const todoTable = doc.getElementById('todo-list-table');

        const rows = Array.from(todoTable.rows);
        const headerRow = rows.shift();


        if (state.todoListSortByDueDateAsc) {

            state.todoListSortByDueDateAsc = false;

            rows.sort(function(a, b) {
                const dateA = parse(a.cells[2].textContent, 'yyyy-MM-dd', new Date());
                const dateB = parse(b.cells[2].textContent, 'yyyy-MM-dd', new Date());

                return compareAsc(dateA, dateB);
            });

        } else {
            state.todoListSortByDueDateAsc = true;

            rows.sort(function(a, b) {
                const dateA = parse(a.cells[2].textContent, 'yyyy-MM-dd', new Date());
                const dateB = parse(b.cells[2].textContent, 'yyyy-MM-dd', new Date());

                return compareDesc(dateA, dateB);
            });
        }

        todoTable.appendChild(headerRow);
        rows.forEach(row => todoTable.appendChild(row));
    };

    const sortByCompletion = () => {
        const todoTable = doc.getElementById('todo-list-table');

        const rows = Array.from(todoTable.rows);
        const headerRow = rows.shift();


        if (state.todoListSortByCheckAsc) {

            state.todoListSortByCheckAsc = false;

            rows.sort(function(a, b) {
                const checkA = a.cells[3].querySelector('.todo-check').checked;
                const checkB = b.cells[3].querySelector('.todo-check').checked;

                if (checkA && !checkB) {
                    return 1;
                }

                if (!checkA && checkB) {
                    return -1;
                }

                return 0;
            });

        } else {

            state.todoListSortByCheckAsc = true;

            rows.sort(function(a, b) {
                const checkA = a.cells[3].querySelector('.todo-check').checked;
                const checkB = b.cells[3].querySelector('.todo-check').checked;

                if (checkA && !checkB) {
                    return -1;
                }

                if (!checkA && checkB) {
                    return 1;
                }

                return 0;
            });

        }

        todoTable.appendChild(headerRow);
        rows.forEach(row => todoTable.appendChild(row));
    };

    const generateUserNameHeader = (username) => {
        const userName = doc.createElement('h1');
        userName.innerText = username;
        userName.id = "user-name";
        userName.classList.add('yellow');

        const userNameContainer = doc.createElement('div');
        userNameContainer.id = "user-name-container";
        userNameContainer.appendChild(userName);

        userNameContainer.addEventListener("click", function() {
            state.currentUserNameColorIndex = (state.currentUserNameColorIndex + 1) % 4;

            switch (state.currentUserNameColorIndex) {
                case 0:
                    userName.classList.add("yellow");
                    userName.classList.remove("green");
                    break;
                case 1:
                    userName.classList.add("orange");
                    userName.classList.remove("yellow");
                    break;
                case 2:
                    userName.classList.add("red");
                    userName.classList.remove("orange");
                    break;
                case 3:
                    userName.classList.add("green");
                    userName.classList.remove("red");
                    break;
            }
        });

        return userNameContainer;
    };

    const generateCreateProjectBtn = () => {
        const btnContainer = doc.createElement('div');
        btnContainer.classList.add('btn-container');
        btnContainer.classList.add('header-btn');
        btnContainer.classList.add('fade-btn');

        const createProjectBtn = doc.createElement('div');
        createProjectBtn.id = "create-project-btn";
        btnContainer.innerHTML = `
            <div class="create-project-btn-vertical"></div>
            <div class="create-project-btn-vertical-blackout"></div>
            <div class="create-project-btn-horizontal"></div>
            <div class="create-project-btn-horizontal-blackout"></div>
        `;

        const actualCreateProjectBtn = doc.createElement('button');
        actualCreateProjectBtn.classList.add('invisible-btn');
        actualCreateProjectBtn.classList.add('header-btn');
        actualCreateProjectBtn.onclick = () => {
            window.removeEventListener("keypress", scrollProjects);

            const expandedProject = doc.querySelector('.expanded');

            if (expandedProject !== null) {
                const shrinkExpandedAddProject = new CustomEvent('addProjectShrink', {
                    target: expandedProject,
                });

                expandedProject.dispatchEvent(shrinkExpandedAddProject);
            }

            renderCreateNewProjectModal();

            if (state.currentView === "todo-list") {

                switchToProjectGrid();
            }
        };

        btnContainer.appendChild(createProjectBtn);
        btnContainer.appendChild(actualCreateProjectBtn);

        return btnContainer;
    };

    const generateSwitchViewBtn = () => {
        const btnContainer = doc.createElement('div');
        btnContainer.id = "switch-view-btn-container";
        btnContainer.classList.add('btn-container');
        btnContainer.classList.add('header-btn');
        btnContainer.classList.add('fade-btn');

        btnContainer.innerHTML = `
            <div id ="switch-btn-circle"></div>
            <div id="switch-btn-eye"></div>
            <div id="switch-btn-pupil"></div>
            <div id="switch-btn-iris"></div>
            <div id="switch-btn-eyelid"></div>
        `;

        const iris = btnContainer.querySelector("#switch-btn-iris");
        const pupil = btnContainer.querySelector("#switch-btn-pupil");

        iris.innerText = "T";
        pupil.innerText = "P";
        pupil.classList.add("active");

        const splitBtnIris = doc.createElement('button');
        splitBtnIris.id = "split-btn-iris";
        splitBtnIris.classList.add("invisible-btn");
        splitBtnIris.classList.add("small-btn");
        splitBtnIris.classList.add("hide-btn");
        splitBtnIris.onclick = () => {
            if (iris.classList.contains("active")) {
                return;
            }

            iris.classList.add("active");
            pupil.classList.remove("active");
            switchToTodoList();
        };

        const splitBtnPupil = doc.createElement('button');
        splitBtnPupil.id = "split-btn-pupil";
        splitBtnPupil.classList.add("invisible-btn");
        splitBtnPupil.classList.add("small-btn");
        splitBtnPupil.classList.add("hide-btn");

        splitBtnPupil.onclick = () => {
            if (pupil.classList.contains("active")) {
                return;
            }

            iris.classList.remove("active");
            pupil.classList.add("active");
            switchToProjectGrid();
        };


        const actualBtn = doc.createElement('button');
        actualBtn.classList.add('invisible-btn');
        actualBtn.classList.add('header-btn');
        actualBtn.id = "switch-view-btn";
        const eyeComponents = Array.from(btnContainer.querySelectorAll('[id^="switch-btn-"]'));

        actualBtn.onclick = () => {
            eyeComponents.forEach(component => {
                component.classList.toggle("split")
            });

            actualBtn.classList.toggle("split");
            splitBtnPupil.classList.toggle("hide-btn");
            splitBtnIris.classList.toggle("hide-btn");
        };

        actualBtn.addEventListener("closeViewBtn", function() {
            eyeComponents.forEach(component => {
                component.classList.remove("split")
            });

            actualBtn.classList.remove("split");
            splitBtnPupil.classList.add("hide-btn");
            splitBtnIris.classList.add("hide-btn");

            if (state.currentView === "todo-list") {
                iris.classList.remove("active");
                pupil.classList.add("active");

                switchToProjectGrid();
            }
        });

        btnContainer.appendChild(actualBtn);
        btnContainer.appendChild(splitBtnIris);
        btnContainer.appendChild(splitBtnPupil);

        return btnContainer;
    };

    const renderProjectGrid = () => {
        const projectGridOuter = doc.createElement('div');
        const projectGrid = doc.createElement('div');
        projectGridOuter.id = "project-grid-outer";
        projectGrid.id = "project-grid";

        projectGridOuter.appendChild(projectGrid);

        window.addEventListener("keypress", scrollProjects);
        return projectGridOuter;
    };

    const scrollProjects = (ev) => {
        const allProjects = Array.from(doc.querySelectorAll('[id^="project-card-"]'));
        const focussedProject = allProjects.find(proj => proj === document.activeElement);
        if (allProjects.length === 0) {
            return;
        }

        if (ev.key === "<") {
            ev.preventDefault();
            scrollProjectsLeft(focussedProject, allProjects);
        } else if (ev.key === ">") {
            ev.preventDefault();
            scrollProjectsRight(focussedProject, allProjects);
        } else if (ev.key === "Enter" && !ev.target.classList.contains("invisible-btn")) {
            // Only if not currently focussed on button that could use the Enter key
            ev.preventDefault();

            if (ev.target.classList.contains("expanding") ||
                ev.target.classList.contains("shrinking")
            ) {
                return;
            }
            renderExpandedProject(ev);
        }
    };

    const scrollProjectsLeft = (focussedProject, allProjects) => {
        if (focussedProject === undefined) {
            allProjects[0].focus();
            return;
        }

        const focussedProjectIndex = allProjects.indexOf(focussedProject);
        const nextProject = allProjects[(focussedProjectIndex + 1) % allProjects.length];

        nextProject.focus()
    };


    const scrollProjectsRight = (focussedProject, allProjects) => {
        if (focussedProject === undefined) {
            allProjects[0].focus();
            return;
        }


        const focussedProjectIndex = allProjects.indexOf(focussedProject);
        let nextProject;

        if (focussedProjectIndex === 0) {
            nextProject = allProjects[allProjects.length - 1];
        } else {
            nextProject = allProjects[(focussedProjectIndex - 1) % allProjects.length];
        }

        nextProject.focus()
    };

    const renderSidebar = () => {
        const dashboardSidebar = doc.createElement('div');
        dashboardSidebar.id = "dashboard-sidebar";

        return dashboardSidebar;
    };


    const renderCreateNewProjectModal = () => {
        const createProjectModalContainer = doc.createElement('div');
        createProjectModalContainer.id = "create-project-modal-container"

        createProjectModalContainer.innerHTML = `
            <form action="#" id="create-project-form" method="POST">
                <h2 id="create-project-title">Create a new Project</h2>
                <label for="create-project-name" class="create-project-label"><span class="warn-hl">*</span> Name: </label>
                <input type="text" value="" name="create-project-name" id="create-project-name-input" 
                maxlength="60" class="required">
                <label for="create-project-description" class="create-project-label">Description:</label>
                <textarea type="text" value="" name="create-project-description" id="create-project-description-input" 
                maxlength="150"></textarea>
                <label for="create-project-todo-count" class="create-project-label"><span class="warn-hl">*</span> Number of todos:</label>
                <input type="number" value="" name="create-project-todo-count" 
                id="create-project-todo-count-input" min="1" max="12" class="required">
                <h3 id="todo-input-container-title">Todos:</h3>
                <div id="todo-input-container">
                    <!-- Dynamic todo item inputs will be added here -->
                </div>
                <button type="button" id="confirm-create-project-btn">Confirm</button>
                <button type="button" id="cancel-create-project-btn">Cancel</button>
            </input>
        `;

        const confirmCreateProjectBtn = createProjectModalContainer.querySelector('#confirm-create-project-btn');
        const cancelCreateProjectBtn = createProjectModalContainer.querySelector('#cancel-create-project-btn');

        confirmCreateProjectBtn.onclick = (ev) => {
            createProjectModalContainer.removeEventListener("keypress", scrollTodosKeyPress);
            window.addEventListener("keypress", scrollProjects);
            UserEvents.createNewProject(ev);
        }

        confirmCreateProjectBtn.disabled = true;
        cancelCreateProjectBtn.onclick = () => {
            createProjectModalContainer.removeEventListener("keypress", scrollTodosKeyPress);
            window.addEventListener("keypress", scrollProjects);
            UserEvents.closeModal(createProjectModalContainer);
        };

        const todoInputContainer = createProjectModalContainer.querySelector('#todo-input-container');

        const createProjectNameInput = createProjectModalContainer.querySelector('#create-project-name-input');
        createProjectNameInput.addEventListener('input', handleModalInputChanges);

        createProjectModalContainer.addEventListener("shown.bs.createProjectModalContainer", setFocusToFirstInput(createProjectNameInput));
        // Check the project name is unique
        createProjectNameInput.addEventListener('blur', (ev) => {
            handleCreateProjectNameInputEvent(ev.target, todoInputContainer);
        });

        const createProjectTodoCountInput = createProjectModalContainer.querySelector('#create-project-todo-count-input');
        createProjectTodoCountInput.addEventListener('input', handleModalInputChanges);
        // Stores chosen todo names to check uniqueness and count names
        let todoCount = 0;

        // Check if the todo count is a valid number and not over max
        // If so, generate inputs for that number of todos
        createProjectTodoCountInput.addEventListener('input', (ev) => {
            renderTodoContainers(ev, todoCount, createProjectModalContainer, createProjectTodoCountInput);
        });

        window.removeEventListener("keypress", scrollProjects);
        createProjectModalContainer.addEventListener("keypress", scrollTodosKeyPress);

        app.appendChild(createProjectModalContainer);

        const switchViewBtn = doc.getElementById('switch-view-btn');
        const closeViewBtnEvent = new CustomEvent('closeViewBtn', {
            target: switchViewBtn,
        });

        switchViewBtn.dispatchEvent(closeViewBtnEvent);

    };

    const handleCreateProjectNameInputEvent = (createProjectNameInput, todoInputContainer) => {
        const user = TodoApp.getCurrentUser();
        const uniqueName = user.checkUniqueProjectName(createProjectNameInput.value);
        if (uniqueName !== -1) {
            const existingWarning = todoInputContainer.querySelector('[id^="warn-"]');

            if (existingWarning !== null) {
                todoInputContainer.removeChild(existingWarning);
            }

            const warnNonUniqueProjectName = doc.createElement('p');
            warnNonUniqueProjectName.id = "warn-non-unique-project-name";
            warnNonUniqueProjectName.innerText = `You already have a project named "${createProjectNameInput.value}", 
                                                      please choose a unique project name`;
            todoInputContainer.appendChild(warnNonUniqueProjectName);
        } else {
            const existingWarning = todoInputContainer.querySelector('[id^="warn-"]');

            if (existingWarning !== null) {
                todoInputContainer.removeChild(existingWarning);
            }
        }
    };

    const renderTodoContainers = (ev, todoCount, createProjectModalContainer, createProjectTodoCountInput) => {
        todoCount = parseInt(ev.target.value);
        const todoNames = [];

        const todoInputContainer = createProjectModalContainer.querySelector('#todo-input-container');
        const warnNonUniqueProjectName = todoInputContainer.querySelector('#warn-non-unique-project-name');

        if (warnNonUniqueProjectName) {
            return;
        }

        const createProjectForm = createProjectModalContainer.querySelector('#create-project-form');

        if (ev.target.value === "") {

            const existingTodoContainers = Array.from(createProjectForm.querySelectorAll('[id^="todo-input-card-"]'));
            if (existingTodoContainers.length > 0) {
                existingTodoContainers.forEach(container => todoInputContainer.removeChild(container));
            }

            createProjectForm.classList.remove('todos-counted');

        } else {
            createProjectForm.classList.add('todos-counted');
        }

        if (isNaN(todoCount)) {
            const existingWarning = todoInputContainer.querySelector('[id^="warn-"]');

            if (existingWarning !== null) {
                todoInputContainer.removeChild(existingWarning);
            }

            const warnNotANumber = doc.createElement('p');
            warnNotANumber.id = "warn-not-a-number";
            warnNotANumber.innerText = `The value you have entered is not a number, 
                                            please insert a number, max = 12.`;
            todoInputContainer.appendChild(warnNotANumber);

            const btnsPresent = todoInputContainer.querySelector('#left-right-todo-btns-container');

            if (btnsPresent) {
                todoInputContainer.removeChild(btnsPresent);
            }

            return;
        }

        if (todoCount > createProjectTodoCountInput.max) {
            const existingWarning = todoInputContainer.querySelector('[id^="warn-"]');

            if (existingWarning !== null) {
                todoInputContainer.removeChild(existingWarning);
            }

            const warnTooManyTodos = doc.createElement('p');
            warnTooManyTodos.id = "warn-too-many-todos";
            warnTooManyTodos.innerText = `${todoCount} is too many todos, max = 12.`;
            todoInputContainer.appendChild(warnTooManyTodos);
            return;
        }

        todoInputContainer.innerHTML = ''; // Clear existing inputs

        for (let i = 0; i < todoCount; i++) {
            renderTodoInputCard(i, todoInputContainer, todoNames);
        };

        if (todoCount > 0) {
            todoInputContainer.appendChild(renderLeftRightTodoBtns());
        }

    };

    const renderTodoInputCard = (i, todoInputContainer, todoNames) => {
        const todoInputCard = doc.createElement('div');
        todoInputCard.innerHTML = `
                    <p class="todo-input-card-title">Todo ${i + 1}</p>
                    <input type="text" name="new-todo-name-${i + 1}" class="create-project-todo-input required"
                    maxlength="40" placeholder="Name">
                    <input type="text" name="new-todo-description-${i + 1}" class="create-project-todo-input"
                    maxlength="150" placeholder="Description">
                    <input type="text" name="new-todo-due-date-${i + 1}" class="create-project-todo-input"
                    placeholder="Date: YYYY-MM-DD">
                    <input type="number" name="new-todo-priority-${i + 1}" class="create-project-todo-input"
                    placeholder="Priority: 0-10" min="1" max="10">
                    <textarea name="new-todo-notes-${i + 1}" class="create-project-todo-textarea"
                    maxlength="150" placeholder="Notes"></textarea>
                `;

        todoInputCard.id = `todo-input-card-${i + 1}`;

        if (i > 0) {
            todoInputCard.classList.add('hide-right');
        }

        const todoNameInput = todoInputCard.querySelector('[name^="new-todo-name-"]');
        todoNameInput.addEventListener('input', handleModalInputChanges);

        todoNameInput.addEventListener('input', () => {
            handleTodoNameInputEvent(i, todoNames, todoNameInput, todoInputContainer);
        });

        const todoDateInput = todoInputCard.querySelector('[name^="new-todo-due-date-"]');
        todoDateInput.addEventListener('blur', (ev) => {
            handleTodoDateInputEvent(ev, todoInputContainer);
        });

        const todoPriorityInput = todoInputCard.querySelector('[name^="new-todo-priority-"]');
        todoPriorityInput.addEventListener('blur', (ev) => {
            handleTodoPriorityInputEvent(ev, todoInputContainer);
        });

        todoInputContainer.appendChild(todoInputCard);
    };

    const handleModalInputChanges = () => {
        const user = TodoApp.getCurrentUser();
        const newProjectName = doc.getElementById("create-project-name-input").value;
        const uniqueProjectName = user.checkUniqueProjectName(newProjectName);

        const projectTodoCount = doc.getElementById("create-project-todo-count-input");
        const confirmCreateProjectBtn = doc.getElementById("confirm-create-project-btn");
        const todoNames = Array.from(doc.querySelectorAll('[name^="new-todo-name-"]'));
        const todoNamesFilled = todoNames.filter(todoName => todoName.value !== "");

        setTimeout(() => {
            const warnings = Array.from(doc.querySelectorAll('[id^="warn-"]'));
            if (uniqueProjectName !== -1 ||
                parseInt(projectTodoCount.value) > parseInt(projectTodoCount.max) ||
                projectTodoCount.value === "" ||
                todoNames.length !== todoNamesFilled.length ||
                todoNamesFilled.length === 0 ||
                warnings.length > 0
            ) {
                confirmCreateProjectBtn.disabled = true;
                return;
            }

            confirmCreateProjectBtn.disabled = false;
            confirmCreateProjectBtn.classList.add("activated");
        }, 300);

    }

    const handleTodoNameInputEvent = (currentTNI, todoNames, todoNameInput, todoInputContainer) => {
        const todoName = todoNameInput.value;
        const todoPresentInArr = todoNames.findIndex(existingTodoName => existingTodoName === todoName);
        if (todoPresentInArr !== -1) {
            // If the warning is already present, dont append another one
            const existingSameWarning = todoInputContainer.querySelector('#warn-non-unique-todo-name');
            if (existingSameWarning !== null) {
                return;
            }

            const warnNonUniqueTodoName = doc.createElement('p');
            warnNonUniqueTodoName.id = "warn-non-unique-todo-name";
            warnNonUniqueTodoName.innerText = `A todo named "${todoName}" already exists in this project,
                                                            please choose a unique name for each todo in a project.`;

            todoInputContainer.appendChild(warnNonUniqueTodoName);
            return;
        } else {
            // Remove existing warning if present
            const existingWarning = todoInputContainer.querySelector('#warn-non-unique-todo-name');
            if (existingWarning !== null) {
                todoInputContainer.removeChild(existingWarning);
            }
            if (todoName !== "") {
                todoNames[currentTNI] = todoName;
                state.currentTodoNames[currentTNI] = todoName;
            }
        }
    };

    const handleTodoDateInputEvent = (ev, parent) => {
        const userInput = ev.target.value;
        const parsedDate = parse(userInput, 'yyyy-MM-dd', new Date());
        const isValidDate = isValid(parsedDate);

        const today = new Date();
        const isAfterOrOnToday = isSameDay(parsedDate, today) || isAfter(parsedDate, today);

        if (!isValidDate) {
            const existingDateWarning = doc.querySelector('[id^="warn-date-"]');
            if (existingDateWarning !== null) {
                parent.removeChild(existingDateWarning);
            }
            const warnInvalidDate = doc.createElement('p');
            warnInvalidDate.id = "warn-date-invalid";
            warnInvalidDate.innerText = `${userInput} is not a valid date, format: YYYY-MM-DD.`;
            parent.appendChild(warnInvalidDate);
            return false;

        } else if (!isAfterOrOnToday) {
            const existingDateWarning = doc.querySelector('[id^="warn-date-"]');
            if (existingDateWarning !== null) {
                parent.removeChild(existingDateWarning);
            }
            const warnPastDate = doc.createElement('p');
            warnPastDate.id = "warn-date-past";
            warnPastDate.innerText = `${userInput} occurs before todays date, ${format(today, 'yyyy-MM-dd')}.`;
            parent.appendChild(warnPastDate);
            return false;

        }

        const existingDateWarning = doc.querySelector('[id^="warn-date-"]');
        if (existingDateWarning !== null) {
            parent.removeChild(existingDateWarning);
        }

        return true;
    };

    const handleTodoPriorityInputEvent = (ev, parent) => {
        const userInput = ev.target.value;
        if (userInput === "") {
            const existingPriorityWarning = doc.querySelector('[id^="warn-priority-"]');
            if (existingPriorityWarning !== null) {
                parent.removeChild(existingPriorityWarning);
            }
            const warnPriorityNaN = doc.createElement('p');
            warnPriorityNaN.id = "warn-priority-nan";
            warnPriorityNaN.innerText = `Priority input is not a number. Priority = 1-10.`;
            parent.appendChild(warnPriorityNaN);

            return false;

        } else if (parseInt(userInput) < parseInt(ev.target.min)) {
            const existingPriorityWarning = doc.querySelector('[id^="warn-priority-"]');
            if (existingPriorityWarning !== null) {
                parent.removeChild(existingPriorityWarning);
            }
            const warnPriorityUnderMin = doc.createElement('p');
            warnPriorityUnderMin.id = "warn-priority-under-min";
            warnPriorityUnderMin.innerText = `${userInput} is too low. Min priority = 1.`;
            parent.appendChild(warnPriorityUnderMin);
            return false;

        } else if (parseInt(userInput) > parseInt(ev.target.max)) {
            const existingPriorityWarning = doc.querySelector('[id^="warn-priority-"]');
            if (existingPriorityWarning !== null) {
                parent.removeChild(existingPriorityWarning);
            }
            const warnPriorityOverMax = doc.createElement('p');
            warnPriorityOverMax.id = "warn-priority-over-max";
            warnPriorityOverMax.innerText = `${userInput} is too high. Max priority = 10.`;
            parent.appendChild(warnPriorityOverMax);
            return false;

        }

        const existingPriorityWarning = doc.querySelector('[id^="warn-priority-"]');
        if (existingPriorityWarning !== null) {
            parent.removeChild(existingPriorityWarning);
        }

        return true;
    };

    const renderLeftRightTodoBtns = () => {
        // Add left and right buttons for todo carousel
        const leftBtnContainer = doc.createElement('div');
        leftBtnContainer.classList.add('btn-container');
        leftBtnContainer.classList.add('big-btn');

        const leftTodoBtnTop = doc.createElement('div');
        leftTodoBtnTop.classList.add("left-todos-btn-top");
        const leftTodoBtnBottom = doc.createElement('div');
        leftTodoBtnBottom.classList.add("left-todos-btn-bottom");

        const leftTodoBtnTopTwo = doc.createElement('div');
        const leftTodoBtnBottomTwo = doc.createElement('div');
        leftTodoBtnTopTwo.classList.add("left-todos-btn-top");
        leftTodoBtnBottomTwo.classList.add("left-todos-btn-bottom");

        const leftTodoBtnTwoContainer = doc.createElement('div');
        leftTodoBtnTwoContainer.classList.add('left-todo-container-two');
        leftTodoBtnTwoContainer.appendChild(leftTodoBtnTopTwo);
        leftTodoBtnTwoContainer.appendChild(leftTodoBtnBottomTwo);

        const leftTodoBtnTopThree = doc.createElement('div');
        const leftTodoBtnBottomThree = doc.createElement('div');
        leftTodoBtnTopThree.classList.add("left-todos-btn-top");
        leftTodoBtnBottomThree.classList.add("left-todos-btn-bottom");

        const leftTodoBtnThreeContainer = doc.createElement('div');
        leftTodoBtnThreeContainer.classList.add('left-todo-container-three');
        leftTodoBtnThreeContainer.appendChild(leftTodoBtnTopThree);
        leftTodoBtnThreeContainer.appendChild(leftTodoBtnBottomThree);

        const actualLeftTodoBtn = doc.createElement('button');
        actualLeftTodoBtn.classList.add('invisible-btn');
        actualLeftTodoBtn.classList.add('big-btn');
        actualLeftTodoBtn.type = "button";
        actualLeftTodoBtn.onclick = scrollTodosLeft;

        leftBtnContainer.appendChild(leftTodoBtnTop);
        leftBtnContainer.appendChild(leftTodoBtnBottom);
        leftBtnContainer.appendChild(leftTodoBtnTwoContainer);
        leftBtnContainer.appendChild(leftTodoBtnThreeContainer);
        leftBtnContainer.appendChild(actualLeftTodoBtn);

        const rightBtnContainer = doc.createElement('div');
        rightBtnContainer.classList.add('btn-container');
        rightBtnContainer.classList.add('big-btn');

        const rightTodoBtnTop = doc.createElement('div');
        const rightTodoBtnBottom = doc.createElement('div');
        rightTodoBtnTop.classList.add("right-todos-btn-top");
        rightTodoBtnBottom.classList.add("right-todos-btn-bottom");

        const rightTodoBtnTopTwo = doc.createElement('div');
        const rightTodoBtnBottomTwo = doc.createElement('div');
        rightTodoBtnTopTwo.classList.add("right-todos-btn-top");
        rightTodoBtnBottomTwo.classList.add("right-todos-btn-bottom");

        const rightTodoBtnTwoContainer = doc.createElement('div');
        rightTodoBtnTwoContainer.classList.add('right-todo-container-two');
        rightTodoBtnTwoContainer.appendChild(rightTodoBtnTopTwo);
        rightTodoBtnTwoContainer.appendChild(rightTodoBtnBottomTwo);

        const rightTodoBtnTopThree = doc.createElement('div');
        const rightTodoBtnBottomThree = doc.createElement('div');
        rightTodoBtnTopThree.classList.add("right-todos-btn-top");
        rightTodoBtnBottomThree.classList.add("right-todos-btn-bottom");

        const rightTodoBtnThreeContainer = doc.createElement('div');
        rightTodoBtnThreeContainer.classList.add('right-todo-container-three');
        rightTodoBtnThreeContainer.appendChild(rightTodoBtnTopThree);
        rightTodoBtnThreeContainer.appendChild(rightTodoBtnBottomThree);

        const actualRightTodoBtn = doc.createElement('button');
        actualRightTodoBtn.classList.add('invisible-btn');
        actualRightTodoBtn.classList.add('big-btn');
        actualRightTodoBtn.type = "button";
        actualRightTodoBtn.onclick = scrollTodosRight;

        rightBtnContainer.appendChild(rightTodoBtnTop);
        rightBtnContainer.appendChild(rightTodoBtnBottom);
        rightBtnContainer.appendChild(rightTodoBtnTwoContainer);
        rightBtnContainer.appendChild(rightTodoBtnThreeContainer);
        rightBtnContainer.appendChild(actualRightTodoBtn);

        const leftRightTodoBtnContainer = doc.createElement('div');
        leftRightTodoBtnContainer.id = "left-right-todo-btns-container";
        leftRightTodoBtnContainer.appendChild(leftBtnContainer);
        leftRightTodoBtnContainer.appendChild(rightBtnContainer);

        return leftRightTodoBtnContainer;

    };

    const scrollTodosKeyPress = (ev) => {
        if (ev.key === ">") {
            ev.preventDefault();
            scrollTodosLeft();
        } else if (ev.key === "<") {
            ev.preventDefault();
            scrollTodosRight();
        }
    };

    const scrollTodosLeft = () => {
        const todos = Array.from(doc.querySelectorAll('[id^="todo-input-card-"]'));

        const visibleTodo = todos.find(todo => {
            return !todo.classList.contains('hide-left') &&
                !todo.classList.contains('hide-right');
        });

        const visibleTodoIdNum = parseInt(visibleTodo.id.match(/\d+/g));

        // If there are no todos to the left
        if (visibleTodoIdNum === 1) {
            return;
        }

        const nextTodo = todos.find(todo => {
            return parseInt(todo.id.match(/\d+/g)) + 1 === visibleTodoIdNum
        });

        visibleTodo.classList.add('hide-right');
        nextTodo.classList.remove('hide-left');
        const todoNameInput = nextTodo.querySelector('input[name^="new-todo-name-"]');
        todoNameInput.focus();
    };

    const scrollTodosRight = () => {
        const todos = Array.from(doc.querySelectorAll('[id^="todo-input-card-"]'));

        const visibleTodo = todos.find(todo => {
            return !todo.classList.contains('hide-left') &&
                !todo.classList.contains('hide-right');
        });

        const visibleTodoIdNum = parseInt(visibleTodo.id.match(/\d+/g));
        const maxNumTodos = parseInt(doc.querySelector('#create-project-todo-count-input').value);

        // If there are no more todos to the right
        if (visibleTodoIdNum === maxNumTodos) {
            const confirmCreateProjectBtn = doc.getElementById('confirm-create-project-btn');
            confirmCreateProjectBtn.focus();
            return;
        }

        const nextTodo = todos.find(todo => {
            return parseInt(todo.id.match(/\d+/g)) - 1 === visibleTodoIdNum;
        });


        visibleTodo.classList.add('hide-left');
        nextTodo.classList.remove('hide-right');
        const todoNameInput = nextTodo.querySelector('input[name^="new-todo-name-"]');
        todoNameInput.focus();
    };

    const renderDeleteProjectModal = (ev) => {
        const deleteProjectModalContainer = doc.createElement('div');
        deleteProjectModalContainer.id = "delete-project-modal-container";

        deleteProjectModalContainer.innerHTML = `
            <div id="delete-project-modal-inner">
                <h2 id="delete-project-modal-title"></h2>  
                <button type="button" id="confirm-delete-project-btn">Confirm</button>
                <button type="button" id="cancel-delete-project-btn">Cancel</button>
            </div>
        `;

        const confirmDeleteBtn = deleteProjectModalContainer.querySelector('#confirm-delete-project-btn');
        const cancelDeleteBtn = deleteProjectModalContainer.querySelector('#cancel-delete-project-btn');
        const deleteProjectTitle = deleteProjectModalContainer.querySelector('#delete-project-modal-title');
        const projectToRemove = ev.target.parentNode.parentNode.parentNode.parentNode;
        const projectToRemoveTitle = projectToRemove.querySelector('.project-title').innerText;

        deleteProjectTitle.innerText = `Are you sure you 
                                        would like to delete
                                        "${projectToRemoveTitle}"`;
        confirmDeleteBtn.onclick = () => {
            UserEvents.deleteProject(projectToRemoveTitle);

            if (projectToRemove.classList.contains('expanded')) {
                const dashboardContainer = doc.getElementById('dashboard-container');
                const projectGridOuter = doc.createElement('div');
                projectGridOuter.id = "project-grid-outer";

                const projectGrid = state.currentProjectGrid;

                projectGridOuter.appendChild(projectGrid)
                dashboardContainer.appendChild(projectGridOuter);
            }
        };

        cancelDeleteBtn.onclick = () => UserEvents.closeModal(deleteProjectModalContainer);

        app.appendChild(deleteProjectModalContainer);

    };

    const renderNewProject = (project) => {
        const projectGrid = doc.getElementById('project-grid');

        const newProjectCard = doc.createElement('div');
        const moddedProjectTitle = project.title.replaceAll(" ", "-");
        newProjectCard.id = `project-card-${moddedProjectTitle}`;

        state.progressBarPercentages[state.progressBarCount] = 0;

        newProjectCard.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-utils">
                <div class="progress-bar-bg">
                    <div id="progress-${state.progressBarCount}" class="progress-bar"></div>
                </div>
            </div>
        `;

        state.progressBarCount++;

        // Delete btn + icon
        const btnContainer = doc.createElement('div');
        btnContainer.classList.add('btn-container');
        btnContainer.classList.add('big-btn');

        const deleteBtn = renderDeleteBtn();

        const actualDeleteBtn = doc.createElement('button');
        actualDeleteBtn.classList.add('invisible-btn');
        actualDeleteBtn.classList.add('big-btn');

        actualDeleteBtn.addEventListener("click", function(ev) {
            ev.stopPropagation();
            renderDeleteProjectModal(ev);
        });

        deleteBtn.appendChild(actualDeleteBtn);
        btnContainer.appendChild(deleteBtn);

        const projectUtils = newProjectCard.querySelector('.project-utils');
        projectUtils.appendChild(btnContainer);

        newProjectCard.addEventListener('click', renderExpandedProject);
        newProjectCard.addEventListener('keypress', renderExpandedProjectKeyEnter);

        newProjectCard.addEventListener('searchGrow', function(ev) {
            renderExpandedProject(ev);
        });

        newProjectCard.addEventListener('searchShrink', function(ev) {
            renderShrunkProject(ev);
        });

        newProjectCard.addEventListener('addProjectShrink', function(ev) {
            renderShrunkProject(ev);
        });

        const user = TodoApp.getCurrentUser();
        newProjectCard.tabIndex = user.getAllProjects().length;


        projectGrid.appendChild(newProjectCard);
        state.currentProjectGrid = projectGrid;
    };

    const renderExpandedProjectKeyEnter = (ev) => {
        ev.target.removeEventListener("keypress", renderExpandedProjectKeyEnter);
        if (ev.key === "Enter") {
            ev.stopImmediatePropagation();
            if (ev.target.classList.contains("expanded") ||
                !ev.target.id.includes("project-card-") ||
                ev.target.classList.contains("expanding")
            ) {
                return;
            } else {
                renderExpandedProject(ev);
            }
        }
    }

    const renderDeleteBtn = () => {
        const deleteBtnContainer = doc.createElement('div');
        deleteBtnContainer.classList.add('delete-btn-container');
        deleteBtnContainer.classList.add('big-btn');

        deleteBtnContainer.innerHTML = `
            <div class="bin-body"></div>
            <div class="bin-lid-bottom"></div>
            <div class="bin-lid-top"></div>
            <div class="bin-lid-bottom-blackout"></div>
            <div class="bin-lid-top-blackout"></div>
            <div class="bin-body-line-one"></div>
            <div class="bin-body-line-two"></div>
            <div class="bin-body-line-three"></div>
        `;

        return deleteBtnContainer;
    };

    const removeProjectFromProjectGrid = (projectTitle) => {
        const moddedProjectTitle = projectTitle.replaceAll(" ", "-");
        const projectCardId = `project-card-${moddedProjectTitle}`;
        const projectGrid = doc.getElementById('project-grid');
        const projectToRemove = doc.querySelector(`#${projectCardId}`);

        // If expanded project deleted, return to projectGrid without
        // the deleted project-card
        if (projectToRemove.classList.contains("expanded")) {
            const dashboardContainer = doc.getElementById('dashboard-container');
            dashboardContainer.removeChild(projectToRemove);

            const projectGrid = state.currentProjectGrid;

            const projectToRemoveInGrid = projectGrid.querySelector(`#${projectCardId}`);
            projectGrid.removeChild(projectToRemoveInGrid);

            const otherProjects = Array.from(projectGrid.querySelectorAll('[id^="project-card-"]'));
            const deleteBtns = Array.from(projectGrid.querySelectorAll('.invisible-btn'));

            deleteBtns.forEach(btn => {
                btn.addEventListener("click", function(ev) {
                    ev.stopPropagation();
                    renderDeleteProjectModal(ev);
                });
            });

            otherProjects.forEach(proj => {
                proj.addEventListener('click', renderExpandedProject);
                proj.addEventListener("keypress", renderExpandedProjectKeyEnter);
                proj.classList.remove('expanded');
            });

            dashboardContainer.appendChild(projectGrid);
        } else {
            projectGrid.removeChild(projectToRemove);
            state.currentProjectGrid = projectGrid;
        }
    };

    const renderExpandedProject = (ev) => {
        ev.target.removeEventListener("keypress", renderExpandedProjectKeyEnter);
        if (Array.from(ev.target.classList).includes("expanded")) {
            renderShrunkProject(ev);
            return;
        }

        let projectCard;
        let gridRect;

        if (ev instanceof MouseEvent) {
            // Check if the target of the click event is the delete icon
            // Or the project card has already been expanded
            // If yes, Return early without triggering the expansion
            if (ev.target.classList.contains('invisible-btn') ||
                ev.currentTarget.classList.contains('expanded')) {
                return;
            }
            projectCard = ev.currentTarget;
            gridRect = ev.currentTarget.parentNode.getBoundingClientRect();

        } else {
            // If keypress event, use target instead of currentTarget
            // If not a project-card, dont expand
            if (!ev.target.id.includes("project-card-")) {
                return;
            }
            projectCard = ev.target;
            gridRect = ev.target.parentNode.getBoundingClientRect();
        }

        projectCard.removeEventListener("click", renderExpandedProject);

        const projectGrid = doc.getElementById('project-grid');
        // Call the function to store the current project grid
        // before the projectCard is removed from it.
        storeCurrentProjectGrid(projectGrid);

        const projectGridOuter = projectGrid.parentNode;

        const styleSheet = getExpansionAnimation(projectCard, projectGrid, gridRect);

        const handleExpansionAnimationEnd = () => {
            // Stop the stylesheets from piling up
            if (styleSheet.parentNode) {
                styleSheet.parentNode.removeChild(styleSheet);
            }

            const dashboardContainer = doc.getElementById('dashboard-container');

            projectCard.classList.remove('expanding');
            projectCard.classList.add('expanded');
            projectCard.tabindex = "1";

            const projectTodoListContainer = doc.createElement('div');
            const projectTodoListContainerOuter = doc.createElement('div');
            projectTodoListContainerOuter.classList.add('project-todos-list-container-outer');
            projectTodoListContainer.classList.add('project-todos-list-container');
            projectTodoListContainer.classList.add('invisible');
            projectTodoListContainerOuter.appendChild(projectTodoListContainer);

            projectTodoListContainer.innerHTML = `
                <h4 class="project-todos-list-title">Todos:</h4>
                <h4 class="project-todos-checkbox-title">Completed:</h4>
                <ul class="project-todos-list">
                    <!-- Dynamically add todos later --> 
                </ul>
            `;

            const projectTodoList = projectTodoListContainer.querySelector('.project-todos-list');
            const currentUser = TodoApp.getCurrentUser();
            const currentProjectTitle = projectCard.querySelector('.project-title').innerText.trim();

            const currentProject = currentUser.getProject(currentProjectTitle);

            const todosToRender = currentProject.getAllTodos();

            renderTodosForProjectExpansion(todosToRender, projectTodoList);

            projectCard.appendChild(projectTodoListContainerOuter);
            projectTodoListContainer.classList.remove('invisible');
            dashboardContainer.removeChild(projectGridOuter);
            dashboardContainer.appendChild(projectCard);
        };

        projectCard.addEventListener('animationend', handleExpansionAnimationEnd);

        // Wait for the expansion to finish and remove event listeners
        // to ensure that it doesnt try to retrigger once expanded
        setTimeout(() => {
            projectCard.style.animation = "";
            projectCard.removeEventListener('animationend', handleExpansionAnimationEnd);
            projectCard.addEventListener("click", renderShrunkProject);
        }, 350);
    };

    const getExpansionAnimation = (projectCard, projectGrid, gridRect) => {
        const cardStyle = getComputedStyle(projectCard);
        const gridStyle = getComputedStyle(projectGrid);

        // Get borders widths of card and grid.
        const gridBorderWidth = parseFloat(gridStyle.borderTopWidth);
        const cardBorderWidth = parseFloat(cardStyle.borderTopWidth);

        // Get current dimensions and position of project-card
        const cardRect = projectCard.getBoundingClientRect();
        const currentX = cardRect.left;
        const currentY = cardRect.top;
        const currentWidth = cardRect.width;
        const currentHeight = cardRect.height;

        // Store current card pos/dimensions and current projectGrid for return animation
        // and to restore the projectGrid after expanded card shrinks again.
        state.expandedCardPrevPosition = { currentX, currentY, currentWidth, currentHeight };

        const gridX = gridRect.left;
        const gridY = gridRect.top;
        const gridWidth = parseFloat(gridStyle.width);
        const gridHeight = parseFloat(gridStyle.height);

        // Shift card to position absolute but hold current position and dimensions
        projectCard.classList.add('expanding');
        projectCard.style.top = `${currentY + cardBorderWidth + gridBorderWidth}px`;
        projectCard.style.left = `${currentX + cardBorderWidth + gridBorderWidth}px`;

        // Prepare expansion animation
        const animationName = `expansionAnimation`;
        const animationDuration = "300ms";
        const animationTransition = "cubic-bezier(.43,.22,.43,.92)";
        const animationKeyframes = `
            @keyframes ${animationName} {
                0% {
                    top: ${currentY}px;
                    left: ${currentX}px;
                    width: ${currentWidth}px;
                    height: ${currentHeight}px;
                    border-radius: 1rem;
                }
                100% {
                    top: ${gridY}px;
                    left: ${gridX}px;
                    width: ${gridWidth}px;
                    height: ${gridHeight}px;
                    border-radius: 0;
                }
            }
        `;

        // Append animation to the stylesheet
        const styleSheet = doc.createElement("style");
        styleSheet.innerHTML = animationKeyframes;
        doc.head.appendChild(styleSheet);

        projectCard.style.animation = `${animationName} ${animationDuration} ${animationTransition}`;

        return styleSheet;
    };

    const renderTodosForProjectExpansion = (todosToRender, projectTodoList) => {
        todosToRender.forEach((todo, index) => {
            const todoContainer = doc.createElement('div');
            todoContainer.classList.add('todo-container');
            todoContainer.tabIndex = (index + 1) * 2;

            todoContainer.innerHTML = `
                <div class="todo-title-checkbox-container">
                    <li class="project-todo">
                    <h4>${todo.title}</h4>
                    </li>
                    <div class="checkbox-container">
                        <input type="checkbox" name="todo-${index}" class="todo-check" 
                            tabindex="${((index + 1) * 2) + 1}"></input>
                        <div class="todo-check-image-left unchecked"></div>
                        <div class="todo-check-image-right unchecked"></div>
                    </div>
                    
                </div>
            `;
            todoContainer.addEventListener('click', handleTodoExpansion);
            todoContainer.addEventListener('keypress', function(ev) {
                if (ev.key === "Enter") {
                    handleTodoExpansion(ev);
                }
            });

            todoContainer.addEventListener('searchTodoGrow', function(ev) {
                handleTodoExpansion(ev);
            });

            todoContainer.style.border = "1px solid var(--contrast-orange-glow)";

            const checkBox = todoContainer.querySelector('.todo-check');
            const checkBoxContainer = todoContainer.querySelector('.checkbox-container');

            checkBox.checked = todo.checked;

            if (checkBox.checked) {
                checkBoxContainer.style.border = "2px solid var(--contrast-green)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)";
            } else {
                checkBoxContainer.style.border = "2px solid var(--contrast-red)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
            }

            checkBox.addEventListener("click", handleCheckBoxProjectGrid);
            checkBox.addEventListener("keydown", function(ev) {
                if (ev.key === "Enter") {
                    ev.preventDefault();
                    handleCheckBoxProjectGrid(ev);
                }
            });

            projectTodoList.appendChild(todoContainer);
        });
    };

    const handleTodoExpansion = (ev) => {
        if (ev.target.classList.contains("todo-check") ||
            ev.target.classList.contains("todo-expanded-info-input") ||
            ev.target.classList.contains("todo-expanded-info-textarea")
        ) {
            return;
        }

        const todoContainer = ev.currentTarget;
        ev.stopPropagation();

        if (todoContainer.classList.contains("expanded") &&
            ev instanceof MouseEvent ||
            todoContainer.classList.contains("expanded") &&
            ev instanceof KeyboardEvent
        ) {
            todoContainer.classList.remove("expanded");
            const expandedInfo = todoContainer.querySelector('.expanded-todo-info');
            todoContainer.removeChild(expandedInfo);
            const otherTodos = Array.from(todoContainer.parentNode.querySelectorAll(".todo-container"));
            const checkBoxes = Array.from(todoContainer.parentNode.querySelectorAll(".checkbox-container"));


            otherTodos.forEach(todo => {
                setTimeout(() => {
                    todo.classList.remove("shrink");
                    todo.style.visibility = "";
                    setTimeout(() => {
                        todo.style.border = "1px solid var(--contrast-orange-glow)";
                        checkBoxes.forEach(box => box.style.opacity = "1");
                    }, 300);
                }, 100);
            });
            return;
        } else if (todoContainer.classList.contains("expanded") &&
            ev instanceof CustomEvent
        ) {
            return;
        }
        renderExpandedTodo(ev);
    };

    const renderExpandedTodoKeyEnter = (ev) => {
        if (ev.key === "Enter") {
            ev.stopImmediatePropagation();
            if (ev.target.classList.contains("expanded") ||
                !ev.target.classList.contains(".todo-container")
            ) {
                return;
            } else {
                renderExpandedTodo(ev);
            }
        }
    }

    const renderExpandedTodo = (ev) => {
        if (ev.target.classList.contains('todo-check')) {
            return;
        }
        const todoContainer = ev.currentTarget;
        const projectId = doc.querySelector('[id^="project-card-"]').id;
        const projectName = projectId.slice(projectId.lastIndexOf("card-") + 5).replaceAll("-", " ");

        const todoName = todoContainer.querySelector('h4').innerText;
        const user = TodoApp.getCurrentUser();
        const project = user.getProject(projectName);
        const todoToExpand = project.getTodo(todoName);
        const checkboxTabIndex = parseInt(todoContainer.querySelector('.todo-check').tabIndex);

        const todoInfo = generateExpandedTodoInfo(todoToExpand, checkboxTabIndex);

        todoContainer.classList.add("expanded");
        const otherTodos = Array.from(todoContainer.parentNode.childNodes).filter(node => {
            return node.nodeType === 1 && node !== todoContainer;
        });

        otherTodos.forEach(todo => {
            todo.classList.add('shrink');
            todo => todo.style.border = "transparent";

            const checkbox = todo.querySelector('.checkbox-container');
            checkbox.style.opacity = "0";
        });

        setTimeout(() => {
            otherTodos.forEach(todo => todo.style.visibility = "hidden");
            todoContainer.appendChild(todoInfo);
            todoInfo.classList.remove('invisible');
        }, 300);
    };

    const generateExpandedTodoInfo = (todoToExpand, checkboxTabIndex) => {
        const todoInfo = doc.createElement('div');
        todoInfo.classList.add('expanded-todo-info');
        todoInfo.innerHTML = `
            <h5>Description</h5>
            <div class="todo-info-field-wrapper">
                <p class="expanded-todo-description" data-field-type="description"
                    tabindex=${checkboxTabIndex + 1}>${todoToExpand.description}</p>
            </div>
            <h5>Due Date</h5>
            <div class="todo-info-field-wrapper">
                <p class="expanded-todo-due-date" data-field-type="dueDate"
                tabindex=${checkboxTabIndex + 2}>${todoToExpand.dueDate}</p>
            </div>
            <h5>Priority</h5>
            <div class="todo-info-field-wrapper">
                <p class="expanded-todo-priority" data-field-type="priority"
                tabindex=${checkboxTabIndex + 3}>${todoToExpand.priority}</p>
            </div>
            <h5>Notes</h5>
            <div class="todo-info-field-wrapper">
                <p class="expanded-todo-notes" data-field-type="notes"
                tabindex=${checkboxTabIndex + 4}>${todoToExpand.notes}</p>
            </div>
        `;
        todoInfo.classList.add('invisible');

        const todoInfoFields = Array.from(todoInfo.querySelectorAll('p'));

        todoInfoFields.forEach(field => field.addEventListener("click", (ev) => {
            ev.stopPropagation();
            const target = ev.target;
            handleTodoInfoFieldEvent(target);
        }));

        todoInfoFields.forEach(field => field.addEventListener("keypress", (ev) => {
            ev.stopPropagation();
            if (ev.key === "Enter") {
                const target = ev.target;
                handleTodoInfoFieldEvent(target);
            }
        }));

        return todoInfo;
    };

    const handleTodoInfoFieldEvent = (target) => {

        const fieldInputAlreadyPresent = target.parentNode.querySelector('.todo-expanded-info-input');

        if (fieldInputAlreadyPresent !== null && fieldInputAlreadyPresent !== undefined) {
            return;
        }

        const fieldInput = doc.createElement('input');
        fieldInput.classList.add('invisible');
        fieldInput.classList.add('todo-expanded-info-input');
        const fieldType = target.dataset.fieldType;

        switch (fieldType) {
            case "description":
                fieldInput.type = "text";
                fieldInput.name = "todo-expanded-input-description";
                target.parentNode.appendChild(fieldInput);
                fieldInput.focus();

                fieldInput.addEventListener("keypress", function(event) {
                    if (event.key === "Enter") {
                        handleTodoFieldInputEvent(event, fieldType);
                    }
                });
                fieldInput.classList.remove('invisible');
                break;

            case "dueDate":
                fieldInput.type = "text";
                fieldInput.name = "todo-expanded-input-duedate";
                target.parentNode.appendChild(fieldInput);
                fieldInput.focus();

                fieldInput.addEventListener("keypress", function(event) {
                    if (event.key === "Enter") {
                        const validDate = handleTodoDateInputEvent(event, target.parentNode);
                        if (validDate) {
                            handleTodoFieldInputEvent(event, fieldType);
                        }
                    }
                });
                fieldInput.classList.remove('invisible');
                break;

            case "priority":
                fieldInput.type = "number";
                fieldInput.max = 10;
                fieldInput.min = 1;
                fieldInput.name = "todo-expanded-input-priority";
                target.parentNode.appendChild(fieldInput);
                fieldInput.focus();

                fieldInput.addEventListener("keypress", function(event) {
                    if (event.key === "Enter") {
                        const validPriority = handleTodoPriorityInputEvent(event, target.parentNode);
                        if (validPriority) {
                            handleTodoFieldInputEvent(event, fieldType);
                        }
                    }
                });
                fieldInput.classList.remove('invisible');
                break;

            case "notes":
                const fieldTextareaAlreadyPresent = target.parentNode.querySelector('.todo-expanded-info-textarea');

                if (fieldTextareaAlreadyPresent !== null && fieldTextareaAlreadyPresent !== undefined) {
                    return;
                }

                const fieldTextarea = doc.createElement('textarea');
                fieldTextarea.classList.add('invisible');
                fieldTextarea.classList.add('todo-expanded-info-textarea');

                fieldTextarea.name = "todo-expanded-input-notes";
                target.parentNode.appendChild(fieldTextarea);
                fieldTextarea.focus();

                fieldTextarea.addEventListener("keypress", function(event) {
                    if (event.key === "Enter") {
                        handleTodoFieldInputEvent(event, fieldType);
                    }
                });

                fieldTextarea.classList.remove('invisible');
                break;
        }
    };


    const handleTodoFieldInputEvent = (event, fieldType) => {
        event.stopPropagation();
        const parent = event.target.parentNode;
        const sibling = parent.querySelector('p');

        if (event.target.value !== "") {
            sibling.innerText = `${event.target.value}`;
            postTodoUpdatesToUser(fieldType, event.target.value);
        }

        parent.removeChild(event.target);

    }

    const postTodoUpdatesToUser = (fieldType, newValue) => {
        const user = TodoApp.getCurrentUser();
        const currentProject = doc.querySelector('[id^="project-card-"].expanded');
        const currentProjTitle = currentProject.querySelector('.project-title').innerText;
        const currentTodo = currentProject.querySelector('.todo-container.expanded');
        const currentTodoTitle = currentTodo.querySelector('h4').innerText;
        const project = user.getProject(currentProjTitle);
        project.updateTodo(currentTodoTitle, fieldType, newValue);
    };

    const renderShrunkProject = (ev) => {
        // Check if the target of the click event is the delete icon
        // or one of the todo checkboxes
        // If yes, Return early without triggering the shrinking
        if (ev.target.classList.contains('invisible-btn') ||
            ev.target.classList.contains('todo-check') ||
            ev.target.classList.contains('todo-container') ||
            ev.target.classList.contains('todo-expanded-info-input') ||
            ev.target.classList.contains('todo-expanded-info-textarea')
        ) {
            return;
        }

        let projectCard;

        if (ev instanceof MouseEvent) {
            projectCard = ev.currentTarget;
            if (!projectCard.classList.contains('expanded')) {
                return;
            }
        } else {
            projectCard = ev.target;
            if (!projectCard.classList.contains('expanded')) {
                return;
            }
        }

        projectCard.removeEventListener("click", renderShrunkProject);

        const dashboardContainer = doc.getElementById('dashboard-container');
        const projectGrid = state.currentProjectGrid;

        const projectGridOuter = doc.createElement('div');
        projectGridOuter.id = "project-grid-outer";

        const styleSheet = getShrinkingAnimation(projectCard);

        projectGridOuter.appendChild(projectGrid);
        dashboardContainer.appendChild(projectGridOuter);

        const handleShrinkingAnimationEnd = () => {
            // Stop the stylesheets from piling up
            if (styleSheet.parentNode) {
                styleSheet.parentNode.removeChild(styleSheet);
            }

            const deleteBtns = Array.from(projectGrid.querySelectorAll('.invisible-btn'));
            const progressBars = Array.from(projectGrid.querySelectorAll('.progress-bar'));

            for (let i = 0; i < progressBars.length; i++) {
                const progressBarIdNum = parseInt(progressBars[i].id.slice(progressBars[i].id.lastIndexOf("-") + 1));
                progressBars[i].style.width = `${state.progressBarPercentages[progressBarIdNum]}%`;
                if (state.progressBarPercentages[progressBarIdNum] === 100) {
                    progressBars[i].style.background = "var(--contrast-green-glow)";
                    progressBars[i].style.boxShadow = `0 0 4px var(--contrast-green), 
                                                   inset 0 0 1px var(--base-white),
                                                    inset 0 0 4px var(--contrast-green-faded)`;
                } else {
                    progressBars[i].style.background = "var(--contrast-red-glow)";
                    progressBars[i].style.boxShadow = `0 0 4px var(--contrast-red), 
                                                   inset 0 0 1px var(--base-white),
                                                    inset 0 0 4px var(--contrast-red-faded)`;
                }
            }

            deleteBtns.forEach(btn => {
                btn.addEventListener("click", function(ev) {
                    ev.stopPropagation();
                    renderDeleteProjectModal(ev);
                });
            });

            const projectsInGrid = Array.from(projectGrid.querySelectorAll('[id^="project-card-"]'));

            projectsInGrid.forEach(proj => {
                proj.addEventListener('click', renderExpandedProject);
                proj.addEventListener('keypress', renderExpandedProjectKeyEnter);
                proj.addEventListener('searchGrow', function(ev) {
                    renderExpandedProject(ev);
                });

                proj.addEventListener('searchShrink', function(ev) {
                    renderShrunkProject(ev);
                });
                proj.classList.remove('search-invisible');
                proj.classList.remove('expanded');
            });

            projectCard.classList.remove('shrinking');
            dashboardContainer.removeChild(projectCard);
        };

        projectCard.addEventListener('animationend', handleShrinkingAnimationEnd);

        setTimeout(() => {
            projectCard.style.animation = "";
            projectCard.removeEventListener('animationend', handleShrinkingAnimationEnd);
        }, 350);
    };

    const getShrinkingAnimation = (projectCard) => {
        // Get current dimensions and position of project-card
        const cardRect = projectCard.getBoundingClientRect();
        const currentX = cardRect.left;
        const currentY = cardRect.top;
        const currentWidth = cardRect.width;
        const currentHeight = cardRect.height;

        // Get previous dimensions and position of project-card in the grid 
        const previousY = state.expandedCardPrevPosition.currentY;
        const previousX = state.expandedCardPrevPosition.currentX;
        const previousWidth = state.expandedCardPrevPosition.currentWidth;
        const previousHeight = state.expandedCardPrevPosition.currentHeight;

        const projectTodoListContainerOuter = projectCard.querySelector('.project-todos-list-container-outer');
        projectCard.removeChild(projectTodoListContainerOuter);

        projectCard.classList.remove('expanded');
        projectCard.classList.add('shrinking');
        const gridBorderWidth = 0;
        const cardBorderWidth = 1;
        projectCard.style.top = `${currentY + cardBorderWidth + gridBorderWidth}px`;
        projectCard.style.left = `${currentX + cardBorderWidth + gridBorderWidth}px`;

        // Prepare shrinking animation
        const animationName = "shrinkingAnimation";
        const animationDuration = "300ms";
        const animationTransition = "cubic-bezier(.43,.22,.43,.92)";
        const animationKeyframes = `
            @keyframes ${animationName} {
                0% {
                    top: ${currentY}px;
                    left: ${currentX}px;
                    width: ${currentWidth}px;
                    height: ${currentHeight}px;
                    border-radius: 0;
                }
                100% {
                    top: ${previousY}px;
                    left: ${previousX}px;
                    width: ${previousWidth}px;
                    height: ${previousHeight}px;
                    border-radius: 1rem;
                }
            }
        `;

        // Append animation to the stylesheet
        const styleSheet = doc.createElement("style");
        styleSheet.innerHTML = animationKeyframes;
        doc.head.appendChild(styleSheet);

        projectCard.style.animation = `${animationName} ${animationDuration} ${animationTransition}`;
        return styleSheet;
    };

    const handleCheckBoxProjectGrid = (ev) => {
        const projectId = doc.querySelector('[id^="project-card-"]').id;
        const projectName = projectId.slice(projectId.lastIndexOf("card-") + 5).replaceAll("-", " ");

        const todoIndex = ev.target.name.slice(ev.target.name.lastIndexOf("-") + 1);
        const projectTodoList = doc.querySelector('.project-todos-list');
        const checkboxes = Array.from(projectTodoList.querySelectorAll('.todo-check'));

        const checkBoxContainer = ev.target.parentNode;

        const user = TodoApp.getCurrentUser();
        const project = user.getProject(projectName);

        if (ev.key === "Enter") {
            if (ev.target.checked) {
                ev.target.checked = false;
                checkBoxContainer.style.border = "2px solid hsl(0, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
            } else {
                ev.target.checked = true;
                checkBoxContainer.style.border = "2px solid hsl(150, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)"
            }
        } else {
            if (ev.target.checked) {
                checkBoxContainer.style.border = "2px solid hsl(150, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)"
            } else {
                checkBoxContainer.style.border = "2px solid hsl(0, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
            }
        }

        project.todos[todoIndex].checked = ev.target.checked;
        const checkBoxCount = checkboxes.length;
        const checkedCount = Array.from(checkboxes.filter(checkbox => checkbox.checked)).length;

        const progressBar = doc.querySelector('.progress-bar');
        progressBar.style.width = `${(checkedCount / checkBoxCount) * 100}%`;

        const progressbarIdNum = parseInt((progressBar.id).slice(progressBar.id.lastIndexOf("-") + 1));
        state.progressBarPercentages[progressbarIdNum] = (checkedCount / checkBoxCount) * 100;

        if (state.progressBarPercentages[progressbarIdNum] === 100) {
            progressBar.style.background = "var(--contrast-green-glow)";
            progressBar.style.boxShadow = `0 0 4px var(--contrast-green), 
                                            inset 0 0 1px var(--base-white),
                                            inset 0 0 4px var(--contrast-green-faded)`;
        } else {
            progressBar.style.background = "var(--contrast-red-glow)";
            progressBar.style.boxShadow = `0 0 4px var(--contrast-red), 
                                            inset 0 0 1px var(--base-white),
                                            inset 0 0 4px var(--contrast-red-faded)`;
        }
    };

    const handleCheckBoxTodoList = (ev) => {
        const todoRow = ev.target.parentNode.parentNode.parentNode;

        const projectName = todoRow.querySelector('.todo-list-row-project-title').innerText;

        const checkBoxContainer = ev.target.parentNode;

        const todoIndex = ev.target.name.slice(ev.target.name.lastIndexOf("-") + 1);

        const user = TodoApp.getCurrentUser();
        const project = user.getProject(projectName);

        if (ev.key === "Enter") {
            if (ev.target.checked) {
                ev.target.checked = false;
                checkBoxContainer.style.border = "2px solid hsl(0, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
            } else {
                ev.target.checked = true;
                checkBoxContainer.style.border = "2px solid hsl(150, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)"
            }
        } else {
            if (ev.target.checked) {
                checkBoxContainer.style.border = "2px solid hsl(150, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)"
            } else {
                checkBoxContainer.style.border = "2px solid hsl(0, 90%, 70%)";
                checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
            }
        }

        project.todos[todoIndex].checked = ev.target.checked;
    };

    const refreshProjectGrid = () => {
        const expandedProject = doc.querySelector('.expanded');
        if (expandedProject !== null) {
            const noSearch = new CustomEvent('searchShrink', {
                target: expandedProject,
            });
            expandedProject.dispatchEvent(noSearch);
            state.expandedMatchingProject = false;

            const projectGrid = doc.getElementById('project-grid');
            const invisibleProjects = Array.from(projectGrid.querySelectorAll('[id^="project-card-"].search-invisible'));

            invisibleProjects.forEach(proj => {
                proj.classList.remove("search-invisible");
                proj.style.display = "grid";

            });
        } else {
            const projectGrid = doc.getElementById('project-grid');
            const projects = Array.from(projectGrid.querySelectorAll('[id^="project-card-"]'));

            projects.forEach(proj => {
                proj.classList.remove("search-invisible");
                proj.style.display = "grid";

            });
        }
    };

    const storeCurrentProjectGrid = (projectGrid) => {
        state.currentProjectGrid = projectGrid.cloneNode(true);
    };

    return {
        renderApp,
        renderWelcomeScreen,
        renderProjectDashboard,
        renderNewProject,
        renderDeleteProjectModal,
        removeProjectFromProjectGrid,
        setFocusToFirstInput,
        getCurrentProjectGrid,
        getCurrentView,
        renderExpandedProject,
        renderShrunkProject,
        refreshProjectGrid,
    };

})(document);
