import { Display } from "./display";

export const TodoApp = (() => {
    const startApp = () => {
        const app = Display.renderApp();
        app.appendChild(Display.renderWelcomeScreen());
        document.body.appendChild(app);
    };

    return {
        startApp,
    };

})();

