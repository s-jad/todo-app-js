import { TodoApp, UserEvents } from "./app";

export const Display = ((doc) => {
    const app = doc.createElement('div');
    app.id = "app-container";

    // To contain the projectGrid and its current project-cards
    // when one of the cards expands to fill the whole container
    // so it can be put back again when the card shrinks
    let state = {
        currentProjectGrid: {},
        expandedCardPrevPosition: {},
        progressBarCount: 0,
        progressBarPercentages: [],
        currentTodoNames: [],
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
                welcomeConfirmBtn.style.boxShadow = "inset 0 0 5px hsl(150, 90%, 70%)";
                welcomeConfirmBtn.style.scale = "1.2";
            }
        })

        welcomeFlex.appendChild(welcomeTitle);
        welcomeFlex.appendChild(welcomeInput);
        welcomeFlex.appendChild(welcomeConfirmBtn);

        return welcomeFlex;
    };

    const removeWelcomeScreen = () => {
        const welcomeFlex = doc.getElementById("welcome-flex");
        app.removeChild(welcomeFlex);
    };

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

        const userName = doc.createElement('h1');
        userName.innerText = username;
        userName.id = "user-name";

        const searchBar = doc.createElement('input');
        searchBar.type = "search";
        searchBar.id = "search-bar";

        // Allows the add.png icon to be used as 
        // the style for the invisible button whilst
        // still being tab selectable
        const btnContainer = doc.createElement('div');
        btnContainer.classList.add('btn-container');

        const createProjectBtn = new Image();
        createProjectBtn.src = "./assets/add.png";
        createProjectBtn.id = "create-project-btn";
        createProjectBtn.style.filter = "invert(90%)";

        const actualCreateProjectBtn = doc.createElement('button');
        actualCreateProjectBtn.classList.add('invisible-btn');
        actualCreateProjectBtn.onclick = () => {
            window.removeEventListener("keypress", scrollProjects);
            renderCreateNewProjectModal();
        };

        btnContainer.appendChild(createProjectBtn);
        btnContainer.appendChild(actualCreateProjectBtn);

        const headerUtilsFlex = doc.createElement('div');
        headerUtilsFlex.id = "header-utils-flex"
        headerUtilsFlex.appendChild(searchBar);
        headerUtilsFlex.appendChild(btnContainer);

        dashboardHeader.appendChild(userName);
        dashboardHeader.appendChild(headerUtilsFlex);

        return dashboardHeader;
    };

    const renderProjectGrid = () => {
        const projectGrid = doc.createElement('div');
        projectGrid.id = "project-grid";


        window.addEventListener("keypress", scrollProjects);
        return projectGrid;
    };

    const scrollProjects = (ev) => {
        const allProjects = Array.from(doc.querySelectorAll('[id^="project-card-"]'));
        const focussedProject = allProjects.find(proj => proj === document.activeElement);
        console.log(ev.target);
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
                <input type="text" value="" name="create-project-name" id="create-project-name-input" class="required">
                <label for="create-project-description" class="create-project-label">Description:</label>
                <textarea type="text" value="" name="create-project-description" id="create-project-description-input"></textarea>
                <label for="create-project-todo-count" class="create-project-label"><span class="warn-hl">*</span> Number of todos:</label>
                <input type="number" value="" name="create-project-todo-count" 
                id="create-project-todo-count-input" min="0" max="12" class="required">
                <p id="todo-input-container-title">Todos:</p>
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

        // Check the project name is unique
        createProjectNameInput.addEventListener('blur', () => {
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
        });

        const createProjectTodoCountInput = createProjectModalContainer.querySelector('#create-project-todo-count-input');
        createProjectTodoCountInput.addEventListener('input', handleModalInputChanges);
        // Stores chosen todo names to check uniqueness and count names
        const todoNames = [];
        let todoCount = 0;

        // Check if the todo count is a valid number and not over max
        // If so, generate inputs for that number of todos
        createProjectTodoCountInput.addEventListener('input', () => {
            todoCount = parseInt(createProjectTodoCountInput.value);

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

                const todoInputCard = doc.createElement('div');
                todoInputCard.innerHTML = `
                    <p class="todo-input-card-title">Todo ${i + 1}</p>
                    <input type="text" name="new-todo-name-${i + 1}" class="create-project-todo-input required"
                    placeholder="Todo ${i + 1} name">
                    <input type="text" name="new-todo-description-${i + 1}" class="create-project-todo-input"
                    placeholder="Todo ${i + 1} description">
                    <input type="text" name="new-todo-due-date-${i + 1}" class="create-project-todo-input"
                    placeholder="Todo ${i + 1} due date">
                    <input type="number" name="new-todo-priority-${i + 1}" class="create-project-todo-input"
                    placeholder="Todo ${i + 1} priority">
                    <textarea name="new-todo-notes-${i + 1}" class="create-project-todo-textarea"
                    placeholder="Todo ${i + 1} notes"></textarea>
                `;

                todoInputCard.id = `todo-input-card-${i + 1}`;

                if (i > 0) {
                    todoInputCard.classList.add('hide-right');
                }


                const todoNameInput = todoInputCard.querySelector('[name^="new-todo-name-"]');
                todoNameInput.addEventListener('input', handleModalInputChanges);


                todoNameInput.addEventListener('input', function() {
                    const currentTNI = i;
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
                });
                todoInputContainer.appendChild(todoInputCard);
            };

            if (todoCount > 0) {
                todoInputContainer.appendChild(renderLeftRightTodoBtns());
            }
        });

        const scrollTodosKeyPress = (ev) => {
            if (ev.key === ">") {
                ev.preventDefault();
                scrollTodosLeft();
            } else if (ev.key === "<") {
                ev.preventDefault();
                scrollTodosRight();
            }
        }
        window.removeEventListener("keypress", scrollProjects);
        createProjectModalContainer.addEventListener("keypress", scrollTodosKeyPress);

        app.appendChild(createProjectModalContainer);

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
        }, 300);

    }

    const renderLeftRightTodoBtns = () => {
        // Add left and right buttons for todo carousel
        const leftBtnContainer = doc.createElement('div');
        leftBtnContainer.classList.add('btn-container');

        const leftTodoBtn = new Image();
        leftTodoBtn.src = "./assets/chevron-left.svg";
        leftTodoBtn.id = "left-todos-btn";

        const actualLeftTodoBtn = doc.createElement('button');
        actualLeftTodoBtn.classList.add('invisible-btn');
        actualLeftTodoBtn.type = "button";
        actualLeftTodoBtn.onclick = scrollTodosLeft;

        leftBtnContainer.appendChild(leftTodoBtn);
        leftBtnContainer.appendChild(actualLeftTodoBtn);

        const rightBtnContainer = doc.createElement('div');
        rightBtnContainer.classList.add('btn-container');

        const rightTodoBtn = new Image();
        rightTodoBtn.src = "./assets/chevron-right.svg";
        rightTodoBtn.id = "right-todos-btn";

        const actualRightTodoBtn = doc.createElement('button');
        actualRightTodoBtn.classList.add('invisible-btn');
        actualRightTodoBtn.type = "button";
        actualRightTodoBtn.onclick = scrollTodosRight;

        rightBtnContainer.appendChild(rightTodoBtn);
        rightBtnContainer.appendChild(actualRightTodoBtn);

        const leftRightTodoBtnContainer = doc.createElement('div');
        leftRightTodoBtnContainer.id = "left-right-todo-btns-container";
        leftRightTodoBtnContainer.appendChild(leftBtnContainer);
        leftRightTodoBtnContainer.appendChild(rightBtnContainer);

        return leftRightTodoBtnContainer;

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
        const projectToRemoveTitle = ev.target.parentNode.parentNode.parentNode.querySelector('.project-title').innerText;

        deleteProjectTitle.innerText = `Are you sure you 
                                        would like to delete
                                        "${projectToRemoveTitle}"`;
        confirmDeleteBtn.onclick = () => UserEvents.deleteProject(projectToRemoveTitle);
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
        const deleteBtn = new Image();
        deleteBtn.classList.add('delete-project-btn');
        deleteBtn.src = './assets/delete.png';

        const actualDeleteBtn = doc.createElement('button');
        actualDeleteBtn.classList.add('invisible-btn');

        actualDeleteBtn.addEventListener("click", function(ev) {
            ev.stopPropagation();
            renderDeleteProjectModal(ev);
        });

        btnContainer.appendChild(deleteBtn);
        btnContainer.appendChild(actualDeleteBtn);

        const projectUtils = newProjectCard.querySelector('.project-utils');
        projectUtils.appendChild(btnContainer);

        newProjectCard.addEventListener('click', renderExpandedProject);
        newProjectCard.addEventListener('keypress', renderExpandedProjectKeyEnter);

        const user = TodoApp.getCurrentUser();
        newProjectCard.tabIndex = user.getAllProjects().length;
        projectGrid.appendChild(newProjectCard);
    };

    const renderExpandedProjectKeyEnter = (ev) => {
        if (ev.key === "Enter") {
            ev.stopImmediatePropagation();
            if (ev.target.classList.contains("expanded") ||
                !ev.target.id.includes("project-card-")

            ) {
                return;
            } else {
                renderExpandedProject(ev);
            }
        }
    }

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
            projectCard = ev.target;
            gridRect = ev.target.parentNode.getBoundingClientRect();
        }

        const projectGrid = doc.getElementById('project-grid');
        const cardStyle = getComputedStyle(projectCard);
        const gridStyle = getComputedStyle(projectGrid);

        // Store the current project grid and its children in state
        const storeCurrentProjectGrid = () => {
            state.currentProjectGrid = projectGrid.cloneNode(true);
        };

        // Call the function to store the current project grid
        // before the projectCard is removed from it.
        storeCurrentProjectGrid();

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
        const animationDuration = "500ms";
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

        const handleExpansionAnimationEnd = () => {
            // Stop the stylesheets from piling up
            if (styleSheet.parentNode) {
                styleSheet.parentNode.removeChild(styleSheet);
            }

            const dashboardContainer = doc.getElementById('dashboard-container');
            const projectGrid = doc.getElementById('project-grid');

            projectCard.classList.remove('expanding');
            projectCard.classList.add('expanded');
            projectCard.tabindex = "1";

            const projectDescription = projectCard.querySelector('.project-description');

            const projectTodoListContainer = doc.createElement('div');
            projectTodoListContainer.classList.add('project-todos-list-container');
            projectTodoListContainer.classList.add('invisible');

            projectTodoListContainer.innerHTML = `
                <p class="project-todos-list-title">Todos:</p>
                <p class="project-todos-checkbox-title">Completed:</p>
                <ul class="project-todos-list">
                    <!-- Dynamically add todos later --> 
                </ul>
            `;

            const projectTodoList = projectTodoListContainer.querySelector('.project-todos-list');
            const currentUser = TodoApp.getCurrentUser();
            const currentProjectTitle = projectCard.querySelector('.project-title').innerText.trim();

            const currentProject = currentUser.getProject(currentProjectTitle);

            const todosToRender = currentProject.getAllTodos();

            todosToRender.forEach((todo, index) => {
                const todoContainer = doc.createElement('div');
                todoContainer.classList.add('todo-container');

                todoContainer.innerHTML = `
                    <div class="todo-title-checkbox-container">
                        <li class="project-todo">
                        <label for="todo-${index}">${todo.title}</label>
                        </li>
                        <div class="checkbox-container">
                            <input type="checkbox" name="todo-${index}" class="todo-check" tabindex="${index + 2}"></input>
                            <div class="todo-check-image-left unchecked"></div>
                            <div class="todo-check-image-right unchecked"></div>
                        </div>
                        
                    </div>
                `;
                todoContainer.addEventListener('click', function(ev) {
                    ev.stopPropagation();

                    if (todoContainer.classList.contains("expanded")) {
                        if (ev.target.classList.contains("todo-check")) {
                            return;
                        }
                        todoContainer.classList.remove("expanded");
                        const expandedInfo = todoContainer.querySelector('.expanded-todo-info');
                        todoContainer.removeChild(expandedInfo);
                        const otherTodos = Array.from(todoContainer.parentNode.querySelectorAll(".todo-container"));
                        otherTodos.forEach(node => {
                            setTimeout(() => {
                                node.classList.remove("shrink");
                                node.style.visibility = "";
                            }, 100);
                        });
                        return;
                    }
                    renderExpandedTodo(ev);
                });

                const checkBox = todoContainer.querySelector('.todo-check');
                const checkBoxContainer = todoContainer.querySelector('.checkbox-container');

                checkBox.checked = todo.checked;

                if (checkBox.checked) {
                    checkBoxContainer.style.border = "2px solid hsl(150, 90%, 70%)";
                    checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(150, 90%, 90%, 0.7)";
                } else {
                    checkBoxContainer.style.border = "2px solid hsl(0, 90%, 70%)";
                    checkBoxContainer.style.boxShadow = "inset 0 0 5px hsla(0, 90%, 90%, 0.7)";
                }

                checkBox.addEventListener("click", handleCheckBox);
                checkBox.addEventListener("keydown", function(ev) {
                    if (ev.key === "Enter") {
                        ev.preventDefault();
                        handleCheckBox(ev);
                    }
                });

                projectTodoList.appendChild(todoContainer);
            });

            projectCard.appendChild(projectTodoListContainer);
            projectTodoListContainer.classList.remove('invisible');
            dashboardContainer.removeChild(projectGrid);
            dashboardContainer.appendChild(projectCard);

            projectCard.addEventListener("click", renderShrunkProject);
        };

        projectCard.addEventListener('animationend', handleExpansionAnimationEnd);

        // Wait for the expansion to finish and remove event listeners
        // to ensure that it doesnt try to retrigger once expanded
        setTimeout(() => {
            projectCard.style.animation = "";
            projectCard.removeEventListener("click", renderExpandedProject);
            projectCard.removeEventListener('animationend', handleExpansionAnimationEnd);
        }, 600);
    };

    const renderExpandedTodo = (ev) => {
        if (ev.target.classList.contains('todo-check')) {
            return;
        }
        const todoContainer = ev.currentTarget;
        const projectId = doc.querySelector('[id^="project-card-"]').id;
        const projectName = projectId.slice(projectId.lastIndexOf("-") + 1);
        const todoName = todoContainer.querySelector('label').innerText;

        const user = TodoApp.getCurrentUser();
        const project = user.getProject(projectName);
        const todoToExpand = project.getTodo(todoName);

        const todoInfo = doc.createElement('div');
        todoInfo.classList.add('expanded-todo-info');
        todoInfo.innerHTML = `
            <h4>Description:</h4>
            <p class="expanded-todo-description">${todoToExpand.description}</p>
            <h4>Due Date:</h4>
            <p class="expanded-todo-due-date">${todoToExpand.dueDate}</p>
            <h4>Priority:</h4>
            <p class="expanded-todo-priority">${todoToExpand.priority}</p>
            <h4>Notes:</h4>
            <p class="expanded-todo-notes">${todoToExpand.notes}</p>
        `;
        todoInfo.classList.add('invisible');

        todoContainer.classList.add("expanded");
        const otherTodos = Array.from(todoContainer.parentNode.childNodes).filter(node => {
            return node.nodeType === 1 && node !== todoContainer;
        });

        otherTodos.forEach(todo => todo.classList.add('shrink'));

        setTimeout(() => {
            otherTodos.forEach(todo => todo.style.visibility = "hidden");
            todoContainer.appendChild(todoInfo);
            todoInfo.classList.remove('invisible');
        }, 300);
    };

    const renderShrunkProject = (ev) => {
        // Check if the target of the click event is the delete icon
        // or one of the todo checkboxes
        // If yes, Return early without triggering the shrinking
        if (ev.target.classList.contains('invisible-btn') ||
            ev.target.classList.contains('todo-check') ||
            ev.target.classList.contains('todo-container')
        ) {
            return;
        }

        let projectCard;

        if (ev instanceof MouseEvent) {
            projectCard = ev.currentTarget;
        } else {
            projectCard = ev.target;
        }

        const dashboardContainer = doc.getElementById('dashboard-container');
        const projectGrid = state.currentProjectGrid;

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

        const projectTodoListContainer = projectCard.querySelector('.project-todos-list-container');
        projectCard.removeChild(projectTodoListContainer);

        projectCard.classList.remove('expanded');
        projectCard.classList.add('shrinking');
        const gridBorderWidth = 0;
        const cardBorderWidth = 1;
        projectCard.style.top = `${currentY + cardBorderWidth + gridBorderWidth}px`;
        projectCard.style.left = `${currentX + cardBorderWidth + gridBorderWidth}px`;

        // Prepare shrinking animation
        const animationName = "shrinkingAnimation";
        const animationDuration = "500ms";
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

        const handleShrinkingAnimationEnd = () => {
            // Stop the stylesheets from piling up
            if (styleSheet.parentNode) {
                styleSheet.parentNode.removeChild(styleSheet);
            }

            const projectsInGrid = Array.from(projectGrid.querySelectorAll('[id^="project-card-"]'));
            const deleteBtns = Array.from(projectGrid.querySelectorAll('.invisible-btn'));
            const progressBars = Array.from(projectGrid.querySelectorAll('.progress-bar'));

            for (let i = 0; i < progressBars.length; i++) {
                const progressBarIdNum = parseInt(progressBars[i].id.slice(progressBars[i].id.lastIndexOf("-") + 1));
                progressBars[i].style.width = `${state.progressBarPercentages[progressBarIdNum]}%`;
                if (state.progressBarPercentages[progressBarIdNum] === 100) {
                    progressBars[i].style.background = "hsl(150, 90%, 70%)";
                } else {
                    progressBars[i].style.background = "hsl(0, 90%, 70%)";
                }
            }

            deleteBtns.forEach(btn => {
                btn.addEventListener("click", function(ev) {
                    ev.stopPropagation();
                    renderDeleteProjectModal(ev);
                });
            });

            projectsInGrid.forEach(proj => {
                proj.addEventListener('click', renderExpandedProject);
                proj.addEventListener('keypress', renderExpandedProjectKeyEnter);
                proj.classList.remove('expanded');
            });
            projectCard.classList.remove('shrinking');
            dashboardContainer.removeChild(projectCard);
            dashboardContainer.appendChild(projectGrid);
        };

        projectCard.addEventListener('animationend', handleShrinkingAnimationEnd);

        setTimeout(() => {
            projectCard.style.animation = "";
            projectCard.removeEventListener("click", renderShrunkProject);
            projectCard.removeEventListener('animationend', handleShrinkingAnimationEnd);
        }, 600);
    };

    const handleCheckBox = (ev) => {
        const projectId = doc.querySelector('[id^="project-card-"]').id;
        const projectName = projectId.slice(projectId.lastIndexOf("-") + 1);
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
            progressBar.style.background = "hsl(150, 90%, 70%)";
            progressBar.style.boxShadow = "0 0 4px hsla(150, 90%, 90%, 0.7)";
        } else {
            progressBar.style.background = "hsl(0, 90%, 70%)";
            progressBar.style.boxShadow = "0 0 4px hsla(0, 90%, 90%, 0.7)";
        }
    };

    return {
        renderApp,
        renderWelcomeScreen,
        renderProjectDashboard,
        renderNewProject,
        renderDeleteProjectModal,
        removeProjectFromProjectGrid,
    };

})(document);
