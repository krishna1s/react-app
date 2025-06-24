describe('Login com sucesso', () => {
  it('should login with a valid user', () => {
    cy.visit('localhost:3000')
    cy.get('#username').type('Dina20')
    cy.get('#password').type('s3cret')
    cy.get('[data-test="signin-submit"]').click()
  })
})
describe('invalid userdata login', () => {
  it('Shows an error message after login using wrong credentials', () => {
    cy.visit('localhost:3000')
    cy.get('#username').type('TestingWrong')
    cy.get('#password').type('s3cret3')
    cy.get('[data-test="signin-submit"]').click()
  });
});
describe('Sing Up a new user', () => {
  it('register a new user using valid credentials', () => {
    cy.visit('localhost:3000')
    cy.get('[data-test="signup"]').click()
    cy.get('#firstName').type('Robson')
    cy.get('#lastName').type('Simpson')
    cy.get('#username').type('rob51p')
    cy.get('#password').type('Donnuts')
    cy.get('#confirmPassword').type('Donnuts')
    cy.get('[data-test="signup-submit"]').click()
  });
});
describe('sing up without confirm same password', () => {
  it('Should appear an error message after trying to register a new user without filling all the obrigatory fields', () => {
    cy.visit('localhost:3000')
    cy.get('[data-test="signup"]').click()
    cy.get('#firstName').type('Robson')
    cy.get('#lastName').type('Simpson')
    cy.get('#username').type('rob51p')
    cy.get('#password').type('Donnuts')
    cy.get('#confirmPassword').type('Donnnuts')
    cy.get('#confirmPassword-helper-text')
  });
});