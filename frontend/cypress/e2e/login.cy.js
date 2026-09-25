describe('Authentication Flow', () => {
  it('should login successfully as admin', () => {
    cy.visit('/login')
    cy.get('input[type="text"]').type('admin')
    cy.get('input[type="password"]').type('password123')
    cy.get('button').contains('Sign in').click()
    
    // Should navigate to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Admin (Head Office)').should('be.visible')
    cy.screenshot('dashboard_view')
  })
})
