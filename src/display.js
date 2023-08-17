const Display = ((doc) => {
    const outerFlex = doc.createElement('div');
    outerFlex.id = "app-outer-flex";
    const app = doc.createElement('div');
    app.id = "app-container";

    const renderApp = () => {
        doc.body.appendChild(outerFlex);
        outerFlex.appendChild(app);
    };

    const renderWelcomeScreen = () => {
        const welcomeFlex = doc.createElement('div');
        welcomeFlex.id = "welcome-flex";
        const welcomeTitle = doc.createElement('h2');
        welcomeTitle.id = "welcome-title";
        const welcomeInput = doc.createElement('input');
        welcomeInput.id = "welcome-input";
        const welcomeConfirmBtn = doc.createElement('button');
        welcomeFlex.id = "welcome-confirm-btn";
        welcomeFlex.appendChild(welcomeTitle, welcomeInput, welcomeConfirmBtn);
        app.appendChild(welcomeFlex);
    };

    return {
        renderApp,
        renderWelcomeScreen,
    };

})(document);
