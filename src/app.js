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
