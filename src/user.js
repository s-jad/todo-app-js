export default class User {
    constructor(userName, projects) {
        this.name = userName;
        this.projects = projects;
    }

    addProject(project) {
        // In case of accidental trailing whitespace
        // makes it impossible to delete
        project.title = project.title.trim();
        this.projects.push(project);
    }

    deleteProject(projectTitle) {
        const projectIndex = this.projects.findIndex(project => project.title === projectTitle);
        if (projectIndex !== -1) {
            this.projects.splice(projectIndex, 1);
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }

    getProject(projectTitle) {
        const projectIndex = this.projects.findIndex(project => project.title === projectTitle);

        if (projectIndex !== -1) {
            return this.projects[projectIndex];
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }

    getAllProjects() {
        return Array.from(this.projects);
    }

    updateProject(projectTitle, projectPatch) {
        const projectIndex = this.projects.findIndex(project => project.title === projectTitle);

        if (projectIndex !== -1) {
            this.projects[projectIndex] = projectPatch;
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }

    checkUniqueProjectName(projectTitle) {
        return this.projects.findIndex(project => project.title === projectTitle);
    }
}
