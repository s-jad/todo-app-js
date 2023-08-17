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

    const renderNewProject = (project) => {
        const projectGrid = doc.getElementById('project-grid');
        const newProjectCard = doc.createElement('div');
        newProjectCard.id = `project-card-${project.title}`;

        newProjectCard.innerHTML = `
            <h3 class="project-title">${project.title}</h3>
            <p class="project-description">${project.description}</p>
            <div class="progress-bar-bg"></div>
            <div class="progress-bar"></div>
        `;

        projectGrid.appendChild(newProjectCard);
    };

    return {
        renderApp,
        renderWelcomeScreen,
        renderProjectDashboard,
        renderNewProject,
    };

})(document);
