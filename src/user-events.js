import { TodoApp } from "./app";
import { Display } from "./display";
import Todo from "./todo";
import Project from "./project";

export const UserEvents = (() => {
    const switchToProjectDashboard = (ev) => {
        const btn = ev.target;

        if (btn.id === "welcome-confirm-btn") {

            const welcomeInput = document.getElementById("welcome-input");
            TodoApp.createNewUser(welcomeInput.value);
            Display.renderProjectDashboard(welcomeInput.value);

        } else if (btn.id === "previous-user-btn") {

            const username = TodoApp.getPreviousUser();
            Display.renderProjectDashboard(username);
        }
    };

    const createNewProject = (ev) => {
        const projectNameInput = document.getElementById('create-project-name-input');

        const projectName = projectNameInput.value.replaceAll("  ", " ");

        const projectDescriptionInput = document.getElementById('create-project-description-input');
        const projectDescription = projectDescriptionInput.value;

        const todoCards = Array.from(document.querySelectorAll('[id^="todo-input-card-"]'));

        let projectTodos = [];

        todoCards.forEach(todoCard => {
            let priority = parseInt(todoCard.querySelector('[name^="new-todo-priority-"]').value);
            priority = isNaN(priority) ? 10 : priority;

            const todo = new Todo(
                todoCard.querySelector('[name^="new-todo-name-"]').value,
                todoCard.querySelector('[name^="new-todo-description-"]').value,
                todoCard.querySelector('[name^="new-todo-due-date-"]').value,
                priority,
                todoCard.querySelector('[name^="new-todo-notes-"]').value,
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

