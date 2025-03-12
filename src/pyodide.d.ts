declare module "pyodide" {
    function loadPyodide(options: { indexURL: string }): Promise<any>;
  }