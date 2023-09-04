import { TodoApp } from "./app";
import { Display } from "./display";

export const SearchBar = ((doc) => {
    let state = {
        expandedMatchingProject: false,
        currentlyExpandedProject: {},
        expandedMatchingTodo: false,
        currentlyExpandedTodo: {},
        searchBarToggle: "projects",
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
        searchBar.maxWidth = "55px";

        const searchToggle = generateSearchToggle();

        const invisibleToggleBtn = doc.createElement("button");
        invisibleToggleBtn.id = "toggle-search-bar";
        invisibleToggleBtn.classList.add("invisible-btn");
        invisibleToggleBtn.classList.add("big-btn");

        invisibleToggleBtn.onclick = () => {
            if (!invisibleToggleBtn.classList.contains("activate")) {
                searchBar.classList.add("active");
                invisibleToggleBtn.classList.add("activate");
                invisibleToggleBtn.classList.add("small-btn");
                invisibleToggleBtn.classList.remove("big-btn");

                searchImageGlass.classList.add("minify");
                searchImageHandle.classList.add("minify");
                searchToggle.classList.remove("invisible");
                searchToggle.style.display = "";

                Display.setFocusToFirstInput(searchBar);
            } else {
                searchBar.classList.remove("active");
                invisibleToggleBtn.classList.remove("activate");
                invisibleToggleBtn.classList.remove("small-btn");
                invisibleToggleBtn.classList.add("big-btn");

                searchImageGlass.classList.remove("minify");
                searchImageHandle.classList.remove("minify");
                searchToggle.classList.add("invisible");
                setTimeout(() => {
                    searchToggle.style.display = "none";
                }, 200);
                searchBar.value = "";
                Display.refreshProjectGrid();
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
        searchBarContainer.appendChild(searchToggle);


        return searchBarContainer;
    };

    const generateSearchToggle = () => {
        const searchToggle = doc.createElement('div');
        searchToggle.id = "search-toggle-container-outer";

        searchToggle.classList.add("invisible");
        searchToggle.classList.add("big-btn");
        searchToggle.style.display = "none";

        searchToggle.innerHTML = `
            <div id="search-toggle-container-inner">
                <input type="radio" name="search-toggle-radio" id="search-toggle-projects" class="invisible-radio very-small-btn">
                <input type="radio" name="search-toggle-radio" id="search-toggle-todos" class="invisible-radio very-small-btn">
                <div class="search-toggle-icon search-projects-icon">P</div>
                <div class="search-toggle-icon search-todos-icon">T</div>
            </div>
        `;

        const searchToggleTodos = searchToggle.querySelector('#search-toggle-todos');
        const searchToggleProjects = searchToggle.querySelector('#search-toggle-projects');
        const iconToggleTodos = searchToggle.querySelector('.search-todos-icon');
        const iconToggleProjects = searchToggle.querySelector('.search-projects-icon');
        iconToggleProjects.classList.add("active");

        searchToggleTodos.addEventListener('change', () => {
            if (searchToggleTodos.checked) {
                state.searchBarToggle = "todos";
                iconToggleProjects.classList.remove("active");
                iconToggleTodos.classList.add("active");
            }
        });

        searchToggleProjects.addEventListener('change', () => {
            if (searchToggleProjects.checked) {
                state.searchBarToggle = "projects";
                iconToggleProjects.classList.add("active");
                iconToggleTodos.classList.remove("active");
            }
        });

        return searchToggle;
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

        if (projectGrid.children === undefined) {
            return;
        }

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

        if (matches === undefined) {
            return;
        }

        const projectMatches = matches.projMatches;
        const todoMatches = matches.todoMatches;

        if (projectMatches === undefined || todoMatches === undefined) {
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
            const matchTitle = projectMatches[0].id.slice(projectMatches[0].id.lastIndexOf("card-") + 5);
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
                if (expandedProject === undefined || expandedProject === null) {
                    setTimeout(() => {
                        const retryExpandedProject = doc.querySelector('.expanded');
                        const projectTodos = Array.from(retryExpandedProject.querySelectorAll('.todo-container'));

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
                    }, 200);
                } else {
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
                            const label = todo.querySelector('h4').innerText;
                            return label === todoMatches[0];
                        });

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
                        const label = todo.querySelector('h4').innerText;
                        return label === todoMatches[0];
                    });

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
            console.log("projTitle => ", projTitle);

            const match = projectMatches.some((match) => {
                const matchTitle = match.querySelector('.project-title').innerText.trim();
                ;
                return matchTitle === projTitle;
            });

            const displayed = currentlyDisplayedProjects.some((project) => {
                const title = project.querySelector('.project-title').innerText.trim();
                return title === projTitle;
            });

            const idProjTitle = projTitle.replaceAll(" ", "-");
            if (!match && displayed) {
                const projectGrid = Display.getCurrentProjectGrid();
                console.log("projTitle => ", projTitle);
                console.log("idProjTitle => ", idProjTitle);
                const projectToRemove = projectGrid.querySelector(`#project-card-${idProjTitle}`);
                console.log("projectToRemove => ", projectToRemove);
                projectToRemove.classList.add("search-invisible");
                setTimeout(() => {
                    projectToRemove.style.display = "none";
                }, 110);
            } else if (match && !displayed) {
                setTimeout(() => {
                    const projectGrid = Display.getCurrentProjectGrid();
                    const projectToAdd = projectGrid.querySelector(`#project-card-${idProjTitle}`);
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
