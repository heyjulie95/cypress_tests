Cypress.Commands.add("login", (username) => {
  const password = Cypress.env("test_password");
  if (username == "admin" || username == "schedule_supervisor" || username == "super_admin") {
    cy.fixture("hard_coded").then((data) => {
      const email = data["hardcoded_users"][username];
      cy.request({
        method: "POST",
        url: `/profile/login`,
        body: {
          email_user: email,
          password,
        }
      }).then(({ body }) => {
        cy.log(body);
        window.localStorage.setItem("token", body.token);
      });
    });
  } else {
    cy.request({
      method: "POST",
      url: `/profile/login`,
      body: {
        username,
        password,
      }
    }).then(({ body }) => {
      window.localStorage.setItem("token", body.token);
    });
  }
});

Cypress.Commands.add("login_for_routing_check", (role, emails) => {
  const email = emails[role];
  cy.request({
    method: "POST",
    url: `/profile/login`,
    body: {
      email_user: email,
      password,
    }
  }).then(({ body }) => {
    cy.log(body);
    window.localStorage.setItem("token", body.token);
  });
});

Cypress.Commands.add("logout", () => {
  cy.visit('profile/logout')
});

const { MailSlurp } = require("mailslurp-client");
const apiKey = Cypress.env("MAILSLURP_API_KEY");
const mailslurp = new MailSlurp({ apiKey });

Cypress.Commands.add("createInbox", () => {
  return mailslurp.createInbox();
});
Cypress.Commands.add("waitForLatestEmail", (inboxId) => {
  // how long we should hold connection waiting for an email to arrive
  const timeoutMillis = 30_000;
  return mailslurp.waitForLatestEmail(inboxId, timeoutMillis);
});
Cypress.Commands.add('confirmPassword', function () {
  let password = Cypress.env("test_password")
  cy.get('[data-form-id="RegisterInvitationForm"]')
      .should('be.visible')
      .within(() => {
          cy.get('[data-vv-name="password"]').focus().clear().type(password)
          cy.get('[data-vv-name="confirm_password"]').focus().clear().type(password)
          cy.wait(1000)
          cy.get('[data-vv-name="agree_conditions"]').click({force:true})
          cy.contains('button', 'Continue').click()
      })
  cy.location('pathname').should('contain', 'dashboard')
})

Cypress.Commands.add("searchCampaignIdByName", (company_name, campaign_name) => {
    cy.visit('/companies')
    cy.get("#all_companies").should("be.visible");
    cy.get('[placeholder="Search"]').type(company_name).wait(1000);
    cy.get('[data-clickable-row-type="URL"]').first().click().wait(1000);
    cy.contains(company_name)
    cy.get('[placeholder="Search"]').type(campaign_name).wait(1000);
    cy.get('[data-clickable-row-type="URL"]').first().click();
    cy.contains(campaign_name)
    cy.contains("span", "Settings")
    cy.url().then((url) => {
        let urlParts = url.split("/");
        let id = urlParts[urlParts.indexOf('campaigns') + 1].replace(/#$/, "").match(/^\d+/)[0];
        cy.log(id);  // To log the value in the Cypress console
        cy.wrap(id).as('campaignId');
    });
})

Cypress.Commands.add('checkAgentFromCampaignDropDown', function (search_by_text) {
  cy.get('.v-select__selections').click()
  cy.get('.v-list-item')
  .contains(search_by_text).click()
  cy.get('.v-select__selections').click()
  cy.contains('Save').click({force:true})
})

Cypress.Commands.add('searchByName', function (search_text) {
  cy.get('[placeholder="Search"]').clear().type(search_text)
  cy.wait(500)
  cy.contains(search_text)
})

Cypress.Commands.add('requestShiftForNextDay', function () {
  cy.visit('/schedules/my')
  cy.contains('button', 'My Shifts').and('have.class', 'primary')
  
})