import { UserEvents } from "./app";

export const Display = ((doc) => {
    const app = doc.createElement('div');
    app.id = "app-container";

    // To contain the projectGrid and its current project-cards
    // when one of the cards expands to fill the whole container
    // so it can be put back again when the card shrinks
    let state = {
        currentProjectGrid: {},
        expandedCardPrevPosition: {},
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
                <label for="create-project-name" id="create-project-label">Name:</label>
                <input type="text" name="create-project-name" id="create-project-name-input">
                <label for="create-project" id="create-project-label">Description:</label>
                <textarea type="text" name="create-project-description" id="create-project-description-input"></textarea>
                <button type="button" id="confirm-create-project-btn">Confirm</button>
                <button type="button" id="cancel-create-project-btn">Cancel</button>
            </form>
        `;

        const confirmCreateProjectBtn = createProjectModalContainer.querySelector('#confirm-create-project-btn');
        const cancelCreateProjectBtn = createProjectModalContainer.querySelector('#cancel-create-project-btn');

        confirmCreateProjectBtn.onclick = UserEvents.createNewProject;
        cancelCreateProjectBtn.onclick = () => UserEvents.closeModal(createProjectModalContainer);

        app.appendChild(createProjectModalContainer);
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

        newProjectCard.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="project-utils">
                <div class="progress-bar-bg">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;

        const btnContainer = doc.createElement('div');
        btnContainer.classList.add('btn-container');
        const deleteBtn = new Image();
        deleteBtn.classList.add('delete-project-btn');
        deleteBtn.src = './assets/delete.png';

        const actualDeleteBtn = doc.createElement('button');
        actualDeleteBtn.classList.add('invisible-btn');

        actualDeleteBtn.addEventListener("click", function(ev) {
            ev.stopPropagation;
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

        if (projectToRemove.classList.contains("expanded")) {
            const dashboardContainer = doc.getElementById('dashboard-container');
            dashboardContainer.removeChild(projectToRemove);
            const projectGrid = state.currentProjectGrid;
            dashboardContainer.appendChild(projectGrid);
        } else {
            projectGrid.removeChild(projectToRemove);
        }
    };

    const renderExpandedProject = (ev) => {
        // Check if the target of the click event is the delete icon
        // If yes, Return early without triggering the expansion
        if (ev.target.classList.contains('invisible-btn')) {
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
        const animationName = `expansionAnimation_${Date.now()}`;
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
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = animationKeyframes;
        document.head.appendChild(styleSheet);

        projectCard.style.animation = `${animationName} ${animationDuration} ${animationTransition}`;

        projectCard.addEventListener("animationend", function() {
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
                    <div class="todo-container">
                        <li class="project-todo" data-todo="example-todo">Example todo</li>
                        <input type="checkbox" class="todo-check" data-todo="example-todo"></input>
                    </div>
                    <div class="todo-container">
                        <li class="project-todo" data-todo="another-longer-todo">Another longer todo</li>
                        <input type="checkbox" class="todo-check" data-todo="another-longer-todo"></input>
                    </div>
                </ul>
            `;
            projectCard.appendChild(projectTodoListContainer);
            projectTodoListContainer.classList.remove('invisible');

            dashboardContainer.removeChild(projectGrid);
            dashboardContainer.appendChild(projectCard);
            projectCard.removeEventListener("click", renderExpandedProject);
        });
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
