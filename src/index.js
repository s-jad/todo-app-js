import Todo from "./todo";
import Project from "./project";
import User from "./user"
import "./style.css"

function TodoApp() {
    const element = document.createElement('div');

    element.innerText = "This is a test from the App";

    return element;
}

document.body.appendChild(TodoApp());

