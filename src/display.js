import { UserEvents } from "./app";

export const Display = ((doc) => {
    const app = doc.createElement('div');
    app.id = "app-container";

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

        const createProjectBtn = new Image();
        createProjectBtn.src = "./assets/add.png";
        createProjectBtn.id = "create-project-btn";

        createProjectBtn.addEventListener("click", renderCreateNewProjectModal);

        const headerUtilsFlex = doc.createElement('div');
        headerUtilsFlex.id = "header-utils-flex"
        headerUtilsFlex.appendChild(searchBar);
        headerUtilsFlex.appendChild(createProjectBtn);

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
        const projectToRemoveTitle = ev.target.parentNode.querySelector('.project-title').innerText;

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
            <div class="progress-bar-bg"></div>
            <div class="progress-bar"></div>
        `;

        const deleteBtn = new Image();
        deleteBtn.classList.add('delete-project-btn');
        deleteBtn.src = './assets/delete.png';
        deleteBtn.addEventListener("click", renderDeleteProjectModal);

        newProjectCard.appendChild(deleteBtn);
        projectGrid.appendChild(newProjectCard);
    };

    const removeProjectFromProjectGrid = (projectTitle) => {
        const projectGrid = doc.getElementById('project-grid');

        const moddedProjectTitle = projectTitle.replaceAll(" ", "-");
        const projectCardId = `project-card-${moddedProjectTitle}`;
        const projectToRemove = projectGrid.querySelector(`#${projectCardId}`);

        projectGrid.removeChild(projectToRemove);
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
