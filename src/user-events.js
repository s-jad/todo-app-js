import TodoApp from './app';
import Display from './display';
import Todo from './todo';
import Project from './project';

const UserEvents = ((doc) => {
  const switchToProjectDashboard = (ev) => {
    const btn = ev.target;

    if (btn.id === 'welcome-confirm-btn') {
      const welcomeInput = doc.getElementById('welcome-input');
      TodoApp.createNewUser(welcomeInput.value, []);
      Display.renderProjectDashboard(welcomeInput.value, false);
    } else if (btn.id === 'previous-user-btn') {
      const username = TodoApp.getPreviousUser();
      Display.renderProjectDashboard(username, true);
    }
  };

  const closeModal = (modal) => {
    const parent = modal.parentNode;
    parent.removeChild(modal);
  };

  const createNewProject = (ev) => {
    const projectNameInput = doc.getElementById('create-project-name-input');

    const projectName = projectNameInput.value.replaceAll('  ', ' ');

    const projectDescriptionInput = doc.getElementById('create-project-description-input');
    const projectDescription = projectDescriptionInput.value;

    const todoCards = Array.from(doc.querySelectorAll('[id^="todo-input-card-"]'));

    const projectTodos = [];

    todoCards.forEach((todoCard) => {
      let priority = parseInt(todoCard.querySelector('[name^="new-todo-priority-"]').value, 10);
      priority = Number.isNaN(priority) ? 10 : priority;

      const todo = new Todo(
        todoCard.querySelector('[name^="new-todo-name-"]').value,
        todoCard.querySelector('[name^="new-todo-description-"]').value,
        todoCard.querySelector('[name^="new-todo-due-date-"]').value,
        priority,
        todoCard.querySelector('[name^="new-todo-notes-"]').value,
        false,
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
    const deleteProjectModalContainer = doc.querySelector('#delete-project-modal-container');
    TodoApp.deleteProjectFromUser(projectTitle);
    Display.removeProjectFromProjectGrid(projectTitle);

    closeModal(deleteProjectModalContainer);
  };

  return {
    switchToProjectDashboard,
    createNewProject,
    deleteProject,
    closeModal,
  };
})(document);

export default UserEvents;
