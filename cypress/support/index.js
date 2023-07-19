Cypress.on('uncaught:exception', (err, runnable) => {
    console.log(err.stack, err.name) // This will log the stack trace of the uncaught exception to the console
    return false // returning false here prevents Cypress from failing the test
  })