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

        window.addEventListener("beforeunload", function(event) {
            event.preventDefault();
            // Chrome requires returnValue to be set
            event.returnValue = "";

            const user = getCurrentUser();
            const progressBarCount = Display.getProgressBarCount();
            const progressBarPercentages = Display.getProgressBarPercentages();

            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("progressBarCount", JSON.stringify(progressBarCount));
            localStorage.setItem("progressBarPercentages", JSON.stringify(progressBarPercentages));
        });
    };

    const createNewUser = (username, projects) => {
        const newUser = new User(username, projects);
        setCurrentUserName(username)
        state.users.push(newUser);

        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const getPreviousUser = () => {
        const userObj = JSON.parse(localStorage.getItem("user"));

        const projectArr = [];

        userObj.projects.forEach(proj => {
            const project = new Project(
                proj.title,
                proj.description,
                [],
            );

            proj.todos.forEach(todoObj => {

                const todo = new Todo(
                    todoObj.title,
                    todoObj.description,
                    todoObj.dueDate,
                    todoObj.priority,
                    todoObj.notes,
                    todoObj.checked,
                );

                project.addTodo(todo);
            });

            projectArr.push(project);
        });

        const user = new User(
            userObj.name,
            projectArr,
        );

        setCurrentUserName(user.name);
        state.users.push(user);
        return user.name;
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

    const updateCurrentUser = (updatedUser) => {
        state.users[getCurrentUserIndex(getCurrentUserName())] = updatedUser;
    };

    const addProjectToUser = (project) => {
        const userName = getCurrentUserName();
        const userIndex = getCurrentUserIndex(userName);
        const currentUser = state.users[userIndex];

        currentUser.addProject(project);
        Display.renderNewProject(project);

        localStorage.setItem("user", JSON.stringify(currentUser));
    };

    const deleteProjectFromUser = (projectTitle) => {
        const userName = getCurrentUserName();
        const userIndex = getCurrentUserIndex(userName);
        const currentUser = state.users[userIndex];
        currentUser.deleteProject(projectTitle);

        localStorage.setItem("user", JSON.stringify(currentUser));
    };

    return {
        startApp,
        createNewUser,
        getPreviousUser,
        addProjectToUser,
        deleteProjectFromUser,
        getCurrentUser,
        updateCurrentUser,
    };
})();
