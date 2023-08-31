import { TodoApp } from "./app";
import { Display } from "./display";
import User from "./user";

export const SearchBar = ((doc) => {
    let state = {
        expandedMatchingProject: false,
        currentlyExpandedProject: {},
        expandedMatchingTodo: false,
        currentlyExpandedTodo: {},
        searchBarToggle: "todos",
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
            if (state.searchBarToggle === "projects") {
                displayProjectMatches(searchBar.value);
            } else if (state.searchBarToggle === "todos") {
                displayTodoMatches(searchBar.value);
            }
        });

        searchBarContainer.appendChild(searchBar);
        searchBarContainer.appendChild(searchImageGlass);
        searchBarContainer.appendChild(searchImageHandle);
        searchBarContainer.appendChild(invisibleToggleBtn);


        return searchBarContainer;
    };

    const findProjectMatches = (wordToMatch) => {
        const projectGrid = Display.getCurrentProjectGrid();
        const projects = Array.from(projectGrid.children);

        if (wordToMatch === "" && state.expandedMatchingProject) {
            const currentExpanded = state.currentlyExpandedProject;
            const currentCard = doc.querySelector(`#${currentExpanded.id}`);

            if (currentCard.classList.contains("search-invisible")) {
                currentCard.classList.remove("search-invisible");
            };
            const notSingleMatch = new CustomEvent('searchShrink', {
                target: currentCard,
            });

            currentCard.dispatchEvent(notSingleMatch);
            state.expandedMatchingProject = false;
        }

        if (wordToMatch === "") {
            projects.forEach(proj => {
                proj.classList.remove("search-invisible");
                proj.style.display = "grid";
            })
            return projects;
        }

        return projects.filter((proj) => {
            const regex = new RegExp(wordToMatch, 'gi');
            const projectTitle = proj.querySelector(".project-title").innerText.trim();
            return projectTitle.match(regex);
        });
    };

    const displayProjectMatches = (wordToMatch) => {
        const projects = Array.from(doc.querySelectorAll('[id^="project-card-"]'));
        // If there are no projects, dont do anything
        if (projects.length === 0) {
            return;
        }

        const matches = findProjectMatches(wordToMatch);
        // If only one project title matches, auto-expand that project
        if (matches.length === 1) {
            const matchTitle = matches[0].id.slice(matches[0].id.lastIndexOf("-") + 1);
            const match = doc.querySelector(`[id="project-card-${matchTitle}"]`)

            // If only one project matches, its expanded but invisible
            if (match.classList.contains("search-invisible")) {
                match.classList.remove("search-invisible");
                return;
            } else {
                const singleMatch = new CustomEvent('searchGrow', {
                    target: matches[0],
                });

                matches[0].dispatchEvent(singleMatch);
                state.expandedMatchingProject = true;
                state.currentlyExpandedProject = matches[0];
            }
        }

        // If there are no matches, but project is expanded, make invisible
        if (matches.length === 0 && state.expandedMatchingProject === true) {
            const currentExpanded = state.currentlyExpandedProject;
            currentExpanded.classList.add("search-invisible");
            return;
        }

        // If a project is auto-expanded but not the only match, shrink it
        if (matches.length > 1 && state.expandedMatchingProject === true) {
            const currentExpanded = state.currentlyExpandedProject;
            if (currentExpanded.classList.contains("search-invisible")) {
                currentExpanded.classList.remove("search-invisible");
            };

            if (currentExpanded.classList.contains("expanded")) {
                const notSingleMatch = new CustomEvent('searchShrink', {
                    target: currentExpanded,
                });

                currentExpanded.dispatchEvent(notSingleMatch);
                state.expandedMatchingProject = false;
            }
        }

        const totalProjectGrid = Display.getCurrentProjectGrid().cloneNode(true);
        const allProjects = Array.from(totalProjectGrid.querySelectorAll('[id^="project-card-"]'));

        const currentProjects = doc.querySelectorAll('[id^="project-card-"]');

        let currentlyDisplayedProjects = [];
        currentProjects.forEach(proj => {
            if (proj.classList.contains("search-invisible")) {
                return;
            }
            currentlyDisplayedProjects.push(proj);
        });


        allProjects.forEach((proj) => {
            const projTitle = proj.querySelector('.project-title').innerText.trim();

            const match = matches.some((match) => {
                const matchTitle = match.querySelector('.project-title').innerText.trim();
                return matchTitle === projTitle;
            });

            const displayed = currentlyDisplayedProjects.some((project) => {
                const title = project.querySelector('.project-title').innerText.trim();
                if (title === projTitle) {
                    return true;
                }
            });

            if (!match && displayed) {
                const projectGrid = Display.getCurrentProjectGrid();
                const projectToRemove = projectGrid.querySelector(`#project-card-${projTitle}`);
                projectToRemove.classList.add("search-invisible");
                setTimeout(() => {
                    projectToRemove.style.display = "none";
                }, 110);
            } else if (match && !displayed) {
                setTimeout(() => {
                    const projectGrid = Display.getCurrentProjectGrid();
                    const projectToAdd = projectGrid.querySelector(`#project-card-${projTitle}`);
                    projectToAdd.style.display = "grid";
                    projectToAdd.classList.remove("search-invisible");
                }, 110);
            }
        });
    }

    const findTodoMatches = (wordToMatch) => {
        const projectGrid = Display.getCurrentProjectGrid();
        const projects = Array.from(projectGrid.children);

        if (wordToMatch === "" && state.expandedMatchingProject) {
            const currentExpanded = state.currentlyExpandedProject;
            const currentCard = doc.querySelector(`#${currentExpanded.id}`);

            if (currentCard.classList.contains("search-invisible")) {
                currentCard.classList.remove("search-invisible");
            };
            const notSingleMatch = new CustomEvent('searchShrink', {
                target: currentCard,
            });

            currentCard.dispatchEvent(notSingleMatch);
            state.expandedMatchingProject = false;
        }

        if (wordToMatch === "") {
            projects.forEach(proj => {
                proj.classList.remove("search-invisible");
                proj.style.display = "grid";
            })
            return projects;
        }

        const currentUser = TodoApp.getCurrentUser();
        let projMatches = [];
        let todoMatches = [];

        for (let i = 0; i < projects.length; i++) {
            const currentProjectTitle = projects[i].querySelector('.project-title').innerText.trim();
            const currentProject = currentUser.getProject(currentProjectTitle);
            const todos = currentProject.getAllTodos();

            todos.forEach((todo) => {
                const regex = new RegExp(wordToMatch, 'gi');
                if (todo.title.match(regex)) {
                    if (!projMatches.includes(projects[i])) {
                        projMatches.push(projects[i]);
                    }
                    todoMatches.push(todo.title);
                }
            });
        };
        return { projMatches, todoMatches };
    };

    const displayTodoMatches = (wordToMatch) => {
        const matches = findTodoMatches(wordToMatch);
        const projectMatches = matches.projMatches;
        const todoMatches = matches.todoMatches;

        if (projectMatches === undefined) {
            return;
        }

        // If there are no matches, but project is expanded, make invisible
        if (projectMatches.length === 0 && state.expandedMatchingProject === true) {
            const currentExpanded = state.currentlyExpandedProject;
            currentExpanded.classList.add("search-invisible");
            return;
        }

        // If a project is auto-expanded but not the only match, shrink it
        if (projectMatches.length > 1 && state.expandedMatchingProject === true) {
            const currentExpanded = state.currentlyExpandedProject;
            if (currentExpanded.classList.contains("search-invisible")) {
                currentExpanded.classList.remove("search-invisible");
            };

            if (currentExpanded.classList.contains("expanded")) {
                const notSingleMatch = new CustomEvent('searchShrink', {
                    target: currentExpanded,
                });

                currentExpanded.dispatchEvent(notSingleMatch);
                state.expandedMatchingProject = false;
            }
        }

        const totalProjectGrid = Display.getCurrentProjectGrid().cloneNode(true);
        const allProjects = Array.from(totalProjectGrid.querySelectorAll('[id^="project-card-"]'));

        const currentProjects = doc.querySelectorAll('[id^="project-card-"]');

        let currentlyDisplayedProjects = [];
        currentProjects.forEach(proj => {
            if (proj.classList.contains("search-invisible")) {
                return;
            }
            currentlyDisplayedProjects.push(proj);
        });

        if (projectMatches.length === 1) {
            const matchTitle = projectMatches[0].id.slice(projectMatches[0].id.lastIndexOf("-") + 1);
            const projectMatch = doc.querySelector(`[id="project-card-${matchTitle}"]`)

            // If only one project matches, its expanded but invisible
            if (projectMatch.classList.contains("search-invisible")) {
                projectMatch.classList.remove("search-invisible");
                return;
            } else {
                const singleMatch = new CustomEvent('searchGrow', {
                    target: projectMatches[0],
                });

                projectMatches[0].dispatchEvent(singleMatch);
                state.expandedMatchingProject = true;
                state.currentlyExpandedProject = projectMatches[0];
            }

            if (todoMatches.length > 1 && state.expandedMatchingTodo) {
                const expandedProject = doc.querySelector('.expanded');
                const projectTodos = Array.from(expandedProject.querySelectorAll('.todo-container'));

                projectTodos.forEach(todo => {
                    if (todo.classList.contains("expanded")) {
                        todo.classList.remove("expanded");
                        const expandedInfo = todo.querySelector('.expanded-todo-info');
                        todo.removeChild(expandedInfo);
                        state.expandedMatchingTodo = false;
                    } else {
                        setTimeout(() => {
                            todo.classList.remove("shrink");
                            todo.style.visibility = "";
                        }, 100);
                    }
                });
            }

            // If only a single todo matches
            if (todoMatches.length === 1) {
                if (todoMatches[0] === state.currentlyExpandedTodo) {
                    return;
                }
                let expandedProject = doc.querySelector('.expanded');
                if (expandedProject === null) {
                    // Wait for the project to expand and expand it.
                    setTimeout(() => {
                        expandedProject = doc.querySelector('.expanded');
                        const projectTodos = Array.from(expandedProject.querySelectorAll('.todo-container'));
                        const todoToExpand = projectTodos.find(todo => {
                            const label = todo.querySelector('label').innerText;
                            return label === todoMatches[0];
                        });

                        console.log("todoToExpand => ", todoToExpand);

                        const singleTodoMatch = new CustomEvent('searchTodoGrow', {
                            target: todoToExpand,
                        });

                        todoToExpand.dispatchEvent(singleTodoMatch);
                        state.expandedMatchingTodo = true;
                        state.currentlyExpandedTodo = todoToExpand;
                    }, 400);
                } else {
                    const projectTodos = Array.from(expandedProject.querySelectorAll('.todo-container'));
                    const todoToExpand = projectTodos.find(todo => {
                        const label = todo.querySelector('label').innerText;
                        return label === todoMatches[0];
                    });

                    console.log("todoToExpand => ", todoToExpand);

                    const singleTodoMatch = new CustomEvent('searchTodoGrow', {
                        target: todoToExpand,
                    });

                    todoToExpand.dispatchEvent(singleTodoMatch);
                    state.expandedMatchingTodo = true;
                    state.currentlyExpandedTodo = todoToExpand;
                }
            }
        }


        allProjects.forEach((proj) => {
            const projTitle = proj.querySelector('.project-title').innerText.trim();

            const match = projectMatches.some((match) => {
                const matchTitle = match.querySelector('.project-title').innerText.trim();
                return matchTitle === projTitle;
            });

            const displayed = currentlyDisplayedProjects.some((project) => {
                const title = project.querySelector('.project-title').innerText.trim();
                if (title === projTitle) {
                    return true;
                }
            });

            if (!match && displayed) {
                const projectGrid = Display.getCurrentProjectGrid();
                const projectToRemove = projectGrid.querySelector(`#project-card-${projTitle}`);
                projectToRemove.classList.add("search-invisible");
                setTimeout(() => {
                    projectToRemove.style.display = "none";
                }, 110);
            } else if (match && !displayed) {
                setTimeout(() => {
                    const projectGrid = Display.getCurrentProjectGrid();
                    const projectToAdd = projectGrid.querySelector(`#project-card-${projTitle}`);
                    projectToAdd.style.display = "grid";
                    projectToAdd.classList.remove("search-invisible");
                }, 110);
            }
        });

    }

    return {
        generateSearchBar,
    };

})(document);
