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
    };

    const renderApp = () => {
        return app;
    };

    const renderWelcomeScreen = () => {
        const welcomeFlex = doc.createElement('div');
        welcomeFlex.id = "welcome-flex";

        const welcomeTitle = doc.createElement('h2');
        welcomeTitle.id = "welcome-title";
        welcomeTitle.textContent = "Welcome, please enter a username";

        const welcomeInput = doc.createElement('input');
        welcomeInput.id = "welcome-input";
        welcomeInput.placeholder = "Username";

        const welcomeConfirmBtn = doc.createElement('button');
        welcomeConfirmBtn.id = "welcome-confirm-btn";
        welcomeConfirmBtn.type = "button";
        welcomeConfirmBtn.innerText = "Confirm";
        welcomeConfirmBtn.onclick = UserEvents.switchToProjectDashboard;

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

        const actualCreateProjectBtn = doc.createElement('button');
        actualCreateProjectBtn.classList.add('invisible-btn');
        actualCreateProjectBtn.onclick = renderCreateNewProjectModal;

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

        return projectGrid;
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
                <label for="create-project-name" class="create-project-label"><span class="required">*</span> Name: </label>
                <input type="text" name="create-project-name" id="create-project-name-input">
                <label for="create-project-description" class="create-project-label">Description:</label>
                <textarea type="text" name="create-project-description" id="create-project-description-input"></textarea>
                <label for="create-project-todo-count" class="create-project-label"><span class="required">*</span> Number of todos:</label>
                <input type="number" name="create-project-todo-count" id="create-project-todo-count-input" min="0" max="12">
                <p id="todo-input-container-title">Todos:</p>
                <div id="todo-input-container">
                    <!-- Dynamic todo item inputs will be added here -->
                </div>
                <button type="button" id="confirm-create-project-btn">Confirm</button>
                <button type="button" id="cancel-create-project-btn">Cancel</button>
            </form>
        `;

        const confirmCreateProjectBtn = createProjectModalContainer.querySelector('#confirm-create-project-btn');
        const cancelCreateProjectBtn = createProjectModalContainer.querySelector('#cancel-create-project-btn');

        confirmCreateProjectBtn.onclick = UserEvents.createNewProject;
        confirmCreateProjectBtn.disabled = true;
        cancelCreateProjectBtn.onclick = () => UserEvents.closeModal(createProjectModalContainer);

        const todoInputContainer = createProjectModalContainer.querySelector('#todo-input-container');

        const createProjectNameInput = createProjectModalContainer.querySelector('#create-project-name-input');

        // Check the project name is unique
        createProjectNameInput.addEventListener('blur', () => {
            const user = TodoApp.getCurrentUser();
            const uniqueName = user.checkUniqueProjectName(createProjectNameInput.value);

            if (uniqueName !== -1) {
                todoInputContainer.innerHTML = '';
                const warnNonUniqueProjectName = doc.createElement('p');
                warnNonUniqueProjectName.id = "warn-non-unique-project-name";
                warnNonUniqueProjectName.innerText = `You already have a project named "${createProjectNameInput.value}", 
                                                      please choose a unique project name`;
                todoInputContainer.appendChild(warnNonUniqueProjectName);
            } else {
                todoInputContainer.innerHTML = '';
            }
        });

        const createProjectTodoCountInput = createProjectModalContainer.querySelector('#create-project-todo-count-input');

        // Stores chosen todo names to check uniqueness and count names
        const todoNames = [];
        let todoCount = 0;

        // Check if the todo count is a valid number and not over max
        // If so, generate inputs for that number of todos
        createProjectTodoCountInput.addEventListener('input', () => {
            todoCount = parseInt(createProjectTodoCountInput.value);

            if (isNaN(todoCount)) {
                todoInputContainer.innerHTML = '';

                const warnNotANumber = doc.createElement('p');
                warnNotANumber.id = "warn-not-a-number";
                warnNotANumber.innerText = `The value you have entered is not a number, 
                                            please insert a number, max = 12.`;
                todoInputContainer.appendChild(warnNotANumber);
                return;
            }

            if (todoCount > createProjectTodoCountInput.max) {
                todoInputContainer.innerHTML = '';

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
                    <input type="text" name="new-todo-name-${i + 1}" class="create-project-todo-input"
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

                todoNameInput.addEventListener('blur', function() {
                    const todoName = todoNameInput.value;
                    const todoNameIndex = i;
                    if (todoNames.findIndex(existingTodoName => existingTodoName === todoName) !== -1) {
                        // If the warning is already present, dont append another one
                        const existingWarning = todoInputContainer.querySelector('#warn-non-unique-todo-name');
                        if (existingWarning !== null) {
                            return
                        }

                        // If the user accidently retriggered blur with the same name as before
                        // don't warn.
                        if (todoName === todoNames[todoNameIndex]) {
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

                        todoNames.push(todoName);
                    }
                });

                todoInputContainer.appendChild(todoInputCard);
            };

            if (todoCount > 0) {
                todoInputContainer.appendChild(renderLeftRightTodoBtns());
            }
        });

        // Create a new instance of MutationObserver
        // Use it to observe if the user is receiving
        // any warnings about inputs or hasnt filled the necessary fields
        // disable confirmCreateProjectBtn if true
        const observer = new MutationObserver(function(mutationsList) {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    if (todoInputContainer.querySelector('[id^="warn-"]') ||
                        todoNames.length < todoCount ||
                        createProjectTodoCountInput.value === "" ||
                        createProjectNameInput.value === ""
                    ) {
                        confirmCreateProjectBtn.disabled = true;
                    } else {
                        confirmCreateProjectBtn.disabled = false;
                    }
                }
            }
        });

        const warningObserverConfig = { childList: true };
        observer.observe(todoInputContainer, warningObserverConfig);

        app.appendChild(createProjectModalContainer);
    };

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
            return;
        }

        const nextTodo = todos.find(todo => {
            return parseInt(todo.id.match(/\d+/g)) - 1 === visibleTodoIdNum;
        });


        visibleTodo.classList.add('hide-left');
        nextTodo.classList.remove('hide-right');
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

        deleteProjectTitle.innerText = `Are you sure you would like to delete ${projectToRemoveTitle}`
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
        console.log("state.progressBarCount = ", state.progressBarCount);

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
        projectGrid.appendChild(newProjectCard);
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
                proj.classList.remove('expanded');
            });

            dashboardContainer.appendChild(projectGrid);
        } else {
            projectGrid.removeChild(projectToRemove);
        }
    };

    const renderExpandedProject = (ev) => {
        // Check if the target of the click event is the delete icon
        // Or the project card has already been expanded
        // If yes, Return early without triggering the expansion
        if (ev.target.classList.contains('invisible-btn') ||
            ev.currentTarget.classList.contains('expanded')) {
            return;
        }

        const projectCard = ev.currentTarget;

        const projectGrid = doc.getElementById('project-grid');

        // Store the current project grid and its children in state
        const storeCurrentProjectGrid = () => {
            state.currentProjectGrid = projectGrid.cloneNode(true);
        };

        // Call the function to store the current project grid
        // before the projectCard is removed from it.
        storeCurrentProjectGrid();

        const cardStyle = getComputedStyle(projectCard);
        const gridStyle = getComputedStyle(projectGrid);

        // Get borders widths of card and grid.
        const gridBorderWidth = parseFloat(gridStyle.borderTopWidth);
        const cardBorderWidth = parseFloat(cardStyle.borderTopWidth);

        // Get current dimensions and position of project-card
        const cardRect = ev.currentTarget.getBoundingClientRect();
        const currentX = cardRect.left;
        const currentY = cardRect.top;
        const currentWidth = cardRect.width;
        const currentHeight = cardRect.height;

        // Store current card pos/dimensions and current projectGrid for return animation
        // and to restore the projectGrid after expanded card shrinks again.
        state.expandedCardPrevPosition = { currentX, currentY, currentWidth, currentHeight };
        // Get current dimensions and position of project-grid
        const gridRect = ev.currentTarget.parentNode.getBoundingClientRect();
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
                        <input type="checkbox" name="todo-${index}" class="todo-check"></input>
                    </div>
                `;
                todoContainer.addEventListener('click', function(ev) {
                    ev.stopPropagation();

                    if (todoContainer.classList.contains("expanded")) {
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
                checkBox.checked = todo.checked;
                checkBox.addEventListener("click", renderProgressBar);

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

        const projectCard = ev.currentTarget;
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
        const gridBorderWidth = 3;
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
                progressBars[i].style.width = `${state.progressBarPercentages[i]}%`;
                if (state.progressBarPercentages[i] === 100) {
                    progressBars[i].style.background = "hsl(150, 51%, 50%)";
                } else {
                    progressBars[i].style.background = "hsl(0, 51%, 50%)";
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

    const renderProgressBar = (ev) => {
        const projectId = doc.querySelector('[id^="project-card-"]').id;
        const projectName = projectId.slice(projectId.lastIndexOf("-") + 1);
        const todoIndex = ev.target.name.slice(ev.target.name.lastIndexOf("-") + 1);

        const projectTodoList = doc.querySelector('.project-todos-list');
        const checkboxes = Array.from(projectTodoList.querySelectorAll('.todo-check'));
        const checkBoxCount = checkboxes.length;
        const checkedCount = Array.from(checkboxes.filter(checkbox => checkbox.checked)).length;

        const user = TodoApp.getCurrentUser();
        const project = user.getProject(projectName);
        project.todos[todoIndex].checked = ev.target.checked;

        const progressBar = doc.querySelector('.progress-bar');
        progressBar.style.width = `${(checkedCount / checkBoxCount) * 100}%`;

        const progressbarIdNum = parseInt((progressBar.id).slice(progressBar.id.lastIndexOf("-") + 1));
        state.progressBarPercentages[progressbarIdNum] = (checkedCount / checkBoxCount) * 100;

        if (state.progressBarPercentages[progressbarIdNum] === 100) {
            progressBar.style.background = "hsl(150, 51%, 50%)";
        } else {
            progressBar.style.background = "hsl(0, 51%, 50%)";
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
