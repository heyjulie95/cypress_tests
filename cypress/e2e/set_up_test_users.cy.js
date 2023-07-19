/// <reference types="cypress-mailslurp" />
const { extractInviteLink } = require("../support/utils");

describe("setting up test users", () => {
  before(() => {
    cy.visit("/");
    cy.login("admin");
  });
  beforeEach(() => {
    cy.preserveCookieOnce("session", "current_version");
    const baseUrl = Cypress.config().baseUrl;
    if (baseUrl == "https://stage.logicall.io") {
      cy.fixture("local_test_data.json").as("test_data");
    } else cy.fixture("stage_test_data.json").as("test_data");
  });
  it("creates empty company", () => {
    if (baseUrl !== 'http://localhost:8081') {
      cy.log('Skipping this test because baseUrl is stage');
      this.skip();
    } else {
        cy.visit("/companies");
        cy.get('[data-show-form-id="CompanyForm_add-company-action"]').click();
        cy.get("#large_form_modal").should("be.visible");
        cy.get("@test_data").then((data) => {
          cy.wait(500);
          cy.get('[data-vv-name="display_name"]').clear().type(data["test_company_name"]);
          cy.get('[data-vv-name="display_name"]').should("contain.value", data["test_company_name"]);
          cy.get('[data-vv-name="email"]').focus().type(data["test_company_email"]);
          cy.contains("Save").click();
          cy.get("#all_companies").should("be.visible");
          cy.get('[placeholder="Search"]').type(data["test_company_name"]);
          cy.get('[data-clickable-row-type="URL"]').first().click();
          cy.contains("Campaigns");
        })
      }
  });
  it("creates empty campaign", () => {
    if (baseUrl !== 'http://localhost:8081') {
      cy.log('Skipping this test because baseUrl is stage');
      this.skip();
    } else {
        cy.visit("/companies");
        cy.get("#all_companies").should("be.visible");
        cy.get("@test_data").then((data) => {
          cy.get('[placeholder="Search"]').type(data["test_company_name"]);
          cy.get('[data-clickable-row-type="URL"]').first().click();
          cy.get("#all_campaigns_in_company").should(
            "not.contain",
            data["test_company_name"]
          );
          cy.contains("Add new Campaign").click();
          cy.get("#large_form_modal").should("be.visible");
          cy.wait(500);
          cy.get('[data-vv-name="name"]').clear().type(data["test_campaign_name"]);
          cy.get('[data-vv-name="name"]').should("contain.value",data["test_campaign_name"]);
          cy.get('[data-vv-name="campaign_type_id"]').click();
          cy.get('[role="listbox"]').children().first().click();
          cy.contains("New Campaign").click();
          cy.contains("DNIS").click({ force: true }).type(data["test_campaign_dnis"]);
          cy.contains("Timezone").click({ force: true }).type(data["test_campaign_time_zone_id"]).type("{downarrow}{enter}");
          cy.get('[data-vv-name="pay_rate"]').click({ force: true }).type(20);
          cy.get('[data-vv-name="billable_Talktime"]').click({ force: true });
          cy.get('[data-vv-name="billable_Holdtime"]').click({ force: true });
          cy.get('[data-vv-name="billable_IVRtime"]').click({ force: true });
          cy.get('[data-vv-name="billable_After-callworktime"]').click({force: true,});
          cy.contains("Save").click();
          cy.get("#large_form_modal", { timeout: 10000 }).should("not.be.visible");
          cy.wait(1000);
          cy.contains(data["test_campaign_name"], { timeout: 10000 });
        });
      }
  });
  it("creates agent group", () => {
    cy.visit("/settings");
    cy.contains("Agent Groups").click();
    cy.url().should("contain", "agent_groups");
    cy.get('[id="add-agent-group-action"]').click();
    cy.get("#large_form_modal").should("be.visible");
    cy.get("@test_data").then((data) => {
      cy.get('[data-vv-name="name"]').click().type(data["test_group_name"]);
    });
    cy.contains("Save").click();
    cy.get("#large_form_modal").should("not.be.visible");
  });
  it("invites agent with assignment to a campaign", () => {
    let inboxId, emailAddress;
    cy.visit("/users");
    cy.contains("Add new User").click();
    cy.get("#large_form_modal").should("be.visible");
    cy.get("@test_data").then((data) => {
      const agent = data["test_users"]["agent"];
      cy.createInbox().then((inbox) => {
        assert.isDefined(inbox);
        emailAddress = inbox.emailAddress;
        inboxId = inbox.id;
        cy.readFile("cypress/fixtures/emails.json").then((jsonObject) => {
        let updatedObject
          if (baseUrl == "https://stage.logicall.io") {
            updatedObject = {
              ...jsonObject,
              stage_agent: {
                email: emailAddress,
                inboxId: inboxId,
              },
            };
          } else {
            updatedObject = {
              ...jsonObject,
              local_agent: {
                email: emailAddress,
                inboxId: inboxId,
              },
            };
          }
          cy.writeFile("cypress/fixtures/emails.json", updatedObject);
        });
        //fields
        cy.get('[data-vv-name="email"]').should("be.visible").clear().type(emailAddress).should("have.value", emailAddress);
        cy.get('[data-vv-name="first_name"]').focus().type(`${agent.first_name}`);
        cy.get('[data-vv-name="last_name"]').focus().type(`${agent.last_name}`);
        cy.get('[data-vv-name="role_field"]').scrollIntoView().click().then(() => {
            cy.get(".v-list-item__content")
              .contains(new RegExp("^Agent(?! Supervisor)$"))
              .invoke("click");
          });
        agent.pay_rate && cy.get('[data-vv-name="pay_rate"]').type(agent.pay_rate);
        cy.get('[data-vv-name="agent_type_id"]').click();
        cy.wait(300);
        cy.contains(".v-list-item__content > .v-list-item__title",`${agent.agent_type}`).click();
        if (!agent.all_campaigns) {
          cy.get('[data-vv-name="all_campaigns"]').uncheck({ force: true });
          cy.get('[data-vv-name="all_campaigns"]').should("have.attr", "aria-checked").should("eq", "false");
          cy.get(".v-select__selections").should("be.visible").click();
          cy.contains(`${data.test_campaign_name}`).click();
          cy.get("body").click();
          cy.get(".v-select__selections").should("contain.text",`${data.test_campaign_name}`);
        }
        cy.get('[data-vv-name="agent_group"]').click();
        cy.get('[role="listbox"]').contains(`${data.test_group_name}`).click();
        cy.contains("Save").click();
        cy.wait(3000);
        cy.get("#large_form_modal").should("have.attr", "aria-hidden").and("eq", "true");
        cy.waitForLatestEmail(inboxId).then(function (email) {
          assert.isDefined(email);
          assert.isDefined(email["body"]);
          let inviteLink = extractInviteLink(email);
          cy.log(inviteLink);
          cy.visit(inviteLink);
          cy.confirmPassword();
        });
      });
    });
  });
  it("invites team lead with assignment to a campaign", () => {
    let inboxId, emailAddress;
    cy.visit("/users");
    cy.contains("Add new User").click();
    cy.get("#large_form_modal").should("be.visible");
    cy.get("@test_data").then((data) => {
      const team_lead = data["test_users"]["team_lead"];
      cy.createInbox().then((inbox) => {
        console.log(inbox);
        assert.isDefined(inbox);
        emailAddress = inbox.emailAddress;
        inboxId = inbox.id;
        cy.readFile("cypress/fixtures/emails.json").then((jsonObject) => {
          let updatedObject
            if (baseUrl == "https://stage.logicall.io") {
              updatedObject = {
                ...jsonObject,
                stage_team_lead: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            } else {
              updatedObject = {
                ...jsonObject,
                local_team_lead: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            }
            cy.writeFile("cypress/fixtures/emails.json", updatedObject);
        });
        cy.get('[data-vv-name="email"]').should("be.visible").clear().type(emailAddress).should("have.value", emailAddress);
        cy.get('[data-vv-name="first_name"]').focus().type(`${team_lead.first_name}`);
        cy.get('[data-vv-name="last_name"]').focus().type(`${team_lead.last_name}`);
        cy.get('[data-vv-name="role_field"]').scrollIntoView().click().then(() => {
            cy.get(".v-list-item__content")
              .contains(new RegExp(`${team_lead.role_name}`))
              .invoke("click");
        });
        team_lead.pay_rate && cy.get('[data-vv-name="pay_rate"]').type(team_lead.pay_rate);
        cy.contains("Agent Groups").click({ force: true });
        cy.contains(`${data.test_group_name}`).click();
        cy.get("body").click();
        cy.contains("Save").click();
        cy.wait(3000);
        cy.get("#large_form_modal").should("have.attr", "aria-hidden").and("eq", "true");
        cy.waitForLatestEmail(inboxId).then(function (email) {
          assert.isDefined(email);
          assert.isDefined(email["body"]);
          let inviteLink = extractInviteLink(email);
          cy.log(inviteLink);
          cy.visit(inviteLink);
          cy.confirmPassword();
        });
      });
    });
  });
  it("invites agent supervisor with assignment to a campaign", () => {
    let inboxId, emailAddress;
    cy.visit("/users");
    cy.contains("Add new User").click();
    cy.get("#large_form_modal").should("be.visible");
    cy.get("@test_data").then((data) => {
      const agent_supervisor = data["test_users"]["agent_supervisor"];
      cy.createInbox().then((inbox) => {
        console.log(inbox);
        assert.isDefined(inbox);
        emailAddress = inbox.emailAddress;
        inboxId = inbox.id;
        cy.readFile("cypress/fixtures/emails.json").then((jsonObject) => {
          let updatedObject
            if (baseUrl == "https://stage.logicall.io") {
              updatedObject = {
                ...jsonObject,
                stage_agent_supervisor: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            } else {
              updatedObject = {
                ...jsonObject,
                local_agent_supervisor: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            }
            cy.writeFile("cypress/fixtures/emails.json", updatedObject);
        });
        cy.get('[data-vv-name="email"]').should("be.visible").clear().type(emailAddress).should("have.value", emailAddress);
        cy.get('[data-vv-name="first_name"]').focus().type(`${agent_supervisor.first_name}`);
        cy.get('[data-vv-name="last_name"]').focus().type(`${agent_supervisor.last_name}`);
        cy.get('[data-vv-name="role_field"]').scrollIntoView().click().then(() => {
            cy.get(".v-list-item__content").contains(new RegExp(`${agent_supervisor.role_name}`)).invoke("click");
        });
        agent_supervisor.pay_rate && cy.get('[data-vv-name="pay_rate"]').type(agent_supervisor.pay_rate);
        cy.contains("Agent Groups").click({ force: true });
        cy.contains(`${data.test_group_name}`).click();
        cy.get("body").click();
        cy.contains("Save").click();
        cy.wait(3000);
        cy.get("#large_form_modal").should("have.attr", "aria-hidden").and("eq", "true");
        cy.waitForLatestEmail(inboxId).then(function (email) {
          assert.isDefined(email);
          assert.isDefined(email["body"]);
          let inviteLink = extractInviteLink(email);
          cy.log(inviteLink);
          cy.visit(inviteLink);
          cy.confirmPassword();
        });
      });
    });
  });
  it("invites campaign manager with assignment to a campaign", () => {
    let inboxId, emailAddress;
    cy.visit("/users");
    cy.contains("Add new User").click();
    cy.get("#large_form_modal").should("be.visible");
    cy.get("@test_data").then((data) => {
      const campaign_manager = data["test_users"]["campaign_manager"];
      cy.createInbox().then((inbox) => {
        console.log(inbox);
        assert.isDefined(inbox);
        emailAddress = inbox.emailAddress;
        inboxId = inbox.id;
        cy.readFile("cypress/fixtures/emails.json").then((jsonObject) => {
          let updatedObject
            if (baseUrl == "https://stage.logicall.io") {
              updatedObject = {
                ...jsonObject,
                stage_campaign_manager: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            } else {
              updatedObject = {
                ...jsonObject,
                local_campaign_manager: {
                  email: emailAddress,
                  inboxId: inboxId,
                },
              };
            }
            cy.writeFile("cypress/fixtures/emails.json", updatedObject);
        });
        cy.get('[data-vv-name="email"]').should("be.visible").clear().type(emailAddress).should("have.value", emailAddress);
        cy.get('[data-vv-name="first_name"]').focus().type(`${campaign_manager.first_name}`);
        cy.get('[data-vv-name="last_name"]').focus().type(`${campaign_manager.last_name}`);
        cy.get('[data-vv-name="role_field"]').scrollIntoView().click().then(() => {
            cy.get(".v-list-item__content").contains(new RegExp(`${campaign_manager.role_name}`)).invoke("click");
        });
        cy.get("body").click();
        if (!campaign_manager.all_campaigns) {
          cy.get('[data-vv-name="all_campaigns"]').uncheck({ force: true });
          cy.get('[data-vv-name="all_campaigns"]')
            .should("have.attr", "aria-checked")
            .should("eq", "false");
          cy.get(".v-select__selections").should("be.visible").click();
          cy.contains(`${data.test_campaign_name}`).click();
          cy.get("body").click();
          cy.get(".v-select__selections").should(
            "contain.text",
            `${data.test_campaign_name}`
          );
        }
        cy.contains("Save").click();
        cy.wait(3000);
        cy.get("#large_form_modal").should("have.attr", "aria-hidden").and("eq", "true");
        cy.waitForLatestEmail(inboxId).then(function (email) {
          assert.isDefined(email);
          assert.isDefined(email["body"]);
          let inviteLink = extractInviteLink(email);
          cy.log(inviteLink);
          cy.visit(inviteLink);
          cy.confirmPassword();
        });
      });
    });
  });
});
