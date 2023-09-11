export default class User {
  constructor(userName, projects) {
    this.name = userName;
    this.projects = projects;
  }

  addProject(project) {
    // In case of accidental trailing whitespace
    // makes it impossible to delete
    const p = project;
    p.title = p.title.trim();
    this.projects.push(p);
  }

  deleteProject(projectTitle) {
    const projectIndex = this.projects.findIndex((project) => project.title === projectTitle);
    if (projectIndex !== -1) {
      this.projects.splice(projectIndex, 1);
    }
  }

  getProject(projectTitle) {
    const projectIndex = this.projects.findIndex((project) => project.title === projectTitle);

    if (projectIndex !== -1) {
      return this.projects[projectIndex];
    }
  }

  getAllProjects() {
    return Array.from(this.projects);
  }

  updateProject(projectTitle, projectPatch) {
    const projectIndex = this.projects.findIndex((project) => project.title === projectTitle);

    if (projectIndex !== -1) {
      this.projects[projectIndex] = projectPatch;
    }
  }

  checkUniqueProjectName(projectTitle) {
    return this.projects.findIndex((project) => project.title === projectTitle);
  }
}
