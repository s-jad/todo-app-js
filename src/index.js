import "./style.css"

function App() {
    const element = document.createElement('div');
    
    element.innerText = "This is a test from the App";

    return element;
}

document.body.appendChild(App());



