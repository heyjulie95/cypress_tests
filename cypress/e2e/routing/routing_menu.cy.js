import placeholders from "../../fixtures/routing_menu_tests/url_placeholders.json";
import roleUrls from "../../fixtures/routing_menu_tests/links_rules";
import emails from '../../fixtures/routing_menu_tests/users_for_routing_emails.json'

describe('URL Accessibility', () => {
    Object.entries(roleUrls).forEach(([role, urls]) => {
      it(`Role: ${role} can access specified URLs`, () => {
        cy.login(role, emails);
        urls.forEach(async (url) => {
          const filledUrl = await placeholders.then((placeholders) => {
            let modifiedUrl = url;
            Object.entries(placeholders).forEach(([idType, idValue]) => {
              modifiedUrl = modifiedUrl.replace(`<${idType}>`, idValue);
            });
            return modifiedUrl;
          });
          cy.visit(filledUrl);
          cy.wait('@visit').its('response.statusCode').should('not.eq', 403);
          // Add more assertions or tests as needed
        });
        cy.logout();
      });
    });
  });