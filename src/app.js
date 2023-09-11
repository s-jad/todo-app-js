import Display from './display';
import Project from './project';
import Todo from './todo';
import User from './user';

const TodoApp = (() => {
  const state = {
    currentUserName: '',
    users: [],
  };
  const doc = document;
  const win = window;
  const ls = win.localStorage;

  const getCurrentUserName = () => state.currentUserName;

  const setCurrentUserName = function setCurrentUserName(username) {
    state.currentUserName = username;
  };

  const getCurrentUserIndex = (username) => {
    const currentUserIndex = state.users.findIndex((user) => user.name === username);

    if (currentUserIndex !== -1) {
      return currentUserIndex;
    }
  };

  const getCurrentUser = () => state.users[getCurrentUserIndex(getCurrentUserName())];

  const startApp = () => {
    const app = Display.renderApp();
    app.appendChild(Display.renderWelcomeScreen());
    doc.body.appendChild(app);

    win.addEventListener('beforeunload', (event) => {
      event.preventDefault();
      // Chrome requires returnValue to be set
      event.returnValue = '';

      const user = getCurrentUser();
      const progressBarCount = Display.getProgressBarCount();
      const progressBarPercentages = Display.getProgressBarPercentages();

      ls.setItem('user', JSON.stringify(user));
      ls.setItem('progressBarCount', JSON.stringify(progressBarCount));
      ls.setItem('progressBarPercentages', JSON.stringify(progressBarPercentages));
    });
  };

  const createNewUser = (username, projects) => {
    const newUser = new User(username, projects);
    setCurrentUserName(username);
    state.users.push(newUser);

    ls.setItem('user', JSON.stringify(newUser));
  };

  const getPreviousUser = () => {
    const userObj = JSON.parse(ls.getItem('user'));

    const projectArr = [];

    userObj.projects.forEach((proj) => {
      const project = new Project(
        proj.title,
        proj.description,
        [],
      );

      proj.todos.forEach((todoObj) => {
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

  const updateCurrentUser = (updatedUser) => {
    state.users[getCurrentUserIndex(getCurrentUserName())] = updatedUser;
  };

  const addProjectToUser = (project) => {
    const userName = getCurrentUserName();
    const userIndex = getCurrentUserIndex(userName);
    const currentUser = state.users[userIndex];

    currentUser.addProject(project);
    Display.renderNewProject(project);

    ls.setItem('user', JSON.stringify(currentUser));
  };

  const deleteProjectFromUser = (projectTitle) => {
    const userName = getCurrentUserName();
    const userIndex = getCurrentUserIndex(userName);
    const currentUser = state.users[userIndex];
    currentUser.deleteProject(projectTitle);

    ls.setItem('user', JSON.stringify(currentUser));
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

export default TodoApp;
