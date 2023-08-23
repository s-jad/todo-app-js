import { Display } from "./display";
import Project from "./project";
import Todo from "./todo";
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

    const getCurrentUser = () => {
        return state.users[getCurrentUserIndex(getCurrentUserName())];
    };

    const addProjectToUser = (project) => {
        const userName = getCurrentUserName();
        const userIndex = getCurrentUserIndex(userName);
        const currentUser = state.users[userIndex];

        currentUser.addProject(project);
        Display.renderNewProject(project);
    };

    const deleteProjectFromUser = (projectTitle) => {
        const userName = getCurrentUserName();
        const userIndex = getCurrentUserIndex(userName);
        const currentUser = state.users[userIndex];
        currentUser.deleteProject(projectTitle);
    };

    return {
        startApp,
        createNewUser,
        addProjectToUser,
        deleteProjectFromUser,
        getCurrentUser,
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

        const todoBoxes = Array.from(document.querySelectorAll('[id^="todo-input-box-"]'));

        let projectTodos = [];

        todoBoxes.forEach(todoBox => {
            const todo = new Todo(
                todoBox.querySelector('[name^="new-todo-name-"]').value,
                todoBox.querySelector('[name^="new-todo-description-"]').value,
                todoBox.querySelector('[name^="new-todo-due-date-"]').value,
                parseInt(todoBox.querySelector('[name^="new-todo-priority-"]').value),
                todoBox.querySelector('[name^="new-todo-notes-"]').value,
            );

            projectTodos.push(todo);
        });

        const newProject = new Project(
            projectName,
            projectDescription,
            projectTodos,
        );

        TodoApp.addProjectToUser(newProject);
        closeModal(ev.target.parentNode.parentNode);
    };

    const deleteProject = (projectTitle) => {
        const deleteProjectModalContainer = document.querySelector('#delete-project-modal-container');
        TodoApp.deleteProjectFromUser(projectTitle);
        Display.removeProjectFromProjectGrid(projectTitle);

        closeModal(deleteProjectModalContainer);
    };

    const closeModal = (modal) => {
        const parent = modal.parentNode;
        parent.removeChild(modal);
    };

    return {
        switchToProjectDashboard,
        createNewProject,
        deleteProject,
        closeModal,
    };

})();

