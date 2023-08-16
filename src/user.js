export default class User {
    constructor(name) {
        this.name = name;
        this.projects = [];
    }

    addProject(project) {
        this.projects.push(project);
    }

    deleteProject(projectTitle) {
        const projectIndex = this.projects.findIndex(project => project.name === projectTitle.name);

        if (projectIndex !== -1) {
            this.projects.splice(projectIndex, 1);
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }

    getProject(projectTitle) {
        const projectIndex = this.projects.findIndex(project => project.name === projectTitle.name);

        if (projectIndex !== -1) {
            return this.projects[projectIndex];
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }

    updateProject(projectTitle, projectPatch) {
        const projectIndex = this.projects.findIndex(project => project.title === projectTitle.title);

        if (projectIndex !== -1) {
            this.projects[projectIndex] = projectPatch;
        } else {
            console.log(`Cant find ${projectTitle}`);
        }
    }
}
