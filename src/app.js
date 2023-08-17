import { Display } from "./display";
import Project from "./project";
import User from "./user";

export const TodoApp = (() => {
    let state = {
        currentUserName: "",
        users: [],
    };

    const startApp = () => {
        const app = Display.renderApp();
        app.appendChild(Display.renderWelcomeScreen());
        document.body.appendChild(app);
    };

    const createNewUser = (username) => {
        const newUser = new User(username);
        setCurrentUserName(username)
        state.users.push(newUser);
    };

    const getCurrentUserName = () => {
        return state.currentUserName;
    };

    const setCurrentUserName = (username) => {
        state.currentUserName = username;
    };

    const getCurrentUserIndex = (username) => {
        const currentUserIndex = state.users.findIndex(user => user.name === username);

        if (currentUserIndex !== -1) {
            return currentUserIndex;
        }
    };

    const addProjectToUser = (project) => {
        const userName = getCurrentUserName();
        const userIndex = getCurrentUserIndex(userName);
        const currentUser = state.users[userIndex];

        currentUser.addProject(project);
        Display.renderNewProject(project);
    };

    return {
        startApp,
        createNewUser,
        addProjectToUser,
    };

})();

export const UserEvents = (() => {
    const switchToProjectDashboard = () => {
        const welcomeInput = document.getElementById('welcome-input');
        TodoApp.createNewUser(welcomeInput.value);
        Display.renderProjectDashboard();
    };

    const createNewProject = (ev) => {
        const projectNameInput = document.getElementById('create-project-name-input');
        const projectName = projectNameInput.value;

        const projectDescriptionInput = document.getElementById('create-project-description-input');
        const projectDescription = projectDescriptionInput.value;

        const newProject = new Project(
            projectName,
            projectDescription,
            [],
        );

        TodoApp.addProjectToUser(newProject);
        closeModal(ev.target.parentNode.parentNode);
    };

    const closeModal = (modal) => {
        const parent = modal.parentNode;
        parent.removeChild(modal);
    };

    return {
        switchToProjectDashboard,
        createNewProject,
        closeModal,
    };

})();

