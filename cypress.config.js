const { defineConfig } = require("cypress");

module.exports = defineConfig({
  requestTimeout: 10000,
  responseTimeout: 10000,
  defaultCommandTimeout: 10000,
  viewportHeight: 632,
  viewportWidth: 1507,
  e2e: {
    setupNodeEvents(on, config) {
    },
    baseUrl: "https://stage.logicall.io",
    // baseUrl: "http://localhost:8081",
    supportFile: "cypress/support/e2e.js",
    env: {
      MAILSLURP_API_KEY: "37e5488ddd6be91e7300d83ace47f3063e4c7b8729763d34033abe1fd6d9e693",
      test_password: "$FobosAttack005",
      // test_password: "Password1!",
    }
  }
});
