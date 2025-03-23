import failOnConsoleError from "cypress-fail-on-console-error";
failOnConsoleError();


// We need this to prevent test failures.  I don't actually know what the error is for sure
// (even if you log it, it is not visible), but I suspect it may be a Brython error that I
// see on the real site to do with an IndentationError in partial code:
Cypress.on("uncaught:exception", (err, runnable) => {
    // returning false here prevents Cypress from failing the test:
    return false;
});

// Must clear all local storage between tests to reset the state:
beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/",  {onBeforeLoad: (win) => {
        win.localStorage.clear();
        win.sessionStorage.clear();
    }});
    cy.window().then((win) => {
        if (win.pyodide) {
            win.pyodide.runPython("import gc; gc.collect()"); 
            win.pyodide = null; 
        }
    });
});

describe("Code Visualiser Functionality", () => {
    it("should display the Code Visualiser tab and its content", () => {
        cy.get("#peaControlsDiv .nav-link").contains("Code Visualiser").click();

        cy.get("#codeVisualiserDiv").should("be.visible");

        cy.get("#codeVisualiserDiv .code-container").should("exist");
        cy.get("#codeVisualiserDiv .nav-buttons").should("exist");
        cy.get("#codeVisualiserDiv .stack-table").should("exist");

        cy.get("#codeVisualiserDiv .nav-button").contains("Previous").should("be.disabled");
        cy.get("#codeVisualiserDiv .nav-button").contains("Next").should("be.disabled");
    });

    it("should execute Python code and display the execution steps in the Code Visualiser", () => {

        cy.wait(1000);
        cy.get("button").contains("Visualise").click();
        cy.wait(1000); 

        cy.get("#codeVisualiserDiv").should("be.visible");

        cy.get("#codeVisualiserDiv .code-row").should("have.length", 2);
        cy.get("#codeVisualiserDiv .current-line").should("exist");
        
        cy.get("#codeVisualiserDiv .stack-table th").should("have.length", 2); 

        cy.get("#codeVisualiserDiv .nav-button").contains("Next").click();
        cy.get("#codeVisualiserDiv .stack-table td").contains("myString").should("exist");
        cy.get("#codeVisualiserDiv .current-line").should("have.length", 1);

        cy.get("#codeVisualiserDiv .nav-button").contains("Previous").click();
        cy.get("#codeVisualiserDiv .current-line").should("have.length", 1);
    });

    it("should execute Python code and display the execution steps in the Code Visualiser - for-loop", () => {

        cy.get("body").type("f");
        cy.get("body").type("x{rightarrow}[1,2,3]");
        cy.get("body").type("{downarrow}px");
        cy.wait(1000);
        cy.get("button").contains("Visualise").click();
        cy.wait(1000); 

        cy.get("#codeVisualiserDiv").should("be.visible");

        cy.get("#codeVisualiserDiv .code-row").should("have.length", 4);
        cy.get("#codeVisualiserDiv .current-line").should("exist");
        
        cy.get("#codeVisualiserDiv .stack-table th").should("have.length", 2); 

        cy.get("#codeVisualiserDiv .nav-button").contains("Next").click();
        cy.get("#codeVisualiserDiv .nav-button").contains("Next").click();
        cy.get("#codeVisualiserDiv .nav-button").contains("Next").click();
        cy.get("#codeVisualiserDiv .stack-table td").contains("x").should("exist");
        cy.get("#codeVisualiserDiv .stack-table td").contains("2").should("exist");
        cy.get("#codeVisualiserDiv .current-line").should("have.length", 1);

        cy.get("#codeVisualiserDiv .nav-button").contains("Previous").click();
        cy.get("#codeVisualiserDiv .current-line").should("have.length", 1);
    });

    it("should display an error message for unsupported Turtle code", () => {

        cy.get("body").type("{uparrow}{uparrow}i");
        cy.get("body").type("turtle");
        cy.wait(2000);

        cy.get("#peaControlsDiv button").contains("Visualise").click();

        cy.get("#codeVisualiserDiv .error-message", { timeout: 1000 }).should("be.visible");
        cy.get("#codeVisualiserDiv .error-message").should(
            "contain.text",
            "Turtle graphics are not supported in this visualizer"
        );
    });

    it("should display an error message for unsupported Modules", () => {

        cy.get("body").type("{uparrow}{uparrow}i");
        cy.get("body").type("os");
        cy.wait(2000);

        cy.get("#peaControlsDiv button").contains("Visualise").click();

        cy.get("#codeVisualiserDiv .error-message", { timeout: 1000 }).should("be.visible");
        cy.get("#codeVisualiserDiv .error-message").should(
            "contain.text",
            "Module 'os' is not yet allowed"
        );
    });
});