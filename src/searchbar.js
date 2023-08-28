import { Display } from "./display";

export const SearchBar = ((doc) => {
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

        searchBarContainer.appendChild(searchBar);
        searchBarContainer.appendChild(searchImageGlass);
        searchBarContainer.appendChild(searchImageHandle);
        searchBarContainer.appendChild(invisibleToggleBtn);


        return searchBarContainer;
    };

    const searchProjects = () => {
        console.log("Searching projects");
    };

    const searchTodos = () => {
        console.log("Searching todos");
    };

    return {
        searchTodos,
        searchProjects,
        generateSearchBar,
    };

})(document);
