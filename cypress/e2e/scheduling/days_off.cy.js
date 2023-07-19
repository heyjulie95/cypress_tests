/// <reference types="cypress-mailslurp" />
import test_data from '../fixtures/test_data.json';

const agent_name = test_data['test_users']["agent"].first_name + " " + test_data['test_users']["agent"].last_name
const team_lead_name = test_data['test_users']["team_lead"].first_name + " " + test_data['test_users']["team_lead"].last_name
const agent_supervisor_name = test_data['test_users']["agent_supervisor"].first_name + " " + test_data['test_users']["agent_supervisor"].last_name

describe("different users ask for days off and", () => {
    before(() => {
        cy.visit("/");
        cy.login("schedule_supervisor");
    });
    beforeEach(() => {
        cy.preserveCookieOnce("session", "current_version");
        cy.fixture("test_data.json").as("test_data");
        cy.fixture("emails.json").as("emails");
    });
})