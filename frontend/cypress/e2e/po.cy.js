describe('Purchase Order Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.get('input[type="text"]').type('admin')
    cy.get('input[type="password"]').type('password123')
    cy.get('button').contains('Sign in').click()
  })

  it('should navigate to new PO screen and create PO', () => {
    cy.contains('Purchase Orders').click()
    cy.contains('Raise PO').click()
    
    // Fill out the PO form
    cy.get('select').eq(0).select('M1') // Supplier
    cy.get('select').eq(1).select('U1') // Unit
    cy.get('input[type="number"]').eq(0).type('30') // Terms
    cy.get('input[type="date"]').type('2026-10-01') // ETA
    
    // Add item
    cy.contains('Add Reel Type').click()
    cy.get('input[placeholder="e.g. Kraft"]').type('Kraft')
    cy.get('input[placeholder="e.g. 120"]').type('120')
    cy.get('input[placeholder="e.g. 18"]').type('18')
    cy.get('input[placeholder="e.g. 100"]').type('100')
    cy.get('input[placeholder="Qty (kg)"]').type('1000')
    cy.get('input[placeholder="Rate (₹)"]').type('35')
    cy.contains('Add item').click()
    
    cy.contains('Submit PO').click()
    cy.contains('Success').should('be.visible')
    cy.screenshot('po_success_view')
  })
})
