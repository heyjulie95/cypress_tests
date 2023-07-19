/// <reference types="cypress-mailslurp" />
import test_data from '../fixtures/test_data.json';

const company_name = test_data['test_company_name']
const campaign_name = test_data['test_campaign_name']
const agent_group_name = test_data['test_group_name']
const agent_name = test_data['test_users']["agent"].first_name + " " + test_data['test_users']["agent"].last_name
const team_lead_name = test_data['test_users']["team_lead"].first_name + " " + test_data['test_users']["team_lead"].last_name
const agent_supervisor_name = test_data['test_users']["agent_supervisor"].first_name + " " + test_data['test_users']["agent_supervisor"].last_name


describe("subscribe and unsibscribe users from the campaign", () => {
    before(() => {
        cy.visit("/");
        cy.login("admin");
    });
    beforeEach(() => {
        cy.preserveCookieOnce("session", "current_version");
        cy.fixture("test_data.json").as("test_data");
        cy.fixture("emails.json").as("emails");
    });
    it('asserts that the group consists of the agent, team lead and supervisor', () => {
        cy.visit('/settings')
        cy.contains('Agent Groups').click()
        cy.url().should('contain', 'agent_groups')
        cy.contains(agent_group_name).click()
        cy.searchByName(agent_name)
        cy.searchByName(agent_supervisor_name)
        cy.searchByName(team_lead_name)
    })
    it('asserts the campaign consists of the group members', () => {
        cy.visit('/companies')
        cy.contains(company_name).click()
        cy.contains(test_data.test_company_email)
        cy.contains(campaign_name).click()
        cy.searchByName(agent_name)
        cy.searchByName(agent_supervisor_name)
        cy.searchByName(team_lead_name)
    })
    it('removes agent from the campaign', () => {
        cy.visit('/companies')
        cy.contains(company_name).click()
        cy.contains(campaign_name).click()
        cy.wait(500)
        cy.get('.mdi-plus-circle-outline').invoke('click')
        cy.contains('Add Agents').invoke('click')
        cy.wait(500)
        cy.checkAgentFromCampaignDropDown(agent_name)
        cy.wait(500)
        cy.get('#activity-notification-parent').should('be.visible')
        .and('contain', agent_name)
        .and('contain', agent_supervisor_name)
        .and('contain', team_lead_name)
        .and('contain', 'removed from ' + campaign_name)
    })
    it('asserts that the campaign doesn\'t have the members removed', () => {
        cy.visit('/companies')
        cy.contains(company_name).click()
        cy.contains(test_data.test_company_email)
        cy.contains(campaign_name).click()
        cy.searchByName(agent_name)
        cy.searchByName(agent_supervisor_name)
        cy.searchByName(team_lead_name)
    })
    it('adds agent back to the campaign', () => {
        cy.visit('/companies')
        cy.contains(company_name).click()
        cy.contains(campaign_name).click()
        cy.wait(500)
        cy.get('.mdi-plus-circle-outline').invoke('click')
        cy.contains('Add Agents').invoke('click')
        cy.wait(500)
        cy.checkAgentFromCampaignDropDown(agent_name)
        cy.wait(500)
        cy.get('#activity-notification-parent').should('be.visible')
        .and('contain', agent_name)
        .and('contain', agent_supervisor_name)
        .and('contain', team_lead_name)
        .and('contain', 'added to ' + campaign_name)
    })
    it('asserts that the group members have the campaign within their profiles', () => {
        // cy.visit('/users')
        // cy.get('[placeholder="Search"]').type(agent_supervisor_name)
        // cy.contains(agent_supervisor_name).click()
        // cy.url().should('include', "schedule")
        // cy.contains('Campaigns').click()
        // cy.contains(campaign_name)
        
        // cy.visit('/users')
        // cy.get('[placeholder="Search"]').type(team_lead_name)
        // cy.contains(team_lead_name).click()
        // cy.url().should('include', "schedule")
        // cy.contains('Campaigns').click()
        // cy.contains(campaign_name)
        
        cy.visit('/users/agent_users')
        cy.get('[placeholder="Search"]').type(agent_name)
        cy.contains(agent_name).click()
        cy.url().should('include', "schedule")
        cy.contains('Campaigns').click()
        cy.contains(campaign_name)
    })
})