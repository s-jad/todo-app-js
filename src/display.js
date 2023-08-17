import User from "./user";

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
        welcomeConfirmBtn.onclick = renderProjectDashboard;
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

    return {
        renderApp,
        renderWelcomeScreen,
        renderProjectDashboard,
    };

})(document);
