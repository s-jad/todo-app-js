import { TodoApp } from "./app";
import { Display } from "./display";
import User from "./user";

export const SearchBar = ((doc) => {
    let state = {
        expandedMatchingProject: false,
        currentlyExpandedProject: {},
    };

    const generateSearchBar = () => {
        const searchBarContainer = doc.createElement('div');
        searchBarContainer.id = "search-bar-container"

        const searchImageGlass = doc.createElement('div');
        const searchImageHandle = doc.createElement('div');
        searchImageGlass.id = "search-image-glass";
        searchImageHandle.id = "search-image-handle";

        const searchBar = doc.createElement('input');
        searchBar.type = "search";
        searchBar.id = "search-bar";

        const invisibleToggleBtn = doc.createElement("button");
        invisibleToggleBtn.id = "toggle-search-bar";
        invisibleToggleBtn.classList.add("invisible-btn");
        invisibleToggleBtn.classList.add("big-btn");

        invisibleToggleBtn.onclick = () => {
            if (!invisibleToggleBtn.classList.contains("activate")) {
                searchBar.classList.add("active");
                invisibleToggleBtn.classList.add("activate");
                searchImageGlass.classList.add("minify");
                searchImageHandle.classList.add("minify");
                Display.setFocusToFirstInput(searchBar);
            } else {
                searchBar.classList.remove("active");
                invisibleToggleBtn.classList.remove("activate");
                searchImageGlass.classList.remove("minify");
                searchImageHandle.classList.remove("minify");
            }
        }

        searchBar.addEventListener("input", function() {
            displayMatches(searchBar.value, "projects");
        })

        searchBarContainer.appendChild(searchBar);
        searchBarContainer.appendChild(searchImageGlass);
        searchBarContainer.appendChild(searchImageHandle);
        searchBarContainer.appendChild(invisibleToggleBtn);


        return searchBarContainer;
    };

    const findMatches = (wordToMatch, arrayToSearch) => {
        const projectGrid = Display.getCurrentProjectGrid();
        const projects = Array.from(projectGrid.children);

        if (wordToMatch === "") {
            return projects;
        }

        if (arrayToSearch = "projects") {
            return projects.filter((proj) => {
                const regex = new RegExp(wordToMatch, 'gi');
                const projectTitle = proj.querySelector(".project-title").innerText.trim();
                console.log("proj ", projectTitle, " matches ", regex, "?");
                console.log(projectTitle.match(regex));
                return projectTitle.match(regex);
            });
        } else if (arrayToSearch = "todos") {
            const currentUser = TodoApp.getCurrentUser();
            let matches;

            for (let i = 0; i < projects.length - 1; i++) {
                const currentProjectTitle = projects[i].querySelector('.project-title').innerText.trim();
                const currentProject = currentUser.getProject(currentProjectTitle);
                const todos = currentProject.getAllTodos();
                todos.forEach((todo) => {
                    const regex = new RegExp(wordToMatch, 'gi');
                    if (todo.title.match(regex)) {
                        console.log("todo matches ", regex);
                        if (!matches.includes(projects[i])) {
                            console.log("Project => ", projects[i]);
                            matches.push(projects[i]);
                        }
                    }
                });
            }
            return matches;
        }
    };

    const displayMatches = (wordToMatch, arrayToSearch) => {
        const matches = findMatches(wordToMatch, arrayToSearch);

        const projectGrid = document.getElementById('project-grid');

        // If only one project title matches, auto-expand that project
        if (matches.length === 1) {
            const singleMatch = new CustomEvent('searchGrow', {
                target: matches[0],
            });

            matches[0].dispatchEvent(singleMatch);
            state.expandedMatchingProject = true;
            state.currentlyExpandedProject = matches[0];
        }

        // If a project is auto-expanded but not the only match, shrink it
        if (matches.length > 1 && state.expandedMatchingProject === true) {
            const currentExpanded = state.currentlyExpandedProject;
            console.log("currentExpanded => ", currentExpanded);
            const notSingleMatch = new CustomEvent('searchShrink', {
                target: currentExpanded,
            });

            console.log("Dispatching event notSingleMatch on element ", currentExpanded);
            currentExpanded.dispatchEvent(notSingleMatch);
            state.expandedMatchingProject = false;

            console.log("displayMatches::notSingleMatch => ", notSingleMatch);
            console.log("state.expandedMatchingProject => ", state.expandedMatchingProject);
        }

        const totalProjectGrid = Display.getCurrentProjectGrid().cloneNode(true);
        const allProjects = Array.from(totalProjectGrid.querySelectorAll('[id^="project-card-"]'));

        const currentProjects = document.querySelectorAll('[id^="project-card-"]');

        let currentlyDisplayedProjects = [];
        currentProjects.forEach(proj => {
            if (proj.classList.contains("search-invisible")) {
                return;
            }
            currentlyDisplayedProjects.push(proj);
        });
        console.log("currentlyDisplayedProjects => ", currentlyDisplayedProjects);


        allProjects.forEach((proj) => {
            const projTitle = proj.querySelector('.project-title').innerText.trim();
            console.log("proj => ", proj);
            console.log("projTitle => ", projTitle);

            const match = matches.some((match) => {
                const matchTitle = match.querySelector('.project-title').innerText.trim();
                console.log("matchTitle => ", matchTitle);
                return matchTitle === projTitle;
            });

            if (!match && currentlyDisplayedProjects.some((project) => {
                const title = project.querySelector('.project-title').innerText.trim();
                if (title === projTitle) {
                    console.log("Title not a match => ", title);
                    return true;
                }
            })
            ) {
                console.log("Isnt a match and is currently displayed => ", proj);
                const projectToRemove = totalProjectGrid.querySelector(`#project-card-${projTitle}`);
                projectToRemove.classList.add("search-invisible");
                setTimeout(() => {
                    projectToRemove.style.display = "none";
                }, 110);
            } else if (match && !currentlyDisplayedProjects.some((project) => {
                const title = project.querySelector('.project-title').innerText.trim();

                if (title === projTitle) {
                    console.log("Title is a match => ", title);
                    return true;
                }
            })) {
                console.log("Is a match and not currently displayed => ", proj);
                const projectToAdd = totalProjectGrid.querySelector(`#project-card-${projTitle}`);
                projectToAdd.style.display = "grid";
                setTimeout(() => {
                    projectToAdd.classList.remove("search-invisible");
                }, 110);
            }
        });
    }

    return {
        generateSearchBar,
    };

})(document);
